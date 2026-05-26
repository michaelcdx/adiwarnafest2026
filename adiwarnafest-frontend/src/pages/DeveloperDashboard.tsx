import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, PencilSimple, Trash, X, FloppyDisk, Basketball, SoccerBall, MusicNotes, GameController, MapPin, CaretRight } from "@phosphor-icons/react";
import { scheduleData, standingsData } from "../data/mockData";
import { useLiveScore } from "../context/LiveScoreContext";

const sportsList = [
  { id: 'Basketball 5x5', label: 'Basketball 5x5', icon: Basketball },
  { id: 'Basketball 3x3', label: 'Basketball 3x3', icon: Basketball },
  { id: 'Futsal', label: 'Futsal', icon: SoccerBall },
  { id: 'Dance', label: 'Dance', icon: MusicNotes },
  { id: 'Mobile Legends', label: 'Mobile Legends', icon: GameController },
];

const dates = ["30 May 2026", "31 May 2026"];

const defaultSportScores: Record<string, ReturnType<typeof useLiveScore>["liveScore"]> = {
  "Basketball 5x5": { team1: "Tigers VC", team2: "Phoenix",   score1: 84, score2: 79, quarter: "Quarter 4", timer: "04:22", sport: "Basketball 5x5", isLive: true },
  "Basketball 3x3": { team1: "Wolves",    team2: "Hawks",     score1: 21, score2: 18, quarter: "2nd Half",  timer: "07:15", sport: "Basketball 3x3", isLive: true },
  "Futsal":         { team1: "Eagles FC", team2: "Lions FC",  score1: 3,  score2: 2,  quarter: "2nd Half",  timer: "14:30", sport: "Futsal",         isLive: false },
  "Dance":          { team1: "Group A",   team2: "Group B",   score1: 0,  score2: 0,  quarter: "Upcoming",  timer: "—",     sport: "Dance",          isLive: false },
  "Mobile Legends": { team1: "Alpha",     team2: "Beta",      score1: 1,  score2: 0,  quarter: "Game 2",    timer: "18:44", sport: "Mobile Legends", isLive: true },
};

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { setLiveScore } = useLiveScore();
  const [activeSport, setActiveSport] = useState('Basketball 5x5');
  const [liveEdit, setLiveEdit] = useState({ ...defaultSportScores['Basketball 5x5'] });
  const [activeDate, setActiveDate] = useState('30 May 2026');
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

  const handleSportChange = (id: string) => {
    setActiveSport(id);
    setLiveEdit({ ...defaultSportScores[id] });
  };

  const [showNewModal, setShowNewModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);

  const currentMatches = (scheduleData as any)[activeSport]?.[activeDate] || [];
  const currentStandings = (standingsData as any)[activeSport] || [];

  return (
    <div className="min-h-screen pb-8 fadein animation-duration-500" style={{ fontFamily: "Epilogue, sans-serif", backgroundColor: "#FAF9F6" }}>
      {/* Header */}
      <div className="sticky top-0 z-5 w-full" style={{ backgroundColor: "rgba(250,249,246,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <header className="flex justify-content-between align-items-center px-4 py-3 mx-auto w-full" style={{ maxWidth: "600px" }}>
          <button onClick={() => navigate(-1)} className="bg-transparent border-none cursor-pointer p-0 flex align-items-center">
            <ArrowLeft size={24} color="#862C14" weight="bold" />
          </button>
          <h1 className="m-0 text-lg font-bold" style={{ color: "#862C14", letterSpacing: "-0.02em" }}>
            Developer Console
          </h1>
          <div className="px-2 py-1 border-round-lg text-[9px] font-bold uppercase tracking-widest" style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.25)" }}>
            Admin
          </div>
        </header>
      </div>

      <main className="px-4 py-4 mx-auto w-full" style={{ maxWidth: "600px" }}>

        {/* ── Sport Selector ── */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div ref={sportTabsRef} style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '5px 4px 6px' }}>
            {sportsList.map(s => {
              const active = activeSport === s.id;
              return (
                <button
                  key={s.id}
                  data-active={active}
                  onClick={() => handleSportChange(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 16px', flexShrink: 0,
                    border: active ? 'none' : '1.5px solid #e5e7eb',
                    borderRadius: '999px', cursor: 'pointer',
                    background: active ? '#862C14' : 'white',
                    color: active ? 'white' : '#6b7280',
                    fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap',
                    fontFamily: 'Epilogue, sans-serif',
                    boxShadow: active ? '0 4px 14px rgba(134,44,20,0.28)' : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <s.icon size={15} weight={active ? 'fill' : 'regular'} />
                  {s.label}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 6, width: '20px', background: 'linear-gradient(to right, #FAF9F6, transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 6, width: '36px', background: 'linear-gradient(to left, #FAF9F6, transparent)', pointerEvents: 'none' }} />
          {chipScroll.thumbRatio < 0.99 && (
            <div style={{ height: '3px', background: 'rgba(134,44,20,0.1)', borderRadius: '999px', marginTop: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', height: '100%',
                width: `${chipScroll.thumbRatio * 100}%`,
                left: `${chipScroll.progress * (100 - chipScroll.thumbRatio * 100)}%`,
                background: 'linear-gradient(90deg, #862C14, #c07000)',
                borderRadius: '999px', transition: 'left 0.08s linear',
              }} />
            </div>
          )}
        </div>

        {/* ── Live Score Editor ── */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Live Score</h2>
              <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: "12px", fontWeight: 600 }}>Shown on Competition page</p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: liveEdit.isLive ? "rgba(239,68,68,0.08)" : "rgba(100,100,100,0.08)",
              borderRadius: "999px", padding: "6px 14px",
              border: liveEdit.isLive ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(0,0,0,0.1)",
            }}>
              {liveEdit.isLive && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", animation: "devPulse 1.5s ease-in-out infinite" }} />}
              <span style={{ fontSize: "10px", fontWeight: 800, color: liveEdit.isLive ? "#ef4444" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {liveEdit.isLive ? "Live" : "Upcoming"}
              </span>
              <button
                onClick={() => setLiveEdit(p => ({ ...p, isLive: !p.isLive }))}
                style={{
                  width: "36px", height: "20px", borderRadius: "999px",
                  border: "none", cursor: "pointer",
                  background: liveEdit.isLive ? "#ef4444" : "#d1d5db",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: "2px",
                  left: liveEdit.isLive ? "18px" : "2px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div style={{
            borderRadius: "18px", overflow: "hidden", marginBottom: "14px",
            height: "170px", position: "relative",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}>
            {liveEdit.isLive ? (
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: "5px", background: "rgba(239,68,68,0.9)", borderRadius: "999px", padding: "3px 10px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "white", animation: "livePulse 1.5s ease-in-out infinite" }} />
                <span style={{ color: "white", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Live</span>
              </div>
            ) : (
              <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(100,100,100,0.75)", borderRadius: "999px", padding: "3px 10px" }}>
                <span style={{ color: "white", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Upcoming</span>
              </div>
            )}
            <div style={{ position: "absolute", top: 10, right: 10, background: "#862C14", borderRadius: "6px", padding: "3px 8px", color: "white", fontSize: "9px", fontWeight: 700 }}>{liveEdit.quarter || "—"}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-evenly", padding: "0 12px 16px" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <span style={{ fontSize: "16px" }}>🏀</span>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: "11px" }}>{liveEdit.team1 || "Team 1"}</span>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0, padding: "0 8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ color: "white", fontSize: "36px", fontWeight: 900, letterSpacing: "-2px" }}>{liveEdit.score1}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "22px", fontWeight: 300 }}>:</span>
                  <span style={{ color: "white", fontSize: "36px", fontWeight: 900, letterSpacing: "-2px" }}>{liveEdit.score2}</span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "999px", padding: "2px 10px", color: "rgba(255,255,255,0.8)", fontSize: "11px", fontFamily: "monospace", marginTop: "2px" }}>{liveEdit.timer || "00:00"}</div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <span style={{ fontSize: "16px" }}>🏀</span>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: "11px" }}>{liveEdit.team2 || "Team 2"}</span>
              </div>
            </div>
          </div>

          {/* Edit fields */}
          <div style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #f0ece8", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Team 1 Name</label>
                <input value={liveEdit.team1} onChange={e => setLiveEdit(p => ({ ...p, team1: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", fontWeight: 700, fontFamily: "Epilogue, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Team 2 Name</label>
                <input value={liveEdit.team2} onChange={e => setLiveEdit(p => ({ ...p, team2: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "13px", fontWeight: 700, fontFamily: "Epilogue, sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Score 1</label>
                <input type="number" value={liveEdit.score1} onChange={e => setLiveEdit(p => ({ ...p, score1: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "9px 8px", borderRadius: "10px", border: "2px solid #862C14", fontSize: "18px", fontWeight: 900, fontFamily: "Epilogue, sans-serif", color: "#862C14", textAlign: "center", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Score 2</label>
                <input type="number" value={liveEdit.score2} onChange={e => setLiveEdit(p => ({ ...p, score2: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "9px 8px", borderRadius: "10px", border: "2px solid #862C14", fontSize: "18px", fontWeight: 900, fontFamily: "Epilogue, sans-serif", color: "#862C14", textAlign: "center", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Period</label>
                <input value={liveEdit.quarter} onChange={e => setLiveEdit(p => ({ ...p, quarter: e.target.value }))}
                  placeholder="e.g. Q4"
                  style={{ width: "100%", padding: "9px 8px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "12px", fontWeight: 600, fontFamily: "Epilogue, sans-serif", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Timer</label>
                <input value={liveEdit.timer} onChange={e => setLiveEdit(p => ({ ...p, timer: e.target.value }))}
                  placeholder="04:22"
                  style={{ width: "100%", padding: "9px 8px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "12px", fontWeight: 600, fontFamily: "monospace", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
              </div>
            </div>
            <button
              onClick={() => setLiveScore({ ...liveEdit })}
              style={{
                width: "100%", padding: "12px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #862C14 0%, #c07000 100%)",
                color: "white", fontWeight: 800, fontSize: "13px",
                fontFamily: "Epilogue, sans-serif", cursor: "pointer",
                letterSpacing: "0.3px", boxShadow: "0 4px 14px rgba(134,44,20,0.3)",
              }}
            >
              Push to Live
            </button>
          </div>
        </div>

        <div style={{ height: "1px", background: "#f0ece8", marginBottom: "28px" }} />

        {/* Add Match Button */}
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="text-2xl font-bold m-0" style={{ color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            Match Manager
          </h2>
          <button onClick={() => setShowNewModal(true)} className="flex align-items-center gap-2 border-none px-4 py-2 border-round-xl text-white font-bold cursor-pointer shadow-2 text-sm" style={{ backgroundColor: "#862C14" }}>
            <Plus size={16} weight="bold" /> Add Match
          </button>
        </div>

        {/* Date Tabs - Sliding Pill Style */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', display: 'inline-flex', background: 'white', borderRadius: '999px', padding: '4px', border: '1px solid #e3e2e0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Sliding pill */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: activeDate === '30 May 2026' ? '4px' : 'calc(50%)',
              width: 'calc(50% - 4px)',
              height: 'calc(100% - 8px)',
              backgroundColor: '#862C14',
              borderRadius: '999px',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }} />
            {dates.map(date => (
              <button key={date} onClick={() => setActiveDate(date)}
                style={{
                  position: 'relative', zIndex: 1,
                  padding: '8px 24px',
                  border: 'none', borderRadius: '999px', cursor: 'pointer',
                  background: 'transparent',
                  color: activeDate === date ? '#ffffff' : '#6b7280',
                  fontWeight: 700, fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s'
                }}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Match List */}
        <div className="flex justify-content-between align-items-end mb-3">
          <div>
            <h3 className="m-0 text-xl font-bold" style={{ color: "#1a1a1a" }}>
              Matches
            </h3>
            <p className="m-0 text-600 text-xs font-semibold mt-1">
              {activeDate === "30 May 2026" ? "Saturday" : "Sunday"}, {activeDate}
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#862C14" }}>
            {currentMatches.length} match{currentMatches.length !== 1 ? "es" : ""}
          </span>
        </div>

        <div className="flex flex-column gap-2 mb-6">
          {currentMatches.length === 0 ? (
            <div className="flex flex-column align-items-center justify-content-center py-6 border-round-2xl border-2 border-dashed" style={{ backgroundColor: "#f9f9f7", borderColor: "#e3e2e0" }}>
              <p className="text-500 font-bold text-sm">No matches on this date</p>
            </div>
          ) : (
            currentMatches.map((match: any, idx: number) => (
              <div key={idx} style={{ background: "white", border: "1px solid #f0ece8", borderRadius: "16px", padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                {/* Match header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 900, color: "#862C14", letterSpacing: "-2px", lineHeight: 1 }}>{match.time}</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>MYT</span>
                    <span style={{ background: "#FEF0E3", color: "#92400e", padding: "3px 10px", borderRadius: "7px", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "4px" }}>{match.type}</span>
                  </div>
                  <button
                    onClick={() => setEditingMatch(editingMatch === idx ? null : idx)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", border: "none", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "Epilogue, sans-serif", background: editingMatch === idx ? "#862C14" : "#f3f2f0", color: editingMatch === idx ? "#fff" : "#862C14" }}
                  >
                    <PencilSimple size={12} weight="bold" /> {editingMatch === idx ? "Close" : "Edit"}
                  </button>
                </div>

                {/* Teams */}
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

                {/* Venue */}
                <div style={{ borderTop: "1px solid #f5f4f2", paddingTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={11} weight="fill" color="#862C14" />
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.7px" }}>{match.venue}</span>
                </div>

                {/* Edit Panel (expanded) */}
                {editingMatch === idx && (
                  <div className="mt-3 pt-3" style={{ borderTop: "2px solid #862C14" }}>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Score 1</label>
                        <input type="text" defaultValue="-" className="w-full border-round-lg p-2 text-center font-mono text-lg font-bold outline-none" style={{ backgroundColor: "#FAF9F6", border: "2px solid #862C14", color: "#862C14" }} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Score 2</label>
                        <input type="text" defaultValue="-" className="w-full border-round-lg p-2 text-center font-mono text-lg font-bold outline-none" style={{ backgroundColor: "#FAF9F6", border: "2px solid #862C14", color: "#862C14" }} />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Team 1</label>
                        <input type="text" defaultValue={match.team1} className="w-full border-round-lg p-2 text-sm outline-none" style={{ backgroundColor: "#FAF9F6", border: "1px solid #e3e2e0" }} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Team 2</label>
                        <input type="text" defaultValue={match.team2} className="w-full border-round-lg p-2 text-sm outline-none" style={{ backgroundColor: "#FAF9F6", border: "1px solid #e3e2e0" }} />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Time</label>
                        <input type="text" defaultValue={match.time} className="w-full border-round-lg p-2 text-sm outline-none" style={{ backgroundColor: "#FAF9F6", border: "1px solid #e3e2e0" }} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[8px] text-500 uppercase font-bold tracking-widest mb-1">Venue</label>
                        <input type="text" defaultValue={match.venue} className="w-full border-round-lg p-2 text-sm outline-none" style={{ backgroundColor: "#FAF9F6", border: "1px solid #e3e2e0" }} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-content-end">
                      <button className="flex align-items-center gap-1 px-3 py-2 border-round-lg border-none cursor-pointer text-xs font-bold" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        <Trash size={12} /> Delete
                      </button>
                      <button className="flex align-items-center gap-1 px-3 py-2 border-round-lg border-none cursor-pointer text-xs font-bold text-white" style={{ backgroundColor: "#862C14" }}>
                        <FloppyDisk size={12} /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Standings Table */}
        <div className="mb-6">
          <div className="flex justify-content-between align-items-center mb-3">
            <h3 className="m-0 text-xl font-bold" style={{ color: "#1a1a1a" }}>
              Standings
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#862C14" }}>
              Editable
            </span>
          </div>
          <div className="bg-gray-50 border-round-2xl p-3 shadow-1">
            <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                  <th className="py-2 px-1 text-[9px] font-bold text-500 uppercase tracking-wider">#</th>
                  <th className="py-2 px-1 text-[9px] font-bold text-500 uppercase tracking-wider">Team</th>
                  <th className="py-2 px-1 text-[9px] font-bold text-500 uppercase tracking-wider text-center">P</th>
                  <th className="py-2 px-1 text-[9px] font-bold text-500 uppercase tracking-wider text-center">W</th>
                  <th className="py-2 px-1 text-[9px] font-bold text-500 uppercase tracking-wider text-center">L</th>
                </tr>
              </thead>
              <tbody>
                {currentStandings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-500 text-sm">
                      No standings data
                    </td>
                  </tr>
                ) : (
                  currentStandings.map((team: any, idx: number) => (
                    <tr key={team.id} className="transition-colors hover:surface-100" style={{ borderBottom: "1px solid #f0efed", backgroundColor: idx === 0 ? "#FFF7ED" : undefined }}>
                      <td className="py-2 px-1 font-bold text-sm" style={{ color: idx === 0 ? "#862C14" : idx < 3 ? "#555" : "#aaa" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="py-2 px-1">
                        <input type="text" defaultValue={team.name} className="bg-transparent border-none outline-none text-sm font-bold text-900 w-full p-0" style={{ minWidth: "80px" }} />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <input type="number" defaultValue={team.p} className="bg-transparent border-none outline-none text-sm font-medium text-center w-2rem p-0" />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <input type="number" defaultValue={team.w} className="bg-transparent border-none outline-none text-sm font-bold text-center w-2rem p-0" style={{ color: "#16a34a" }} />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <input type="number" defaultValue={team.l} className="bg-transparent border-none outline-none text-sm font-medium text-center w-2rem p-0" style={{ color: "#dc2626" }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bracket Seeding */}
        <div className="mb-6">
          <div className="flex justify-content-between align-items-center mb-3">
            <h3 className="m-0 text-xl font-bold" style={{ color: "#1a1a1a" }}>
              Bracket Seeding
            </h3>
            <button className="bg-transparent border-none p-0 cursor-pointer flex align-items-center gap-1 group" onClick={() => navigate("/bracket", { state: { sport: activeSport } })}>
              <span
                className="text-orange-500 font-bold text-xs uppercase border-bottom-1 border-orange-500 pb-1 group-hover:text-orange-600 group-hover:border-orange-600 transition-all"
                style={{ color: "#862C14", borderColor: "#862C14" }}
              >
                View Full Bracket
              </span>
              <CaretRight size={14} weight="bold" color="#862C14" />
            </button>
          </div>
          <div className="flex flex-column gap-2">
            {currentStandings.length === 0 ? (
              <div className="flex flex-column align-items-center py-4 border-round-2xl border-2 border-dashed" style={{ borderColor: "#e3e2e0" }}>
                <p className="text-500 font-bold text-sm">No teams to seed</p>
              </div>
            ) : (
              currentStandings.map((team: any, idx: number) => (
                <div key={team.id} className="flex align-items-center gap-3 px-4 py-3 border-round-2xl shadow-1" style={{ backgroundColor: "#fff", border: "1px solid #eee" }}>
                  <select defaultValue={idx + 1} className="border-round-lg px-2 py-1 font-bold text-xs outline-none cursor-pointer" style={{ backgroundColor: "#FCD7AB", color: "#862C14", border: "none", minWidth: "70px" }}>
                    {currentStandings.map((_: any, si: number) => (
                      <option key={si} value={si + 1}>
                        Seed #{si + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-bold text-900 flex-1">{team.name}</span>
                  <div className={`w-2rem h-2rem border-circle flex align-items-center justify-content-center text-[9px] font-bold bg-${team.color}-200`}>{team.id}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save All */}
        <div className="flex gap-3 justify-content-end">
          <button className="px-5 py-3 border-round-xl border-none cursor-pointer font-bold text-sm text-white shadow-3 uppercase tracking-widest" style={{ backgroundColor: "#862C14" }}>
            Save All Changes
          </button>
        </div>
      </main>

      {/* New Match Modal */}
      {showNewModal && (
        <div className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center" style={{ zIndex: 1000, backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowNewModal(false)}>
          <div className="bg-white border-round-2xl p-5 w-full shadow-6 mx-3" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-content-between align-items-center mb-4">
              <h3 className="m-0 text-xl font-bold" style={{ color: "#1a1a1a" }}>
                Add New Match
              </h3>
              <button onClick={() => setShowNewModal(false)} className="w-2rem h-2rem border-circle flex align-items-center justify-content-center cursor-pointer border-none" style={{ backgroundColor: "#f3f2f0" }}>
                <X weight="bold" size={14} color="#666" />
              </button>
            </div>
            <div className="flex flex-column gap-3">
              <div>
                <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Sport</label>
                <select className="w-full p-3 border-round-xl outline-none text-sm font-medium" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }}>
                  {sportsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Date</label>
                  <select className="w-full p-3 border-round-xl outline-none text-sm font-medium" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }}>
                    {dates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Time</label>
                  <input type="time" className="w-full p-3 border-round-xl outline-none text-sm" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Stage</label>
                <select className="w-full p-3 border-round-xl outline-none text-sm font-medium" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }}>
                  <option>Group Stage</option>
                  <option>Quarter-Finals</option>
                  <option>Semi-Finals</option>
                  <option>Finals</option>
                  <option>Third Place</option>
                  <option>Performance</option>
                  <option>Qualifiers</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Team 1</label>
                  <input type="text" placeholder="Team name" className="w-full p-3 border-round-xl outline-none text-sm" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }} />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Team 2</label>
                  <input type="text" placeholder="Team name" className="w-full p-3 border-round-xl outline-none text-sm" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-500 uppercase font-bold tracking-widest mb-1">Venue</label>
                <input type="text" placeholder="e.g. B1 indoor basketball court" className="w-full p-3 border-round-xl outline-none text-sm" style={{ border: "1px solid #e3e2e0", backgroundColor: "#FAF9F6" }} />
              </div>
              <button className="mt-1 w-full py-3 border-round-xl border-none text-white font-bold cursor-pointer shadow-3 text-sm uppercase tracking-widest" style={{ backgroundColor: "#862C14" }}>
                Create Match
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes livePulse { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:0.35;transform:scale(1.6); } }
        @keyframes devPulse  { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:0.35;transform:scale(1.7); } }
      `}</style>
    </div>
  );
};

export default DeveloperDashboard;
