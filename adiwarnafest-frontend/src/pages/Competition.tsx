import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Basketball, SoccerBall, MusicNotes, GameController,
  CaretRight, Trophy, Clock, MapPin, Code, GearSix,
} from "@phosphor-icons/react";

import { scheduleData, standingsData } from "../data/mockData";
import MaintenanceCompetition from "./MaintenanceCompetition";

const MEDALS = ["🥇", "🥈", "🥉"];

const Competition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDate, setActiveDate] = useState("30 May 2026");
  const [activeSport, setActiveSport] = useState(location.state?.sport || "Basketball 5x5");
  const [visibleMatches, setVisibleMatches] = useState(3);
  const [showFullStandings, setShowFullStandings] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [updatedSchedules, setUpdatedSchedules] = useState(() => {
    const saved = localStorage.getItem("editedScheduleData");
    return saved ? JSON.parse(saved) : scheduleData;
  });
  const [updatedStandings, setUpdatedStandings] = useState(() => {
    const saved = localStorage.getItem("editedStandingsData");
    return saved ? JSON.parse(saved) : standingsData;
  });
  const prevVisibleRef = useRef(0);
  const sportTabsRef = useRef<HTMLDivElement>(null);
  const [chipScroll, setChipScroll] = useState({ progress: 0, thumbRatio: 1 });

  const updateChipScroll = useCallback(() => {
    const el = sportTabsRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setChipScroll({
      progress: max > 0 ? el.scrollLeft / max : 0,
      thumbRatio: max > 0 ? el.clientWidth / el.scrollWidth : 1,
    });
  }, []);

  useEffect(() => {
    const el = sportTabsRef.current;
    if (!el) return;
    updateChipScroll();
    el.addEventListener("scroll", updateChipScroll, { passive: true });
    window.addEventListener("resize", updateChipScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", updateChipScroll);
      window.removeEventListener("resize", updateChipScroll);
    };
  }, [updateChipScroll]);

  useEffect(() => {
    if (location.state?.sport) setActiveSport(location.state.sport);
  }, [location.state]);

  // Reload data from localStorage when component mounts or when focus returns
  useEffect(() => {
    const handleFocus = () => {
      const saved = localStorage.getItem("editedScheduleData");
      const savedStandings = localStorage.getItem("editedStandingsData");
      if (saved) setUpdatedSchedules(JSON.parse(saved) as any);
      if (savedStandings) setUpdatedStandings(JSON.parse(savedStandings) as any);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    prevVisibleRef.current = 0;
    setVisibleMatches(3);
    setShowFullStandings(false);
  }, [activeSport, activeDate]);

  useEffect(() => {
    if (!sportTabsRef.current) return;
    const btn = sportTabsRef.current.querySelector<HTMLElement>("[data-active='true']");
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSport]);

  const handleLoadMore = () => {
    prevVisibleRef.current = visibleMatches;
    setVisibleMatches((p) => p + 3);
  };
  const handleShowLess = () => {
    prevVisibleRef.current = 0;
    setVisibleMatches(3);
  };

  const dates = ["30 May 2026", "31 May 2026"];
  const sports = [
    { id: "Basketball 5x5", label: "Basketball 5x5", icon: Basketball },
    { id: "Basketball 3x3", label: "Basketball 3x3", icon: Basketball },
    { id: "Futsal",         label: "Futsal",         icon: SoccerBall },
    { id: "Dance",          label: "Dance",          icon: MusicNotes },
    { id: "Mobile Legends", label: "Mobile Legends", icon: GameController },
  ];

  const activeMatches = (updatedSchedules as any)[activeSport]?.[activeDate] || [];
  const activeStandings = (updatedStandings as any)[activeSport] || [];
  const sortedMatches = [...activeMatches].sort((a: any, b: any) => a.time.localeCompare(b.time));
  const visibleList = sortedMatches.slice(0, visibleMatches);
  const standingsSlice = showFullStandings ? activeStandings : activeStandings.slice(0, 5);

  return (
    <div style={{ fontFamily: "Epilogue, sans-serif", background: "#f8f7f5", minHeight: "100vh", paddingBottom: "110px" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Title ── */}
        <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.03em", margin: "0 0 22px", textTransform: "uppercase" }}>
          Competition Schedule
        </h2>

        {/* ── Date Tabs ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", display: "inline-flex", background: "white", borderRadius: "999px", padding: "4px", border: "1px solid #e8e5e0", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: "4px",
              left: activeDate === "30 May 2026" ? "4px" : "calc(50%)",
              width: "calc(50% - 4px)", height: "calc(100% - 8px)",
              background: "var(--color-primary)", borderRadius: "999px",
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
              zIndex: 0, boxShadow: "0 2px 8px rgba(144,77,0,0.3)",
            }} />
            {dates.map(d => (
              <button key={d} onClick={() => setActiveDate(d)} style={{
                position: "relative", zIndex: 1,
                padding: "9px 28px", border: "none", borderRadius: "999px",
                cursor: "pointer", background: "transparent",
                color: activeDate === d ? "white" : "#6b7280",
                fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap",
                fontFamily: "Epilogue, sans-serif", transition: "color 0.25s",
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sport Chips ── */}
        <div style={{ position: "relative", marginBottom: "22px" }}>
          <div
            ref={sportTabsRef}
            className="sport-chips-row"
            style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", padding: "5px 4px 6px" }}
          >
            {sports.map(s => {
              const active = activeSport === s.id;
              return (
                <button
                  key={s.id}
                  data-active={active}
                  onClick={() => setActiveSport(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "9px 16px", flexShrink: 0,
                    border: active ? "none" : "1.5px solid #e5e7eb",
                    borderRadius: "999px", cursor: "pointer",
                    background: active ? "var(--color-primary)" : "white",
                    color: active ? "white" : "#6b7280",
                    fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap",
                    fontFamily: "Epilogue, sans-serif",
                    boxShadow: active ? "0 4px 14px rgba(144,77,0,0.28)" : "0 1px 3px rgba(0,0,0,0.06)",
                    transform: active ? "scale(1.04)" : "scale(1)",
                    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <s.icon size={15} weight={active ? "fill" : "regular"} />
                  {s.label}
                </button>
              );
            })}
          </div>
          {/* Fade hints — hidden on desktop via CSS */}
          <div className="chips-fade-left" style={{ position: "absolute", left: 0, top: 0, bottom: 6, width: "20px", background: "linear-gradient(to right, #f8f7f5, transparent)", pointerEvents: "none" }} />
          <div className="chips-fade-right" style={{ position: "absolute", right: 0, top: 0, bottom: 6, width: "36px", background: "linear-gradient(to left, #f8f7f5, transparent)", pointerEvents: "none" }} />
          {/* Scroll progress bar — hidden on desktop via CSS */}
          {chipScroll.thumbRatio < 0.99 && (
            <div className="chips-scroll-bar" style={{ height: "3px", background: "rgba(144,77,0,0.1)", borderRadius: "999px", marginTop: "4px", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", height: "100%",
                width: `${chipScroll.thumbRatio * 100}%`,
                left: `${chipScroll.progress * (100 - chipScroll.thumbRatio * 100)}%`,
                background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                borderRadius: "999px",
                transition: "left 0.08s linear",
              }} />
            </div>
          )}
        </div>

        {/* ── Schedule Header ── */}
        <div style={{ marginBottom: "14px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Upcoming Matches</h3>
          <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: "13px", fontWeight: 600 }}>
            {activeDate === "30 May 2026" ? "Saturday" : "Sunday"} · {activeDate}
          </p>
        </div>

        {/* ── Match Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {activeMatches.length > 0 ? (
            visibleList.map((match: any, idx: number) => {
              const isNew = idx >= prevVisibleRef.current;
              const delay = isNew ? (idx - prevVisibleRef.current) * 0.08 : 0;
              return (
                <div
                  key={`${match.time}-${match.team1}`}
                  style={{
                    background: "white", border: "1px solid #f0ece8",
                    borderRadius: "16px", padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    animation: isNew ? `slideInCard 0.45s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "28px", fontWeight: 900, color: "#862C14", letterSpacing: "-2px", lineHeight: 1 }}>{match.time}</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>MYT</span>
                    </div>
                    <span style={{ background: "#FEF0E3", color: "#92400e", padding: "3px 10px", borderRadius: "7px", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>{match.type}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "#111", letterSpacing: "-0.3px" }}>{match.team1}</div>
                      {match.seed1 && <div style={{ fontSize: "9px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "2px" }}>{match.seed1}</div>}
                    </div>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "10px", fontWeight: 700, fontStyle: "italic" }}>vs</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "#111", letterSpacing: "-0.3px" }}>{match.team2}</div>
                      {match.seed2 && <div style={{ fontSize: "9px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "2px" }}>{match.seed2}</div>}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f5f4f2", paddingTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={11} weight="fill" color="#862C14" />
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.7px" }}>{match.venue}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: "20px", border: "2px dashed #e5e7eb" }}>
              <Clock size={36} weight="light" color="#d1d5db" />
              <p style={{ color: "#9ca3af", fontWeight: 600, marginTop: "10px", fontSize: "14px" }}>No matches scheduled for this day</p>
            </div>
          )}
        </div>

        {/* ── Load More / Show Less ── */}
        {(activeMatches.length > visibleMatches || visibleMatches > 3) && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
            {activeMatches.length > visibleMatches && (
              <button
                onClick={handleLoadMore}
                className="comp-btn-primary"
                style={{
                  background: "white", border: "2px solid var(--color-primary)",
                  color: "var(--color-primary)", padding: "10px 26px",
                  borderRadius: "999px", fontWeight: 700, fontSize: "12px",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  cursor: "pointer", fontFamily: "Epilogue, sans-serif",
                  boxShadow: "0 2px 8px rgba(144,77,0,0.12)",
                  transition: "all 0.2s ease",
                }}
              >
                Load More
              </button>
            )}
            {visibleMatches > 3 && (
              <button
                onClick={handleShowLess}
                className="comp-btn-ghost"
                style={{
                  background: "white", border: "2px solid #e5e7eb",
                  color: "#6b7280", padding: "10px 26px",
                  borderRadius: "999px", fontWeight: 700, fontSize: "12px",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  cursor: "pointer", fontFamily: "Epilogue, sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {/* ── Full Bracket CTA ── */}
        <button
          onClick={() => navigate("/bracket", { state: { sport: activeSport } })}
          className="comp-bracket-btn"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #c07000 100%)",
            border: "none", borderRadius: "18px", cursor: "pointer",
            marginBottom: "28px",
            boxShadow: "0 6px 20px rgba(144,77,0,0.28)",
            fontFamily: "Epilogue, sans-serif",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Trophy size={22} weight="fill" color="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.02em" }}>View Full Bracket</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 500, marginTop: "1px" }}>All matchups & results · {activeSport}</div>
            </div>
          </div>
          <CaretRight size={22} weight="bold" color="rgba(255,255,255,0.85)" />
        </button>

        {/* ── Standings ── */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "20px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Standings</h3>

          <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid #f0ece8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 40px 40px 40px", padding: "10px 14px", background: "#faf9f7", borderBottom: "1px solid #f0ece8" }}>
              {(["#", "Team", "P", "W", "L"] as const).map((h, i) => (
                <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px", textAlign: i > 1 ? "center" : "left" }}>{h}</div>
              ))}
            </div>

            {/* Data rows */}
            {standingsSlice.map((team: any, idx: number) => (
              <div
                key={team.id}
                style={{
                  display: "grid", gridTemplateColumns: "52px 1fr 40px 40px 40px",
                  padding: "12px 14px", alignItems: "center",
                  borderBottom: idx < standingsSlice.length - 1 ? "1px solid #f7f5f3" : "none",
                  background: idx === 0 ? "linear-gradient(90deg,rgba(144,77,0,0.05) 0%,transparent 100%)" : "transparent",
                }}
              >
                <div>
                  {idx < 3
                    ? <span style={{ fontSize: "20px", lineHeight: 1 }}>{MEDALS[idx]}</span>
                    : <span style={{ fontSize: "13px", fontWeight: 700, color: "#9ca3af" }}>{idx + 1}</span>
                  }
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                    background: idx === 0 ? "var(--color-primary)" : idx === 1 ? "#94a3b8" : idx === 2 ? "#d97706" : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 800, color: idx < 3 ? "white" : "#6b7280",
                  }}>{team.id}</div>
                  <span style={{ fontSize: "14px", fontWeight: idx < 3 ? 700 : 500, color: idx < 3 ? "#111" : "#6b7280" }}>{team.name}</span>
                </div>
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#6b7280" }}>{team.p}</div>
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: idx < 3 ? "#16a34a" : "#374151" }}>{team.w}</div>
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, color: idx < 3 ? "#dc2626" : "#9ca3af" }}>{team.l}</div>
              </div>
            ))}
          </div>

          {activeStandings.length > 5 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "14px" }}>
              <button
                onClick={() => setShowFullStandings(p => !p)}
                className="comp-btn-primary"
                style={{
                  background: "white", border: "2px solid var(--color-primary)",
                  color: "var(--color-primary)", padding: "9px 28px",
                  borderRadius: "999px", fontWeight: 700, fontSize: "12px",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  cursor: "pointer", fontFamily: "Epilogue, sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                {showFullStandings ? "Collapse" : "View All Standings"}
              </button>
            </div>
          )}
        </div>

      </main>

      {/* ── Maintenance Button ── */}
      <button
        onClick={() => setMaintenanceOpen(true)}
        title="Maintenance Mode"
        className="comp-maintenance-btn"
        style={{
          position: "fixed", bottom: "150px", right: "18px", zIndex: 9999,
          display: "flex", alignItems: "center", gap: "8px",
          padding: "11px 16px",
          background: "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)",
          border: "none", borderRadius: "999px", cursor: "pointer",
          color: "white", fontFamily: "Epilogue, sans-serif",
          fontWeight: 700, fontSize: "12px", letterSpacing: "0.3px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.32)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <GearSix size={16} weight="bold" />
          <span style={{
            position: "absolute", top: "-5px", right: "-5px",
            width: "7px", height: "7px",
            background: "#f59e0b", borderRadius: "50%",
            animation: "devPulse 2s ease-in-out infinite",
          }} />
        </div>
        <span>Maintenance</span>
      </button>

      {/* ── Dev Mode FAB ── */}
      <button
        onClick={() => navigate("/dev")}
        title="Developer Mode"
        className="comp-dev-fab"
        style={{
          position: "fixed", bottom: "90px", right: "18px", zIndex: 9999,
          display: "flex", alignItems: "center", gap: "8px",
          padding: "11px 16px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          border: "none", borderRadius: "999px", cursor: "pointer",
          color: "white", fontFamily: "Epilogue, sans-serif",
          fontWeight: 700, fontSize: "12px", letterSpacing: "0.3px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.32)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Code size={16} weight="bold" />
          <span style={{
            position: "absolute", top: "-5px", right: "-5px",
            width: "7px", height: "7px",
            background: "#22c55e", borderRadius: "50%",
            animation: "devPulse 2s ease-in-out infinite",
          }} />
        </div>
        <span>Dev Mode</span>
      </button>

      {/* ── Maintenance Modal ── */}
      <MaintenanceCompetition
        isOpen={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
      />

      <style>{`
        @keyframes slideInCard {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes devPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.7); }
        }
        /* hide scrollbar on sport chips row */
        div[data-sport-tabs]::-webkit-scrollbar { display: none; }
        .sport-chips-row::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) {
          .sport-chips-row {
            flex-wrap: nowrap !important;
            overflow-x: visible !important;
            justify-content: center;
          }
          .sport-chips-row button {
            padding: 8px 12px !important;
          }
          .chips-fade-left, .chips-fade-right { display: none; }
          .chips-scroll-bar { display: none; }
        }
        /* button hover states */
        .comp-btn-primary:hover { background: var(--color-primary) !important; color: white !important; }
        .comp-btn-ghost:hover   { background: #f3f4f6 !important; }
        .comp-bracket-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(144,77,0,0.38) !important; }
        .comp-dev-fab:hover     { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(0,0,0,0.45) !important; }
        .comp-maintenance-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(146,64,14,0.45) !important; }
      `}</style>
    </div>
  );
};

export default Competition;
