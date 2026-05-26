import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Basketball, SoccerBall, GameController,
  Clock, MapPin,
} from "@phosphor-icons/react";

import { tournamentsService } from "../services/tournaments";
import { publicService } from "../services/public";
import type { Game } from "../services/games";
import type { Tournament } from "../services/tournaments";

const MEDALS = ["🥇", "🥈", "🥉"];

// Maps sport tab label → backend gameType value (must match DB stored string exactly)
const SPORT_TO_GAMETYPE: Record<string, string> = {
  "Basketball 5x5": "Basketball5v5",
  "Futsal": "Futsal",
  "Mobile Legends": "Mobile Legends",
};

// Format a UTC ISO datetime string as "HH:MM" in local time
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Format a UTC ISO datetime string as "D Month YYYY" matching the dates array (uses local time)
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

const Competition = () => {
  const location = useLocation();
  const [activeDate, setActiveDate] = useState("30 May 2026");
  const [activeSport, setActiveSport] = useState(location.state?.sport || "Basketball 5x5");
  const [visibleMatches, setVisibleMatches] = useState(3);
  const [showFullStandings, setShowFullStandings] = useState(false);
  const isFutsal = activeSport === "Futsal";
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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

  // Load all tournaments once
  useEffect(() => {
    tournamentsService.listTournaments().then(setTournaments).catch(() => setTournaments([]));
  }, []);

  // When sport changes, find the matching tournament and fetch its games
  useEffect(() => {
    const gameType = SPORT_TO_GAMETYPE[activeSport];
    const tournament = tournaments.find(t => t.gameType === gameType);
    if (!tournament) {
      setGames([]);
      return;
    }
    publicService.getPublicGames(tournament.id)
      .then(setGames)
      .catch(() => setGames([]));
  }, [activeSport, tournaments]);

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

  const dates = ["27 May 2026", "28 May 2026", "29 May 2026", "30 May 2026", "31 May 2026"];
  const dayNames: { [key: string]: string } = {
    "27 May 2026": "Wednesday",
    "28 May 2026": "Thursday",
    "29 May 2026": "Friday",
    "30 May 2026": "Saturday",
    "31 May 2026": "Sunday",
  };
  const sports = [
    { id: "Basketball 5x5", label: "Basketball 5x5", icon: Basketball },
    { id: "Futsal",         label: "Futsal",         icon: SoccerBall },
    { id: "Mobile Legends", label: "Mobile Legends", icon: GameController },
  ];

  // Filter games for the active date
  const activeMatches = games.filter(g => formatDate(g.scheduledAt) === activeDate);
  const sortedMatches = [...activeMatches].sort((a, b) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  const visibleList = sortedMatches.slice(0, visibleMatches);

  // Compute standings from games
  const gameType = SPORT_TO_GAMETYPE[activeSport];
  const activeTournament = tournaments.find(t => t.gameType === gameType);
  const teamStatsMap = new Map<string, { id: string; name: string; p: number; w: number; d: number; l: number; pts: number }>();
  if (activeTournament) {
    activeTournament.teams.forEach(t => {
      teamStatsMap.set(t.teamId, { id: t.teamId.slice(0, 3).toUpperCase(), name: t.teamName, p: 0, w: 0, d: 0, l: 0, pts: 0 });
    });
  }
  games.filter(g => g.gameStatus === "COMPLETED").forEach(g => {
    const t1 = teamStatsMap.get(g.team1Id);
    const t2 = teamStatsMap.get(g.team2Id);
    const isDraw = g.team1Score === g.team2Score;
    if (t1) {
      t1.p++;
      if (isDraw && isFutsal) { t1.d++; t1.pts += 1; }
      else if (g.team1Score > g.team2Score) { t1.w++; t1.pts += isFutsal ? 3 : 1; }
      else { t1.l++; }
    }
    if (t2) {
      t2.p++;
      if (isDraw && isFutsal) { t2.d++; t2.pts += 1; }
      else if (g.team2Score > g.team1Score) { t2.w++; t2.pts += isFutsal ? 3 : 1; }
      else { t2.l++; }
    }
  });
  const activeStandings = Array.from(teamStatsMap.values()).sort((a, b) =>
    isFutsal ? (b.pts - a.pts || b.w - a.w) : (b.w - a.w || b.p - a.p)
  );
  const standingsSlice = showFullStandings ? activeStandings : activeStandings.slice(0, 5);

  const activeDateIndex = dates.indexOf(activeDate);
  const buttonWidth = `calc(${100 / dates.length}% - 4px)`;

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
              left: `calc(${activeDateIndex * (100 / dates.length)}% + 4px)`,
              width: buttonWidth, height: "calc(100% - 8px)",
              background: "var(--color-primary)", borderRadius: "999px",
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)",
              zIndex: 0, boxShadow: "0 2px 8px rgba(144,77,0,0.3)",
            }} />
            {dates.map(d => {
              const [day, month] = d.split(' ');
              return (
                <button key={d} onClick={() => setActiveDate(d)} style={{
                  position: "relative", zIndex: 1,
                  padding: "9px 12px", border: "none", borderRadius: "999px",
                  cursor: "pointer", background: "transparent",
                  color: activeDate === d ? "white" : "#6b7280",
                  fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap",
                  fontFamily: "Epilogue, sans-serif", transition: "color 0.25s",
                  flex: `1 1 ${100 / dates.length}%`,
                  textAlign: "center",
                }}>
                  {day} {month}
                </button>
              );
            })}
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
            {dayNames[activeDate]} · {activeDate}
          </p>
        </div>

        {/* ── Match Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {activeMatches.length > 0 ? (
            visibleList.map((match, idx) => {
              const isNew = idx >= prevVisibleRef.current;
              const delay = isNew ? (idx - prevVisibleRef.current) * 0.08 : 0;
              const isCompleted = match.gameStatus === "COMPLETED";
              const t1Goals = isCompleted ? match.team1Score : null;
              const t2Goals = isCompleted ? match.team2Score : null;
              return (
                <div
                  key={match.id}
                  style={{
                    background: "white", border: "1px solid #f0ece8",
                    borderRadius: "16px", padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    animation: isNew ? `slideInCard 0.45s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "28px", fontWeight: 900, color: "#862C14", letterSpacing: "-2px", lineHeight: 1 }}>{formatTime(match.scheduledAt)}</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>MYT</span>
                    </div>
                    <span style={{ background: isCompleted ? "#dcfce7" : "#FEF0E3", color: isCompleted ? "#166534" : "#92400e", padding: "3px 10px", borderRadius: "7px", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>
                      {match.remark || match.gameStatus}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "#111", letterSpacing: "-0.3px" }}>{match.team1Name}</div>
                      {isCompleted && t1Goals !== null && <div style={{ fontSize: "22px", fontWeight: 900, color: t1Goals > t2Goals! ? "#16a34a" : "#dc2626", marginTop: "2px" }}>{t1Goals}</div>}
                    </div>
                    <div style={{ width: "48px", height: "32px", borderRadius: "50%", background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "10px", fontWeight: 700, fontStyle: "italic" }}>vs</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: "#111", letterSpacing: "-0.3px" }}>{match.team2Name}</div>
                      {isCompleted && t2Goals !== null && <div style={{ fontSize: "22px", fontWeight: 900, color: t2Goals > t1Goals! ? "#16a34a" : "#dc2626", marginTop: "2px" }}>{t2Goals}</div>}
                    </div>
                  </div>

                  {match.remark && (
                    <div style={{ borderTop: "1px solid #f5f4f2", paddingTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <MapPin size={11} weight="fill" color="#862C14" />
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.7px" }}>{match.remark}</span>
                    </div>
                  )}
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

{/* ── Standings ── */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "20px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Standings</h3>

          <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: "1px solid #f0ece8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: isFutsal ? "52px 1fr 40px 40px 40px 40px 48px" : "52px 1fr 40px 40px 40px", padding: "10px 14px", background: "#faf9f7", borderBottom: "1px solid #f0ece8" }}>
              {(isFutsal ? ["#", "Team", "P", "W", "D", "L", "PTS"] : ["#", "Team", "P", "W", "L"]).map((h, i) => (
                <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.7px", textAlign: i > 1 ? "center" : "left" }}>{h}</div>
              ))}
            </div>

            {/* Data rows */}
            {standingsSlice.map((team, idx: number) => (
              <div
                key={team.id}
                style={{
                  display: "grid", gridTemplateColumns: isFutsal ? "52px 1fr 40px 40px 40px 40px 48px" : "52px 1fr 40px 40px 40px",
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
                {isFutsal && <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#6b7280" }}>{team.d}</div>}
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, color: idx < 3 ? "#dc2626" : "#9ca3af" }}>{team.l}</div>
                {isFutsal && <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "var(--color-primary)" }}>{team.pts}</div>}
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
      `}</style>
    </div>
  );
};

export default Competition;
