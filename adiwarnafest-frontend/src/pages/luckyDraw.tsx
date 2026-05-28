import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import {
  CheckCircle,
  QrCode,
  MapPin,
  GameController,
  Trophy,
  Camera,
  XCircle,
  Sparkle,
  UserCircle
} from '@phosphor-icons/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../store/auth';
import { luckyDrawService } from '../services/luckyDraw';

// Booth Images
import adiwarnaLogo from '../image/Adiwarna_Logo_NoBackground.png';
import gadpaLogo from '../image/gadpa_xmum_logo.png';
import anyTimeFitnessLogo from '/Anytime_fitness_logo.jpeg';
import plainBackground from '../image/Plain_Background.png';

interface Booth {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
}

const BOOTHS: Booth[] = [
  {
    id: 'ADIWARNA2026FEST8h7X9kL2mN4pQ6rS8tUvWx',
    name: 'Vendor Booth',
    location: 'B1 - Ground Floor & 1st Floor',
    image: adiwarnaLogo,
    description: 'Purchase any vendor booth offering delicious food, unique accessories, and more. Browse through our diverse selection of vendors and make your purchase to receive a QR code for the lucky draw.'
  },
  {
    id: 'ADIWARNA2026FEST3aB5cD7eF9gH1jK2lM4nO6',
    name: 'GADPA Booth',
    location: 'B1 - 1st Floor',
    image: gadpaLogo,
    description: 'Purchase from our GADPA booth and choose from: 1. Donat, 2. Nutrisasri, or 3. Simfoni Ticket. Complete any of these purchases to receive your QR code for the lucky draw.'
  },
  {
    id: 'ADIWARNA2026FEST5xY2zZ9kL1mN7pQ3rS6tUvWx',
    name: 'Sponsor Booth',
    location: 'B1 - Ground Floor',
    image: anyTimeFitnessLogo,
    description: 'Visit our sponsor booth, Anytime Fitness. Learn about their exclusive services and fitness programs, then claim your QR code to enter the lucky draw.'
  }
];

