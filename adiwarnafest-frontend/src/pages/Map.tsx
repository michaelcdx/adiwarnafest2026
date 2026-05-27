import React, { useState, useEffect, useMemo } from "react";
import { MagnifyingGlass, X, Info, MapPin, Storefront } from "@phosphor-icons/react";
import { Scroll } from "@phosphor-icons/react/dist/csr/Scroll";
import { Image } from "@phosphor-icons/react/dist/csr/Image";
import { Tag } from "@phosphor-icons/react/dist/csr/Tag";
import { vendorsData } from "../data/vendorMockData";
import type { Vendor } from "../data/vendorMockData";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg: "#FAF9F6",
  primary: "#A14000",
  accent: "#FEB246",
  muted: "#705A49",
  card: "#FFFFFF",
} as const;

const FIRST_FLOOR_MAP = new URL("../image/1st_Floor_withoutBooth.jpg", import.meta.url).href;
const GROUND_FLOOR_MAP = new URL("../image/GroundFloor_withoutBooth.jpg", import.meta.url).href;
const GADPA_LOGO = new URL("../image/gadpa_xmum_logo.png", import.meta.url).href;
const ANYTIME_FITNESS_LOGO = "/Anytime_fitness_logo.jpeg";

const formatBadge = (id: string): string => (id.startsWith("B") ? `#${id.slice(1).padStart(2, "0")}` : id);

// ── Map marker positions ──────────────────────────────────────────────────────
// Coordinates are percentages of the rendered map image's dimensions,
// calibrated to land directly on top of the printed booth numbers
// in `1F Map.png` / `GF Map.png`. Tweak per booth if alignment drifts.

interface MarkerPos {
  x: number;
  y: number;
  w?: number; // width as % of container (defaults to standard booth size)
  h?: number; // height as % of container
}

const MAP_POSITIONS: Record<string, MarkerPos> = {
  // ── 1st Floor — bottom row (Booths 1–10, left → right) ────────
  B1: { x: 31, y: 58 },
  B2: { x: 34, y: 58 },
  B3: { x: 39, y: 58 },
  B4: { x: 42, y: 58 },
  B5: { x: 47, y: 58 },
  B6: { x: 50, y: 58 },
  B7: { x: 55, y: 58 },
  B8: { x: 58, y: 58 },
  B9: { x: 63, y: 58 },
  B10: { x: 66, y: 58 },
  // ── 1st Floor — top row (Booths 11–20, right → left) ──────────
  B20: { x: 31, y: 42 },
  B19: { x: 34, y: 42 },
  B18: { x: 39, y: 42 },
  B17: { x: 42, y: 42 },
  B16: { x: 47, y: 42 },
  B15: { x: 49, y: 42, w: 6.0 },
  B14: { x: 55, y: 42 },
  B13: { x: 58, y: 42 },
  B12: { x: 63, y: 42 },
  B11: { x: 66, y: 42 },
  // ── 1st Floor — GADPA + MIC (red/pink box, right of booth 11) ─
  GADPA: { x: 72, y: 50, w: 4.0, h: 12.0 },
  // ── Ground Floor — upper row (Booths 23–28, in pairs) ─────────
  B23: { x: 52, y: 36 },
  B24: { x: 55, y: 36 },
  B25: { x: 60, y: 36 },
  B26: { x: 63, y: 36 },
  B27: { x: 68, y: 36 },
  B28: { x: 71, y: 36 },
  // ── Ground Floor — middle row (Booths 29–31) ──────────────────
  B29: { x: 54, y: 45 },
  B30: { x: 62, y: 45, w: 8.0, h: 4.0 },
  B31: { x: 69, y: 45 },
  // ── Ground Floor — booth 22 (vertical, left of large rect) ────
  B22: { x: 52, y: 53 },
  // ── Ground Floor — bottom row (Booths 21, 32) ─────────────────
  B21: { x: 55, y: 58 },
  B32: { x: 64, y: 58 },
};

// ── Interactive Floor Map ─────────────────────────────────────────────────────

