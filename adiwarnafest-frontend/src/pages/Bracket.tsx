import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Basketball, SoccerBall, MusicNotes, GameController } from "@phosphor-icons/react";

const sports = [
  { id: 'Basketball 5x5', label: 'Basketball 5x5', icon: Basketball },
  { id: 'Basketball 3x3', label: 'Basketball 3x3', icon: Basketball },
  { id: 'Futsal',         label: 'Futsal',         icon: SoccerBall },
  { id: 'Dance',          label: 'Dance',           icon: MusicNotes },
  { id: 'Mobile Legends', label: 'Mobile Legends',  icon: GameController },
];

interface BracketMatch {
  matchId: string;
  team1: string;
  score1: number | string;
  team2: string;
  score2: number | string;
  winner?: 1 | 2;
  time?: string;
  isPending?: boolean;
}

interface Round {
  label: string;
  matches: BracketMatch[];
}

const bracketData: Record<string, Round[]> = {
  'Basketball 5x5': [
    {
      label: 'Quarter-Finals',
      matches: [
        { matchId: 'Q1', team1: 'Tigers VC',    score1: 98, team2: 'Falcons Elite',  score2: 82, winner: 1, time: '09:00' },
        { matchId: 'Q2', team1: 'Iron Giants',  score1: 75, team2: 'Phoenix SC',     score2: 81, winner: 2, time: '10:30' },
        { matchId: 'Q3', team1: 'Stallions',    score1: 104,team2: 'Dune Raiders',   score2: 95, winner: 1, time: '12:00' },
        { matchId: 'Q4', team1: 'Neon Knights', score1: 88, team2: 'Wildcats',       score2: 92, winner: 2, time: '13:30' },
      ],
    },
    {
      label: 'Semi-Finals',
      matches: [
        { matchId: 'S1', team1: 'Tigers VC', score1: 91, team2: 'Phoenix SC', score2: 78, winner: 1, time: '15:00' },
        { matchId: 'S2', team1: 'Stallions', score1: '-', team2: 'Wildcats',  score2: '-', isPending: true, time: '16:30' },
      ],
    },
    {
      label: 'Finals',
      matches: [
        { matchId: 'F1', team1: 'Tigers VC', score1: '-', team2: 'TBD', score2: '-', isPending: true, time: '18:00' },
      ],
    },
  ],
  'Basketball 3x3': [
    {
      label: 'Semi-Finals',
      matches: [
        { matchId: 'S1', team1: 'Hoop Dreams', score1: 21, team2: 'Slam Dunkers', score2: 18, winner: 1, time: '09:00' },
        { matchId: 'S2', team1: 'Net Rippers', score1: '-', team2: 'Ballers', score2: '-', isPending: true, time: '10:00' },
      ],
    },
    {
      label: 'Finals',
      matches: [
        { matchId: 'F1', team1: 'Hoop Dreams', score1: '-', team2: 'TBD', score2: '-', isPending: true, time: '11:30' },
      ],
    },
  ],
  'Futsal': [
    {
      label: 'Semi-Finals',
      matches: [
        { matchId: 'S1', team1: 'United FC', score1: 3, team2: 'Goal Diggers', score2: 1, winner: 1, time: '09:00' },
        { matchId: 'S2', team1: 'Strikerz',  score1: '-', team2: 'Red Devils', score2: '-', isPending: true, time: '10:30' },
      ],
    },
    {
      label: 'Finals',
      matches: [
        { matchId: 'F1', team1: 'United FC', score1: '-', team2: 'TBD', score2: '-', isPending: true, time: '13:00' },
      ],
    },
  ],
  'Dance': [
    {
      label: 'Finals',
      matches: [
        { matchId: 'F1', team1: 'Crew X', score1: '-', team2: 'Crew Y', score2: '-', isPending: true, time: '15:00' },
      ],
    },
  ],
  'Mobile Legends': [
    {
      label: 'Semi-Finals',
      matches: [
        { matchId: 'S1', team1: 'EVOS X', score1: 2, team2: 'Alter Ego Z', score2: 0, winner: 1, time: '13:00' },
        { matchId: 'S2', team1: 'RRQ Y',  score1: '-', team2: 'TBD', score2: '-', isPending: true, time: '15:00' },
      ],
    },
    {
      label: 'Finals',
      matches: [
        { matchId: 'F1', team1: 'EVOS X', score1: '-', team2: 'TBD', score2: '-', isPending: true, time: '17:00' },
      ],
    },
  ],
};

