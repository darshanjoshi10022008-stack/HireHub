import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const Alert = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: {
      bg: "#ecfdf5",
      border: "#a7f3d0",
      text: "#065f46",
      icon: <CheckCircle2 size={18} color="#059669" />,
    },
    error: {
      bg: "#fef2f2",
      border: "#fecaca",
      text: "#991b1b",
      icon: <AlertCircle size={18} color="#dc2626" />,
    },
    warning: {
      bg: "#fffbeb",
      border: "#fde68a",
      text: "#92400e",
      icon: <AlertTriangle size={18} color="#d97706" />,
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      icon: <Info size={18} color="#2563eb" />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "8px",
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.text,
        fontSize: "14px",
        lineHeight: "1.5",
        marginBottom: "16px",
      }}
      role="alert"
    >
      <div style={{ flexShrink: 0, marginTop: "2px" }}>{current.icon}</div>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: current.text,
            padding: 0,
            lineHeight: 1,
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
