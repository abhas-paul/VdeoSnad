"use client";
import React, { useRef, useEffect, useState } from "react";

const JoinMeetings = ({ isOpen, setIsOpen, Postcode }) => {
    const dialogRef = useRef(null);

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

                <h2 style={{ marginBottom: "20px" }}>Postpone a Meeting</h2>
                <p style={{ marginBottom: "20px" }}>
                    Use the link below laterly to jump into the meeting.
                </p>

                <textarea
                    readOnly
                    value={Postcode}
                    rows={1}
                    style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #2a4d8f",
                        fontFamily: "monospace",
                        fontSize: "15px",
                        resize: "none",
                        backgroundColor: "#0b1f4d", 
                        color: "#d3dbff",
                        boxShadow: "inset 0 0 10px #2a4d8f",
                        transition: "border-color 0.3s ease",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#4a78ff")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#2a4d8f")}
                />

            </dialog>
        </>
    );
};



export default JoinMeetings;