const MatchCard = ({ match, isFinal }: { match: BracketMatch; isFinal?: boolean }) => (
  <div style={{
    background: isFinal ? "linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%)" : "white",
    border: isFinal ? "2px solid var(--color-primary)" : "1px solid #f0ece8",
    borderRadius: "14px",
    padding: "10px 12px",
    boxShadow: isFinal ? "0 4px 18px rgba(144,77,0,0.18)" : "0 1px 5px rgba(0,0,0,0.05)",
    position: "relative",
    minWidth: 0,
  }}>
    {isFinal && (
      <div style={{ position: "absolute", top: -10, right: 10, background: "var(--color-primary)", borderRadius: "6px", padding: "2px 8px", color: "white", fontSize: "8px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        🏆 Final
      </div>
    )}
    {match.time && (
      <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>
        {match.time} MYT
      </div>
    )}
    {/* Team 1 */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 8px", borderRadius: "8px", marginBottom: "3px",
      background: match.winner === 1 ? "rgba(144,77,0,0.08)" : match.isPending ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.02)",
      border: match.winner === 1 ? "1px solid rgba(144,77,0,0.15)" : "1px solid transparent",
    }}>
      <span style={{
        fontSize: "12px", fontWeight: match.winner === 1 ? 900 : 500,
        color: match.winner === 1 ? "#862C14" : match.isPending ? "#9ca3af" : "#374151",
        letterSpacing: "-0.2px", flex: 1, minWidth: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{match.team1}</span>
      <span style={{
        fontSize: "15px", fontWeight: 900, color: match.winner === 1 ? "#862C14" : "#9ca3af",
        letterSpacing: "-1px", marginLeft: "8px", flexShrink: 0,
        fontFamily: match.isPending ? "monospace" : "Epilogue, sans-serif",
      }}>{match.score1}</span>
    </div>
    {/* Team 2 */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 8px", borderRadius: "8px",
      background: match.winner === 2 ? "rgba(144,77,0,0.08)" : "rgba(0,0,0,0.02)",
      border: match.winner === 2 ? "1px solid rgba(144,77,0,0.15)" : "1px solid transparent",
    }}>
      <span style={{
        fontSize: "12px", fontWeight: match.winner === 2 ? 900 : 500,
        color: match.winner === 2 ? "#862C14" : match.isPending ? "#9ca3af" : "#374151",
        letterSpacing: "-0.2px", flex: 1, minWidth: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{match.team2}</span>
      <span style={{
        fontSize: "15px", fontWeight: 900, color: match.winner === 2 ? "#862C14" : "#9ca3af",
        letterSpacing: "-1px", marginLeft: "8px", flexShrink: 0,
        fontFamily: match.isPending ? "monospace" : "Epilogue, sans-serif",
      }}>{match.score2}</span>
    </div>
  </div>
);

const Bracket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState(location.state?.sport || 'Basketball 5x5');
  const sportTabsRef = useRef<HTMLDivElement>(null);
  const [chipScroll, setChipScroll] = useState({ progress: 0, thumbRatio: 1 });

  const updateChipScroll = useCallback(() => {
    const el = sportTabsRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setChipScroll({ progress: max > 0 ? el.scrollLeft / max : 0, thumbRatio: max > 0 ? el.clientWidth / el.scrollWidth : 1 });
  }, []);

  useEffect(() => {
    const el = sportTabsRef.current;
    if (!el) return;
    updateChipScroll();
    el.addEventListener("scroll", updateChipScroll, { passive: true });
    window.addEventListener("resize", updateChipScroll, { passive: true });
    return () => { el.removeEventListener("scroll", updateChipScroll); window.removeEventListener("resize", updateChipScroll); };
  }, [updateChipScroll]);

  useEffect(() => {
    if (!sportTabsRef.current) return;
    const btn = sportTabsRef.current.querySelector<HTMLElement>("[data-active='true']");
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSport]);

  const rounds = bracketData[activeSport] || [];

  return (
    <div style={{ fontFamily: "Epilogue, sans-serif", background: "#f8f7f5", minHeight: "100vh", paddingBottom: "32px" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(248,247,245,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "700px", margin: "0 auto", height: "52px" }}>
          <button style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate(-1)}>
            <ArrowLeft size={22} weight="bold" color="var(--color-primary)" />
          </button>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Tournament Bracket</h1>
          <div style={{ width: 22 }} />
        </div>
      </header>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>

        {/* Sport Chips */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div ref={sportTabsRef} style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '5px 4px 6px' }}>
            {sports.map(sport => {
              const active = activeSport === sport.id;
              return (
                <button
                  key={sport.id}
                  data-active={active}
                  onClick={() => setActiveSport(sport.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 16px', flexShrink: 0,
                    border: active ? 'none' : '1.5px solid #e5e7eb',
                    borderRadius: '999px', cursor: 'pointer',
                    background: active ? 'var(--color-primary)' : 'white',
                    color: active ? 'white' : '#6b7280',
                    fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap',
                    fontFamily: 'Epilogue, sans-serif',
                    boxShadow: active ? '0 4px 14px rgba(144,77,0,0.28)' : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <sport.icon size={15} weight={active ? 'fill' : 'regular'} />
                  {sport.label}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 6, width: '20px', background: 'linear-gradient(to right, #f8f7f5, transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 6, width: '36px', background: 'linear-gradient(to left, #f8f7f5, transparent)', pointerEvents: 'none' }} />
          {chipScroll.thumbRatio < 0.99 && (
            <div style={{ height: '3px', background: 'rgba(144,77,0,0.1)', borderRadius: '999px', marginTop: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', height: '100%',
                width: `${chipScroll.thumbRatio * 100}%`,
                left: `${chipScroll.progress * (100 - chipScroll.thumbRatio * 100)}%`,
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                borderRadius: '999px', transition: 'left 0.08s linear',
              }} />
            </div>
          )}
        </div>

        {/* Sport title */}
        <div style={{ marginBottom: "22px" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.03em" }}>{activeSport}</h2>
          <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: "12px", fontWeight: 600 }}>30–31 May 2026 · Adiwarna Fest</p>
        </div>

        {/* Champion banner — only if there's a completed final */}
        {rounds.length > 0 && (() => {
          const finalRound = rounds[rounds.length - 1];
          const finalMatch = finalRound?.matches[0];
          const champion = finalMatch && !finalMatch.isPending && finalMatch.winner
            ? (finalMatch.winner === 1 ? finalMatch.team1 : finalMatch.team2)
            : null;
          return champion ? (
            <div style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, #c07000 100%)",
              borderRadius: "20px", padding: "20px", marginBottom: "24px",
              boxShadow: "0 6px 24px rgba(144,77,0,0.28)",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.18)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trophy size={30} weight="fill" color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Champion</p>
                <h3 style={{ margin: "3px 0 0", fontSize: "22px", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>{champion}</h3>
              </div>
            </div>
          ) : null;
        })()}

        {/* Bracket grid — horizontal scroll */}
        <div style={{ overflowX: "auto", marginBottom: "8px", paddingBottom: "4px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${rounds.length}, minmax(180px, 1fr))`,
            gap: "16px",
            minWidth: `${rounds.length * 196}px`,
            alignItems: "start",
          }}>
            {rounds.map((round, ri) => (
              <div key={ri}>
                {/* Round header */}
                <div style={{
                  textAlign: "center", marginBottom: "10px",
                  padding: "5px 12px",
                  background: ri === rounds.length - 1 ? "linear-gradient(135deg, var(--color-primary), #c07000)" : "white",
                  borderRadius: "999px",
                  border: ri === rounds.length - 1 ? "none" : "1px solid #e5e7eb",
                  boxShadow: ri === rounds.length - 1 ? "0 3px 10px rgba(144,77,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 800,
                    color: ri === rounds.length - 1 ? "white" : "#6b7280",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                  }}>{round.label}</span>
                </div>

                {/* Matches */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {round.matches.map((match, mi) => (
                    <div key={mi} style={{ position: "relative" }}>
                      <MatchCard match={match} isFinal={ri === rounds.length - 1} />
                      {/* Connector line to next round */}
                      {ri < rounds.length - 1 && (
                        <div style={{
                          position: "absolute", right: "-17px", top: "50%",
                          width: "17px", height: "1px",
                          background: "#d1d5db", zIndex: 1,
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        {rounds.length > 2 && (
          <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", fontWeight: 600, margin: "8px 0 0" }}>
            ← Scroll to see all rounds →
          </p>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "28px", padding: "14px 16px", background: "white", borderRadius: "14px", border: "1px solid #f0ece8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(144,77,0,0.12)", border: "1px solid rgba(144,77,0,0.2)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>Winner</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>Pending</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={12} weight="fill" color="var(--color-primary)" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>Championship</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Bracket;
