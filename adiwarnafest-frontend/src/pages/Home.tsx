import { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, Star, Basketball, MusicNotes, Storefront, Crown, X, CaretDown, Trophy, Medal, UsersThree } from "@phosphor-icons/react";

// Imported Images
import plainBackground from "../image/Plain_Background.png";
import adiwarnaLogo from "../image/Adiwarna_Logo_NoBackground.png";
import xiamenLogo from "../image/xiamen_logo.png";
import gadpaLogo from "../image/gadpa_xmum_logo.png";

import { sportsSlides, sportsDetails } from "../data/mockData";
import { registrationService, type RegistrationStats } from "../services/registration";

const Home: React.FC = () => {
  const [currentSportImg, setCurrentSportImg] = useState(0);
  const [isBazaarModalOpen, setIsBazaarModalOpen] = useState(false);
  const [isSportsModalOpen, setIsSportsModalOpen] = useState(false);
  const [isSimfoniModalOpen, setIsSimfoniModalOpen] = useState(false);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [activePortalIndex, setActivePortalIndex] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSportImg((prev) => (prev + 1) % sportsSlides.length);
    }, 2000); // cycle image every 2 second
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsError(null);
        const data = await registrationService.getStats();
        setStats(data);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch registration stats";
        console.error("Failed to fetch registration stats:", error);
        setStatsError(errorMsg);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const portalContainer = portalRef.current;
    if (!portalContainer) return;

    const autoScroll = setInterval(() => {
      const now = Date.now();
      // Only auto-scroll if 10 seconds have passed since last interaction
      if (now - lastInteraction < 10000) return;

      const cardWidth = window.innerWidth * 0.82 + 12;
      const nextIndex = (activePortalIndex + 1) % 3; // Total 3 portals

      portalContainer.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth",
      });
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(autoScroll);
  }, [activePortalIndex, lastInteraction]);

  useEffect(() => {
    if (!isPrizeModalOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FFD700", "#D4AF37", "#B8860B", "#C0C0C0", "#CD7F32", "#FFF8DC"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2,
      vy: 2 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
    }));

    let frame: number;
    let elapsed = 0;
    const start = Date.now();

    const draw = () => {
      elapsed = Date.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = Math.max(0, 1 - elapsed / 5000);
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(elapsed / 800) * 0.3;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.04;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = fade * 0.85;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < 5000) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [isPrizeModalOpen]);

  const toggleSport = (id: string) => {
    setExpandedSport(expandedSport === id ? null : id);
  };

  const handlePortalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    // Assume each card takes roughly ~82vw + gap
    const cardWidth = window.innerWidth * 0.82 + 12; // 12px gap
    const index = Math.round(scrollLeft / cardWidth);
    setActivePortalIndex(Math.min(2, Math.max(0, index)));
    setLastInteraction(Date.now()); // Reset cooldown on scroll
  };

  const renderSportDetails = (sportId: string) => {
    const sport = sportsDetails.find((s) => s.id === sportId);
    if (!sport) return null;

    return (
      <div className="fadein animation-duration-200">
        <p className="m-0 text-sm mb-1 text-700">
          <strong>Date:</strong>{" "}
          <span style={{ whiteSpace: "pre-line" }} className="text-900">
            {sport.date}
          </span>
        </p>
        <p className="m-0 text-sm mb-1 text-700">
          <strong>Location:</strong> <span className="text-900">{sport.location}</span>
        </p>
        {sport.venue && (
          <p className="m-0 text-sm mb-1 text-700">
            <strong>Venue:</strong> <span className="text-900">{sport.venue}</span>
          </p>
        )}
        <p className="m-0 text-sm mb-1 text-700">
          <strong>Registration Fee:</strong> <span className="text-900">{sport.fee}</span>
        </p>

        <p className="m-0 text-sm text-700 font-bold mb-2 mt-2">
          Prizepool: <span className="text-900 font-bold">{sport.prize}</span>
        </p>

        <div className="flex flex-column gap-2 mb-3">
          {sport.prizeBreakdown?.map((prize, idx) => (
            <div key={idx} className="p-2 border-round-lg flex align-items-center gap-3" style={{ backgroundColor: "rgba(161, 64, 0, 0.04)", border: "1px solid rgba(161, 64, 0, 0.1)" }}>
              <div className="flex align-items-center justify-content-center border-circle" style={{ width: "32px", height: "32px", backgroundColor: "var(--color-primary)", color: "#fff" }}>
                <Star size={16} weight="fill" />
              </div>
              <div className="flex-1">
                <p className="m-0 text-xs font-bold text-900">{prize.rank}</p>
                <p className="m-0 text-[10px] text-700">{prize.details}</p>
              </div>
            </div>
          ))}
          <div className="p-2 mt-1 border-round-lg" style={{ backgroundColor: "var(--color-background)" }}>
            <p className="m-0 text-[8px] text-500 font-italic line-height-3">*The prize pool may vary depending on the number of participating teams and sponsors. Once a team is registered, withdrawals are not permitted.</p>
          </div>
        </div>

        <div className="flex flex-column gap-2 mt-3">
          {sport.tnc && (
            <a
              href={sport.tnc}
              target="_blank"
              rel="noreferrer"
              className="flex align-items-center justify-content-center w-full py-2 bg-white text-900 font-semibold border-1 border-round-lg text-decoration-none text-xs transition-colors hover:surface-100 shadow-1"
              style={{ borderColor: "var(--color-border)" }}
            >
              Terms and Conditions
            </a>
          )}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfu-UDfhlRcgx-i5RA2gpvArcJCTa5ABN61RU61467-XTO3dA/viewform"
            target="_blank"
            rel="noreferrer"
            className="flex align-items-center justify-content-center w-full py-2 text-white font-bold border-round-lg text-decoration-none text-sm transition-colors shadow-1 hover:surface-hover"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Register Now
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="surface-0 min-h-screen fadein animation-duration-1000" style={{ fontFamily: "Epilogue, sans-serif" }}>
      {/* Mobile Header is now managed in MainLayout */}

      <main className="pb-6 mx-auto w-full" style={{ maxWidth: "1024px" }}>
        {/* Hero Banner Area */}
        <section className="px-3 pt-3">
          <div
            className="border-round-2xl p-4 flex flex-column align-items-center text-center shadow-3 overflow-hidden"
            style={{
              backgroundColor: "var(--color-primary)",
              backgroundImage: `url(${plainBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "200px",
            }}
          >
            {/* Top Logos in Header using Flexbox (no absolute positioning) */}
            <div className="w-full flex justify-content-between align-items-start mb-4">
              <img src={xiamenLogo} alt="Xiamen University" style={{ height: "40px", objectFit: "contain" }} />
              <img src={gadpaLogo} alt="GADPA" style={{ height: "40px", objectFit: "contain", borderRadius: "4px" }} />
            </div>

            <div className="w-full flex justify-content-center align-items-center flex-grow-1">
              <img src={adiwarnaLogo} alt="Adiwarna Fest 2026 Logo" style={{ width: "100%", maxWidth: "400px", objectFit: "contain" }} />
            </div>
          </div>
        </section>

        {/* When & Where Panel */}
        <section className="px-3 mt-3">
          <div className="bg-white border-round-2xl p-4 shadow-2 border-1 flex flex-column md:flex-row md:align-items-center md:justify-content-evenly gap-4" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex align-items-center gap-3 w-full md:w-auto md:flex-1 md:justify-content-center">
              <div className="flex align-items-center justify-content-center border-circle flex-shrink-0" style={{ width: "40px", height: "40px", backgroundColor: "var(--color-primary-light)", color: "#fff" }}>
                <Calendar size={20} weight="fill" />
              </div>
              <div>
                <p className="m-0 text-[10px] font-bold uppercase" style={{ color: "var(--color-primary)", letterSpacing: "0.05em" }}>
                  When
                </p>
                <p className="m-0 text-sm font-semibold text-900 line-height-2">30-31 May 2026</p>
              </div>
            </div>

            <div className="md:hidden" style={{ height: "1px", width: "100%", backgroundColor: "var(--color-border)" }}></div>
            <div className="hidden md:block" style={{ width: "1px", height: "50px", backgroundColor: "var(--color-border)" }}></div>

            <div className="flex align-items-center gap-3 w-full md:w-auto md:flex-1 md:justify-content-center">
              <div className="flex align-items-center justify-content-center border-circle flex-shrink-0" style={{ width: "40px", height: "40px", backgroundColor: "var(--color-primary-light)", color: "#fff" }}>
                <MapPin size={20} weight="fill" />
              </div>
              <div>
                <p className="m-0 text-[10px] font-bold uppercase" style={{ color: "var(--color-primary)", letterSpacing: "0.05em" }}>
                  Where
                </p>
                <p className="m-0 text-sm font-semibold text-900 line-height-2" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  Xiamen University Malaysia
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prizepool Section */}
        <section className="px-3 mt-4">
          <div className="luxury-obsidian-panel border-round-2xl p-5 shadow-6" style={{ minHeight: "280px" }}>
            {/* Animated gold dust particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute border-circle"
                style={{
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#D4AF37" : "#FFF8DC",
                  left: `${(i * 8.3) % 100}%`,
                  bottom: `${10 + ((i * 7) % 30)}%`,
                  animation: `gold-dust ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Floating Background Icons */}
            <Trophy size={180} weight="fill" className="absolute" style={{ right: "-40px", bottom: "-30px", opacity: 0.07, transform: "rotate(-15deg)", filter: "blur(2px)", color: "#D4AF37" }} />
            <Medal size={100} weight="fill" className="absolute" style={{ left: "-20px", top: "10px", opacity: 0.06, transform: "rotate(15deg)", filter: "blur(1px)", color: "#D4AF37" }} />

            <div className="relative z-1 flex flex-column align-items-center text-center">
              {/* Grand Prize Badge */}
              <div
                className="flex align-items-center gap-2 px-4 py-2 border-round-3xl mb-4"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.45)",
                }}
              >
                <Crown size={16} weight="fill" color="#D4AF37" />
                <span className="text-[10px] font-black uppercase" style={{ color: "#D4AF37", letterSpacing: "0.2em" }}>
                  Grand Prize Pool
                </span>
              </div>

              {/* Total Amount */}
              <p className="m-0 mb-2 text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>
                Grand Prize Pool
              </p>
              <h2 className="m-0 text-5xl md:text-6xl font-black gold-shimmer-amount" style={{ letterSpacing: "-0.02em" }}>
                RM 6,100.00
              </h2>
            </div>
          </div>
        </section>

        {/* Registration Portals */}
        <section className="pl-3 md:px-3 mt-5">
          <h2 className="text-xl font-bold text-900 mb-3 m-0 pr-3">Registration Portals</h2>

          <div
            ref={portalRef}
            className="flex overflow-x-auto gap-3 pb-2 pr-3 md:pr-0 md:justify-content-center"
            onScroll={handlePortalScroll}
            onTouchStart={() => setLastInteraction(Date.now())}
            onMouseDown={() => setLastInteraction(Date.now())}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
          >
            {/* Sports */}
            <div
              className="flex-shrink-0 flex flex-column justify-content-end p-4 border-round-2xl shadow-3 overflow-hidden transition-all duration-500"
              style={{
                width: "82vw",
                maxWidth: "320px",
                height: "400px",
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%), url('${sportsSlides[currentSportImg].image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                scrollSnapAlign: "center",
              }}
            >
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 text-white text-[10px] font-bold uppercase border-round-3xl mb-2" style={{ backgroundColor: "var(--color-primary)", letterSpacing: "0.05em" }}>
                  Athletics
                </span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Sports Registration</h4>
                <div className="min-h-3rem flex align-items-end mb-4">
                  <p className="text-white text-sm m-0 line-height-3 fadein animation-duration-500" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }} key={currentSportImg}>
                    {sportsSlides[currentSportImg].subtitle}
                  </p>
                </div>
                <button onClick={() => setIsSportsModalOpen(true)} className="w-full py-3 bg-white text-900 font-bold border-round-xl border-none cursor-pointer shadow-2 transition-colors hover:surface-200">
                  Register Now
                </button>
              </div>
            </div>

            {/* Simfoni */}
            <div
              className="flex-shrink-0 flex flex-column justify-content-end p-4 border-round-2xl shadow-3 overflow-hidden transition-all"
              style={{
                width: "82vw",
                maxWidth: "320px",
                height: "400px",
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDR60n5cwc4CYhvGicG5VUgOFyT7k8g8TPjnom5vERt2BADRprLHLEJ2QURiVmjXWsnHN6aSNW3ke7gRKZmXvXofXJiJ_fddgcP7j3JCjLXv8gLynXrPxa8nQ11GG3bG2vPVO6GOdc8s2e16VCKL7elNJKN_8EUlIsNcIjkw1z4ju9Kq-VDW1s27gUumXVlfEHSRQVZMWmQYVdHa89LhSWTVTp5k_KGThSJqUfP5Eue-ewVXw1whA2FwFW0BtVQZus68OlPGg9_QAM')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                scrollSnapAlign: "center",
              }}
            >
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 text-900 text-[10px] font-bold uppercase border-round-3xl mb-2" style={{ backgroundColor: "var(--color-accent)", letterSpacing: "0.05em" }}>
                  Performing Arts
                </span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Simfoni 2026</h4>
                <p className="text-white text-sm mb-4 line-height-3 m-0 mt-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Music band & performance and sports winner awarding ceremony
                </p>
                <button onClick={() => setIsSimfoniModalOpen(true)} className="w-full py-3 bg-white text-900 font-bold border-round-xl border-none cursor-pointer shadow-2 transition-colors hover:surface-200">
                  Secure Seat
                </button>
              </div>
            </div>

            {/* Booth */}
            <div
              className="flex-shrink-0 flex flex-column justify-content-end p-4 border-round-2xl shadow-3 overflow-hidden transition-all"
              style={{
                width: "82vw",
                maxWidth: "320px",
                height: "400px",
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGxfOA3TkYA8NjqhzM8nizSACgCR0lLoubZHmA34fo7xdjxTQOVP20E25X5qT4Rs0Nx3Aa9S2z3nhjnPE9dJYpsDRPJUQeSCPlGu_1sNpEhmrgSf21XE6SC0dJqiFmAVOWUjCchSA441ndg9GrFohOQi8BSwmFTBSreILs5v6zf94yAVJntjSr1sgFtpNkK5yRexdHC_b9L9aAEYxMtaTOMmC1KUDXLI3o5Nhl8MH-_H75iseGqzcw1-suQuHv9ssCinpAWV2m5ls')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                scrollSnapAlign: "center",
              }}
            >
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 text-white text-[10px] font-bold uppercase border-round-3xl mb-2" style={{ backgroundColor: "#8c7166", letterSpacing: "0.05em" }}>
                  Entrepreneurship
                </span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Open a Booth</h4>
                <p className="text-white text-sm mb-4 line-height-3 m-0 mt-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Open for public and student vendor
                </p>
                <button disabled className="w-full py-3 font-bold border-round-xl border-none cursor-not-allowed shadow-2 text-white" style={{ backgroundColor: "#dc2626" }}>
                  Slots are Full
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator Dots */}
          <div className="flex justify-content-center gap-2 mt-2 pr-3">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`border-round-xl transition-all duration-300 ${activePortalIndex === idx ? "w-2rem" : "w-1rem"}`}
                style={{ height: "6px", backgroundColor: activePortalIndex === idx ? "var(--color-primary)" : "#e3e2e0" }}
              />
            ))}
          </div>
        </section>

        {/* Live Registration Stats */}
        <section className="px-3 mt-5">
          <div className="border-round-2xl p-6 shadow-4 glass-panel-dashboard">
            {/* Header Area */}
            <div className="flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-black text-900 m-0 flex align-items-center gap-2" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  <UsersThree size={28} weight="fill" color="var(--color-primary)" />
                  Live Registration Status
                </h2>
                <p className="m-0 text-xs font-semibold text-600 mt-1">Real-time participant analytics and tournament seat availability</p>
              </div>
            </div>

            {/* Error State */}
            {statsError && (
              <div className="p-4 mb-4 border-round-2xl" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#dc2626" }}>
                <p className="m-0 text-sm font-semibold">⚠️ Unable to load live stats: {statsError}</p>
              </div>
            )}

            {/* Overview KPIs Row (Top Row - 3 Cards) */}
            <div className="flex flex-column md:flex-row gap-4 mb-4">
              {/* Card 1: Total Festival Participants */}
              <div className="flex-1 premium-card-base border-round-2xl p-4 flex flex-column justify-content-between glow-hover-pink" style={{ minHeight: "130px" }}>
                <div className="flex justify-content-between align-items-start mb-2">
                  <div className="flex align-items-center justify-content-center border-circle" style={{ width: "36px", height: "36px", backgroundColor: "rgba(236, 72, 153, 0.1)", color: "#EC4899" }}>
                    <UsersThree size={20} weight="bold" />
                  </div>
                  <span className="text-[10px] font-bold text-500 uppercase tracking-widest" style={{ letterSpacing: "0.08em" }}>
                    Grand Total
                  </span>
                </div>
                <div>
                  <h3
                    className="m-0 text-4xl font-black mb-1"
                    style={{
                      background: "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Epilogue, sans-serif",
                    }}
                  >
                    {stats?.simfoniParticipants ?? "Loading..."}
                  </h3>
                  <p className="m-0 text-xs font-bold text-700">Simfoni Attendees</p>
                </div>
              </div>

              {/* Card 2: Sports Athletes */}
              <div className="flex-1 premium-card-base border-round-2xl p-4 flex flex-column justify-content-between glow-hover-orange" style={{ minHeight: "130px" }}>
                <div className="flex justify-content-between align-items-start mb-2">
                  <div className="flex align-items-center justify-content-center border-circle" style={{ width: "36px", height: "36px", backgroundColor: "rgba(242, 153, 74, 0.1)", color: "var(--color-primary-light)" }}>
                    <UsersThree size={20} weight="bold" />
                  </div>
                  <span className="text-[10px] font-bold text-500 uppercase tracking-widest" style={{ letterSpacing: "0.08em" }}>
                    Athletes
                  </span>
                </div>
                <div>
                  <h3
                    className="m-0 text-4xl font-black mb-1"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Epilogue, sans-serif",
                    }}
                  >
                    {stats?.sportParticipants ?? "Loading..."}
                  </h3>
                  <p className="m-0 text-xs font-bold text-700">Sports Competitors</p>
                </div>
              </div>

              {/* Card 3: Tournament Teams */}
              <div className="flex-1 premium-card-base border-round-2xl p-4 flex flex-column justify-content-between glow-hover-gold" style={{ minHeight: "130px" }}>
                <div className="flex justify-content-between align-items-start mb-2">
                  <div className="flex align-items-center justify-content-center border-circle" style={{ width: "36px", height: "36px", backgroundColor: "rgba(208, 170, 47, 0.1)", color: "var(--color-accent)" }}>
                    <Trophy size={20} weight="bold" />
                  </div>
                  <span className="text-[10px] font-bold text-500 uppercase tracking-widest" style={{ letterSpacing: "0.08em" }}>
                    Squads
                  </span>
                </div>
                <div>
                  <h3
                    className="m-0 text-4xl font-black mb-1"
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent) 0%, #a17800 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "Epilogue, sans-serif",
                    }}
                  >
                    {stats?.totalTeams ?? "Loading..."}
                  </h3>
                  <p className="m-0 text-xs font-bold text-700">Registered Teams</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership / Sponsors */}
        <section className="px-3 mt-4 mb-5">
          <div className="bg-white border-round-2xl p-5 shadow-2 border-1" style={{ borderColor: "var(--color-border)", background: "linear-gradient(to bottom, #ffffff, #fdfbf9)" }}>
            <div className="flex justify-content-between align-items-end mb-4">
              <div>
                <p className="text-[10px] font-black uppercase mb-1 m-0" style={{ color: "var(--color-primary)", letterSpacing: "0.1em" }}>
                  Partnership
                </p>
                <h2 className="text-2xl font-bold text-900 m-0">Meet our Sponsors</h2>
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-medium text-500">Supporting Adiwarna Fest 2026</span>
              </div>
            </div>

            <div className="flex flex-wrap align-items-center justify-content-center gap-4 mt-2">
              {[
                { name: "Mulan", logo: "/Mulan_logo.jpg" },
                { name: "Starbucks", logo: "/Starbucks_logo.png" },
                { name: "Quaker", logo: "/Quaker_logo.jpg" },
                { name: "Dengkil Steam Fish Head", logo: "/DengkilSteamFishHead_Logo.jpg" },
                { name: "Anytime Fitness", logo: "/Anytime_fitness_logo.jpeg" },
                { name: "Sai Ngon", logo: "/Sai_Ngon_logo.jpg" },
                { name: "Printcious", logo: "/printcious_logo.png" },
              ].map((sponsor, idx) => (
                <div key={idx} className="flex flex-column align-items-center gap-2 p-2 transition-all duration-300 hover:transform-y-1" style={{ width: "calc(50% - 1.5rem)", maxWidth: "160px" }}>
                  <div className="border-round-xl flex align-items-center justify-content-center p-3 w-full bg-white shadow-1 border-1" style={{ height: "100px", borderColor: "rgba(0,0,0,0.03)" }}>
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-500 uppercase tracking-wider text-center px-2">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Sports Registration Modal */}
      {isSportsModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-3" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white border-round-2xl p-4 w-full max-w-30rem md:max-w-48rem shadow-6 relative fadein animation-duration-200 flex flex-column" style={{ maxHeight: "90vh" }}>
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer text-600 hover:text-900 transition-colors z-1" onClick={() => setIsSportsModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <Basketball size={24} color="var(--color-primary)" weight="fill" />
              <h3 className="m-0 text-xl font-bold text-900" style={{ color: "var(--color-primary)" }}>
                Sports Registration
              </h3>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 pb-4">
              <div className="flex flex-column md:flex-row gap-4 h-full">
                {/* Left Side: Sports List (Mobile Accordion) */}
                <div className="flex flex-column gap-2 w-full md:w-4">
                  {sportsDetails.map((sport) => (
                    <div
                      key={sport.id}
                      className="border-round-xl border-1 overflow-hidden transition-all duration-200"
                      style={{
                        borderColor: expandedSport === sport.id ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)",
                        backgroundColor: expandedSport === sport.id ? "#fff" : "var(--color-background)",
                        boxShadow: expandedSport === sport.id ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                      }}
                    >
                      <button className="w-full flex justify-content-between align-items-center p-3 bg-transparent border-none cursor-pointer text-left" onClick={() => toggleSport(sport.id)}>
                        <span className="font-bold text-900">{sport.title}</span>
                        <CaretDown
                          size={20}
                          color={expandedSport === sport.id ? "var(--color-primary)" : "#8c7166"}
                          className="md:hidden transition-transform duration-200"
                          style={{ transform: expandedSport === sport.id ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>
                      {/* Mobile Details Area */}
                      {expandedSport === sport.id && (
                        <div className="p-3 pt-0 md:hidden fadein animation-duration-200">
                          <div className="border-top-1 pt-3" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                            {renderSportDetails(sport.id)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Side: Desktop Details Panel */}
                <div className="hidden md:flex flex-column flex-1 p-4 border-round-xl border-1" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  {expandedSport ? (
                    <>
                      <h4 className="m-0 mb-3 text-lg font-bold text-900" style={{ color: "var(--color-primary)" }}>
                        {sportsDetails.find((s) => s.id === expandedSport)?.title}
                      </h4>
                      {renderSportDetails(expandedSport)}
                    </>
                  ) : (
                    <div className="flex flex-column align-items-center justify-content-center h-full text-500 opacity-50 mt-5 pt-5">
                      <Basketball size={48} weight="fill" className="mb-2" />
                      <p className="m-0 font-semibold text-center px-4">Select a sport from the left to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simfoni Registration Modal */}
      {isSimfoniModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white border-round-2xl p-4 w-full max-w-20rem shadow-6 relative fadein animation-duration-200">
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer text-600 hover:text-900 transition-colors" onClick={() => setIsSimfoniModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <MusicNotes size={24} color="var(--color-primary)" weight="fill" />
              <h3 className="m-0 text-xl font-bold text-900" style={{ color: "var(--color-primary)" }}>
                Simfoni 2026
              </h3>
            </div>

            <div className="mb-4">
              <p className="m-0 text-sm font-semibold text-700 mb-1">
                Date: <span className="text-900">30-31 May 2026</span>
              </p>
              <p className="m-0 text-sm font-semibold text-700 mb-1">
                Venue: <span className="text-900">Main Stage</span>
              </p>
              <p className="m-0 text-sm font-semibold text-700">
                Location: <span className="text-900">Xiamen University Malaysia</span>
              </p>
            </div>

            <div className="p-3 border-round-xl border-1 mb-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <p className="m-0 text-sm text-700 line-height-3">Join us for an unforgettable night of music band performances and the grand sports winner awarding ceremony!</p>
            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd-dli1gB9idOGFHg2wiqRBGr2JOi7in5-Xao14yfi9HH_S8g/viewform"
              target="_blank"
              rel="noreferrer"
              className="flex align-items-center justify-content-center w-full py-3 text-white font-bold border-round-xl text-decoration-none transition-colors shadow-2 hover:surface-hover"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Secure Seat
            </a>
          </div>
        </div>
      )}

      {/* Bazaar Registration Modal */}
      {isBazaarModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white border-round-2xl p-4 w-full max-w-20rem shadow-6 relative fadein animation-duration-200">
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer text-600 hover:text-900 transition-colors" onClick={() => setIsBazaarModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <Storefront size={24} color="var(--color-primary)" weight="fill" />
              <h3 className="m-0 text-xl font-bold text-900" style={{ color: "var(--color-primary)" }}>
                Bazaar Vendor
              </h3>
            </div>

            <div className="mb-4">
              <p className="m-0 text-sm font-semibold text-700 mb-1">
                Date: <span className="text-900">30 May 2026</span>
              </p>
              <p className="m-0 text-sm font-semibold text-700 mb-1">
                Venue: <span className="text-900">B1 - Ground Floor & 1st Floor</span>
              </p>
              <p className="m-0 text-sm font-semibold text-700">
                Location: <span className="text-900">Xiamen University Malaysia</span>
              </p>
            </div>

            <div className="flex flex-column gap-3">
              <div className="p-3 border-round-xl border-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                <p className="m-0 text-sm font-bold text-900 mb-1">Public Vendor</p>
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="text-xs text-600">Contact:</span>
                  <span className="font-bold text-800 text-sm">Ivon</span>
                </div>
                <a
                  href="https://wa.me/6281280658422"
                  target="_blank"
                  rel="noreferrer"
                  className="flex align-items-center justify-content-center w-full py-2 text-white font-bold border-round-lg text-decoration-none text-xs transition-colors shadow-1"
                  style={{ backgroundColor: "#25D366" }}
                >
                  Chat Ivon on WhatsApp
                </a>
              </div>

              <div className="p-3 border-round-xl border-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                <p className="m-0 text-sm font-bold text-900 mb-1">Student Vendor</p>
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="text-xs text-600">Contact:</span>
                  <span className="font-bold text-800 text-sm">Nadya</span>
                </div>
                <a
                  href="https://wa.me/601125250543"
                  target="_blank"
                  rel="noreferrer"
                  className="flex align-items-center justify-content-center w-full py-2 text-white font-bold border-round-lg text-decoration-none text-xs transition-colors shadow-1"
                  style={{ backgroundColor: "#25D366" }}
                >
                  Chat Nadya on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prize Pool Modal */}
      {isPrizeModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", top: 0, left: 0, right: 0, bottom: 0, overflowY: "auto" }}>
          <canvas ref={canvasRef} className="fixed inset-0 z-6 pointer-events-none" style={{ pointerEvents: "none" }} />
          <div className="luxury-modal-content border-round-2xl p-6 w-full max-w-2xl shadow-6 relative fadein animation-duration-200 my-6" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer" onClick={() => setIsPrizeModalOpen(false)} style={{ color: "#D4AF37", zIndex: 10 }}>
              <X size={28} weight="bold" />
            </button>

            <div className="flex align-items-center gap-3 mb-6">
              <Trophy size={32} weight="fill" color="#D4AF37" />
              <h2 className="m-0 text-3xl font-black" style={{ color: "#D4AF37", letterSpacing: "0.1em" }}>
                Treasure Vault
              </h2>
            </div>

            {/* Lucky Draw Card */}
            <div className="p-5 border-round-2xl mb-5" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)", borderTop: "3px solid #FFD700" }}>
              <div className="flex align-items-center gap-2 mb-3">
                <Crown size={24} weight="fill" color="#0A0A0B" />
                <h3 className="m-0 text-xl font-black" style={{ color: "#0A0A0B" }}>
                  Lucky Draw
                </h3>
              </div>
              <p className="m-0 text-sm mb-4" style={{ color: "#0A0A0B", opacity: 0.8 }}>
                Total Prize Pool:{" "}
                <span className="font-black" style={{ fontSize: "1.25rem" }}>
                  RM 1,800
                </span>
              </p>
              <div className="flex flex-column gap-2">
                {[
                  { rank: "1st Prize", prize: "RM 800", badge: "gold-medal-badge" },
                  { rank: "2nd Prize", prize: "RM 500", badge: "silver-medal-badge" },
                  { rank: "3rd Prize", prize: "RM 300", badge: "bronze-medal-badge" },
                  { rank: "Consolation (x2)", prize: "RM 100 each", badge: "silver-medal-badge" },
                ].map((item, idx) => (
                  <div key={idx} className="flex align-items-center gap-3 p-2" style={{ backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                    <div className={item.badge}></div>
                    <div className="flex-1">
                      <p className="m-0 font-bold text-sm" style={{ color: "#0A0A0B" }}>
                        {item.rank}
                      </p>
                    </div>
                    <p className="m-0 font-black" style={{ color: "#0A0A0B" }}>
                      {item.prize}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sports Section */}
            <div>
              <h3 className="m-0 mb-4 text-lg font-black" style={{ color: "#D4AF37", letterSpacing: "0.08em" }}>
                SPORTS COMPETITIONS
              </h3>
              <div className="flex flex-column gap-3">
                {sportsDetails.map((sport) => (
                  <div key={sport.id} className="border-round-xl overflow-hidden" style={{ backgroundColor: "rgba(17, 17, 20, 0.8)", border: "1px solid rgba(212, 175, 55, 0.3)" }}>
                    <div className="p-3" style={{ backgroundColor: "#111114" }}>
                      <h4 className="m-0 mb-1 font-bold" style={{ color: "white" }}>
                        {sport.title}
                      </h4>
                      <p className="m-0 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {sport.date} • {sport.venue}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="m-0 mb-3 text-lg font-black" style={{ color: "#D4AF37" }}>
                        Total Prize: {sport.prize}
                      </p>
                      <div className="flex flex-column gap-2">
                        {sport.prizeBreakdown?.map((prize, idx) => {
                          let badgeClass = "gold-medal-badge";
                          if (idx === 1) badgeClass = "silver-medal-badge";
                          else if (idx === 2) badgeClass = "bronze-medal-badge";

                          return (
                            <div key={idx} className="flex align-items-center gap-3 p-2" style={{ backgroundColor: "rgba(212, 175, 55, 0.06)", borderRadius: "8px" }}>
                              <div className={badgeClass}></div>
                              <div className="flex-1">
                                <p className="m-0 text-sm font-bold" style={{ color: "white" }}>
                                  {prize.rank}
                                </p>
                              </div>
                              <p className="m-0 text-sm font-bold" style={{ color: "#D4AF37" }}>
                                {prize.details.split("+")[0].trim()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="m-0 mt-6 text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              *All prizes are subject to terms and conditions
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
