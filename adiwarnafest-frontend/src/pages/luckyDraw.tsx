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
  Info,
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
  }, []);

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
      <div className="surface-0 min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner mb-3"></div>
          <p className="text-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Require login before scanning
  if (!isAuthenticated) {
    navigate("/login", { state: { from: "/lucky-draw" } });
    return null;
  }

  return (
    <div className="surface-0 min-h-screen fadein animation-duration-1000 p-0 overflow-x-hidden" style={{ fontFamily: 'Epilogue, sans-serif' }}>
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
            <Trophy size={16} weight="fill" color="#FFD700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Adiwarna Fest 2026</span>
          </div>
          <h1 className="m-0 text-4xl md:text-5xl font-black text-white line-height-1">LUCKY DRAW</h1>
          <div className="flex align-items-center gap-2 mt-1">
            <UserCircle size={18} weight="fill" color="rgba(255,255,255,0.7)" />
            <p className="m-0 text-white-alpha-80 text-sm font-bold uppercase tracking-widest">
              {username || 'Participant'}
            </p>
          </div>
          <p className="m-0 text-white-alpha-80 text-sm font-medium max-w-20rem line-height-3 mt-2">
            Scan QR codes at all 3 booths to unlock your chance to win grand prizes!
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="relative z-2 mx-auto max-w-30rem -mb-12 px-4">
          <div className="bg-white border-round-2xl p-3 md:p-4 shadow-8 border-1" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-content-between align-items-end mb-3 gap-2">
              <div className="flex-1">
                <h3 className="m-0 text-xs md:text-sm font-bold text-900 uppercase tracking-wide">Your Progress</h3>
                <p className="m-0 text-[10px] md:text-xs text-500">{scannedBooths.length} of 3 booths completed</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
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
        <div className="flex flex-column gap-3 mt-4">
          {BOOTHS.map((booth, index) => {
            const isScanned = scannedBooths.includes(booth.id);
            return (
              <div
                key={booth.id}
                className={`flex align-items-center gap-2 md:gap-4 bg-white border-round-2xl p-3 md:p-4 shadow-4 cursor-pointer transition-all duration-300 transform active:scale-95 ${isScanned ? 'opacity-80' : 'hover:shadow-7'}`}
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
                      <div className="bg-primary-50 border-round-lg px-2 py-1 text-[8px] font-bold text-primary uppercase tracking-wider">Booth {index + 1}</div>
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
                    <div className="border-round-xl flex align-items-center justify-content-center shadow-4" style={{ backgroundColor: 'var(--color-primary)', width: 'min(50px, 12vw)', height: 'min(50px, 12vw)', minWidth: '50px', minHeight: '50px' }}>
                      <QrCode size={24} color="#ffffff" weight="bold" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vendor Map Button */}
        <section className="mt-6 flex justify-content-center">
          <Button
            label="View Vendor Map"
            icon={<MapPin size={20} className="mr-2" />}
            className="py-3 px-6 shadow-6 border-round-xl font-bold uppercase"
            style={{
              backgroundColor: '#f0ece8',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)'
            }}
            onClick={() => navigate("/map")}
          />
        </section>

        {/* Submit Button Section */}
        <section className="mt-8 px-4 flex flex-column align-items-center gap-4">
          <div className="text-center">
            <h3 className="m-0 text-lg md:text-xl font-bold text-900 mb-2">Ready for the Grand Draw?</h3>
            <p className="m-0 text-xs md:text-sm text-600">Complete all booth challenges to unlock your entry form.</p>
          </div>

          <Button
            label={isSubmitted ? "Entry Submitted" : "Submit Lucky Draw Entry"}
            icon={isSubmitted ? <CheckCircle size={20} weight="fill" className="mr-2" /> : <Sparkle size={20} weight="fill" className="mr-2" />}
            className={`w-full max-w-25rem py-3 md:py-4 shadow-8 border-round-2xl font-bold md:font-black text-sm md:text-xl uppercase tracking-widest transition-all duration-300 ${scannedBooths.length === 3 && !isSubmitted ? 'pulse-button' : ''}`}
            disabled={scannedBooths.length < 3 || isSubmitted}
            style={{
              backgroundColor: isSubmitted ? '#22C55E' : (scannedBooths.length === 3 ? 'var(--color-primary)' : '#e3e2e0'),
              borderColor: isSubmitted ? '#22C55E' : (scannedBooths.length === 3 ? 'var(--color-primary)' : '#e3e2e0'),
              color: scannedBooths.length === 3 || isSubmitted ? '#fff' : '#8c7166'
            }}
            onClick={() => setIsSubmitModalOpen(true)}
          />

          {!isSubmitted && scannedBooths.length < 3 && (
            <p className="m-0 text-xs font-bold text-500 uppercase tracking-widest">
              {3 - scannedBooths.length} Booths Remaining
            </p>
          )}
        </section>

        {/* Info Box */}
        <section className="mt-6 px-4">
          <div className="bg-blue-50 border-round-2xl p-3 md:p-4 border-1 border-blue-100 flex gap-3 md:gap-4 align-items-start">
            <div className="bg-blue-500 border-round-xl p-2 flex align-items-center justify-content-center shadow-2 flex-shrink-0">
              <Info size={20} weight="fill" color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="m-0 text-[10px] md:text-sm font-bold text-blue-900 mb-1 uppercase tracking-wide">How it works</h4>
              <ul className="m-0 p-0 list-none flex flex-column gap-2">
                {[
                  'Visit any of the 3 booths listed above.',
                  'Participate in the game activity and win!',
                  'Ask the booth attendant to show you the exclusive QR code.',
                  'Scan the QR code using this app to mark it as completed.',
                  'Complete all 3 booths to be automatically entered into the grand Lucky Draw.'
                ].map((text, i) => (
                  <li key={i} className="text-[9px] md:text-xs text-blue-700 flex gap-1 md:gap-2 align-items-start">
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
              className="absolute top-0 right-0 m-3 p-2 bg-black-alpha-40 border-round-circle border-none cursor-pointer z-5 text-white backdrop-blur-md transition-colors hover:bg-black-alpha-60"
            >
              <XCircle size={24} weight="fill" />
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
                    <Button
                      label="Cancel Scanning"
                      icon={<XCircle size={20} className="mr-2" />}
                      className="p-button-danger p-button-text font-bold"
                      onClick={stopScanner}
                    />
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
                    <Button 
                      label="Scan QR Code" 
                      icon={<QrCode size={24} className="mr-2" />} 
                      className="w-full py-3 shadow-6 border-round-xl font-bold text-lg transform active:scale-95 transition-all"
                      style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                      onClick={startScanner}
                    />
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
        <div className="bg-white p-4">
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-2">
              <Sparkle size={28} weight="fill" color="var(--color-primary)" />
              <h2 className="m-0 text-2xl font-black text-900 tracking-tight">Final Entry</h2>
            </div>
            <button onClick={() => setIsSubmitModalOpen(false)} className="bg-transparent border-none p-1 cursor-pointer">
              <XCircle size={28} weight="fill" color="#cbd5e1" />
            </button>
          </div>

          <p className="text-sm text-600 mb-6 line-height-3">
            Please fill in your contact details correctly. We will use this information to contact you if you win.
          </p>

          <form onSubmit={handleSubmitEntry} className="flex flex-column gap-5">
            <div className="flex flex-column gap-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-500">Full Name</label>
              <div className="flex align-items-center bg-gray-50 border-1 border-round-xl overflow-hidden transition-all focus-within:border-primary" style={{ borderColor: '#f1f5f9' }}>
                <div className="pl-3 flex align-items-center justify-content-center" style={{ color: '#9ca3af' }}>
                  <i className="pi pi-user" />
                </div>
                <InputText
                  id="name"
                  value={submissionForm.name}
                  onChange={(e) => setSubmissionForm({...submissionForm, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="flex-1 p-3 border-none bg-transparent"
                  style={{ boxShadow: 'none', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-500">Whatsapp Number / Phone Number</label>
              <div className="flex align-items-center bg-gray-50 border-1 border-round-xl overflow-hidden transition-all focus-within:border-primary" style={{ borderColor: '#f1f5f9' }}>
                <div className="pl-3 flex align-items-center justify-content-center" style={{ color: '#9ca3af' }}>
                  <i className="pi pi-phone" />
                </div>
                <InputText
                  id="phone"
                  value={submissionForm.phone}
                  onChange={(e) => setSubmissionForm({...submissionForm, phone: e.target.value})}
                  placeholder="+60 12-345 6789"
                  className="flex-1 p-3 border-none bg-transparent"
                  style={{ boxShadow: 'none', outline: 'none' }}
                  type="tel"
                  required
                />
              </div>
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="instagram" className="text-xs font-bold uppercase tracking-widest text-500">Instagram</label>
              <div className="flex align-items-center bg-gray-50 border-1 border-round-xl overflow-hidden transition-all focus-within:border-primary" style={{ borderColor: '#f1f5f9' }}>
                <div className="pl-3 flex align-items-center justify-content-center" style={{ color: '#9ca3af' }}>
                  <i className="pi pi-instagram" />
                </div>
                <InputText
                  id="instagram"
                  value={submissionForm.instagram}
                  onChange={(e) => setSubmissionForm({...submissionForm, instagram: e.target.value})}
                  placeholder="@username"
                  className="flex-1 p-3 border-none bg-transparent"
                  style={{ boxShadow: 'none', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <div className="flex align-items-start gap-3 p-3 border-round-xl bg-gray-50 border-1 border-gray-100 mt-2">
              <Checkbox 
                inputId="agree" 
                checked={submissionForm.agreed} 
                onChange={e => setSubmissionForm({...submissionForm, agreed: e.checked || false})} 
                className="mt-1"
              />
              <label htmlFor="agree" className="text-[11px] text-600 line-height-3 cursor-pointer">
                I hereby acknowledge that I must be **attending the lucky draw session on the spot**. If my name is called and I am not present, the reward will be dismissed and a redraw will occur.
              </label>
            </div>

            <Button
              type="submit"
              label={isSubmitting ? "Submitting..." : "Confirm & Submit Entry"}
              loading={isSubmitting}
              disabled={!submissionForm.name.trim() || !submissionForm.phone.trim() || !submissionForm.instagram.trim() || !submissionForm.agreed || isSubmitting}
              className="w-full py-4 border-round-2xl font-black text-lg uppercase tracking-widest shadow-6 transform active:scale-95 transition-all mt-2"
              style={{
                backgroundColor: submissionForm.name.trim() && submissionForm.phone.trim() && submissionForm.instagram.trim() && submissionForm.agreed
                  ? 'var(--color-primary)'
                  : '#d3d3d3',
                borderColor: submissionForm.name.trim() && submissionForm.phone.trim() && submissionForm.instagram.trim() && submissionForm.agreed
                  ? 'var(--color-primary)'
                  : '#d3d3d3'
              }}
            />
          </form>
        </div>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-button {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(144, 77, 0, 0.4); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(144, 77, 0, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(144, 77, 0, 0); }
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
