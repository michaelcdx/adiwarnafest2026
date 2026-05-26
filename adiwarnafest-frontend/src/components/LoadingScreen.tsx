import adiwarnaLogo from '../image/Adiwarna_Logo_NoBackground.png';

const LoadingScreen = () => {
  return (
    <div
      className="w-full h-screen flex flex-column align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #f8f7f5 0%, #f0ece8 100%)',
        fontFamily: 'Epilogue, sans-serif',
      }}
    >
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .loading-logo {
          animation: fadeInScale 0.8s ease-out;
        }

        .loading-text {
          animation: fadeInScale 0.8s ease-out 0.3s backwards;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(144, 77, 0, 0.2);
          border-top: 4px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-top: 2rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="loading-logo flex align-items-center justify-content-center">
        <img
          src={adiwarnaLogo}
          alt="Adiwarna Logo"
          style={{
            maxWidth: '280px',
            height: 'auto',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
          }}
        />
      </div>

      <p
        className="loading-text m-0 text-lg font-bold"
        style={{
          color: '#6b7280',
          letterSpacing: '0.05em',
          marginTop: '1rem',
        }}
      >
        Where Myths Come Alive
      </p>

      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingScreen;
