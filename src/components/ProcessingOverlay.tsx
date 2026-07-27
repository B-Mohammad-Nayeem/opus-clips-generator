import React, { useEffect, useState } from 'react';
import {
  Mic,
  Users,
  Film,
  Pause,
  Flame,
  Laugh,
  Tag,
  BarChart3,
  Bot,
  CheckCircle2,
  Sparkles,
  Loader2,
  Terminal,
} from 'lucide-react';
import { ProcessingStep } from '../types';

interface ProcessingOverlayProps {
  videoTitle: string;
  onComplete: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ videoTitle, onComplete }) => {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'step-whisper',
      label: 'Transcribing Audio',
      description: 'Whisper AI extracting word-by-word speech-to-text timestamps...',
      iconName: 'Mic',
      status: 'active',
      progress: 30,
      logDetails: '[Whisper v3] Sampling 16kHz audio track... 540 words recognized.',
    },
    {
      id: 'step-speakers',
      label: 'Speaker Diarization',
      description: 'Identifying unique speaker voices & active audio channels...',
      iconName: 'Users',
      status: 'pending',
      progress: 0,
      logDetails: '[Diarization] Found 2 distinct speakers (Speaker 1: 65%, Speaker 2: 35%).',
    },
    {
      id: 'step-scenes',
      label: 'Scene & Cut Detection',
      description: 'Analyzing frame color histogram & shot transitions...',
      iconName: 'Film',
      status: 'pending',
      progress: 0,
      logDetails: '[OpenCV] Detected 14 visual cut boundaries and 8 camera angle changes.',
    },
    {
      id: 'step-pauses',
      label: 'Pause & Silence Trim',
      description: 'Locating dead air, filler words (um, ah) & natural cut points...',
      iconName: 'Pause',
      status: 'pending',
      progress: 0,
      logDetails: '[Audio Filter] Marked 8 filler pauses for auto-tightening.',
    },
    {
      id: 'step-emotion',
      label: 'Emotion & Pitch Intensity',
      description: 'Measuring speech cadence, pitch spikes & voice excitement...',
      iconName: 'Flame',
      status: 'pending',
      progress: 0,
      logDetails: '[Acoustics] Peak vocal energy spikes detected at 00:15 and 01:22.',
    },
    {
      id: 'step-reactions',
      label: 'Reactions & Laughter',
      description: 'Detecting laughter, applause, and outbursts...',
      iconName: 'Laugh',
      status: 'pending',
      progress: 0,
      logDetails: '[Audio Model] Audience laughter detected around 01:10.',
    },
    {
      id: 'step-keywords',
      label: 'Keywords & Topics',
      description: 'Indexing core technical entities and semantic clusters...',
      iconName: 'Tag',
      status: 'pending',
      progress: 0,
      logDetails: '[NLP] Indexed key tags: #aistartups, #wrapper, #retention.',
    },
    {
      id: 'step-scoring',
      label: 'Engagement Matrix',
      description: 'Calculating hook score, retention curve & viral rating...',
      iconName: 'BarChart3',
      status: 'pending',
      progress: 0,
      logDetails: '[Viral Algorithm] Top moment scored 98/100 Viral Index.',
    },
    {
      id: 'step-clips',
      label: 'AI Viral Clip Selection',
      description: 'Gemini 3.6 Flash assembling vertical 9:16 reframed clips & captions...',
      iconName: 'Bot',
      status: 'pending',
      progress: 0,
      logDetails: '[Gemini 3.6 Flash] Generated 4 viral clips with kinetic captions.',
    },
  ]);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [totalProgress, setTotalProgress] = useState(10);
  const [logLogs, setLogLogs] = useState<string[]>(['Initializing AI Processing Engine v4.2...']);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx((prevIdx) => {
        if (prevIdx < steps.length - 1) {
          const nextIdx = prevIdx + 1;

          setSteps((prevSteps) => {
            return prevSteps.map((s, idx) => {
              if (idx < nextIdx) return { ...s, status: 'completed', progress: 100 };
              if (idx === nextIdx) return { ...s, status: 'active', progress: 50 };
              return s;
            });
          });

          setLogLogs((prev) => [
            ...prev,
            steps[nextIdx]?.logDetails || `Finished step ${nextIdx}...`,
          ]);

          setTotalProgress(Math.round(((nextIdx + 1) / steps.length) * 100));
          return nextIdx;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prevIdx;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, [steps.length, onComplete]);

  const renderIcon = (name: string, active: boolean) => {
    const props = { className: `w-4 h-4 ${active ? 'text-violet-400 animate-bounce' : 'text-slate-400'}` };
    switch (name) {
      case 'Mic': return <Mic {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Film': return <Film {...props} />;
      case 'Pause': return <Pause {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Laugh': return <Laugh {...props} />;
      case 'Tag': return <Tag {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Bot': return <Bot {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">AI Processing Video</h2>
              <p className="text-xs text-slate-400 truncate max-w-md">{videoTitle}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-extrabold text-violet-400">{totalProgress}%</span>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Completion</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 h-full rounded-full transition-all duration-300 shadow-md shadow-violet-500/30"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const isActive = step.status === 'active';
            const isDone = step.status === 'completed';

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                  isActive
                    ? 'bg-violet-950/40 border-violet-500/80 shadow-lg shadow-violet-500/10'
                    : isDone
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    renderIcon(step.iconName, isActive)
                  )}
                </div>

                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {isActive && <span className="text-[10px] text-amber-400 font-mono animate-pulse">Running</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/90 font-mono text-[11px] space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-900 text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-emerald-400" /> AI Execution Logs
            </span>
            <span className="text-emerald-400">STATUS: ACTIVE</span>
          </div>
          <div className="h-20 overflow-y-auto space-y-1 text-slate-400">
            {logLogs.map((log, i) => (
              <p key={i} className="leading-tight">
                <span className="text-violet-400">&gt;</span> {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
