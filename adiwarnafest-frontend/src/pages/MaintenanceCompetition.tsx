interface MaintenanceCompetitionProps {
  isOpen: boolean;
  onClose: () => void;
}

const MaintenanceCompetition = ({ isOpen, onClose }: MaintenanceCompetitionProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          maxWidth: "800px",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #c07000 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white" }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Competition Management</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              padding: "8px",
              fontSize: "20px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "30px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>
              Competition Management Moved
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
              Competition scheduling and standings are now managed in the <strong>Management Panel</strong> under the <strong>Competitions tab</strong>.
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>
              Please use the Competitions tab to add matches, manage standings, and schedule games.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "var(--color-primary)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: "Epilogue, sans-serif",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCompetition;
