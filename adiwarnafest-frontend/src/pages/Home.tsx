import { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, Star, Basketball, MusicNotes, Storefront, Crown, X, CaretDown, Trophy, Medal, UsersThree, Eye, SoccerBall, GameController } from "@phosphor-icons/react";
import { InstagramLogo } from "@phosphor-icons/react/dist/csr/InstagramLogo";

// Imported Images
import plainBackground from "../image/Plain_Background.png";
import adiwarnaLogo from "../image/Adiwarna_Logo_NoBackground.png";
import xiamenLogo from "../image/xiamen_logo.png";
import gadpaLogo from "../image/gadpa_xmum_logo.png";
import xiamenLandscape from "../image/xiamen_landscape.jpg";

import { sportsSlides, sportsDetails } from "../data/mockData";
import { registrationService, type RegistrationStats } from "../services/registration";
import { liveYoutubeService, extractYouTubeId } from "../services/liveYoutube";
import type { LiveYoutube } from "../services/liveYoutube";

const Home: React.FC = () => {
  const [currentSportImg, setCurrentSportImg] = useState(0);
  const [isBazaarModalOpen, setIsBazaarModalOpen] = useState(false);
  const [isSportsModalOpen, setIsSportsModalOpen] = useState(false);
  const [isSimfoniModalOpen, setIsSimfoniModalOpen] = useState(false);
  const [closedPortal, setClosedPortal] = useState<{ title: string; message: string } | null>(null);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [activePortalIndex, setActivePortalIndex] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [liveEntries, setLiveEntries] = useState<LiveYoutube[]>([]);
  const portalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSportImg((prev) => (prev + 1) % sportsSlides.length);
    }, 2000);
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
        setStatsError(errorMsg);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLiveEntries = async () => {
      try {
        const data = await liveYoutubeService.listLiveYoutubes();
        const ongoing = data.filter(entry => entry.status === 'ONGOING' && !entry.isDeleted);
        setLiveEntries(ongoing);
      } catch {
        setLiveEntries([]);
      }
    };

    fetchLiveEntries();
    const interval = setInterval(fetchLiveEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const portalContainer = portalRef.current;
    if (!portalContainer) return;

    const autoScroll = setInterval(() => {
      const now = Date.now();
      if (now - lastInteraction < 10000) return;

      const cardWidth = window.innerWidth * 0.82 + 12;
      const nextIndex = (activePortalIndex + 1) % 3;

      portalContainer.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth",
      });
    }, 4000);

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
    const cardWidth = window.innerWidth * 0.82 + 12;
    const index = Math.round(scrollLeft / cardWidth);
    setActivePortalIndex(Math.min(2, Math.max(0, index)));
    setLastInteraction(Date.now());
  };

  const renderSportDetails = (sportId: string) => {
    const sport = sportsDetails.find((s) => s.id === sportId);
    if (!sport) return null;

    return (
      <div className="fadein animation-duration-200">
        <p className="m-0 text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          <strong>Date:</strong>{" "}
          <span style={{ whiteSpace: "pre-line", color: "var(--text-primary)" }}>{sport.date}</span>
        </p>
        <p className="m-0 text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          <strong>Location:</strong> <span style={{ color: "var(--text-primary)" }}>{sport.location}</span>
        </p>
        {sport.venue && (
          <p className="m-0 text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            <strong>Venue:</strong> <span style={{ color: "var(--text-primary)" }}>{sport.venue}</span>
          </p>
        )}
        <p className="m-0 text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          <strong>Registration Fee:</strong> <span style={{ color: "var(--text-primary)" }}>{sport.fee}</span>
        </p>
        <p className="m-0 text-sm font-bold mb-2 mt-2" style={{ color: "var(--text-secondary)" }}>
          Prizepool: <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{sport.prize}</span>
        </p>

        <div className="flex flex-column gap-2 mb-3">
          {sport.prizeBreakdown?.map((prize, idx) => (
            <div key={idx} className="p-2 border-round-lg flex align-items-center gap-3" style={{ backgroundColor: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div className="flex align-items-center justify-content-center border-circle" style={{ width: "32px", height: "32px", backgroundColor: "rgba(209,223,246,0.15)", color: "#6366F1", flexShrink: 0 }}>
                <Star size={16} weight="fill" />
              </div>
              <div className="flex-1">
                <p className="m-0 text-xs font-bold" style={{ color: "var(--text-primary)" }}>{prize.rank}</p>
                <p className="m-0 text-[10px]" style={{ color: "var(--text-muted)" }}>{prize.details}</p>
              </div>
            </div>
          ))}
          <div className="p-2 mt-1 border-round-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}>
            <p className="m-0 text-[8px] font-italic line-height-3" style={{ color: "var(--text-muted)" }}>*The prize pool may vary depending on the number of participating teams and sponsors. Once a team is registered, withdrawals are not permitted.</p>
          </div>
        </div>

        <div className="flex flex-column gap-2 mt-3">
          {sport.tnc && (
            <a
              href={sport.tnc}
              target="_blank"
              rel="noreferrer"
              className="glass-btn flex align-items-center justify-content-center w-full py-2 text-decoration-none text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Terms and Conditions
            </a>
          )}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfu-UDfhlRcgx-i5RA2gpvArcJCTa5ABN61RU61467-XTO3dA/viewform"
            target="_blank"
            rel="noreferrer"
            className="glass-btn-indigo flex align-items-center justify-content-center w-full py-2 text-white font-bold text-decoration-none text-sm"
            style={{ borderRadius: "14px" }}
          >
            Register Now
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-page fadein animation-duration-1000" style={{ fontFamily: "Epilogue, sans-serif" }}>
      <main className="pb-6 mx-auto w-full" style={{ maxWidth: "1024px" }}>

        {/* Hero Banner */}
        <section className="px-3 pt-3">
          <div
            className="border-round-2xl p-4 flex flex-column align-items-center text-center shadow-3 overflow-hidden"
            style={{
              backgroundImage: `url(${plainBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "200px",
            }}
          >
            <div className="w-full flex justify-content-between align-items-start mb-4">
              <img src={xiamenLogo} alt="Xiamen University" style={{ height: "40px", objectFit: "contain" }} />
              <img src={gadpaLogo} alt="GADPA" style={{ height: "40px", objectFit: "contain", borderRadius: "4px" }} />
            </div>
            <div className="w-full flex justify-content-center align-items-center flex-grow-1">
              <img src={adiwarnaLogo} alt="Adiwarna Fest 2026 Logo" style={{ width: "100%", maxWidth: "400px", objectFit: "contain" }} />
            </div>
          </div>
        </section>

        {/* When & Where */}
        <section className="px-3 mt-3">
          <div
            className="p-3 md:p-4 flex flex-row gap-2 md:gap-4"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(161,64,0,0.12)",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(161,64,0,0.06)",
            }}
          >

            {/* Day 1 */}
            <div className="flex-1">
              <div className="flex align-items-center gap-2 mb-3">
                <div className="glass-icon flex-shrink-0" style={{ width: "34px", height: "34px" }}>
                  <Calendar size={17} weight="fill" style={{ color: "var(--text-secondary)" }} />
                </div>
                <p className="m-0 text-sm font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>30 May 2026</p>
              </div>
              <div className="flex flex-column gap-3 pl-1">
                {[
                  { icon: <Storefront size={14} weight="fill" />, label: "Bazaar", location: "B1 – Ground Floor & First Floor", mapLink: true },
                  { icon: <Basketball size={14} weight="fill" />, label: "Basketball", location: "B1 – Indoor Court" },
                  { icon: <SoccerBall size={14} weight="fill" />, label: "Futsal", location: "B1 – Futsal Court" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 align-items-start">
                    <span style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
                    <div className="flex flex-column gap-2">
                      <div className="flex flex-column gap-1">
                        <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.location}</span>
                      </div>
                      {(item as { mapLink?: boolean }).mapLink && (
                        <a
                          href="/map"
                          className="text-decoration-none flex align-items-center justify-content-center gap-2"
                          style={{
                            alignSelf: "flex-start",
                            background: "linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(161,64,0,0.4)",
                            borderRadius: "999px",
                            padding: "7px 13px",
                            fontSize: "12px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            color: "#3a1800",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 12px rgba(161,64,0,0.22)",
                            transition: "all 0.18s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"}
                        >
                          <MapPin size={14} weight="fill" /> View Map
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {/* Mobile Legends row with Watch Live button */}
                <div className="flex gap-2 align-items-start">
                  <span style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }}><GameController size={14} weight="fill" /></span>
                  <div className="flex flex-column gap-2">
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Mobile Legends</span>
                    <a
                      href="/competition"
                      className="text-decoration-none flex align-items-center justify-content-center gap-2"
                      style={{
                        alignSelf: "flex-start",
                        background: "linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(161,64,0,0.4)",
                        borderRadius: "999px",
                        padding: "7px 13px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        color: "#3a1800",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 12px rgba(161,64,0,0.22)",
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"}
                    >
                      <Calendar size={14} weight="fill" /> See Schedule
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ width: "1px", alignSelf: "stretch", background: "rgba(161,64,0,0.12)", flexShrink: 0 }} />

            {/* Day 2 */}
            <div className="flex-1">
              <div className="flex align-items-center gap-2 mb-3">
                <div className="glass-icon flex-shrink-0" style={{ width: "34px", height: "34px" }}>
                  <Calendar size={17} weight="fill" style={{ color: "var(--text-secondary)" }} />
                </div>
                <p className="m-0 text-sm font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>31 May 2026</p>
              </div>
              <div className="flex flex-column gap-3 pl-1">
                {[
                  { icon: <Basketball size={14} weight="fill" />, label: "Basketball", location: "B1 – Indoor Court" },
                  { icon: <SoccerBall size={14} weight="fill" />, label: "Futsal", location: "B1 – Futsal Court" },
                  { icon: <MusicNotes size={14} weight="fill" />, label: "Simfoni", location: "A1 – Tan Hua Choon Auditorium" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 align-items-start">
                    <span style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
                    <div className="flex flex-column gap-1">
                      <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Live Page Entry */}
        <section className="px-3 mt-3">
          <a
            href="/live"
            className="text-decoration-none"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              borderRadius: '14px',
              padding: '14px 18px',
              boxShadow: '0 4px 16px rgba(220,0,0,0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(220,0,0,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(220,0,0,0.35)'; }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5 6.2a3.01 3.01 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3.01 3.01 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.01 3.01 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3.01 3.01 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
            </svg>
            <div className="flex-1">
              <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '15px', fontFamily: 'Epilogue, sans-serif' }}>
                {liveEntries.length > 0 ? '🔴 Streaming Now' : 'Watch Live on YouTube'}
              </p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 600, fontFamily: 'Epilogue, sans-serif' }}>
                {liveEntries.length > 0 ? 'Live stream is on — tune in!' : '@AdiwarnaFest · Tap to open'}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        </section>

        {/* Live Now */}
        {liveEntries.length > 0 && (
          <section className="px-3 mt-4">
            <div className="glass-card p-4">
              <div className="flex align-items-center gap-3 mb-3">
                <div className="glass-icon" style={{ width: "40px", height: "40px", backgroundColor: "rgba(255,0,0,0.12)" }}>
                  <Eye size={20} weight="fill" color="#FF0000" />
                </div>
                <div className="flex-1">
                  <p className="m-0 text-[10px] font-bold uppercase" style={{ color: "#FF0000", letterSpacing: "0.05em" }}>Live Now</p>
                  <h2 className="m-0 text-lg font-bold" style={{ color: "var(--text-primary)" }}>Watch Live on YouTube</h2>
                </div>
                <a href="/live" className="flex align-items-center gap-1 text-sm font-semibold text-decoration-none" style={{ color: "#FF0000" }}>
                  View All
                </a>
              </div>

              <div className="grid gap-3">
                {liveEntries.slice(0, 2).map(entry => {
                  const videoId = extractYouTubeId(entry.filePath);
                  return (
                    <div key={entry.id} className="col-12 md:col-6">
                      <div className="border-round-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.45)" }}>
                        {videoId ? (
                          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={entry.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                            />
                          </div>
                        ) : (
                          <div className="flex align-items-center justify-content-center" style={{ height: "180px", backgroundColor: "rgba(255,255,255,0.25)" }}>
                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Unable to embed</span>
                          </div>
                        )}
                        <div className="p-2 flex align-items-center justify-content-between" style={{ background: "rgba(255,255,255,0.3)" }}>
                          <span className="text-sm font-semibold truncate" style={{ maxWidth: "70%", color: "var(--text-primary)" }}>{entry.title}</span>
                          <a href={entry.filePath} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-decoration-none" style={{ color: "#FF0000" }}>
                            Watch →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Registration Portals */}
        <section className="pl-3 md:px-3 mt-5">
          <h2 className="text-xl font-bold mb-3 m-0 pr-3" style={{ color: "var(--text-primary)" }}>Registration Portals</h2>

          <div
            ref={portalRef}
            className="flex overflow-x-auto gap-3 pb-2 pr-3 md:pr-0 md:justify-content-center"
            onScroll={handlePortalScroll}
            onTouchStart={() => setLastInteraction(Date.now())}
            onMouseDown={() => setLastInteraction(Date.now())}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
          >
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
                <span className="glass-tag inline-block px-3 py-1 mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>Performing Arts</span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Simfoni 2026</h4>
                <p className="text-white text-sm mb-4 line-height-3 m-0 mt-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Music band & performance and sports winner awarding ceremony
                </p>
                <div className="button-wrap w-full" style={{ fontSize: '15px' }}>
                  <button className="premium-btn w-full" onClick={() => setIsSimfoniModalOpen(true)}><span style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', textAlign: 'center', display: 'block', width: '100%' }}>Secure Seat</span></button>
                  <div className="button-shadow" />
                </div>
              </div>
            </div>

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
                <span className="glass-tag inline-block px-3 py-1 mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>Athletics</span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Sports Registration</h4>
                <div className="min-h-3rem flex align-items-end mb-4">
                  <p className="text-white text-sm m-0 line-height-3 fadein animation-duration-500" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }} key={currentSportImg}>
                    {sportsSlides[currentSportImg].subtitle}
                  </p>
                </div>
                <div className="button-wrap w-full" style={{ fontSize: '15px' }}>
                  <button className="premium-btn w-full" onClick={() => setClosedPortal({ title: 'Sports Registration Closed', message: 'Sports registration has ended. Thank you for your interest — stay tuned for Adiwarna Fest 2026!' })}><span style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', textAlign: 'center', display: 'block', width: '100%' }}>Registration Closed</span></button>
                  <div className="button-shadow" />
                </div>
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
                <span className="glass-tag inline-block px-3 py-1 mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>Entrepreneurship</span>
                <h4 className="text-white text-2xl font-bold mb-2 m-0">Open a Booth</h4>
                <p className="text-white text-sm mb-4 line-height-3 m-0 mt-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Open for public and student vendor
                </p>
                <div className="button-wrap w-full" style={{ fontSize: '15px' }}>
                  <button className="premium-btn w-full" onClick={() => setClosedPortal({ title: 'Vendor Slots are Full', message: 'All vendor booth slots have been filled. Thank you for your interest — hope to see you as a visitor at Adiwarna Fest 2026!' })}><span style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', textAlign: 'center', display: 'block', width: '100%' }}>Slots are Full</span></button>
                  <div className="button-shadow" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator Dots — mobile only */}
          <div className="flex justify-content-center gap-2 mt-2 pr-3 md:hidden">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`border-round-xl transition-all duration-300 ${activePortalIndex === idx ? "w-2rem" : "w-1rem"}`}
                style={{ height: "6px", backgroundColor: activePortalIndex === idx ? "rgba(161,64,0,0.85)" : "rgba(255,255,255,0.45)" }}
              />
            ))}
          </div>
        </section>

        {/* Live Registration Stats */}
        <section className="px-3 mt-5">
          <div style={{ background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)', padding: '28px 24px' }}>
            <div className="flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-3 mb-5">
              <div>
                <div className="flex align-items-center gap-2 mb-2">
                  <span className="pulse-live-dot" />
                  <span className="text-[10px] font-black uppercase" style={{ color: '#ef4444', letterSpacing: '0.12em' }}>Live</span>
                </div>
                <h2 className="text-2xl font-black m-0 flex align-items-center gap-2" style={{ fontFamily: "Epilogue, sans-serif", color: "var(--text-primary)" }}>
                  <UsersThree size={28} weight="fill" style={{ color: "var(--text-secondary)" }} />
                  Registration Status
                </h2>
                <p className="m-0 text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>Real-time participant analytics and tournament seat availability</p>
              </div>
            </div>

            {statsError && (
              <div className="p-4 mb-4 border-round-2xl" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#dc2626" }}>
                <p className="m-0 text-sm font-semibold">⚠️ Unable to load live stats: {statsError}</p>
              </div>
            )}

            <div className="flex flex-row gap-2 md:gap-4 mb-4">
              {/* Simfoni Attendees */}
              <div className="flex-1 glass-stat-card p-3 md:p-4 flex flex-column justify-content-between" style={{ minHeight: "120px" }}>
                <div className="flex flex-column gap-2 mb-2">
                  <div className="glass-icon" style={{ width: "32px", height: "32px", backgroundColor: "rgba(236,72,153,0.12)" }}>
                    <UsersThree size={18} weight="bold" color="#EC4899" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>Grand Total</span>
                </div>
                <div>
                  <h3 className="m-0 text-2xl md:text-4xl font-black mb-1" style={{ background: "linear-gradient(135deg, #A14000 0%, #6b2e00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "Epilogue, sans-serif" }}>
                    {stats?.simfoniParticipants ?? "—"}
                  </h3>
                  <p className="m-0 text-[10px] md:text-xs font-bold line-height-2" style={{ color: "var(--text-secondary)" }}>Simfoni Attendees</p>
                </div>
              </div>

              {/* Sports Athletes */}
              <div className="flex-1 glass-stat-card p-3 md:p-4 flex flex-column justify-content-between" style={{ minHeight: "120px" }}>
                <div className="flex flex-column gap-2 mb-2">
                  <div className="glass-icon" style={{ width: "32px", height: "32px", backgroundColor: "rgba(245,158,11,0.12)" }}>
                    <UsersThree size={18} weight="bold" color="#F59E0B" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>Athletes</span>
                </div>
                <div>
                  <h3 className="m-0 text-2xl md:text-4xl font-black mb-1" style={{ background: "linear-gradient(135deg, #A14000 0%, #6b2e00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "Epilogue, sans-serif" }}>
                    {stats?.sportParticipants ?? "—"}
                  </h3>
                  <p className="m-0 text-[10px] md:text-xs font-bold line-height-2" style={{ color: "var(--text-secondary)" }}>Sports Competitors</p>
                </div>
              </div>

            </div>
          </div>  {/* close stats glass div */}
        </section>

        {/* Prizepool */}
        <section className="px-3 mt-4">
          <div
            className="p-5 border-round-2xl"
            style={{
              minHeight: "280px",
              position: "relative",
              overflow: "hidden",
              backgroundImage: `linear-gradient(135deg, rgba(20,10,2,0.72) 0%, rgba(40,20,5,0.6) 50%, rgba(20,10,2,0.78) 100%), url(${xiamenLandscape})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 16px 48px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
              border: "1px solid rgba(254,178,70,0.25)",
            }}
          >
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

            <Trophy size={180} weight="fill" className="absolute" style={{ right: "-40px", bottom: "-30px", opacity: 0.1, transform: "rotate(-15deg)", filter: "blur(2px)", color: "#FFD700" }} />
            <Medal size={100} weight="fill" className="absolute" style={{ left: "-20px", top: "10px", opacity: 0.08, transform: "rotate(15deg)", filter: "blur(1px)", color: "#FFD700" }} />

            <div className="relative z-1 flex flex-column align-items-center text-center">
              <div
                className="flex align-items-center gap-2 px-4 py-2 border-round-3xl mb-4"
                style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              >
                <Crown size={16} weight="fill" color="#FFD700" />
                <span className="text-[10px] font-black uppercase" style={{ color: "#FFD700", letterSpacing: "0.2em" }}>Grand Prize Pool</span>
              </div>

              {/* Glass amount panel */}
              <div
                className="px-6 py-4 border-round-2xl"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(20px) saturate(160%)",
                  WebkitBackdropFilter: "blur(20px) saturate(160%)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                <p className="m-0 mb-2 text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>Total Prize Pool</p>
                <h2 className="m-0 text-5xl md:text-6xl font-black" style={{ color: '#fff', textShadow: '0 2px 12px rgba(212,175,55,0.5), 0 0 28px rgba(255,215,0,0.2)', fontFamily: 'Epilogue, sans-serif', letterSpacing: '-0.02em' }}>RM 4,000.00</h2>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsors */}
        <section className="px-3 mt-4 mb-5">
          <div style={{ background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)', padding: '24px 20px' }}>
            <div className="flex flex-column align-items-center text-center mb-5">
              <p className="text-[10px] font-black uppercase mb-1 m-0" style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}>Partnership</p>
              <h2 className="text-2xl font-bold m-0" style={{ color: "var(--text-primary)" }}>Meet our Sponsors</h2>
            </div>

            <div className="grid mt-2">
              {[
                { name: "Mulan", logo: "/Mulan_logo.jpg" },
                { name: "Starbucks", logo: "/Starbucks_logo.png" },
                { name: "Quaker", logo: "/Quaker_logo.jpg" },
                { name: "Dengkil Steam Fish Head", logo: "/DengkilSteamFishHead_Logo.jpg" },
                { name: "Anytime Fitness", logo: "/Anytime_fitness_logo.jpeg" },
                { name: "Sai Ngon", logo: "/Sai_Ngon_logo.jpg" },
              ].map((sponsor, idx) => (
                <div key={idx} className="col-6 md:col-4 p-2">
                  <div
                    className="flex flex-column align-items-center justify-content-start gap-2 h-full"
                  >
                    <div
                      className="flex align-items-center justify-content-center w-full"
                      style={{
                        height: "90px",
                        padding: "14px",
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
                      }}
                    >
                      <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center flex align-items-center justify-content-center" style={{ color: "var(--text-muted)", minHeight: "28px", lineHeight: 1.2 }}>{sponsor.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="px-3 mt-5 mb-6">
          <div
            className="p-5 md:p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(161,64,0,0.4)",
              borderRadius: "24px",
              boxShadow: "inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -2px 2px rgba(161,64,0,0.2), 0 8px 24px rgba(161,64,0,0.22)",
            }}
          >
            <div className="absolute border-circle" style={{ width: "120px", height: "120px", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", top: "-20px", right: "-20px", pointerEvents: "none" }} />
            <div className="absolute border-circle" style={{ width: "160px", height: "160px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", bottom: "-40px", left: "-40px", pointerEvents: "none" }} />

            <div className="relative z-1 mb-5 flex flex-column align-items-center text-center sm:align-items-start sm:text-left">
              <span className="glass-tag inline-block px-3 py-1 mb-2" style={{ color: "#3a1800", background: "rgba(255,255,255,0.35)", border: "1px solid rgba(161,64,0,0.25)" }}>Stay Connected</span>
              <h2 className="m-0 text-3xl font-black" style={{ color: "#3a1800", fontFamily: "Epilogue, sans-serif", letterSpacing: "-0.01em" }}>Follow Our Social Media</h2>
              <p className="m-0 text-xs font-semibold mt-2" style={{ color: "#7a3d12" }}>Join our digital community for exclusive updates, live ceremony streams, and daily snapshots!</p>
            </div>

            <div className="flex flex-column md:flex-row gap-4 mt-2">
              {/* YouTube */}
              <div className="flex-1">
                <a
                  href="https://www.youtube.com/@AdiwarnaFest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-column justify-content-between p-4 border-round-2xl h-full transition-all duration-300 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(255,0,0,0.08) 0%, rgba(20,10,10,0.95) 100%)", border: "1px solid rgba(255,0,0,0.25)", minHeight: "180px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "rgba(255,0,0,0.6)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,0,0,0.25)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
                >
                  <Eye size={130} weight="fill" className="absolute" style={{ right: "-20px", bottom: "-20px", opacity: 0.04, color: "#FFFFFF", transform: "rotate(-10deg)" }} />
                  <div className="flex align-items-center justify-content-between relative z-1 mb-3">
                    <div className="flex align-items-center justify-content-center border-circle" style={{ width: "42px", height: "42px", backgroundColor: "rgba(255,0,0,0.15)", border: "1px solid rgba(255,0,0,0.3)" }}>
                      <Eye size={24} weight="fill" color="#FF0000" />
                    </div>
                    <span className="text-[9px] uppercase text-white" style={{ letterSpacing: "0.15em" }}>Official Channel</span>
                  </div>
                  <div className="relative z-1">
                    <h3 className="m-0 text-xl font-bold text-white mb-2" style={{ fontFamily: "Epilogue, sans-serif" }}>YouTube</h3>
                    <p className="m-0 text-xs text-white line-height-3 mb-4">Watch the Mobile Legends live competition streams right here on our official channel!</p>
                    <span className="inline-flex align-items-center gap-2 text-xs font-bold" style={{ color: "#FFFFFF" }}>Subscribe Now ➜</span>
                  </div>
                </a>
              </div>

              {/* Instagram */}
              <div className="flex-1">
                <a
                  href="https://www.instagram.com/adiwarnafest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-column justify-content-between p-4 border-round-2xl h-full transition-all duration-300 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(228,64,95,0.08) 0%, rgba(20,10,15,0.95) 100%)", border: "1px solid rgba(228,64,95,0.25)", minHeight: "180px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "rgba(228,64,95,0.6)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(228,64,95,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(228,64,95,0.25)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
                >
                  <InstagramLogo size={130} weight="fill" className="absolute" style={{ right: "-20px", bottom: "-20px", opacity: 0.04, color: "#d62976", transform: "rotate(10deg)" }} />
                  <div className="flex align-items-center justify-content-between relative z-1 mb-3">
                    <div className="flex align-items-center justify-content-center border-circle" style={{ width: "42px", height: "42px", backgroundColor: "rgba(228,64,95,0.15)", border: "1px solid rgba(228,64,95,0.3)" }}>
                      <InstagramLogo size={24} weight="fill" color="#d62976" />
                    </div>
                    <span className="text-[9px] uppercase text-white" style={{ letterSpacing: "0.15em" }}>Latest Updates</span>
                  </div>
                  <div className="relative z-1">
                    <h3 className="m-0 text-xl font-bold text-white mb-2" style={{ fontFamily: "Epilogue, sans-serif" }}>Instagram</h3>
                    <p className="m-0 text-xs text-white line-height-3 mb-4">Catch daily snapshot updates, behind-the-scenes committee interviews, vibrant event photos, and direct story feeds!</p>
                    <span className="inline-flex align-items-center gap-2 text-xs font-bold" style={{ color: "#FFFFFF" }}>Follow Us ➜</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Closed Portal Popup */}
      {closedPortal && (
        <div
          className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setClosedPortal(null)}
        >
          <div
            className="fadein animation-duration-200"
            style={{
              background: "rgba(255,255,255,0.42)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.75)",
              borderRadius: "24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
              padding: "32px 28px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <X size={28} weight="bold" color="#dc2626" />
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "Epilogue, sans-serif", letterSpacing: "-0.02em" }}>
              {closedPortal.title}
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {closedPortal.message}
            </p>
            <div className="button-wrap w-full" style={{ fontSize: "14px" }}>
              <button className="premium-btn w-full" onClick={() => setClosedPortal(null)}>
                <span style={{ textAlign: "center", display: "block", width: "100%" }}>Got it</span>
              </button>
              <div className="button-shadow" />
            </div>
          </div>
        </div>
      )}

      {/* Sports Registration Modal */}
      {isSportsModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-3" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass-card p-4 w-full max-w-30rem md:max-w-48rem shadow-6 relative fadein animation-duration-200 flex flex-column" style={{ maxHeight: "90vh" }}>
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer z-1" style={{ color: "var(--text-secondary)" }} onClick={() => setIsSportsModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <Basketball size={24} weight="fill" style={{ color: "var(--text-secondary)" }} />
              <h3 className="m-0 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Sports Registration</h3>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 pb-4">
              <div className="flex flex-column md:flex-row gap-4 h-full">
                <div className="flex flex-column gap-2 w-full md:w-4">
                  {sportsDetails.map((sport) => (
                    <div
                      key={sport.id}
                      className="border-round-xl border-1 overflow-hidden transition-all duration-200"
                      style={{
                        borderColor: expandedSport === sport.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                        backgroundColor: expandedSport === sport.id ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                        boxShadow: expandedSport === sport.id ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                      }}
                    >
                      <button className="w-full flex justify-content-between align-items-center p-3 bg-transparent border-none cursor-pointer text-left" onClick={() => toggleSport(sport.id)}>
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>{sport.title}</span>
                        <CaretDown
                          size={20}
                          color={expandedSport === sport.id ? "var(--text-secondary)" : "var(--text-muted)"}
                          className="md:hidden transition-transform duration-200"
                          style={{ transform: expandedSport === sport.id ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>
                      {expandedSport === sport.id && (
                        <div className="p-3 pt-0 md:hidden fadein animation-duration-200">
                          <div className="border-top-1 pt-3" style={{ borderColor: "rgba(255,255,255,0.4)" }}>
                            {renderSportDetails(sport.id)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden md:flex flex-column flex-1 p-4 border-round-xl border-1" style={{ backgroundColor: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.55)" }}>
                  {expandedSport ? (
                    <>
                      <h4 className="m-0 mb-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        {sportsDetails.find((s) => s.id === expandedSport)?.title}
                      </h4>
                      {renderSportDetails(expandedSport)}
                    </>
                  ) : (
                    <div className="flex flex-column align-items-center justify-content-center h-full mt-5 pt-5" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
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
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass-card p-4 w-full max-w-20rem shadow-6 relative fadein animation-duration-200">
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer" style={{ color: "var(--text-secondary)" }} onClick={() => setIsSimfoniModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <MusicNotes size={24} weight="fill" style={{ color: "var(--text-secondary)" }} />
              <h3 className="m-0 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Simfoni 2026</h3>
            </div>

            <div className="mb-4">
              <p className="m-0 text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Date: <span style={{ color: "var(--text-primary)" }}>30-31 May 2026</span></p>
              <p className="m-0 text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Venue: <span style={{ color: "var(--text-primary)" }}>Main Stage</span></p>
              <p className="m-0 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Location: <span style={{ color: "var(--text-primary)" }}>Xiamen University Malaysia</span></p>
            </div>

            <div className="p-3 border-round-xl border-1 mb-4" style={{ borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.3)" }}>
              <p className="m-0 text-sm line-height-3" style={{ color: "var(--text-secondary)" }}>Join us for an unforgettable night of music band performances and the grand sports winner awarding ceremony!</p>
            </div>

            <div className="button-wrap w-full" style={{ fontSize: '15px' }}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd-dli1gB9idOGFHg2wiqRBGr2JOi7in5-Xao14yfi9HH_S8g/viewform"
                target="_blank"
                rel="noreferrer"
                className="premium-btn w-full text-decoration-none"
                style={{ display: 'block' }}
              >
                <span style={{ textAlign: 'center', display: 'block', width: '100%' }}>Secure Seat</span>
              </a>
              <div className="button-shadow" />
            </div>
          </div>
        </div>
      )}

      {/* Bazaar Registration Modal */}
      {isBazaarModalOpen && (
        <div className="fixed inset-0 z-5 flex align-items-center justify-content-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass-card p-4 w-full max-w-20rem shadow-6 relative fadein animation-duration-200">
            <button className="absolute top-0 right-0 m-3 p-1 bg-transparent border-none cursor-pointer" style={{ color: "var(--text-secondary)" }} onClick={() => setIsBazaarModalOpen(false)}>
              <X size={24} weight="bold" />
            </button>

            <div className="flex align-items-center gap-2 mb-3">
              <Storefront size={24} weight="fill" style={{ color: "var(--text-secondary)" }} />
              <h3 className="m-0 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bazaar Vendor</h3>
            </div>

            <div className="mb-4">
              <p className="m-0 text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Date: <span style={{ color: "var(--text-primary)" }}>30 May 2026</span></p>
              <p className="m-0 text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Venue: <span style={{ color: "var(--text-primary)" }}>B1 - Ground Floor & 1st Floor</span></p>
              <p className="m-0 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Location: <span style={{ color: "var(--text-primary)" }}>Xiamen University Malaysia</span></p>
            </div>

            <div className="flex flex-column gap-3">
              <div className="p-3 border-round-xl border-1" style={{ borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.3)" }}>
                <p className="m-0 text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Public Vendor</p>
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Contact:</span>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Ivon</span>
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

              <div className="p-3 border-round-xl border-1" style={{ borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.3)" }}>
                <p className="m-0 text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Student Vendor</p>
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Contact:</span>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Nadya</span>
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
              <h2 className="m-0 text-3xl font-black" style={{ color: "#D4AF37", letterSpacing: "0.1em" }}>Treasure Vault</h2>
            </div>

            {/* Lucky Draw Card */}
            <div className="p-5 border-round-2xl mb-5" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)", borderTop: "3px solid #FFD700" }}>
              <div className="flex align-items-center gap-2 mb-3">
                <Crown size={24} weight="fill" color="#0A0A0B" />
                <h3 className="m-0 text-xl font-black" style={{ color: "#0A0A0B" }}>Lucky Draw</h3>
              </div>
              <p className="m-0 text-sm mb-4" style={{ color: "#0A0A0B", opacity: 0.8 }}>
                Total Prize Pool:{" "}
                <span className="font-black" style={{ fontSize: "1.25rem" }}>RM 1,800</span>
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
                      <p className="m-0 font-bold text-sm" style={{ color: "#0A0A0B" }}>{item.rank}</p>
                    </div>
                    <p className="m-0 font-black" style={{ color: "#0A0A0B" }}>{item.prize}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sports Section */}
            <div>
              <h3 className="m-0 mb-4 text-lg font-black" style={{ color: "#D4AF37", letterSpacing: "0.08em" }}>SPORTS COMPETITIONS</h3>
              <div className="flex flex-column gap-3">
                {sportsDetails.map((sport) => (
                  <div key={sport.id} className="border-round-xl overflow-hidden" style={{ backgroundColor: "rgba(17,17,20,0.8)", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <div className="p-3" style={{ backgroundColor: "#111114" }}>
                      <h4 className="m-0 mb-1 font-bold" style={{ color: "white" }}>{sport.title}</h4>
                      <p className="m-0 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{sport.date} • {sport.venue}</p>
                    </div>
                    <div className="p-4">
                      <p className="m-0 mb-3 text-lg font-black" style={{ color: "#D4AF37" }}>Total Prize: {sport.prize}</p>
                      <div className="flex flex-column gap-2">
                        {sport.prizeBreakdown?.map((prize, idx) => {
                          let badgeClass = "gold-medal-badge";
                          if (idx === 1) badgeClass = "silver-medal-badge";
                          else if (idx === 2) badgeClass = "bronze-medal-badge";

                          return (
                            <div key={idx} className="flex align-items-center gap-3 p-2" style={{ backgroundColor: "rgba(212,175,55,0.06)", borderRadius: "8px" }}>
                              <div className={badgeClass}></div>
                              <div className="flex-1">
                                <p className="m-0 text-sm font-bold" style={{ color: "white" }}>{prize.rank}</p>
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
