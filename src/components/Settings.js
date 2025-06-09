"use client";
import React, { useEffect, useRef, useState } from "react";

const SettingsModal = ({
  isOpen,
  setIsOpen,
  selectedCamera,
  selectedMic,
  selectedSpeaker,
  setSelectedCamera,
  setSelectedMic,
  setSelectedSpeaker,
  updateStream,
}) => {
  const dialogRef = useRef(null);

  const [videoDevices, setVideoDevices] = useState([]);
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);

  const [tempCamera, setTempCamera] = useState("");
  const [tempMic, setTempMic] = useState("");
  const [tempSpeaker, setTempSpeaker] = useState("");

  // Fetch media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        const cams = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");
        const speakers = devices.filter((d) => d.kind === "audiooutput");

        setVideoDevices(cams);
        setAudioInputDevices(mics);
        setAudioOutputDevices(speakers);

        if (!selectedCamera && cams.length > 0) {
          setSelectedCamera(cams[0].deviceId);
          setTempCamera(cams[0].deviceId);
        }
        if (!selectedMic && mics.length > 0) {
          setSelectedMic(mics[0].deviceId);
          setTempMic(mics[0].deviceId);
        }
        if (!selectedSpeaker && speakers.length > 0) {
          setSelectedSpeaker(speakers[0].deviceId);
          setTempSpeaker(speakers[0].deviceId);
        }

        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Error getting devices:", err);
      }
    };
    getDevices();
  }, []);

  // Dialog open/close handler
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      setTempCamera(selectedCamera);
      setTempMic(selectedMic);
      setTempSpeaker(selectedSpeaker);
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setIsOpen(false);
  };

  const handleSave = async () => {
    setSelectedCamera(tempCamera);
    setSelectedMic(tempMic);
    setSelectedSpeaker(tempSpeaker);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: tempCamera },
        audio: { deviceId: tempMic },
      });
      updateStream(newStream); // pass new stream to parent
    } catch (err) {
      console.error("Failed to get updated media stream:", err);
    }

    closeDialog();
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
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Device Settings</h2>

        <div style={{ marginBottom: "20px" }}>
          <label>Camera</label>
          <select
            value={tempCamera}
            onChange={(e) => setTempCamera(e.target.value)}
            style={selectStyle}
          >
            {videoDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Microphone</label>
          <select
            value={tempMic}
            onChange={(e) => setTempMic(e.target.value)}
            style={selectStyle}
          >
            {audioInputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mic ${d.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Speaker</label>
          <select
            value={tempSpeaker}
            onChange={(e) => setTempSpeaker(e.target.value)}
            style={selectStyle}
          >
            {audioOutputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Speaker ${d.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b59ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Save & Close
        </button>
      </dialog>
    </>
  );
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  backgroundColor: "#0b1f4d",
  color: "#d3dbff",
  fontSize: "15px",
  border: "1px solid #2a4d8f",
};

export default SettingsModal;
