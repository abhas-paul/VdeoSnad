'use client'

import { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Settings, Info, Share, Monitor, MonitorOff } from "lucide-react"
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import SettingsCompo from '@/components/Settings'

const socket = io(process.env.NEXT_PUBLIC_SIGNAL_SERVER);

const Page = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const localUserName = user && (user.name || user.email) ? user.name ?? user.email ?? "Anonymous" : "Anonymous";
  const { roomID } = useParams();
  const localRef = useRef(null);
  const peersRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState([]);
  const localStream = useRef(null);
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [id, setId] = useState("");
  const [OpenSettings, setOpenSettings] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const screenVideoRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localRef.current) localRef.current.srcObject = localStream.current;

      socket.emit('join-room', roomID);

      socket.on('user-joined', async (id) => {
        const pc = createPeerConnection(id);
        peersRef.current[id] = pc;

        localStream.current.getTracks().forEach(track => {
          pc.addTrack(track, localStream.current);
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { targetID: id, offer, from: socket.id });
      });

      socket.on('offer', async ({ offer, from }) => {
        const pc = createPeerConnection(from);
        peersRef.current[from] = pc;

        localStream.current.getTracks().forEach(track => {
          pc.addTrack(track, localStream.current);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { targetID: from, answer, from: socket.id });
      });

      socket.on('answer', async ({ answer, from }) => {
        await peersRef.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('ice-candidate', ({ candidate, from }) => {
        if (peersRef.current[from]) {
          peersRef.current[from].addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socket.on('user-disconnected', (id) => {
        if (peersRef.current[id]) {
          peersRef.current[id].close();
          delete peersRef.current[id];
        }
        setRemoteStreams(prev => prev.filter(s => s.id !== id));
      });
    };

    init();

    return () => {
      Object.values(peersRef.current).forEach(pc => pc.close());
      socket.disconnect();
    };
  }, []);

  const handleCutOffs = () => {
    router.push('/')
  }

  const openDialog = () => {
    setIsOpen(true);
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const closeDialog = () => {
    setIsOpen(false);
    if (dialogRef.current) dialogRef.current.close();
    setCopySuccess("");
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const meetingId = pathParts[pathParts.length - 1];
    setId(meetingId);
  }, []);

  const toggleMic = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleVideo = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setVideoOn(track.enabled);
    });
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const remoteStream = new MediaStream();
    setRemoteStreams(prev => [...prev, { id: peerId, stream: remoteStream }]);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { targetID: peerId, candidate: event.candidate });
      }
    };

    return pc;
  };

  const openSettings = () => {
    setOpenSettings(true)
  }

  const updateStream = (newStream) => {
    if (localRef.current) localRef.current.srcObject = newStream;
    if (localStream.current) localStream.current.getTracks().forEach((t) => t.stop());
    localStream.current = newStream;

    Object.values(peersRef.current).forEach((pc) => {
      const senders = pc.getSenders();
      senders.forEach((sender) => {
        const kind = sender.track?.kind;
        const newTrack = newStream.getTracks().find((t) => t.kind === kind);
        if (newTrack) sender.replaceTrack(newTrack);
      });
    });
  };

  // Screen sharing functions
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Add screen share to all peer connections
      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      });

      // Handle when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Add screen share to remote streams
      setRemoteStreams(prev => [...prev, { id: 'screen', stream, isScreen: true }]);
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      // Remove screen share from remote streams
      setRemoteStreams(prev => prev.filter(s => !s.isScreen));

      // Restore original video track for all peers
      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && localStream.current) {
          const videoTrack = localStream.current.getVideoTracks()[0];
          if (videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
      });
    }
  };

  return (
    <>
      <article className="min-h-screen w-full flex flex-col bg-[#000b1e] text-white font-sans">

        {/* Header with Info & Settings */}
        <header className="flex justify-end gap-2 px-4 pt-4 pb-4 sm:gap-3 sm:px-6">
          <button
            onClick={openDialog}
            aria-label="Info"
            className="p-2 sm:p-3 cursor-pointer rounded-full bg-[#0a1835] hover:bg-[#132850] border border-blue-600 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            <Info size={18} className="sm:size-5 text-blue-300" />
          </button>
          <button
            onClick={openSettings}
            aria-label="Settings"
            className="p-2 sm:p-3 cursor-pointer rounded-full bg-[#0a1835] hover:bg-[#132850] border border-blue-600 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            <Settings size={18} className="sm:size-5 text-blue-300" />
          </button>
        </header>

        {/* Main Video Grid */}
        <main className="flex-1 px-2 sm:px-4 py-4 sm:py-6 bg-gradient-to-br from-[#000b1e] via-[#050f27] to-[#000b1e]">
          <section
            aria-label="Video Grid"
            className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
          >
            {/* Local Video */}
            <figure className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-blue-700 hover:border-blue-400 transition-all">
              <video
                ref={localRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded z-10">
                You {`(${localUserName})`}
              </span>
              <figcaption className="sr-only">You</figcaption>
              <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <span className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full shadow-md animate-pulse" />
            </figure>

            {/* Remote Videos */}
            {remoteStreams.map(({ id, stream, isScreen }) => (
              <figure
                key={id}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-blue-700 hover:border-blue-400 transition-all"
              >
                <video
                  autoPlay
                  playsInline
                  ref={(video) => video && (video.srcObject = stream)}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded z-10">
                  {isScreen ? 'Screen Share' : 'Participant'}
                </span>
                <figcaption className="sr-only">{isScreen ? 'Screen Share' : 'Remote User'}</figcaption>
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <span className={`absolute top-3 right-3 w-3 h-3 ${isScreen ? 'bg-yellow-400' : 'bg-blue-400'} rounded-full shadow-md animate-pulse`} />
              </figure>
            ))}
          </section>
        </main>

        {/* Bottom Controls */}
        <footer className="bg-gradient-to-r from-[#0f1c3a] via-[#1f3260] to-[#152142] border-t border-blue-900 px-4 py-3 sm:px-6 sm:py-5 flex justify-center items-center gap-3 sm:gap-5">
          <button
            onClick={handleCutOffs}
            aria-label="End Call"
            className="bg-red-700 cursor-pointer hover:bg-red-600 p-3 sm:p-4 rounded-full shadow-lg border border-red-600 transition-all active:scale-95"
          >
            <PhoneOff size={20} />
          </button>
          <button
            onClick={toggleMic}
            aria-label="Toggle Mic"
            className="bg-[#0a1835] cursor-pointer hover:bg-[#1b2d5a] p-3 sm:p-4 rounded-full shadow-lg border border-blue-600 text-blue-300 transition-all active:scale-95"
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            onClick={toggleVideo}
            aria-label="Toggle Camera"
            className="bg-[#0a1835] cursor-pointer hover:bg-[#1b2d5a] p-3 sm:p-4 rounded-full shadow-lg border border-blue-600 text-blue-300 transition-all active:scale-95"
          >
            {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            aria-label="Toggle Screen Share"
            className="bg-[#0a1835] cursor-pointer hover:bg-[#1b2d5a] p-3 sm:p-4 rounded-full shadow-lg border border-blue-600 text-blue-300 transition-all active:scale-95"
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>
        </footer>
      </article>

      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 100, 255, 0.15)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 999,
          }}
          aria-hidden="true"
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
          boxShadow:
            "0 0 15px 4px rgba(0, 38, 102, 0.6), 0 4px 30px rgba(0, 0, 0, 0.5)",
          width: "90%",
          maxWidth: "520px",
          border: "none",
          zIndex: 1000,
          backgroundColor: "#001f3f", // navy blue background
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#e0e7ff", // light bluish text
        }}
      >
        <button
          onClick={closeDialog}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: "pointer",
            lineHeight: "1",
            color: "#a0c4ff", // soft glowing light blue
            textShadow: "0 0 6px #a0c4ff",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#cbd5ff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#a0c4ff")}
        >
          &times;
        </button>

        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#89aaff",
            textShadow: "0 0 8px #789cff",
            fontWeight: "700",
            letterSpacing: "0.05em",
          }}
        >
          Copy & Share the meeting code.
        </h2>
        <p
          style={{
            marginBottom: "25px",
            color: "#bbcfff",
            fontSize: "15px",
            lineHeight: "1.4",
            textShadow: "0 0 3px rgba(137, 154, 255, 0.6)",
          }}
        >
          Share this code with your friends.
          Once they receive it, ask them to use the "Join Meeting" feature on the homepage to continue.
        </p>

        <textarea
          readOnly
          value={id}
          rows={1}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "8px",
            border: "1px solid #2a4d8f",
            fontFamily: "monospace",
            fontSize: "15px",
            resize: "none",
            backgroundColor: "#0b1f4d", // darker navy for textarea
            color: "#d3dbff",
            boxShadow: "inset 0 0 10px #2a4d8f",
            transition: "border-color 0.3s ease",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#4a78ff")}
          onBlur={e => (e.currentTarget.style.borderColor = "#2a4d8f")}
        />

        {copySuccess && (
          <p
            style={{
              color: "#7fff7f",
              marginTop: "15px",
              fontWeight: "700",
              fontSize: "15px",
              textShadow: "0 0 6px #4fff4f",
            }}
          >
            {copySuccess}
          </p>
        )}
      </dialog>

      <SettingsCompo
        isOpen={OpenSettings}
        setIsOpen={setOpenSettings}
        selectedCamera={selectedCamera}
        selectedMic={selectedMic}
        selectedSpeaker={selectedSpeaker}
        setSelectedCamera={setSelectedCamera}
        setSelectedMic={setSelectedMic}
        setSelectedSpeaker={setSelectedSpeaker}
        updateStream={updateStream}
      />


    </>
  );
};

export default Page;
