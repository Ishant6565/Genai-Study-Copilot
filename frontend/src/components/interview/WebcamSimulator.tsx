'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebcamSimulatorProps {
  isCandidateSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function WebcamSimulator({
  isCandidateSpeaking,
  isMuted,
  onToggleMute
}: WebcamSimulatorProps) {
  const [cameraOn, setCameraOn] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      if (cameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasPermission(true);
        } catch {
          setHasPermission(false);
          setCameraOn(false);
        }
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraOn]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl aspect-video sm:aspect-auto sm:h-64 flex flex-col items-center justify-center group">
      {cameraOn && hasPermission ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            isCandidateSpeaking
              ? "bg-emerald-500/20 border-2 border-emerald-500 ring-4 ring-emerald-500/20 scale-105"
              : "bg-slate-800 border border-slate-700"
          )}>
            <User className={cn("w-10 h-10", isCandidateSpeaking ? "text-emerald-400" : "text-slate-400")} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Candidate (You)</p>
            <p className="text-[11px] text-slate-400">
              {isCandidateSpeaking ? "🎙️ Speaking..." : "Ready to respond"}
            </p>
          </div>
        </div>
      )}

      {/* Floating Status & Controls Pill */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">
        <span className={cn("w-2 h-2 rounded-full", isCandidateSpeaking ? "bg-emerald-500 animate-ping" : "bg-slate-400")} />
        <span>Candidate Feed</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={cn(
            "p-2 rounded-xl backdrop-blur-md border transition-all text-xs",
            cameraOn
              ? "bg-sky-600/80 border-sky-400/40 text-white"
              : "bg-black/60 border-white/10 text-slate-300 hover:text-white"
          )}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleMute}
          className={cn(
            "p-2 rounded-xl backdrop-blur-md border transition-all text-xs",
            isMuted
              ? "bg-rose-600/80 border-rose-400/40 text-white"
              : "bg-black/60 border-white/10 text-slate-300 hover:text-white"
          )}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