const LuckyDraw: React.FC = () => {
  const { username, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scannedBooths, setScannedBooths] = useState<string[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    name: '',
    phone: '',
    instagram: '',
    agreed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Load scanned booths from backend API on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    const loadStatus = async () => {
      try {
        const status = await luckyDrawService.getStatus();
        setScannedBooths(status.scannedBooths.map(s => s.boothId));
        setIsSubmitted(status.hasSubmitted);
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load your progress. Please refresh the page.',
          life: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, [isAuthenticated]);

  const handleScanSuccess = async (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 2000) {
      return;
    }
    lastScanTimeRef.current = now;

    if (selectedBooth && decodedText === selectedBooth.id) {
      if (!scannedBooths.includes(selectedBooth.id)) {
        try {
          await luckyDrawService.scanQr(selectedBooth.id);
          const newScanned = [...scannedBooths, selectedBooth.id];
          setScannedBooths(newScanned);
          toast.current?.show({
            severity: 'success',
            summary: 'Booth Verified!',
            detail: `You have successfully checked in at ${selectedBooth.name}.`,
            life: 3000
          });

          if (newScanned.length === 3) {
            toast.current?.show({
              severity: 'info',
              summary: 'Lucky Draw Eligible!',
              detail: 'Congratulations! You have scanned all 3 booths and are now eligible for the Lucky Draw.',
              life: 5000
            });
          }
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Scan Failed',
            detail: 'Failed to record your scan. Please try again.',
            life: 3000
          });
        }
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Already Scanned',
          detail: 'You have already scanned this booth.',
          life: 3000
        });
      }
      stopScanner();
      setIsDetailsOpen(false);
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Invalid QR Code',
        detail: 'This QR code does not match the current booth.',
        life: 3000
      });
    }
  };

  const startScanner = async () => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError("Camera access requires a secure connection (HTTPS). Please use localhost or an HTTPS URL.");
      setIsScanning(true);
      return;
    }

    setIsScanning(true);
    setCameraError(null);
    
    // Use a more robust check for the element
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryStart = async () => {
      const element = document.getElementById("qr-reader");
      if (element) {
        try {
          if (qrReaderRef.current) {
            await stopScanner();
          }
          
          const html5QrCode = new Html5Qrcode("qr-reader");
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
            () => {} // Ignored
          );
        } catch (err: unknown) {
          setCameraError(err instanceof Error ? err.message : "Unable to access camera. Please ensure permissions are granted.");
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
    setIsScanning(false);
    qrReaderRef.current = null;
  };

  const openBoothDetails = (booth: Booth) => {
    setSelectedBooth(booth);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    if (isScanning) {
      stopScanner();
    }
    setIsDetailsOpen(false);
    setSelectedBooth(null);
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionForm.agreed) {
      toast.current?.show({ severity: 'warn', summary: 'Agreement Required', detail: 'Please acknowledge the terms and conditions.' });
      return;
    }
    if (!submissionForm.name.trim() || submissionForm.name.trim().length > 100) {
      toast.current?.show({ severity: 'error', summary: 'Invalid Name', detail: 'Full name is required and must be under 100 characters.' });
      return;
    }
    if (!/^\+?[0-9\s\-]{7,20}$/.test(submissionForm.phone)) {
      toast.current?.show({ severity: 'error', summary: 'Invalid Phone', detail: 'Please enter a valid phone number.' });
      return;
    }
    if (!/^@?[A-Za-z0-9._]{1,50}$/.test(submissionForm.instagram)) {
      toast.current?.show({ severity: 'error', summary: 'Invalid Instagram', detail: 'Please enter a valid Instagram handle.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await luckyDrawService.submitEntry({
        fullName: submissionForm.name,
        phoneNumber: submissionForm.phone,
        instagramHandle: submissionForm.instagram,
      });

      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
      setIsSubmitted(true);
      toast.current?.show({
        severity: 'success',
        summary: 'Entry Submitted!',
        detail: 'Good luck! Your entry has been recorded for the grand lucky draw.',
        life: 5000
      });
    } catch (error) {
      setIsSubmitting(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'Failed to submit your entry. Please try again.',
        life: 3000
      });
    }
  };

  const progress = (scannedBooths.length / 3) * 100;

  if (isLoading) {
    return (
      <div className="glass-page min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner mb-3"></div>
          <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Require login before scanning
  if (!isAuthenticated) {
    return (
      <div
        className="fadein animation-duration-500"
        style={{
          fontFamily: 'Epilogue, sans-serif',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          boxSizing: 'border-box',
          background: 'var(--page-gradient)',
        }}
      >
        {/* Icon */}
        <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 20px rgba(255,215,0,0.1)', flexShrink: 0 }}>
          <Trophy size={34} weight="fill" color="#F59E0B" />
        </div>

        {/* Heading */}
        <h1 className="m-0 text-3xl font-black text-center" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Lucky Draw
        </h1>
        <p className="m-0 text-center mt-2 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, maxWidth: '300px', lineHeight: 1.55 }}>
          Scan QR codes at all 3 booths and enter the grand prize draw at Adiwarna Fest 2026.
        </p>

        {/* Steps preview */}
        <div className="w-full mb-5" style={{ maxWidth: '340px', padding: '20px 24px', background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <p className="m-0 mb-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>How it works</p>
          {[
            { num: '1', text: 'Visit any of the 3 participating booths' },
            { num: '2', text: 'Scan the booth QR code with this app' },
            { num: '3', text: 'Complete all 3 booths to enter the draw' },
          ].map(step => (
            <div key={step.num} className="flex align-items-start gap-3 mb-3">
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(-75deg, rgba(209,223,246,0.25), rgba(209,223,246,0.65), rgba(209,223,246,0.25))', border: '1px solid rgba(209,223,246,0.5)', boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a5f' }}>{step.num}</span>
              </div>
              <p className="m-0 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: '4px' }}>{step.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 w-full" style={{ maxWidth: '340px', fontSize: '14px' }}>
          <div style={{ flex: '1 1 50%', minWidth: 0 }}>
            <div className="button-wrap w-full">
              <button className="premium-btn w-full" onClick={() => navigate('/login', { state: { from: '/lucky-draw' } })} style={{ fontFamily: 'Epilogue, sans-serif' }}>
                <span style={{ textAlign: 'center', display: 'block', width: '100%' }}>Login</span>
              </button>
              <div className="button-shadow" />
            </div>
          </div>
          <div style={{ flex: '1 1 50%', minWidth: 0 }}>
            <div className="button-wrap w-full">
              <button className="premium-btn w-full" onClick={() => navigate('/login', { state: { from: '/lucky-draw', register: true } })} style={{ fontFamily: 'Epilogue, sans-serif' }}>
                <span style={{ textAlign: 'center', display: 'block', width: '100%' }}>Register Here</span>
              </button>
              <div className="button-shadow" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-page fadein animation-duration-1000 p-0 overflow-x-hidden" style={{ fontFamily: 'Epilogue, sans-serif' }}>
      <Toast ref={toast} position="bottom-center" />

      {/* Hero Header Section */}
      <section className="relative pt-6 pb-4 px-4 overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #a14000 100%)',
        backgroundImage: `url(${plainBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <Sparkle size={100} weight="fill" className="absolute" style={{ top: '10%', left: '5%', animation: 'pulse 3s infinite' }} />
          <Trophy size={150} weight="fill" className="absolute" style={{ bottom: '-20px', right: '5%', transform: 'rotate(-15deg)' }} />
          <QrCode size={80} weight="bold" className="absolute" style={{ top: '40%', right: '10%', opacity: 0.1 }} />
        </div>

        <div className="relative z-1 flex flex-column align-items-center text-center gap-2 mb-6 mt-4">
          <div className="bg-white-alpha-20 border-round-3xl px-3 py-1 flex align-items-center gap-2 border-1 border-white-alpha-30 mb-2">
            <Trophy size={16} weight="fill" color="#A14000" />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#3a1800' }}>Adiwarna Fest 2026</span>
          </div>
          <h1 className="m-0 text-4xl md:text-5xl font-black line-height-1" style={{ color: '#3a1800' }}>LUCKY DRAW</h1>
          <div className="flex align-items-center gap-2 mt-1">
            <UserCircle size={18} weight="fill" color="rgba(58,24,0,0.7)" />
            <p className="m-0 text-sm font-bold uppercase tracking-widest" style={{ color: 'rgba(58,24,0,0.85)' }}>
              {username || 'Participant'}
            </p>
          </div>
          <p className="m-0 text-sm font-medium max-w-20rem line-height-3 mt-2" style={{ color: 'rgba(58,24,0,0.85)' }}>
            Scan QR codes at all 3 booths to unlock your chance to win grand prizes!
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="relative z-2 mx-auto max-w-30rem -mb-12 px-4">
          <div className="glass-card p-3 md:p-4">
            <div className="flex justify-content-between align-items-end mb-3 gap-2">
              <div className="flex-1">
                <h3 className="m-0 text-xs md:text-sm font-bold text-900 uppercase tracking-wide">Your Progress</h3>
                <p className="m-0 text-[10px] md:text-xs text-500">{scannedBooths.length} of 3 booths completed</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xl md:text-2xl font-black" style={{ color: '#A14000' }}>{Math.round(progress)}%</span>
              </div>
            </div>
            <ProgressBar value={progress} showValue={false} style={{ height: '12px', borderRadius: '6px', backgroundColor: 'var(--color-border)' }} />
            
            {scannedBooths.length === 3 && (
              <div className="mt-3 bg-green-50 p-2 border-round-lg flex align-items-center gap-2 border-1 border-green-200 fadein animation-duration-500">
                <CheckCircle size={20} weight="fill" color="#22C55E" />
                <span className="text-xs font-bold text-green-700">You are eligible for the Lucky Draw!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booths Grid */}
      <main className="px-4 pt-10 pb-6 mx-auto w-full" style={{ maxWidth: '1024px' }}>

        {/* Submit Button Section */}
        <section className="mt-4 mb-6 px-4 flex flex-column align-items-center gap-4">
          <div className="text-center">
            <h3 className="m-0 text-lg md:text-xl font-bold text-900 mb-2">Ready for the Grand Draw?</h3>
            <p className="m-0 text-xs md:text-sm text-600">Complete all booth challenges to unlock your entry form.</p>
          </div>

          <div className={`w-full max-w-25rem ${scannedBooths.length === 3 && !isSubmitted ? 'pulse-button' : ''}`} style={{ fontSize: '15px' }}>
            {scannedBooths.length < 3 && !isSubmitted ? (
              /* Locked state — visually disabled */
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '999px',
                  border: '1px solid rgba(200,210,225,0.4)',
                  background: 'rgba(200,210,225,0.18)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: 'rgba(100,130,170,0.45)',
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em',
                  boxShadow: 'none',
                }}
              >
                <Sparkle size={20} weight="regular" />
                Submit Lucky Draw Entry
              </button>
            ) : (
              /* Active state — full glass button */
              <div className="button-wrap w-full">
                <button
                  className="premium-btn w-full"
                  disabled={isSubmitted}
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    {isSubmitted
                      ? <><CheckCircle size={20} weight="fill" /> Entry Submitted</>
                      : <><Sparkle size={20} weight="fill" /> Submit Lucky Draw Entry</>
                    }
                  </span>
                </button>
                <div className="button-shadow" />
              </div>
            )}
          </div>

          {!isSubmitted && scannedBooths.length < 3 && (
            <p className="m-0 text-xs font-bold text-500 uppercase tracking-widest">
              {3 - scannedBooths.length} Booths Remaining
            </p>
          )}

          <div className="button-wrap" style={{ fontSize: '13px' }}>
            <button className="premium-btn" onClick={() => navigate("/map")} style={{ fontFamily: 'Epilogue, sans-serif' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <MapPin size={18} weight="fill" />
                View Vendor Map
              </span>
            </button>
            <div className="button-shadow" />
          </div>
        </section>

        <div className="flex flex-column gap-3">
          {BOOTHS.map((booth, index) => {
            const isScanned = scannedBooths.includes(booth.id);
            return (
              <div
                key={booth.id}
                className={`flex align-items-center gap-2 md:gap-4 p-3 md:p-4 cursor-pointer transition-all duration-300 transform active:scale-95 ${isScanned ? 'opacity-80' : ''}`}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(161,64,0,0.12)",
                  borderRadius: "24px",
                  boxShadow: "0 8px 24px rgba(161,64,0,0.06)",
                }}
                onClick={() => openBoothDetails(booth)}
              >
                {/* Logo/Image on Left */}
                <div className="flex-shrink-0">
                  <img
                    src={booth.image}
                    alt={booth.name}
                    style={{
                      width: 'min(80px, 20vw)',
                      height: 'min(80px, 20vw)',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      filter: isScanned ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.8)',
                      transition: 'filter 0.5s ease-in-out'
                    }}
                  />
                </div>

                {/* Details on Right */}
                <div className="flex-1 flex flex-column justify-content-between">
                  <div>
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="button-wrap" style={{ fontSize: '9px' }}>
                        <div className="premium-btn">
                          <span className="font-bold uppercase tracking-wider" style={{ paddingInline: '0.9em', paddingBlock: '0.4em' }}>Booth {index + 1}</span>
                        </div>
                        <div className="button-shadow" />
                      </div>
                      {isScanned && (
                        <div className="bg-green-100 border-round-lg px-2 py-1 text-[8px] font-bold text-green-700 uppercase tracking-wider">Completed</div>
                      )}
                    </div>
                    <h4 className="m-0 text-lg font-bold text-900 leading-tight">{booth.name}</h4>
                    <div className="flex align-items-center gap-1 text-600 text-[12px] mt-2">
                      <MapPin size={12} weight="fill" />
                      <span>{booth.location}</span>
                    </div>
                  </div>
                </div>

                {/* QR/Check Icon on Right */}
                <div className="flex-shrink-0">
                  {isScanned ? (
                    <div className="border-circle shadow-4 flex align-items-center justify-content-center" style={{ backgroundColor: '#22C55E', width: 'min(50px, 12vw)', height: 'min(50px, 12vw)', minWidth: '50px', minHeight: '50px' }}>
                      <CheckCircle size={24} weight="fill" color="#ffffff" />
                    </div>
                  ) : (
                    <div className="button-wrap" style={{ fontSize: '14px' }}>
                      <div
                        className="premium-btn flex align-items-center justify-content-center"
                        style={{ width: 'min(50px, 12vw)', height: 'min(50px, 12vw)', minWidth: '50px', minHeight: '50px', borderRadius: '999vw' }}
                      >
                        <span style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <QrCode size={24} color="#3a1800" weight="bold" />
                        </span>
                      </div>
                      <div className="button-shadow" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <section className="mt-6 px-4">
          <div className="glass-card p-3 md:p-4 flex gap-3 md:gap-4 align-items-start">
            <div className="flex-1 min-w-0">
              <h4 className="m-0 text-[10px] md:text-sm font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>How it works</h4>
              <ul className="m-0 p-0 list-none flex flex-column gap-2">
                {[
                  'Visit any of the 3 booths listed above.',
                  'Participate in the game activity and win!',
                  'Ask the booth attendant to show you the exclusive QR code.',
                  'Scan the QR code using this app to mark it as completed.',
                  'Complete all 3 booths to be automatically entered into the grand Lucky Draw.'
                ].map((text, i) => (
                  <li key={i} className="text-[9px] md:text-xs flex gap-1 md:gap-2 align-items-start" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Booth Details Modal */}
      <Dialog 
        visible={isDetailsOpen} 
        onHide={closeDetails}
        showHeader={false}
        contentClassName="p-0 border-round-2xl"
        style={{ width: '90vw', maxWidth: '450px', maxHeight: '95vh' }}
        contentStyle={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        dismissableMask
        modal
      >
        {selectedBooth && (
          <div className="flex flex-column h-full relative">
            {/* Close Button */}
            <button
              onClick={closeDetails}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.12)',
                background: 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.18)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <XCircle size={22} weight="fill" color="#111827" />
            </button>

            {/* Booth Image Header */}
            <div className="relative h-15rem overflow-hidden">
              <img 
                src={selectedBooth.image} 
                alt={selectedBooth.name} 
                className="w-full h-full" 
                style={{ 
                  objectFit: 'cover', 
                  objectPosition: 'center',
                  filter: scannedBooths.includes(selectedBooth.id) ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.8)',
                  transition: 'filter 0.5s ease'
                }} 
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)' }}></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h2 className="m-0 text-2xl font-bold text-white">{selectedBooth.name}</h2>
                <div className="flex align-items-center gap-2 text-white-alpha-80 text-sm mt-1">
                  <MapPin size={16} weight="fill" color="var(--color-primary-light)" />
                  <span>{selectedBooth.location}</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 bg-white flex-1">
              {isScanning ? (
                <div className="flex flex-column align-items-center gap-4 py-2">
                  <div className="text-center">
                    <h3 className="m-0 text-lg font-bold text-900">Scan QR Code</h3>
                    <p className="m-0 text-xs text-600">Point your camera at the booth's QR code</p>
                  </div>
                  
                  <div className="relative w-full aspect-square border-round-2xl overflow-hidden bg-black shadow-8 border-2 border-primary" style={{ touchAction: 'none' }}>
                    <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
                    
                    {/* Scanning Overlay Animation */}
                    {!cameraError && (
                      <div className="absolute top-0 left-0 w-full h-2px bg-primary shadow-4 scanner-line"></div>
                    )}
                    
                    {cameraError && (
                      <div className="absolute inset-0 flex flex-column align-items-center justify-content-center p-4 text-center gap-3">
                        <Camera size={48} weight="duotone" color="var(--color-primary)" />
                        <p className="m-0 text-white text-sm font-medium">{cameraError}</p>
                        <Button label="Retry" icon="pi pi-refresh" className="p-button-sm p-button-outlined" onClick={startScanner} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-column gap-2 w-full">
                    <button
                      onClick={stopScanner}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,100,100,0.45)',
                        background: 'rgba(220,38,38,0.18)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#dc2626',
                        fontFamily: 'Epilogue, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(220,38,38,0.15)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.28)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,100,100,0.65)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.975)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.18)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,100,100,0.45)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                    >
                      <XCircle size={20} weight="fill" /> Cancel Scanning
                    </button>
                  </div>

                  <p className="m-0 text-[10px] text-500 font-italic text-center px-4">
                    *Ensure you are scanning the official Adiwarna Fest QR code located at this booth.
                  </p>
                </div>
              ) : (
                <div className="flex flex-column gap-4 py-2">
                  <div className="bg-gray-50 border-round-xl p-3 border-1 border-gray-100">
                    <h4 className="m-0 text-xs font-bold text-500 uppercase tracking-widest mb-2 flex align-items-center gap-2">
                      <GameController size={16} />
                      Activity Description
                    </h4>
                    <p className="m-0 text-sm text-700 line-height-3">
                      {selectedBooth.description}
                    </p>
                  </div>

                  {scannedBooths.includes(selectedBooth.id) ? (
                    <div className="flex flex-column align-items-center gap-2 py-2">
                      <div className="bg-green-100 border-circle p-4 mb-2">
                        <CheckCircle size={48} weight="fill" color="#22C55E" />
                      </div>
                      <h3 className="m-0 text-xl font-bold text-green-700">Already Scanned!</h3>
                      <p className="m-0 text-sm text-600 text-center">You have completed this booth challenge.</p>
                      <Button label="Back to Grid" className="mt-3 p-button-outlined w-full border-round-xl" onClick={closeDetails} />
                    </div>
                  ) : (
                    <div className="button-wrap w-full" style={{ fontSize: '16px' }}>
                      <button className="premium-btn w-full" onClick={startScanner}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <QrCode size={22} weight="bold" /> Scan QR Code
                        </span>
                      </button>
                      <div className="button-shadow" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Submission Modal */}
      <Dialog
        visible={isSubmitModalOpen}
        onHide={() => setIsSubmitModalOpen(false)}
        header={false}
        showHeader={false}
        contentClassName="p-0 border-round-2xl"
        style={{ width: '90vw', maxWidth: '450px', maxHeight: '95vh' }}
        contentStyle={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        modal
      >
        <div style={{ background: 'rgba(238,244,253,0.96)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', padding: '24px 20px' }}>
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-2">
              <Sparkle size={26} weight="fill" color="var(--text-secondary)" />
              <h2 className="m-0 text-xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Final Entry</h2>
            </div>
            <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <XCircle size={26} weight="fill" color="var(--text-muted)" />
            </button>
          </div>

          <p className="mb-5 line-height-3" style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
            Please fill in your contact details correctly. We will use this information to contact you if you win.
          </p>

          <form onSubmit={handleSubmitEntry} className="flex flex-column gap-4">
            {/* Full Name */}
            <div className="flex flex-column gap-1">
              <label htmlFor="name" className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.72)', borderRadius: '14px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)', overflow: 'hidden' }}>
                <div style={{ padding: '0 12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <i className="pi pi-user" style={{ fontSize: '13px' }} />
                </div>
                <InputText
                  id="name"
                  value={submissionForm.name}
                  onChange={(e) => setSubmissionForm({...submissionForm, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="flex-1 border-none"
                  style={{ background: 'transparent', boxShadow: 'none', outline: 'none', padding: '11px 12px 11px 0', fontSize: '14px', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-column gap-1">
              <label htmlFor="phone" className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>WhatsApp / Phone</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.72)', borderRadius: '14px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)', overflow: 'hidden' }}>
                <div style={{ padding: '0 12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <i className="pi pi-phone" style={{ fontSize: '13px' }} />
                </div>
                <InputText
                  id="phone"
                  value={submissionForm.phone}
                  onChange={(e) => setSubmissionForm({...submissionForm, phone: e.target.value})}
                  placeholder="+60 12-345 6789"
                  className="flex-1 border-none"
                  style={{ background: 'transparent', boxShadow: 'none', outline: 'none', padding: '11px 12px 11px 0', fontSize: '14px', color: 'var(--text-primary)' }}
                  type="tel"
                  required
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="flex flex-column gap-1">
              <label htmlFor="instagram" className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Instagram</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.72)', borderRadius: '14px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)', overflow: 'hidden' }}>
                <div style={{ padding: '0 12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <i className="pi pi-instagram" style={{ fontSize: '13px' }} />
                </div>
                <InputText
                  id="instagram"
                  value={submissionForm.instagram}
                  onChange={(e) => setSubmissionForm({...submissionForm, instagram: e.target.value})}
                  placeholder="@username"
                  className="flex-1 border-none"
                  style={{ background: 'transparent', boxShadow: 'none', outline: 'none', padding: '11px 12px 11px 0', fontSize: '14px', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            {/* Agreement */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: '14px' }}>
              <Checkbox
                inputId="agree"
                checked={submissionForm.agreed}
                onChange={e => setSubmissionForm({...submissionForm, agreed: e.checked || false})}
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <label htmlFor="agree" style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6, cursor: 'pointer' }}>
                I acknowledge that I must be <strong>attending the lucky draw session on the spot</strong>. If my name is called and I am not present, the reward will be dismissed and a redraw will occur.
              </label>
            </div>

            {/* Submit */}
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {submissionForm.name.trim() && submissionForm.phone.trim() && submissionForm.instagram.trim() && submissionForm.agreed && !isSubmitting ? (
                <div className="button-wrap w-full">
                  <button type="submit" className="premium-btn w-full">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <Sparkle size={16} weight="fill" /> Confirm &amp; Submit Entry
                    </span>
                  </button>
                  <div className="button-shadow" />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled
                  style={{
                    width: '100%', padding: '13px 20px', borderRadius: '999px',
                    border: '1px solid rgba(200,210,225,0.4)', background: 'rgba(200,210,225,0.18)',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    color: 'rgba(100,130,170,0.45)', fontFamily: 'Epilogue, sans-serif',
                    fontWeight: 700, fontSize: '14px', cursor: 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <Sparkle size={16} weight="regular" />
                  {isSubmitting ? 'Submitting…' : 'Confirm & Submit Entry'}
                </button>
              )}
            </div>
          </form>
        </div>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-button {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(209, 223, 246, 0.4); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(209, 223, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(209, 223, 246, 0); }
        }
        .pulse-button {
          animation: pulse-button 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.2; }
        }
        .scanner-line {
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .scanner-line {
          background: linear-gradient(to right, transparent, var(--color-primary), transparent);
          height: 4px;
          opacity: 0.8;
          box-shadow: 0 0 10px var(--color-primary);
        }
        #qr-reader video {
          border-radius: 1rem;
          object-fit: cover;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default LuckyDraw;
