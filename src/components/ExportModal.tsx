import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Sparkles,
  CheckCircle2,
  Film,
  Loader2,
  Zap,
} from 'lucide-react';
import { Clip, ExportJob } from '../types';

interface ExportModalProps {
  clip: Clip;
  videoTitle: string;
  onClose: () => void;
  onAddExportJob: (job: ExportJob) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  clip,
  videoTitle,
  onClose,
  onAddExportJob,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(60);
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);

  const startExport = () => {
    setIsRendering(true);
    setRenderProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      setRenderProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setIsRendering(false);
        setRenderComplete(true);

        const newJob: ExportJob = {
          id: 'export-' + Date.now(),
          clipId: clip.id,
          clipTitle: clip.title,
          videoTitle,
          format,
          resolution,
          fps,
          fileSizeFormatted: resolution === '4k' ? '48.2 MB' : '18.5 MB',
          createdAt: new Date().toLocaleDateString(),
          status: 'completed',
          progress: 100,
        };

        onAddExportJob(newJob);
      }
    }, 200);
  };

  const triggerDownload = () => {
    // Create text or sample blob for demonstration download
    const blob = new Blob([`Dummy MP4 Video Data for ${clip.title}`], {
      type: 'video/mp4',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}_${resolution}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Export AI Short Clip</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{clip.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        {!renderComplete ? (
          <div className="space-y-5">
            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Export Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1080p', label: '1080p (Full HD)', sub: 'Best for TikTok/Reels' },
                  { id: '4k', label: '4K Ultra HD', sub: 'Max quality' },
                  { id: '720p', label: '720p HD', sub: 'Fast render' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      resolution === r.id
                        ? 'bg-violet-600/20 border-violet-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* FPS & Format */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Frame Rate (FPS)</label>
                <div className="flex gap-2">
                  {[60, 30].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f as any)}
                      className={`flex-1 py-2 rounded-xl border text-center ${
                        fps === f
                          ? 'bg-violet-600 text-white border-violet-500 font-bold'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">File Format</label>
                <div className="flex gap-2">
                  {['mp4', 'webm'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt as any)}
                      className={`flex-1 py-2 uppercase rounded-xl border text-center ${
                        format === fmt
                          ? 'bg-violet-600 text-white border-violet-500 font-bold'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rendering Progress Indicator */}
            {isRendering && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-violet-400 font-bold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering Frame Burn-in...
                  </span>
                  <span className="font-mono text-white">{renderProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Render Trigger */}
            <button
              onClick={startExport}
              disabled={isRendering}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRendering ? 'Rendering MP4 Video...' : 'Start Rendering & Download'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Clip Render Completed!</h3>
              <p className="text-xs text-slate-400">
                Your short clip has been encoded in {resolution} @ {fps}FPS with animated captions.
              </p>
            </div>

            <button
              onClick={triggerDownload}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Download MP4 File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
