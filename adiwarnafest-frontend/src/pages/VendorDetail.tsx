import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, X } from "@phosphor-icons/react";
import { vendorsData } from "../data/vendorMockData";

const P = {
  bg: '#FAF9F6',
  primary: '#A14000',
  accent: '#FEB246',
  muted: '#705A49',
  card: '#FFFFFF',
} as const;

const formatBadge = (id: string): string =>
  id.startsWith('B') ? `#${id.slice(1).padStart(2, '0')}` : id;

const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);

  const vendor = vendorsData.find(v => v.id === id);

  if (!vendor) {
    return (
      <div className="mythic-pattern min-h-screen font-jakarta" style={{ backgroundColor: P.bg, paddingBottom: '96px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: P.primary, fontWeight: 700 }}>Vendor not found.</p>
          <button
            onClick={() => navigate('/map')}
            style={{ marginTop: '16px', background: P.primary, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' }}
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  const hasImage = !!vendor.localImage;
  const badge = vendor.isSpecial ? (vendor.id_display ?? vendor.id) : formatBadge(vendor.id);

  return (
    <>
      <style>{`
        @keyframes adiFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adiSlideUp {
          from { transform: translateY(18px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        .vd-back-btn:hover { background: rgba(161,64,0,0.13) !important; }
        .vd-menu-row:nth-child(odd) { background: rgba(161,64,0,0.03); }
      `}</style>

      {/* Image lightbox */}
      {imageOpen && hasImage && (
        <div
          onClick={() => setImageOpen(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(20,10,5,0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            animation: 'adiFadeIn 0.12s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: P.card, borderRadius: '20px', maxWidth: '560px', width: '100%',
              overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
              animation: 'adiSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid rgba(161,64,0,0.07)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: P.primary, display: 'block', marginBottom: '2px' }}>
                  {badge} · {vendor.floor === '1st' ? '1st Floor' : 'Ground Floor'}
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827', fontFamily: 'Epilogue, sans-serif', letterSpacing: '-0.02em' }}>
                  {vendor.name}
                </h3>
              </div>
              <button
                onClick={() => setImageOpen(false)}
                aria-label="Close image"
                style={{ background: 'rgba(161,64,0,0.07)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={16} weight="bold" color={P.primary} />
              </button>
            </div>
            <div style={{ background: '#faf7f5' }}>
              <img src={vendor.localImage} alt={`${vendor.name} menu`} style={{ width: '100%', display: 'block', maxHeight: '440px', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '10px 20px 14px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: P.muted, opacity: 0.6, fontStyle: 'italic' }}>
                Press <kbd style={{ background: 'rgba(161,64,0,0.07)', border: `1px solid rgba(161,64,0,0.15)`, borderRadius: '4px', padding: '1px 5px', fontSize: '11px', fontStyle: 'normal', fontFamily: 'monospace' }}>Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mythic-pattern min-h-screen font-jakarta" style={{ backgroundColor: P.bg, paddingBottom: '96px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 16px 0', animation: 'adiSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* Back button */}
          <button
            className="vd-back-btn"
            onClick={() => navigate('/map')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(161,64,0,0.07)', border: 'none',
              borderRadius: '10px', padding: '9px 16px',
              color: P.primary, fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              marginBottom: '24px', transition: 'background 0.15s',
            }}
          >
            <ArrowLeft size={15} weight="bold" />
            Back to Map
          </button>

          {/* Header card */}
          <div style={{
            background: vendor.isSpecial
              ? 'linear-gradient(135deg, #3a1800 0%, #6b2e00 50%, #8a4a00 100%)'
              : P.card,
            borderRadius: '20px',
            border: vendor.isSpecial ? `1px solid rgba(254,178,70,0.2)` : `1px solid rgba(161,64,0,0.09)`,
            boxShadow: vendor.isSpecial
              ? '0 8px 32px rgba(161,64,0,0.22)'
              : '0 4px 20px rgba(161,64,0,0.06)',
            padding: '28px 28px 24px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {vendor.isSpecial && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 80% 50%, rgba(254,178,70,0.12) 0%, transparent 65%)' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{
                background: vendor.isSpecial ? 'rgba(254,178,70,0.2)' : P.primary,
                border: vendor.isSpecial ? '1px solid rgba(254,178,70,0.4)' : 'none',
                color: vendor.isSpecial ? P.accent : '#fff',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em',
                padding: '5px 13px', borderRadius: '8px',
              }}>
                {badge}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 600,
                color: vendor.isSpecial ? 'rgba(255,255,255,0.6)' : P.muted,
                background: vendor.isSpecial ? 'transparent' : 'rgba(112,90,73,0.08)',
                padding: vendor.isSpecial ? '0' : '4px 10px',
                borderRadius: '999px',
              }}>
                {vendor.floor === '1st' ? '1st Floor' : 'Ground Floor'}
              </span>
            </div>
            <h1
              className="font-epilogue"
              style={{
                margin: '0 0 10px',
                fontSize: 'clamp(22px, 5vw, 30px)',
                fontWeight: 900,
                color: vendor.isSpecial ? '#ffffff' : P.primary,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {vendor.name}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: vendor.isSpecial ? 'rgba(255,255,255,0.75)' : P.muted }}>
              {vendor.description}
            </p>
            {vendor.tags && vendor.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                {vendor.tags.map(tag => (
                  <span key={tag} style={{
                    background: vendor.isSpecial ? 'rgba(254,178,70,0.18)' : 'rgba(161,64,0,0.07)',
                    color: vendor.isSpecial ? P.accent : P.primary,
                    border: vendor.isSpecial ? '1px solid rgba(254,178,70,0.25)' : 'none',
                    fontSize: '11px', fontWeight: 600,
                    padding: '4px 12px', borderRadius: '999px',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Menu card */}
          {vendor.menu && vendor.menu.length > 0 && (
            <div style={{
              background: P.card, borderRadius: '16px',
              border: `1px solid rgba(161,64,0,0.09)`,
              boxShadow: '0 4px 20px rgba(161,64,0,0.06)',
              overflow: 'hidden', marginBottom: '16px',
            }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid rgba(161,64,0,0.07)` }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: P.muted, opacity: 0.7 }}>
                  Menu
                </p>
              </div>
              <div>
                {vendor.menu.map((item, i) => (
                  <div
                    key={i}
                    className="vd-menu-row"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 20px', gap: '12px',
                      borderBottom: i < vendor.menu.length - 1 ? `1px solid rgba(161,64,0,0.05)` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: P.primary, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View menu image button */}
          {hasImage && (
            <button
              onClick={() => setImageOpen(true)}
              style={{
                width: '100%', padding: '13px 18px',
                background: P.primary, color: '#fff',
                border: 'none', borderRadius: '14px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#8a3500')}
              onMouseLeave={e => (e.currentTarget.style.background = P.primary)}
            >
              <MagnifyingGlass size={16} weight="bold" />
              View Menu Image
            </button>
          )}

        </div>
      </div>
    </>
  );
};

export default VendorDetail;
