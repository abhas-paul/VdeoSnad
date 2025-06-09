"use client";
import React, { useRef, useEffect, useState } from "react";

const JoinMeetings = ({ isOpen, setIsOpen }) => {
  const dialogRef = useRef(null);
  const [meetingCode, setMeetingCode] = useState("");

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setIsOpen(false);
  };

  const handleJoin = () => {
    if (meetingCode.trim()) {
      window.open(`/meeting/${meetingCode.trim()}`, '_blank');
      closeDialog();
    }
  };  

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 100, 255, 0.15)",
            backdropFilter: "blur(6px)",
            zIndex: 999,
          }}
        />
      )}

      <dialog
        ref={dialogRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "30px",
          borderRadius: "12px",
          backgroundColor: "#001f3f",
          color: "#e0e7ff",
          width: "90%",
          maxWidth: "520px",
          zIndex: 1000,
          border: "none",
        }}
      >
        {/* Close button */}
        <button
          onClick={closeDialog}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            background: "transparent",
            border: "none",
            color: "#e0e7ff",
            fontSize: "20px",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 style={{ marginBottom: "20px" }}>Join a Meeting</h2>
        <p style={{ marginBottom: "20px" }}>
          Enter your meeting code below to quickly jump into a call.
        </p>

        <input
          type="text"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
          placeholder="Enter meeting code"
          style={inputStyle}
        />

        <button onClick={handleJoin} style={buttonStyle}>
          Join Meeting
        </button>
      </dialog>
    </>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  backgroundColor: "#0b1f4d",
  color: "#d3dbff",
  fontSize: "15px",
  border: "1px solid #2a4d8f",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#3b59ff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "15px",
  cursor: "pointer",
};

export default JoinMeetings;
