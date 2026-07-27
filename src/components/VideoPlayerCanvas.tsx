import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Smile } from 'lucide-react';
import { Clip, AspectRatio } from '../types';

interface VideoPlayerCanvasProps {
  clip: Clip;
  videoUrl: string;
  showCaptions?: boolean;
  showFaceBox?: boolean;
  aspectRatio?: AspectRatio;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export const VideoPlayerCanvas: React.FC<VideoPlayerCanvasProps> = ({
  clip,
  videoUrl,
  showCaptions = true,
  showFaceBox = false,
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

      {/* MediaPipe Face Bounding Box Simulation (when editing or enabled) */}
      {(showFaceBox || clip.reframing.showFaceBoundingBox) && (
        <div
          className="absolute border-2 border-emerald-400/90 rounded-2xl bg-emerald-400/10 pointer-events-none transition-all duration-200 shadow-lg shadow-emerald-400/20"
          style={{
            left: `${Math.max(10, faceCoords.xPercent - 20)}%`,
            top: `${Math.max(10, faceCoords.yPercent - 25)}%`,
            width: '40%',
            height: '45%',
          }}
        >
          <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
            <Smile className="w-3 h-3" /> Speaker Face Track (MediaPipe)
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
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl max-w-[90%] mx-auto">
            {visibleWordsChunk.map((w, idx) => {
              const isRelative = w.start <= clip.duration + 5;
              const timeToCheck = isRelative ? relativeTime : currentTime;
              const isActive = timeToCheck >= w.start && timeToCheck <= w.end;
              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: clip.captionStyle.fontFamily || 'Montserrat, sans-serif',
                    color: isActive
                      ? clip.captionStyle.activeWordColor
                      : clip.captionStyle.textColor,
                    fontSize: `${clip.captionStyle.fontSize || 26}px`,
                    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
                  }}
                  className={`font-extrabold transition-all duration-150 inline-block uppercase tracking-tight ${
                    isActive ? 'scale-110 drop-shadow-md' : 'opacity-90'
                  }`}
                >
                  {w.word}
                  {clip.captionStyle.showEmojis && w.emoji && (
                    <span className="ml-1 text-base">{w.emoji}</span>
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
