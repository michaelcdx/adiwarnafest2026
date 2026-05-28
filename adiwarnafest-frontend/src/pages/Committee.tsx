import React, { useState, useRef, useEffect } from "react";

import committeeData from "../data/committee-data.json";

interface Member {
  name: string;
  role: string;
  photo: string;
  isHead?: boolean;
}

interface Tier {
  label: string;
  subtitle: string;
  color: string;
  members: Member[];
}

interface Category {
  id: string;
  label: string;
  headingPhoto: string;
  tiers?: Tier[];
  members?: Member[];
}

const categories = committeeData as Category[];

const getImageUrl = (path: string) => {
  if (path.startsWith("/comboard_photos/")) {
    return path;
  }
  return path;
};

const MemberCard: React.FC<{ member: Member }> = ({ member }) => (
  <div className="col-6 md:col-4 lg:col-3 p-2">
    <div
      className="cmember-card"
      style={{
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.68)",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
        <img src={getImageUrl(member.photo)} alt={member.name} className="cmember-photo" loading="lazy" style={{ backgroundColor: "#f3f4f6" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {member.isHead && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(209,223,246,0.85)",
              color: "white",
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "9px",
              fontWeight: 800,
              letterSpacing: "0.8px",
              fontFamily: "Epilogue, sans-serif",
              textTransform: "uppercase",
              boxShadow: "0 2px 8px rgba(209,223,246,0.35)",
            }}
          >
            Head
          </div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px", pointerEvents: "none" }}>
          {member.name && (
            <p
              style={{
                color: "white",
                fontWeight: 700,
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.3,
                fontFamily: "Epilogue, sans-serif",
              }}
            >
              {member.name}
            </p>
          )}
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              margin: member.name ? "3px 0 0" : 0,
              fontSize: "11px",
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            {member.role}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Committee: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>("executive");
  const [scrollInfo, setScrollInfo] = useState({ progress: 0, thumbRatio: 1 });
  const stripRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = categories.find((c) => c.id === selectedId)!;
  const memberCount = current.tiers ? current.tiers.reduce((acc, t) => acc + t.members.length, 0) : (current.members?.length ?? 0);

  const updateScrollInfo = () => {
    const el = stripRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    const thumbRatio = maxScroll > 0 ? el.clientWidth / el.scrollWidth : 1;
    setScrollInfo({ progress, thumbRatio });
  };

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    updateScrollInfo();
    el.addEventListener("scroll", updateScrollInfo, { passive: true });
    window.addEventListener("resize", updateScrollInfo, { passive: true });
    return () => {
      el.removeEventListener("scroll", updateScrollInfo);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, []);

  const selectCategory = (id: string, index: number) => {
    setSelectedId(id);
    const strip = stripRef.current;
    const tab = tabRefs.current[index];
    if (strip && tab) {
      const targetLeft = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
      strip.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  };

  const thumbWidthPct = scrollInfo.thumbRatio * 100;
  const thumbLeftPct = scrollInfo.progress * (100 - thumbWidthPct);
  const showIndicator = scrollInfo.thumbRatio < 0.99;

  return (
    <div className="glass-page pb-20">
      {/* Hero header */}
      <div
        style={{
          paddingTop: "40px",
          paddingBottom: "28px",
          textAlign: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <p
          style={{
            fontFamily: "Epilogue, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 10px",
          }}
        >
          Adiwarna Fest 2026
        </p>
        <h1
          style={{
            fontFamily: "Epilogue, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 7vw, 3.2rem)",
            color: "var(--text-primary)",
            margin: "0 0 12px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Our Committee
        </h1>
        <p
          style={{
            fontFamily: "Epilogue, sans-serif",
            fontSize: "clamp(14px, 3.5vw, 18px)",
            fontStyle: "italic",
            fontWeight: 500,
            color: "var(--text-secondary)",
            margin: "0 auto",
            maxWidth: "400px",
            lineHeight: 1.5,
            opacity: 0.85,
          }}
        >
          "Before we build results, we build trust."
        </p>
        <div
          style={{
            width: "40px",
            height: "3px",
            background: "linear-gradient(90deg, rgba(209,223,246,0.7), rgba(209,223,246,0.7))",
            borderRadius: "999px",
            margin: "16px auto 0",
          }}
        />
      </div>

      {/* Category tab strip */}
      <div style={{ paddingLeft: "16px", paddingRight: "16px", marginBottom: "8px" }}>
        <div ref={stripRef} className="committee-tab-strip">
          {categories.map((cat, index) => {
            const active = cat.id === selectedId;
            return (
              <button
                key={cat.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => selectCategory(cat.id, index)}
                style={{
                  flexShrink: 0,
                  width: "110px",
                  height: "76px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: active ? "3px solid rgba(254,178,70,0.85)" : "3px solid rgba(255,255,255,0.5)",
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: active ? "0 4px 18px rgba(161,64,0,0.35)" : "0 2px 8px rgba(0,0,0,0.08)",
                  transform: active ? "scale(1.06)" : "scale(1)",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
              >
                <img src={getImageUrl(cat.headingPhoto)} alt={cat.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "#f3f4f6" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: active ? "linear-gradient(to top, rgba(161,64,0,0.95) 0%, rgba(161,64,0,0.55) 40%, transparent 80%)" : "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.08))",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "8px",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: "9px",
                      fontWeight: 800,
                      fontFamily: "Epilogue, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      lineHeight: 1.2,
                      textAlign: "left",
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll progress indicator */}
        {showIndicator && (
          <div
            style={{
              height: "3px",
              background: "rgba(209,223,246,0.1)",
              borderRadius: "999px",
              marginTop: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: `${thumbWidthPct}%`,
                left: `${thumbLeftPct}%`,
                background: "linear-gradient(90deg, rgba(209,223,246,0.8), rgba(209,223,246,0.8))",
                borderRadius: "999px",
                transition: "left 0.08s linear",
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-3 mt-5">
        {/* Category banner — full 7:5 image, no crop */}
        <div
          style={{
            position: "relative",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <img src={getImageUrl(current.headingPhoto)} alt={current.label} loading="lazy" style={{ width: "100%", height: "auto", maxHeight: "450px", objectFit: "cover", display: "block", backgroundColor: "#f3f4f6" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(110deg, rgba(12,8,28,0.82) 0%, rgba(12,8,28,0.4) 45%, transparent 100%)",
              display: "flex",
              alignItems: "center",
              padding: "clamp(20px, 5%, 44px)",
            }}
          >
            <div>
              <h2
                style={{
                  color: "white",
                  fontFamily: "Epilogue, sans-serif",
                  fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                  fontWeight: 900,
                  margin: 0,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                }}
              >
                {current.label}
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  margin: "8px 0 0",
                  fontSize: "13px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Executive — tiered layout */}
        {current.tiers ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {current.tiers.map((tier, ti) => (
              <div key={ti}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
                  <span
                    style={{
                      padding: "5px 18px",
                      borderRadius: "999px",
                      background: "linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(161,64,0,0.4)",
                      color: "#3a1800",
                      fontWeight: 800,
                      fontSize: "10px",
                      fontFamily: "Epilogue, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      whiteSpace: "nowrap",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 12px rgba(161,64,0,0.22)",
                    }}
                  >
                    {tier.label}
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(209,223,246,0.12)" }} />
                </div>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                    margin: "0 0 16px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {tier.subtitle}
                </p>
                <div className="grid m-0">
                  {tier.members.map((member, mi) => (
                    <MemberCard key={mi} member={member} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid m-0">
            {current.members!.map((member, mi) => (
              <MemberCard key={mi} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Committee;
