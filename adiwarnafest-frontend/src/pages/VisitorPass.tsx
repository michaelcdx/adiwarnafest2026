import React, { useState, useCallback } from 'react';
import visitorPassImg from '../image/visitor_pass.jpeg';

const rules = [
  {
    icon: '🚭',
    text: 'Smoking, vaping, or any similar activity is strictly prohibited anywhere on campus grounds. Violations will result in a fine of RM50 per offence — and yes, repeat violations keep getting fined.',
  },
  {
    icon: '🤝',
    text: 'Any form of violence, threatening behaviour, or intimidation is strictly forbidden within XMUM premises. Let\'s keep the vibes positive.',
  },
  {
    icon: '🌿',
    text: 'Please help us keep XMUM clean and beautiful. Dispose of your rubbish properly and leave the campus as you found it.',
  },
  {
    icon: '⛔',
    text: 'Entry into any student dormitory area is strictly off-limits — no exceptions. This includes: D1, D2, D3, D4, D5, LY1, LY2, LY4, LY5, LY6, LY7, LY8, and LY9. Hungry? Head to the bazaar on Day 1 for great food!',
  },
];

const VisitorPass: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const openFullscreen = useCallback(() => {
    setRotation(0);
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreen(false);
  }, []);

  const rotate = useCallback(() => {
    setRotation(r => (r + 90) % 360);
  }, []);

  const isLandscape = rotation === 90 || rotation === 270;

  return (
    <>
      <div className="glass-page pb-20">
        {/* Hero header */}
        <div
          style={{
            paddingTop: '40px',
            paddingBottom: '28px',
            textAlign: 'center',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          <p
            style={{
              fontFamily: 'Epilogue, sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: '0 0 10px',
            }}
          >
            Adiwarna Fest 2026
          </p>
          <h1
            style={{
              fontFamily: 'Epilogue, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 7vw, 3.2rem)',
              color: 'var(--text-primary)',
              margin: '0 0 12px',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Visitor Pass
          </h1>
          <div
            style={{
              width: '40px',
              height: '3px',
              background: 'linear-gradient(90deg, rgba(254,178,70,0.7), rgba(161,64,0,0.5))',
              borderRadius: '999px',
              margin: '16px auto 0',
            }}
          />
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
          {/* Description card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.68)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 20px',
                lineHeight: 1.65,
              }}
            >
              Your Visitor Pass is displayed below — please have it ready to show the security guard at the entrance to gain access to Xiamen University Malaysia.
            </p>

            <p
              style={{
                fontFamily: 'Epilogue, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#a14000',
                margin: '0 0 14px',
              }}
            >
              Rules &amp; Regulations
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rules.map((rule, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(254,178,70,0.08)',
                    border: '1px solid rgba(161,64,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1.3 }}>{rule.icon}</span>
                  <p
                    style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {rule.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visitor Pass image */}
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.6)',
              marginBottom: '16px',
            }}
          >
            <img
              src={visitorPassImg}
              alt="Visitor Pass"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* View Fullscreen button */}
          <div className="button-wrap" style={{ marginBottom: '40px' }}>
            <button
              onClick={openFullscreen}
              className="premium-btn"
              style={{ fontFamily: 'Epilogue, sans-serif', width: '100%', fontSize: '15px', padding: '14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                ⛶ View Full Screen
              </span>
            </button>
            <div className="button-shadow" />
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Controls */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              zIndex: 1,
            }}
          >
            <button
              onClick={rotate}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                padding: '10px 18px',
                cursor: 'pointer',
                fontFamily: 'Epilogue, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              ↻ Rotate
            </button>
            <button
              onClick={closeFullscreen}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                padding: '10px 18px',
                cursor: 'pointer',
                fontFamily: 'Epilogue, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Image */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '72px 16px 24px',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={visitorPassImg}
              alt="Visitor Pass"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                maxWidth: isLandscape ? '90vh' : '100%',
                maxHeight: isLandscape ? '90vw' : 'calc(100vh - 96px)',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorPass;
