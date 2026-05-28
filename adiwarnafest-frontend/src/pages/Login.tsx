import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { CaretLeft, Eye, EyeSlash, QrCode, ShieldCheck, Camera, XCircle, Trash, ArrowRight } from "@phosphor-icons/react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../store/auth";
import { authService } from "../services/auth";
import { REGISTRATION_KEY } from "../utils/qrGenerator";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginFrom, setLoginFrom] = useState<string | null>(null);
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'credentials' | 'verify'>('credentials');
  const [registrationKey, setRegistrationKey] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, role } = useAuth();

  // Auto-open register form when navigated from lucky draw "Create Account"
  useEffect(() => {
    const state = location.state as { register?: boolean } | null;
    if (state?.register) setIsRegistering(true);
  }, [location.state]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const from = (location.state as { from?: string } | null)?.from;
      setLoginFrom(from || null);
      await signIn(email, password);
      setHasSignedIn(true);
    } catch (error: unknown) {
      setLoading(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error instanceof Error ? error.message : 'Failed to sign in. Please check your credentials.',
        life: 3000
      });
    }
  }

  useEffect(() => {
    if (role && hasSignedIn) {
      if (role === 'Admin' || role === 'Maintainer') {
        navigate(loginFrom || "/maintenance");
      } else {
        navigate(loginFrom || "/lucky-draw");
      }
      setLoading(false);
    }
  }, [role, hasSignedIn, loginFrom, navigate])

  useEffect(() => {
    return () => {
      if (qrReaderRef.current && qrReaderRef.current.isScanning) {
        qrReaderRef.current.stop().catch(() => {});
        qrReaderRef.current.clear();
      }
    };
  }, []);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (registrationStep === 'credentials') {
      if (!EMAIL_REGEX.test(email)) {
        toast.current?.show({
          severity: 'error',
          summary: 'Invalid Email',
          detail: 'Please enter a valid email address.',
          life: 3000
        });
        return;
      }
      if (password !== confirmPassword) {
        toast.current?.show({
          severity: 'error',
          summary: 'Password Mismatch',
          detail: 'Passwords do not match. Please try again.',
          life: 3000
        });
        return;
      }
      if (password.length < 8) {
        toast.current?.show({
          severity: 'error',
          summary: 'Weak Password',
          detail: 'Password must be at least 8 characters long.',
          life: 3000
        });
        return;
      }
      setRegistrationStep('verify');
      return;
    }

    if (registrationKey.trim() !== REGISTRATION_KEY) {
      toast.current?.show({
        severity: 'error',
        summary: 'Invalid Registration Key',
        detail: 'The registration key is invalid. Please scan the correct QR code.',
        life: 3000
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password);
      toast.current?.show({
        severity: 'success',
        summary: 'Account Created',
        detail: 'Your account has been successfully created. Signing you in...',
        life: 3000
      });
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || "/lucky-draw");
    } catch (error: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Registration Failed',
        detail: error instanceof Error ? error.message : 'Failed to register account. Please try again.',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    setRegistrationKey(decodedText);
    await stopScanner();
    setIsScannerOpen(false);
    if (decodedText.trim() === REGISTRATION_KEY) {
      toast.current?.show({
        severity: 'success',
        summary: 'Key Verified',
        detail: 'Registration key is valid. Click Create Account to finish.',
        life: 3000
      });
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Invalid Key',
        detail: 'This QR code is not a valid registration key.',
        life: 3000
      });
    }
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setCameraError(null);

    let attempts = 0;
    const maxAttempts = 10;

    const tryStart = async () => {
      const element = document.getElementById("register-qr-reader");
      if (element) {
        try {
          if (qrReaderRef.current) {
            await stopScanner();
          }
          const html5QrCode = new Html5Qrcode("register-qr-reader");
          qrReaderRef.current = html5QrCode;
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            handleScanSuccess,
            () => {}
          );
        } catch (err: unknown) {
          setCameraError(err instanceof Error ? err.message : "Unable to access camera. Please grant camera permission.");
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryStart, 100);
      } else {
        setCameraError("Scanner container not found. Please try again.");
      }
    };

    setTimeout(tryStart, 200);
  };

  const stopScanner = async () => {
    if (qrReaderRef.current && qrReaderRef.current.isScanning) {
      try {
        await qrReaderRef.current.stop();
        await qrReaderRef.current.clear();
      } catch {
        // ignore stop errors
      }
    }
    qrReaderRef.current = null;
  };

  const closeScannerModal = async () => {
    await stopScanner();
    setIsScannerOpen(false);
  };

  const resetRegistration = () => {
    setRegistrationStep('credentials');
    setRegistrationKey("");
    setConfirmPassword("");
  };

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      await authService.deleteAccount(email, password);
      toast.current?.show({
        severity: 'success',
        summary: 'Account Deleted',
        detail: 'Your account has been successfully deleted.',
        life: 3000
      });
      setEmail("");
      setPassword("");
      setIsDeleting(false);
      setTimeout(() => navigate("/"), 2000);
    } catch (error: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Delete Failed',
        detail: error instanceof Error ? error.message : 'Failed to delete account. Please check your credentials.',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-page min-h-screen flex flex-column align-items-center justify-content-center px-3 relative overflow-hidden"
         style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--text-primary)' }}>
      <Toast ref={toast} position="bottom-center" />

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(209,223,246,0.07) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(209,223,246,0.06) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .custom-input {
          width: 100%; padding: 14px 18px; background: rgba(255,255,255,0.4); border: 1.5px solid rgba(255,255,255,0.65); border-radius: 14px; color: var(--text-primary); font-size: 15px; font-weight: 500; transition: all 0.25s ease;
        }
        .custom-input:focus { outline: none; border-color: rgba(209,223,246,0.6); background: rgba(255,255,255,0.7); box-shadow: 0 0 0 4px rgba(209,223,246,0.12); }

        .login-btn {
          background: rgba(209,223,246,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(209,223,246,0.5); border-radius: 16px; padding: 16px; color: white; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 24px rgba(209,223,246,0.25);
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); background: rgba(168,192,232,0.92); box-shadow: 0 12px 32px rgba(209,223,246,0.35); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-0 left-0 m-4 p-2 flex align-items-center gap-2 border-none bg-transparent cursor-pointer"
        style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', zIndex: 10 }}
      >
        <CaretLeft size={20} weight="bold" />
        Back to Home
      </button>

      <main className="w-full relative z-1" style={{ maxWidth: '420px' }}>
        <div className="login-card glass-card p-6 flex flex-column gap-5" style={{ borderRadius: '32px' }}>
          
          <div className="text-center">
            <p className="m-0 text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              Adiwarna Fest 2026
            </p>
            <h1 style={{
              fontFamily: 'Epilogue, sans-serif',
              fontSize: '32px',
              fontWeight: 900,
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              {isDeleting ? 'Delete Account' : isRegistering ? (registrationStep === 'verify' ? 'Verify Key' : 'Join Adiwarna') : 'Welcome Back'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, fontWeight: 500 }}>
              {isDeleting ? 'Permanently delete your account and data.' : isRegistering ? (registrationStep === 'verify' ? 'Scan the registration QR code to continue.' : 'Create your account to join the fest.') : 'Sign in to access your lucky draw pass.'}
            </p>
          </div>

          {isRegistering && registrationStep === 'verify' ? (
            <form onSubmit={handleRegister} className="flex flex-column gap-4">
              <div className="border-round-xl p-4 flex flex-column gap-3 align-items-center text-center" style={{ backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '2px dashed rgba(124, 58, 237, 0.3)' }}>
                <div className="border-round-xl p-3" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                  <ShieldCheck size={32} weight="bold" color="#fff" />
                </div>
                <p className="m-0 text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                  Registration Approval Required
                </p>
                <p className="m-0 text-xs" style={{ color: '#6b7280' }}>
                  Scan the QR code provided by the Adiwarna committee.
                </p>
                <div className="border-round-lg p-3 w-full" style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                  <p className="m-0 text-xs font-bold" style={{ color: '#6d28d9' }}>
                    📍 Please find <span style={{ textDecoration: 'underline' }}>GADPA Booth at B1-1st Floor</span> to ask for the QR Approval
                  </p>
                </div>
              </div>

              <div className="button-wrap w-full">
                <button type="button" className="premium-btn w-full" onClick={startScanner} style={{ fontFamily: 'Epilogue, sans-serif' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                    <Camera size={20} /> Scan QR Code
                  </span>
                </button>
                <div className="button-shadow" />
              </div>

              {registrationKey && registrationKey.trim() === REGISTRATION_KEY && (
                <div className="border-round-xl p-3 flex align-items-center gap-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <ShieldCheck size={20} weight="fill" color="#22C55E" />
                  <p className="m-0 text-xs font-bold" style={{ color: '#15803d' }}>
                    Registration key verified successfully!
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  label="Back"
                  onClick={resetRegistration}
                  className="flex-1"
                  outlined
                  severity="secondary"
                  style={{ borderRadius: '14px', padding: '14px', fontWeight: 700 }}
                />
                <Button
                  className="login-btn flex-1"
                  type="submit"
                  disabled={loading || registrationKey.trim() !== REGISTRATION_KEY}
                  label={loading ? "Creating..." : "Create Account"}
                  loading={loading}
                />
              </div>
            </form>
          ) : (
            <form onSubmit={isDeleting ? handleDeleteAccount : (isRegistering ? handleRegister : handleLogin)} className="flex flex-column gap-4">
              <div className="flex flex-column gap-2">
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '4px' }}>Email Address</label>
                <InputText
                  className="custom-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-column gap-2">
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <InputText
                    className="custom-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div className="flex flex-column gap-2">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '4px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <InputText
                      className="custom-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {!isRegistering && !isDeleting && (
                <div className="flex justify-content-end">
                  <button type="button" style={{ border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <div style={{ fontSize: '15px' }}>
                {isDeleting ? (
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '13px 20px', borderRadius: '999px',
                      border: '1px solid rgba(220,38,38,0.45)', background: 'rgba(220,38,38,0.18)',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      color: '#dc2626', fontFamily: 'Epilogue, sans-serif', fontWeight: 700,
                      fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Trash size={18} weight="fill" />
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                ) : (
                  <div className="button-wrap w-full">
                    <button type="submit" className="premium-btn w-full" disabled={loading} style={{ fontFamily: 'Epilogue, sans-serif' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        {isRegistering ? <><QrCode size={18} weight="bold" /> {loading ? 'Checking...' : 'Continue'}</> : <><ArrowRight size={18} weight="bold" /> {loading ? 'Signing in...' : 'Sign In'}</>}
                      </span>
                    </button>
                    <div className="button-shadow" />
                  </div>
                )}
              </div>
            </form>
          )}

          <div className="flex flex-column gap-3">
            <div className="text-center">
              <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                {isDeleting ? "Back to login? " : isRegistering ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isDeleting) {
                    setIsDeleting(false);
                    setIsRegistering(false);
                  } else {
                    setIsRegistering(!isRegistering);
                  }
                  resetRegistration();
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {isDeleting ? "Sign In" : isRegistering ? "Sign In" : "Create Account"}
              </button>
            </div>

          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-5" style={{ opacity: 0.6 }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>
            Adiwarna Fest 2026 · Xiamen University Malaysia
          </p>
        </div>
      </main>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div
          className="fixed inset-0 flex align-items-center justify-content-center px-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white border-round-2xl p-4 w-full shadow-8 flex flex-column gap-4" style={{ maxWidth: '420px' }}>
            <div className="flex justify-content-between align-items-center">
              <div className="flex align-items-center gap-2">
                <QrCode size={24} weight="bold" color="#7c3aed" />
                <h3 className="m-0 text-lg font-bold" style={{ color: '#1a1a1a' }}>Scan Registration QR</h3>
              </div>
              <button
                type="button"
                onClick={closeScannerModal}
                className="bg-transparent border-none cursor-pointer p-1"
                style={{ color: '#6b7280' }}
              >
                <XCircle size={28} weight="bold" />
              </button>
            </div>

            {cameraError ? (
              <div className="border-round-xl p-4 text-center" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <p className="m-0 text-sm font-bold mb-2" style={{ color: '#dc2626' }}>Camera Error</p>
                <p className="m-0 text-xs" style={{ color: '#7f1d1d' }}>{cameraError}</p>
              </div>
            ) : (
              <div
                id="register-qr-reader"
                className="border-round-xl overflow-hidden"
                style={{ width: '100%', minHeight: '300px', backgroundColor: '#000' }}
              />
            )}

            <p className="m-0 text-xs text-center" style={{ color: '#6b7280' }}>
              Point your camera at the registration QR code provided by the Adiwarna committee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
