import React from 'react';
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
  return (
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

        {/* Visitor Pass image — full width */}
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <img
            src={visitorPassImg}
            alt="Visitor Pass"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorPass;
