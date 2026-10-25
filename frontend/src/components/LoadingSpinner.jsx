import React from "react";

const LoadingSpinner = ({ size = 32, text = "Loading..." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "32px",
        color: "#64748b",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid #e2e8f0",
          borderTopColor: "#1264c8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {text && <span style={{ fontSize: "14px", fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