interface InteractiveMapProps {
  floor: "1st" | "Ground";
  vendors: Vendor[];
  onMarkerClick: (v: Vendor) => void;
  fading: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ floor, vendors, onMarkerClick, fading }) => {
  const [zoom, setZoom] = useState(1);
  const zoomRef = React.useRef(zoom);
  const lastDistanceRef = React.useRef(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Keep ref in sync so the non-React touch handler can read latest zoom
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Register passive:false touchmove so preventDefault actually works for pinch
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0]!.clientX - touches[1]!.clientX;
      const dy = touches[0]!.clientY - touches[1]!.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) lastDistanceRef.current = getDistance(e.touches);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dist = getDistance(e.touches);
      if (lastDistanceRef.current > 0) {
        const ratio = dist / lastDistanceRef.current;
        if (ratio > 1.01 || ratio < 0.99) {
          setZoom((prev) => Math.max(1, Math.min(prev * ratio, 4)));
          lastDistanceRef.current = dist;
        }
      } else {
        lastDistanceRef.current = dist;
      }
    };

    const onTouchEnd = () => { lastDistanceRef.current = 0; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      style={{
        background: P.card,
        borderRadius: "16px",
        border: `1px solid rgba(161,64,0,0.09)`,
        boxShadow: "0 4px 20px rgba(161,64,0,0.06)",
        overflow: "hidden",
        marginBottom: "20px",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid rgba(161,64,0,0.07)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: P.muted, opacity: 0.7 }}>{floor === "1st" ? "1st Floor" : "Ground Floor"} Map</p>
        <p style={{ margin: 0, fontSize: "11px", color: P.muted, opacity: 0.6, fontStyle: "italic" }}>Tap booth • Pinch to zoom</p>
      </div>

      {/* Scrollable viewport — expands when zoomed so you can pan */}
      <div
        ref={scrollRef}
        style={{
          overflow: zoom > 1 ? "auto" : "hidden",
          background: "#faf7f5",
          lineHeight: 0,
          touchAction: zoom > 1 ? "pan-x pan-y" : "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {/* Inner map — grows with zoom; buttons stay % positioned so they scale too */}
        <div
          style={{
            position: "relative",
            width: `${zoom * 100}%`,
            aspectRatio: floor === "1st" ? "2366/1251" : "2377/1811",
            lineHeight: 0,
          }}
        >
          {zoom > 1 && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                zIndex: 100,
                pointerEvents: "none",
              }}
            >
              {(zoom * 100).toFixed(0)}%
            </div>
          )}

          <img
            src={floor === "1st" ? FIRST_FLOOR_MAP : GROUND_FLOOR_MAP}
            alt={`${floor === "1st" ? "1st" : "Ground"} Floor venue map`}
            style={{ width: "100%", height: "100%", display: "block", userSelect: "none", objectFit: "cover" }}
            draggable={false}
          />

          {vendors.map((vendor) => {
            const pos = MAP_POSITIONS[vendor.id];
            if (!pos) return null;
            const width = pos.w ?? 3.0;
            const height = pos.h ?? 5.0;
            const label = vendor.id_display ?? (vendor.isSpecial ? vendor.id : vendor.id.replace("B", ""));

            return (
              <div key={vendor.id}>
                <button
                  className={`booth-overlay ${vendor.isSpecial ? "booth-special" : ""} ${vendor.id === "GADPA" ? "booth-gadpa" : ""} ${vendor.id === "B30" ? "booth-anytime" : ""}`}
                  onClick={() => onMarkerClick(vendor)}
                  aria-label={`View ${vendor.name} (Booth ${vendor.id_display ?? formatBadge(vendor.id)})`}
                  title={`${formatBadge(vendor.id)} — ${vendor.name}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                  }}
                >
                  <span className="booth-label">{label}</span>
                </button>
                {vendor.id === "GADPA" && (
                  <img
                    src={GADPA_LOGO}
                    alt="GADPA Logo"
                    style={{
                      position: "absolute",
                      left: `${pos.x + 2.5}%`,
                      top: `${pos.y}%`,
                      width: "2.5%",
                      height: "auto",
                      maxHeight: "15%",
                    }}
                  />
                )}
                {vendor.id === "B30" && (
                  <img
                    src={ANYTIME_FITNESS_LOGO}
                    alt="Anytime Fitness Logo"
                    style={{
                      position: "absolute",
                      left: `${pos.x - 1}%`,
                      top: `${pos.y + 2.5}%`,
                      width: "3.0%",
                      height: "auto",
                      maxHeight: "12%",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Info Modal ────────────────────────────────────────────────────────────────

interface InfoModalProps {
  vendor: Vendor;
  onClose: () => void;
  onViewImage: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ vendor, onClose, onViewImage }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "flyer">("overview");
  const hasImage = !!vendor.localImage;
  const menuCount = vendor.menu?.length ?? 0;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,10,5,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "adiFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: P.card,
          borderRadius: "24px",
          maxWidth: "520px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(161, 64, 0, 0.08)",
          animation: "adiSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Banner Header — 200px for more visual impact */}
        <div style={{ position: "relative", height: "200px", width: "100%", flexShrink: 0, overflow: "hidden" }}>
          {hasImage ? (
            <>
              <img src={vendor.localImage} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.78) 100%)" }} />
            </>
          ) : (
            <>
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${P.primary} 0%, #d66a22 50%, ${P.accent} 100%)` }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.07,
                  pointerEvents: "none",
                  backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.4)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={18} weight="bold" color="#fff" />
          </button>

          {/* Heading overlay */}
          <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "60px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: vendor.isSpecial ? "#D4AF37" : P.accent,
                  color: vendor.isSpecial ? "#0A0A0B" : "#3a1800",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {vendor.isSpecial
                  ? (vendor.id_display ?? vendor.id)
                  : vendor.id_display
                    ? vendor.id_display
                        .split(" & ")
                        .map((n) => `#${n.padStart(2, "0")}`)
                        .join(" & ")
                    : formatBadge(vendor.id)}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "#fff",
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "3px 9px",
                  borderRadius: "999px",
                }}
              >
                {vendor.floor === "1st" ? "First Floor" : "Ground Floor"}
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 900,
                fontFamily: "Epilogue, sans-serif",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                lineHeight: 1.2,
              }}
            >
              {vendor.name}
            </h3>
          </div>
        </div>

        {/* Tab Navbar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(161,64,0,0.08)",
            background: "rgba(161,64,0,0.02)",
            padding: "0 12px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              flex: 1,
              padding: "13px 8px",
              background: "none",
              border: "none",
              borderBottom: `3px solid ${activeTab === "overview" ? P.primary : "transparent"}`,
              color: activeTab === "overview" ? P.primary : P.muted,
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              transition: "all 0.2s ease",
            }}
          >
            <Info size={16} weight={activeTab === "overview" ? "fill" : "regular"} />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            style={{
              flex: 1,
              padding: "13px 8px",
              background: "none",
              border: "none",
              borderBottom: `3px solid ${activeTab === "menu" ? P.primary : "transparent"}`,
              color: activeTab === "menu" ? P.primary : P.muted,
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              transition: "all 0.2s ease",
            }}
          >
            <Scroll size={16} weight={activeTab === "menu" ? "fill" : "regular"} />
            Menu Guide
            {menuCount > 0 && (
              <span
                style={{
                  background: activeTab === "menu" ? P.primary : "rgba(112,90,73,0.12)",
                  color: activeTab === "menu" ? "#fff" : P.muted,
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "999px",
                  lineHeight: 1.6,
                  transition: "all 0.2s ease",
                }}
              >
                {menuCount}
              </span>
            )}
          </button>

          {hasImage && (
            <button
              onClick={() => setActiveTab("flyer")}
              style={{
                flex: 1,
                padding: "13px 8px",
                background: "none",
                border: "none",
                borderBottom: `3px solid ${activeTab === "flyer" ? P.primary : "transparent"}`,
                color: activeTab === "flyer" ? P.primary : P.muted,
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                transition: "all 0.2s ease",
              }}
            >
              <Image size={16} weight={activeTab === "flyer" ? "fill" : "regular"} />
              Menu Flyer
            </button>
          )}
        </div>

        {/* Scrollable Tab Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, minHeight: "200px" }}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div style={{ animation: "adiFadeIn 0.2s ease-out" }}>
              {/* Quick-info strip */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(161,64,0,0.06)",
                    border: "1px solid rgba(161,64,0,0.1)",
                    color: P.primary,
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "5px 11px",
                    borderRadius: "999px",
                  }}
                >
                  <MapPin size={12} weight="fill" />
                  {vendor.floor === "1st" ? "1st Floor" : "Ground Floor"}
                </span>
                {menuCount > 0 && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(161,64,0,0.06)",
                      border: "1px solid rgba(161,64,0,0.1)",
                      color: P.primary,
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "5px 11px",
                      borderRadius: "999px",
                    }}
                  >
                    <Storefront size={12} weight="fill" />
                    {menuCount} item{menuCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <p style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: 1.7, color: P.muted, textAlign: "justify" }}>{vendor.description}</p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "rgba(161,64,0,0.04)",
                  border: "1px solid rgba(161,64,0,0.08)",
                  marginBottom: "20px",
                }}
              >
                <MapPin size={18} weight="fill" color={P.primary} />
                <div>
                  <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: P.muted, textTransform: "uppercase" }}>Location</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: P.primary }}>
                    {vendor.floor === "1st" ? "1st Floor (Upstairs)" : "Ground Floor"} — Booth{" "}
                    {vendor.isSpecial
                      ? (vendor.id_display ?? vendor.id)
                      : vendor.id_display
                        ? vendor.id_display
                            .split(" & ")
                            .map((n) => `#${n.padStart(2, "0")}`)
                            .join(" & ")
                        : formatBadge(vendor.id)}
                  </p>
                </div>
              </div>

              {vendor.tags && vendor.tags.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <Tag size={14} weight="bold" color={P.muted} />
                    <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: P.muted }}>Featured Tags</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {vendor.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(161,64,0,0.06)",
                          color: P.primary,
                          fontSize: "11.5px",
                          fontWeight: 700,
                          padding: "5px 12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(161,64,0,0.08)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div style={{ animation: "adiFadeIn 0.2s ease-out" }}>
              {/* Header row with item count + price range */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Storefront size={16} weight="fill" color={P.primary} />
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: P.muted }}>Menu Guide</p>
                </div>
              </div>

              {vendor.menu && vendor.menu.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {vendor.menu.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 16px",
                        background: "#fff",
                        borderRadius: "14px",
                        border: "1px solid rgba(161,64,0,0.06)",
                        borderLeft: `4px solid ${P.primary}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                        gap: "12px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(161,64,0,0.09)";
                        e.currentTarget.style.background = "#faf9f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(161,64,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Storefront size={20} weight="regular" color={P.muted} />
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: P.primary }}>No Menu Available</p>
                  <p style={{ margin: 0, fontSize: "12px", color: P.muted, opacity: 0.7 }}>Visit the booth for details.</p>
                </div>
              )}
            </div>
          )}

          {/* Flyer Tab */}
          {activeTab === "flyer" && hasImage && (
            <div style={{ animation: "adiFadeIn 0.2s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(161,64,0,0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                  background: "#fff",
                  lineHeight: 0,
                  marginBottom: "16px",
                }}
              >
                <img src={vendor.localImage} alt={`${vendor.name} menu flyer`} style={{ width: "100%", maxHeight: "350px", objectFit: "contain", display: "block" }} />
              </div>
              <button
                onClick={onViewImage}
                style={{
                  padding: "10px 20px",
                  background: P.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.15s, transform 0.15s",
                  boxShadow: "0 4px 12px rgba(161,64,0,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#8a3500";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = P.primary;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <MagnifyingGlass size={16} weight="bold" />
                View Fullscreen Flyer
              </button>
            </div>
          )}
        </div>

        {/* Sticky flyer CTA — pinned at modal bottom when not on flyer tab */}
        {hasImage && activeTab !== "flyer" && (
          <div
            style={{
              borderTop: "1px solid rgba(161,64,0,0.08)",
              padding: "11px 20px",
              background: "rgba(161,64,0,0.02)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <p style={{ margin: 0, fontSize: "11px", color: P.muted, opacity: 0.65 }}>Menu flyer available for this booth</p>
            <button
              onClick={() => setActiveTab("flyer")}
              style={{
                background: "none",
                border: `1px solid rgba(161,64,0,0.22)`,
                borderRadius: "10px",
                padding: "7px 14px",
                color: P.primary,
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(161,64,0,0.06)";
                e.currentTarget.style.borderColor = P.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.borderColor = "rgba(161,64,0,0.22)";
              }}
            >
              <Image size={13} weight="bold" />
              View Flyer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Image Modal ───────────────────────────────────────────────────────────────

interface ImageModalProps {
  vendor: Vendor;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ vendor, onClose }) => (
  <div
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(20,10,5,0.65)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "adiFadeIn 0.12s ease",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: P.card,
        borderRadius: "20px",
        maxWidth: "560px",
        width: "100%",
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
        animation: "adiSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid rgba(161,64,0,0.07)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: P.primary, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", marginBottom: "2px" }}>
            {vendor.id_display
              ? vendor.id_display.split(" & ").map((n) => (
                  <span key={n} style={{ background: "rgba(161,64,0,0.08)", borderRadius: "4px", padding: "1px 5px" }}>{`#${n.padStart(2, "0")}`}</span>
                ))
              : formatBadge(vendor.id)}
            {" "}· {vendor.floor === "1st" ? "1st Floor" : "Ground Floor"}
          </span>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827", fontFamily: "Epilogue, sans-serif", letterSpacing: "-0.02em" }}>{vendor.name}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close image"
          style={{
            background: "rgba(161,64,0,0.07)",
            border: "none",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(161,64,0,0.14)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(161,64,0,0.07)")}
        >
          <X size={16} weight="bold" color={P.primary} />
        </button>
      </div>
      <div style={{ background: "#faf7f5" }}>
        <img src={vendor.localImage} alt={`${vendor.name} menu`} style={{ width: "100%", display: "block", maxHeight: "440px", objectFit: "contain" }} />
      </div>
      <div style={{ padding: "10px 20px 14px" }}>
        <p style={{ margin: 0, fontSize: "11px", color: P.muted, opacity: 0.6, fontStyle: "italic" }}>
          Press <kbd style={{ background: "rgba(161,64,0,0.07)", border: `1px solid rgba(161,64,0,0.15)`, borderRadius: "4px", padding: "1px 5px", fontSize: "11px", fontStyle: "normal", fontFamily: "monospace" }}>Esc</kbd> or click outside
          to close
        </p>
      </div>
    </div>
  </div>
);

// ── GADPA Featured Card ───────────────────────────────────────────────────────

interface GADPACardProps {
  vendor: Vendor;
  onViewInfo: () => void;
}

const GADPACard: React.FC<GADPACardProps> = ({ vendor, onViewInfo }) => (
  <div
    style={{
      background: "linear-gradient(135deg, #3a1800 0%, #6b2e00 50%, #8a4a00 100%)",
      borderRadius: "18px",
      padding: "20px 24px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
      boxShadow: "0 8px 32px rgba(161,64,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
      border: `1px solid rgba(254,178,70,0.2)`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "radial-gradient(ellipse at 80% 50%, rgba(254,178,70,0.12) 0%, transparent 65%)",
      }}
    />

    <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
        <span
          style={{
            background: "rgba(254,178,70,0.2)",
            border: "1px solid rgba(254,178,70,0.4)",
            color: P.accent,
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: "6px",
          }}
        >
          Official Booth
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
          }}
        >
          1st Floor · Featured
        </span>
      </div>
      <h2
        style={{
          margin: "0 0 6px",
          fontSize: "20px",
          fontWeight: 900,
          color: "#ffffff",
          fontFamily: "Epilogue, sans-serif",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {vendor.name}
      </h2>
      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{vendor.description}</p>
      {vendor.tags && vendor.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px" }}>
          {vendor.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(254,178,70,0.18)",
                color: P.accent,
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(254,178,70,0.25)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>

    <button
      onClick={onViewInfo}
      style={{
        background: P.accent,
        color: "#3a1800",
        border: "none",
        borderRadius: "12px",
        padding: "10px 20px",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "all 0.15s",
        boxShadow: "0 2px 8px rgba(254,178,70,0.3)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffc45e";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = P.accent;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      View Details
    </button>
  </div>
);

// ── Booth Card ────────────────────────────────────────────────────────────────

interface BoothCardProps {
  vendor: Vendor;
  onViewInfo: () => void;
}

const BoothCard: React.FC<BoothCardProps> = ({ vendor, onViewInfo }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onViewInfo}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: P.card,
        borderRadius: "16px",
        border: `1px solid rgba(161,64,0,${hovered ? "0.13" : "0.07"})`,
        boxShadow: hovered ? "0 12px 36px rgba(161,64,0,0.13), 0 4px 12px rgba(0,0,0,0.06)" : "0 2px 10px rgba(0,0,0,0.045)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "8px" }}>
        <span
          style={{
            background: P.primary,
            color: "#fff",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.05em",
            padding: "5px 12px",
            borderRadius: "8px",
            flexShrink: 0,
          }}
        >
          {vendor.id_display ? (
            <span style={{ display: "flex", gap: "4px" }}>
              {vendor.id_display.split(" & ").map((n) => (
                <span key={n}>{`#${n.padStart(2, "0")}`}</span>
              ))}
            </span>
          ) : formatBadge(vendor.id)}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: P.muted,
            fontWeight: 600,
            background: "rgba(112,90,73,0.07)",
            padding: "4px 10px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          {vendor.floor === "1st" ? "1st Floor" : "Ground Floor"}
        </span>
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "16px",
          fontWeight: 800,
          color: P.primary,
          lineHeight: 1.3,
          fontFamily: "Epilogue, sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {vendor.name}
      </h3>

      <p
        style={{
          margin: 0,
          marginBottom: "16px",
          fontSize: "13px",
          lineHeight: 1.65,
          color: P.muted,
          flexGrow: 1,
        }}
      >
        {vendor.description}
      </p>

      {vendor.tags && vendor.tags.length > 0 && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: P.muted, opacity: 0.55 }}>What They Sell</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {vendor.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(161,64,0,0.07)",
                  color: P.primary,
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 11px",
                  borderRadius: "999px",
                  letterSpacing: "0.01em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Map (Booth Directory) Page ────────────────────────────────────────────────

const Map: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<"1st" | "Ground">("1st");
  const [searchQuery, setSearchQuery] = useState("");
  const [infoVendor, setInfoVendor] = useState<Vendor | null>(null);
  const [imageVendor, setImageVendor] = useState<Vendor | null>(null);
  const [fading, setFading] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  // ── ESC closes topmost modal ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (imageVendor) {
        setImageVendor(null);
        return;
      }
      if (infoVendor) {
        setInfoVendor(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageVendor, infoVendor]);

  const gadpa = useMemo(() => vendorsData.find((v) => v.id === "GADPA")!, []);
  const specialBooths = useMemo(() => vendorsData.filter((v) => v.isSpecial), []);

  // ── Filtering ────────────────────────────────────────────────────────────
  const regularVendors = useMemo(() => vendorsData.filter((v) => !v.isSpecial), []);

  const floorVendors = useMemo(() => {
    const seen = new Set<string>();
    return regularVendors.filter((v) => {
      if (v.floor !== activeFloor) return false;
      const key = v.name + v.floor;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [regularVendors, activeFloor]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    const seen = new Set<string>();
    return regularVendors.filter((v) => {
      const num = v.id.replace("B", "");
      const matches = v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || num.includes(q) || formatBadge(v.id).toLowerCase().includes(q) || (v.tags ?? []).some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
      const key = v.name + v.floor;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [isSearching, searchQuery, regularVendors]);

  const displayVendors = isSearching ? searchResults : floorVendors;

  // ── Special booths appear on their actual floor ──────────────────────────
  const mapMarkers = useMemo(() => {
    const list: Vendor[] = [...floorVendors];
    specialBooths.forEach((booth) => {
      if (booth.floor === activeFloor) list.push(booth);
    });
    return list;
  }, [floorVendors, specialBooths, activeFloor]);

  // ── Smooth floor switch with opacity fade ────────────────────────────────
  const switchFloor = (next: "1st" | "Ground") => {
    if (next === activeFloor) return;
    setFading(true);
    window.setTimeout(() => {
      setActiveFloor(next);
      setFading(false);
    }, 300);
  };

  return (
    <>
      <style>{`
        @keyframes adiFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adiSlideUp {
          from { transform: translateY(18px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }

        /* ── Booth marker overlay — visible orange box with white text ── */
        .booth-overlay {
          position: absolute;
          transform: translate(-50%, -50%);
          background: #A14000;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          border-radius: 3px;
          cursor: pointer;
          padding: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease,
                      box-shadow 0.2s ease, transform 0.2s ease;
          box-shadow: 0 2px 8px rgba(161, 64, 0, 0.3);
        }
        .booth-overlay:hover {
          background: #C85A1E;
          border-color: #fff;
          box-shadow: 0 0 0 2px rgba(254, 178, 70, 0.4),
                      0 4px 12px rgba(161, 64, 0, 0.4);
          transform: translate(-50%, -50%) scale(1.15);
          z-index: 8;
        }
        .booth-overlay:active {
          transform: translate(-50%, -50%) scale(0.95);
        }
        .booth-overlay:focus-visible {
          background: #C85A1E;
          border-color: #FEB246;
          outline: 2px solid #FEB246;
          outline-offset: 1px;
          z-index: 9;
        }

        /* ── Special booth styling (GADPA, Anytime Fitness) ──────────────────── */
        .booth-overlay.booth-special {
          background: #D4AF37;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
        }
        .booth-overlay.booth-special:hover {
          background: #E6C542;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5),
                      0 4px 12px rgba(212, 175, 55, 0.5);
        }
        .booth-overlay.booth-special:focus-visible {
          background: #E6C542;
          border-color: #F0D860;
          outline: 2px solid #F0D860;
        }

        .booth-label {
          color: #fff;
          font-weight: 800;
          font-size: clamp(7px, 1vw, 11px);
          line-height: 1.2;
          letter-spacing: 0.02em;
          white-space: normal;
          word-wrap: break-word;
          pointer-events: none;
          user-select: none;
          padding: 2px 4px;
        }

        .booth-gadpa .booth-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: normal;
          font-size: 10px;
        }

        /* ── Floor tab scale + glow ───────────────────────────────────── */
        .floor-tab {
          padding: 8px 22px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #705A49;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: background 0.25s ease, color 0.25s ease,
                      transform 0.25s ease, box-shadow 0.25s ease;
        }
        .floor-tab:hover:not(.active) {
          background: rgba(254, 178, 70, 0.15);
          color: #A14000;
          transform: scale(1.05);
        }
        .floor-tab.active {
          background: #A14000;
          color: #fff;
          transform: scale(1.04);
          box-shadow: 0 4px 18px rgba(161, 64, 0, 0.32),
                      0 0 0 4px rgba(254, 178, 70, 0.16);
        }
        .floor-tab.active:hover {
          background: #8a3500;
        }
        .floor-tab:focus-visible {
          outline: 3px solid #FEB246;
          outline-offset: 3px;
        }

        /* ── Cards grid ───────────────────────────────────────────────── */
        .booth-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 899px) { .booth-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 599px) { .booth-grid { grid-template-columns: 1fr; } }

        .search-input::placeholder { color: rgba(112,90,73,0.5); }

        /* ── GADPA & Anytime Fitness mobile fix ────────────────────────── */
        .booth-gadpa .booth-label,
        .booth-anytime .booth-label {
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .booth-gadpa .booth-label {
            font-size: 6px;
            line-height: 1;
          }
          .booth-anytime .booth-label {
            font-size: 7px;
            line-height: 1.1;
          }
        }
        @media (max-width: 480px) {
          .booth-gadpa .booth-label {
            font-size: 4px;
          }
          .booth-anytime .booth-label {
            font-size: 4px;
          }
        }
      `}</style>

      {/* Modals */}
      {infoVendor && (
        <InfoModal
          vendor={infoVendor}
          onClose={() => setInfoVendor(null)}
          onViewImage={() => {
            if (infoVendor?.localImage) {
              setImageVendor(infoVendor);
              setInfoVendor(null);
            }
          }}
        />
      )}
      {imageVendor && <ImageModal vendor={imageVendor} onClose={() => setImageVendor(null)} />}

      <div className="mythic-pattern min-h-screen font-jakarta" style={{ backgroundColor: P.bg, paddingBottom: "96px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 16px 0" }}>
          {/* ── Page title ──────────────────────────────────────────── */}
          <div style={{ marginBottom: "20px" }}>
            <h1
              className="font-epilogue"
              style={{
                margin: "0 0 4px",
                fontSize: "clamp(26px, 5vw, 34px)",
                fontWeight: 900,
                color: P.primary,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Discover Excellence
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: P.muted }}>
              {isSearching ? (
                <>
                  Showing <strong style={{ color: P.primary }}>{searchResults.length}</strong> result{searchResults.length !== 1 ? "s" : ""} across all floors
                </>
              ) : (
                <>
                  Browsing <strong style={{ color: P.primary }}>{floorVendors.length}</strong> vendors on the <strong style={{ color: P.primary }}>{activeFloor === "1st" ? "1st" : "Ground"} Floor</strong>
                </>
              )}
            </p>
          </div>

          {/* ── GADPA — always pinned at top ─────────────────────────── */}
          <GADPACard vendor={gadpa} onViewInfo={() => setInfoVendor(gadpa)} />

          {/* ── Floor tabs — always visible (even during search) ─────── */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "16px",
              background: "rgba(112,90,73,0.07)",
              borderRadius: "999px",
              padding: "4px",
              width: "fit-content",
            }}
          >
            {(["1st", "Ground"] as const).map((floor) => (
              <button key={floor} className={`floor-tab ${activeFloor === floor ? "active" : ""}`} onClick={() => switchFloor(floor)}>
                {floor === "1st" ? "First Floor" : "Ground Floor"}
              </button>
            ))}
          </div>

          {/* ── Interactive map — always visible ──────────────────────── */}
          <InteractiveMap floor={activeFloor} vendors={mapMarkers} onMarkerClick={(v) => setInfoVendor(v)} fading={fading} />

          {/* ── Search bar ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              borderRadius: "999px",
              padding: "11px 18px",
              boxShadow: "0 2px 16px rgba(161,64,0,0.07)",
              border: `1px solid rgba(161,64,0,${isSearching ? "0.2" : "0.1"})`,
              marginBottom: "20px",
              transition: "border-color 0.15s",
            }}
          >
            <MagnifyingGlass size={16} weight="bold" style={{ color: P.muted, flexShrink: 0, opacity: 0.7 }} />
            <input
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all booths — names, items, or descriptions…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                flex: 1,
                color: "#1f2937",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{
                  background: "rgba(161,64,0,0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <X size={12} weight="bold" color={P.primary} />
              </button>
            )}
          </div>

          {/* ── Search active banner ─────────────────────────────────── */}
          {isSearching && (
            <div
              style={{
                background: `rgba(254,178,70,0.12)`,
                border: `1px solid rgba(254,178,70,0.3)`,
                borderRadius: "12px",
                padding: "10px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                animation: "adiFadeIn 0.15s ease",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#8a5a00", fontWeight: 600 }}>Universal search — cards below are filtered across both floors; the map stays anchored above.</p>
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  color: "#8a5a00",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* ── Cards grid (filters; map above stays put) ───────────── */}
          <div
            style={{
              opacity: fading && !isSearching ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            {displayVendors.length > 0 ? (
              <div className="booth-grid">
                {displayVendors.map((vendor) => (
                  <BoothCard key={vendor.id} vendor={vendor} onViewInfo={() => setInfoVendor(vendor)} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "rgba(161,64,0,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <MagnifyingGlass size={22} weight="bold" color={P.primary} />
                </div>
                <p style={{ fontSize: "15px", color: P.primary, fontWeight: 700, margin: "0 0 5px", fontFamily: "Epilogue, sans-serif" }}>No results found</p>
                <p style={{ fontSize: "13px", color: P.muted, opacity: 0.7, margin: 0 }}>Try a different search term or clear the query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Map;
