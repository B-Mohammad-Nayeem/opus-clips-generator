import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  Sparkles,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Film,
  Layers,
  Bot,
  Video,
} from 'lucide-react';
import { VideoProject } from '../types';
import { SAMPLE_VIDEOS } from '../data/sampleVideos';

interface UploadSectionProps {
  onStartProcessing: (
    file: File | null,
    sampleProj: VideoProject | null,
    targetDuration: string,
    customPrompt: string,
    fileDuration?: number
  ) => void;
  onSelectSample: (proj: VideoProject) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onStartProcessing,
  onSelectSample,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [selectedSample, setSelectedSample] = useState<VideoProject | null>(SAMPLE_VIDEOS[0]);
  const [dragActive, setDragActive] = useState(false);
  const [targetDuration, setTargetDuration] = useState<string>('30s');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFileSelection = (file: File) => {
    if (!file.type.includes('video')) {
      alert('Please upload a valid video file (MP4, MOV, AVI, MKV).');
      return;
    }
    setSelectedFile(file);
    setSelectedSample(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Detect actual duration from video file
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration > 0) {
        setFileDuration(Math.round(tempVideo.duration));
      }
    };

    // Simulate direct upload progress feedback
    setIsSimulatingUpload(true);
    setUploadProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsSimulatingUpload(false);
      }
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileSelection(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    onStartProcessing(
      selectedFile,
      selectedSample,
      targetDuration,
      customPrompt,
      fileDuration || undefined
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen AI Short Video Generator & Repurposer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Turn 1 Long Video into <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">10+ Viral Short Clips</span> instantly.
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          AI automatically transcribes audio, detects peak emotional hooks, auto-reframes to 9:16 vertical video, generates kinetic captions, and exports in 4K.
        </p>
      </div>

      {/* Main Upload Box & Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Video Upload & Dropzone */}
        <div className="lg:col-span-7 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed transition-all p-8 text-center cursor-pointer overflow-hidden ${
              dragActive
                ? 'border-violet-500 bg-violet-950/30 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-slate-900/90'
                : 'border-slate-800 hover:border-violet-500/50 bg-slate-900/60 hover:bg-slate-900/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mov,video/avi,video/mkv"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl && selectedFile ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black max-h-64 border border-slate-800">
                  <video src={previewUrl} controls className="w-full h-64 object-contain mx-auto" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Uploaded</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-left px-2">
                  <div className="flex items-center gap-3 truncate">
                    <FileVideo className="w-5 h-5 text-violet-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • High Quality MP4
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-xs text-rose-400 hover:underline px-2 py-1"
                  >
                    Remove
                  </button>
                </div>

                {isSimulatingUpload && (
                  <div className="space-y-1 text-left px-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Direct Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-violet-500/40 flex items-center justify-center mx-auto text-violet-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">
                    Drag and drop your video file here, or{' '}
                    <span className="text-violet-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports MP4, MOV, AVI, MKV (Up to 4K resolution & 500MB)
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto Reframing 9:16
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Whisper AI Transcripts
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Face Tracking
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sample Video Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-violet-400" />
                Or Try Demo Video (1-Click Instant)
              </span>
              <span className="text-[11px] text-slate-500">No upload required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = selectedSample?.id === sample.id && !selectedFile;
                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      onSelectSample(sample);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500/80 shadow-lg shadow-violet-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <img
                      src={sample.thumbnailUrl}
                      alt={sample.title}
                      className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-semibold text-white truncate">{sample.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {sample.duration}s • {sample.clips.length} Viral Clips pre-indexed
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: AI Clip Target Duration & Prompt Customizer */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Bot className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base">Clip Generation Settings</h3>
          </div>

          {/* Duration Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Target Clip Length</span>
              <span className="text-violet-400 font-mono">{targetDuration}</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {['15s', '30s', '45s', '60s', '90s', 'Auto'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setTargetDuration(dur)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                    targetDuration === dur
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              AI will generate 10–50 clips optimized for short-form video algorithms.
            </p>
          </div>

          {/* AI Focus Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              AI Focus Directive (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Find funny jokes, high energy motivational moments, or controversial technical debates..."
              rows={3}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* What AI Does Overview */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Automated AI Pipeline:
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
              <li>Whisper Speech-to-Text Transcription</li>
              <li>Emotion & Reaction Intensity Scoring</li>
              <li>Face Tracking & 9:16 Center Crop Reframing</li>
              <li>Animated Kinetic Captions + Emojis</li>
            </ul>
          </div>

          {/* Primary Submit Button */}
          <button
            onClick={handleGenerate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-base shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>Generate AI Short Clips</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
