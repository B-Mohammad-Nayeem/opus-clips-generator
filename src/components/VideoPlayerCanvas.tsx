import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Smile } from 'lucide-react';
import { Clip, AspectRatio } from '../types';

interface VideoPlayerCanvasProps {
  clip: Clip;
  videoUrl: string;
  showCaptions?: boolean;
  showFaceBox?: boolean;
  showVisualDiagnostics?: boolean;
  aspectRatio?: AspectRatio;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export const VideoPlayerCanvas: React.FC<VideoPlayerCanvasProps> = ({
  clip,
  videoUrl,
  showCaptions = true,
  showFaceBox = false,
  showVisualDiagnostics = false,
  aspectRatio = '9:16',
  onTimeUpdate,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(clip.startTimestamp);
  const [actualDuration, setActualDuration] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Sync video bounds to startTimestamp & endTimestamp
  useEffect(() => {
    if (videoRef.current && !hasError) {
      const maxDur = actualDuration || videoRef.current.duration || clip.endTimestamp;
      const safeStart = Math.min(clip.startTimestamp, Math.max(0, maxDur - 1));
      try {
        videoRef.current.currentTime = safeStart;
      } catch (e) {
        // Safe seek fail guard
      }
    }
  }, [clip.startTimestamp, actualDuration, hasError]);

  const handleLoadedMetadata = () => {
    setHasError(false);
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setActualDuration(dur);
        const safeStart = Math.min(clip.startTimestamp, Math.max(0, dur - 1));
        videoRef.current.currentTime = safeStart;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasError) return;
    const time = videoRef.current.currentTime;
    const maxDur = actualDuration || videoRef.current.duration || clip.endTimestamp;

    setCurrentTime(time);
    if (onTimeUpdate) onTimeUpdate(time);

    const safeStart = Math.min(clip.startTimestamp, Math.max(0, maxDur - 1));
    const safeEnd = Math.min(clip.endTimestamp, maxDur);

    // Loop within startTimestamp and endTimestamp
    if (time >= safeEnd || time < safeStart - 1.0) {
      videoRef.current.currentTime = safeStart;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current || hasError) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Find active caption word based on current video time
  const currentWords = clip.transcriptWords || [];
  // Relative offset in clip
  const relativeTime = currentTime - clip.startTimestamp;

  // Find active word or group of words for subtitle display
  const activeWordIndex = currentWords.findIndex((w) => {
    const isRelative = w.start <= clip.duration + 5;
    const timeToCheck = isRelative ? relativeTime : currentTime;
    return timeToCheck >= w.start && timeToCheck <= w.end;
  });

  // Get active subtitle chunk (e.g. 3-4 words around active word)
  let visibleWordsChunk = currentWords;
  if (currentWords.length > 0) {
    const activeIdx = activeWordIndex >= 0 ? activeWordIndex : 0;
    const chunkSize = clip.captionStyle.maxWordsPerLine || 3;
    const startIdx = Math.floor(activeIdx / chunkSize) * chunkSize;
    visibleWordsChunk = currentWords.slice(startIdx, startIdx + chunkSize);
  }

  // Calculate aspect ratio container style
  const getAspectClass = (asp: AspectRatio | string) => {
    switch (asp) {
      case '9:16': return 'aspect-[9/16]';
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-video';
      default: return 'aspect-[9/16]';
    }
  };

  // Calculate face tracking box percentage position
  const faceCoords = clip.reframing.faceCoordinates || { xPercent: 50, yPercent: 40, zoom: 1.4 };

  return (
    <div
      onClick={togglePlay}
      className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-xl group cursor-pointer select-none flex items-center justify-center ${getAspectClass(
        aspectRatio
      )} ${className}`}
    >
      {/* Video Element with Reframing Crop */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-all duration-300"
        style={{
          objectPosition: `${faceCoords.xPercent}% ${faceCoords.yPercent}%`,
          transform: `scale(${faceCoords.zoom})`,
        }}
      />

      {/* Visual Diagnostics & Real-time Speaker / Object Tracking Overlay */}
      {(showVisualDiagnostics || showFaceBox || clip.reframing.showFaceBoundingBox) && (
        <div className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden">
          {/* Top Diagnostics Telemetry HUD Bar */}
          <div className="absolute top-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-between shadow-lg shadow-cyan-950/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-white tracking-wider">AI DIAGNOSTICS</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Anchor: <strong className="text-cyan-200">X:{faceCoords.xPercent}% Y:{faceCoords.yPercent}%</strong></span>
              <span>Zoom: <strong className="text-cyan-200">{faceCoords.zoom}x</strong></span>
              <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/30">60 FPS</span>
            </div>
          </div>

          {/* Rule-of-Thirds & Viewport Guidelines Grid */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute top-1/3 left-0 right-0 border-b border-dashed border-cyan-400" />
            <div className="absolute top-2/3 left-0 right-0 border-b border-dashed border-cyan-400" />
            <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-cyan-400" />
            <div className="absolute left-2/3 top-0 bottom-0 border-r border-dashed border-cyan-400" />
          </div>

          {/* Center Crosshair Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center opacity-40">
            <div className="w-full h-[1px] bg-cyan-400" />
            <div className="h-full w-[1px] bg-cyan-400 absolute" />
          </div>

          {/* PRIMARY SPEAKER FACE BOUNDING BOX (Emerald Glowing Box + Keypoints) */}
          <div
            className="absolute border-2 border-emerald-400/90 rounded-2xl bg-emerald-400/10 transition-all duration-200 shadow-xl shadow-emerald-400/20"
            style={{
              left: `${Math.max(8, faceCoords.xPercent - 20)}%`,
              top: `${Math.max(10, faceCoords.yPercent - 22)}%`,
              width: '40%',
              height: '44%',
            }}
          >
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />

            {/* Simulated Facial Coordinates Keypoints (Eyes, Nose, Mouth) */}
            <div className="absolute top-[35%] left-[30%] w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-md shadow-emerald-400 animate-pulse" />
            <div className="absolute top-[35%] right-[30%] w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-md shadow-emerald-400 animate-pulse" />
            <div className="absolute top-[52%] left-[48%] w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-md shadow-emerald-300" />
            <div className="absolute top-[70%] left-[38%] right-[38%] h-1 bg-emerald-300/80 rounded-full" />

            {/* Header Badge */}
            <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Smile className="w-3 h-3" /> SPEAKER #1 (98.6%) • TRACKING
            </div>
          </div>

          {/* SECONDARY OBJECT / HAND GESTURE BOUNDING BOX (Amber Box) */}
          <div
            className="absolute border border-dashed border-amber-400/80 rounded-xl bg-amber-400/10 transition-all duration-300"
            style={{
              left: `${Math.min(65, faceCoords.xPercent + 18)}%`,
              top: `${Math.min(55, faceCoords.yPercent + 25)}%`,
              width: '24%',
              height: '22%',
            }}
          >
            <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[8px] font-bold uppercase tracking-tight">
              HAND GESTURE [89.4%]
            </div>
          </div>

          {/* BACKGROUND SUBJECT / OBJECT BOUNDING BOX (Violet Box) */}
          <div
            className="absolute border border-violet-400/60 rounded-xl bg-violet-400/10 transition-all duration-300"
            style={{
              left: `${Math.max(5, faceCoords.xPercent - 32)}%`,
              top: `${Math.min(60, faceCoords.yPercent + 15)}%`,
              width: '20%',
              height: '25%',
            }}
          >
            <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-violet-600/90 text-white text-[8px] font-bold uppercase tracking-tight">
              BG SUBJECT [74.2%]
            </div>
          </div>
        </div>
      )}

      {/* Brand Logo Watermark Overlay */}
      {clip.brandAssets?.watermarkText && (
        <div
          className={`absolute text-white font-extrabold text-[11px] tracking-wider opacity-80 px-2 py-1 rounded bg-black/40 backdrop-blur-sm pointer-events-none ${
            clip.brandAssets.logoPosition === 'top-right'
              ? 'top-3 right-3'
              : clip.brandAssets.logoPosition === 'top-left'
              ? 'top-3 left-3'
              : clip.brandAssets.logoPosition === 'bottom-left'
              ? 'bottom-16 left-3'
              : 'bottom-16 right-3'
          }`}
        >
          {clip.brandAssets.watermarkText}
        </div>
      )}

      {/* Smart Kinetic Animated Captions Overlay */}
      {showCaptions && visibleWordsChunk.length > 0 && (
        <div
          className={`absolute w-full px-4 text-center pointer-events-none z-10 transition-all ${
            clip.captionStyle.textPosition === 'top'
              ? 'top-8'
              : clip.captionStyle.textPosition === 'center'
              ? 'top-1/2 -translate-y-1/2'
              : 'bottom-12'
          }`}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl max-w-[95%] mx-auto">
            {visibleWordsChunk.map((w, idx) => {
              const isRelative = w.start <= clip.duration + 5;
              const timeToCheck = isRelative ? relativeTime : currentTime;
              const isActive = timeToCheck >= w.start && timeToCheck <= w.end;
              const isKey = w.isKeyWord;

              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: clip.captionStyle.fontFamily || 'Montserrat, sans-serif',
                    color: isActive
                      ? clip.captionStyle.activeWordColor || '#facc15'
                      : isKey
                      ? '#fde047'
                      : clip.captionStyle.textColor || '#ffffff',
                    fontSize: `${clip.captionStyle.fontSize || 26}px`,
                    textShadow: isActive
                      ? `0 0 12px ${clip.captionStyle.activeWordColor || '#facc15'}, 0 2px 8px rgba(0,0,0,0.9)`
                      : '0 2px 8px rgba(0,0,0,0.9)',
                  }}
                  className={`font-extrabold transition-all duration-150 inline-flex items-center gap-1 uppercase tracking-tight px-1.5 py-0.5 rounded-lg ${
                    isActive
                      ? 'scale-115 bg-white/10 shadow-lg ring-2 ring-white/20'
                      : isKey
                      ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                      : 'opacity-90'
                  }`}
                >
                  <span>{w.word}</span>
                  {clip.captionStyle.showEmojis && w.emoji && (
                    <span className="text-base animate-bounce">{w.emoji}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Play/Pause Overlay Button */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity ${
          isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
        <span>
          {(currentTime - clip.startTimestamp).toFixed(1)}s / {clip.duration}s
        </span>

        <button onClick={toggleMute} className="p-1 hover:text-violet-300 transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
};
