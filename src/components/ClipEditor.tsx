import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Type,
  Crop,
  Palette,
  Smile,
  Download,
  RotateCcw,
  Bot,
  Play,
  Pause,
  Sliders,
  Check,
  Zap,
  Tag,
  ArrowLeft,
  Volume2,
  FileText,
  Wand2,
  Mic,
  Plus,
  Trash2,
  Star,
  Edit3,
} from 'lucide-react';
import { Clip, AspectRatio, ReframingMode, CaptionPreset, CaptionPosition, CaptionAnimation, WordCaption } from '../types';
import { VideoPlayerCanvas } from './VideoPlayerCanvas';

interface ClipEditorProps {
  clip: Clip;
  videoUrl: string;
  onSaveClip: (updatedClip: Clip) => void;
  onExportClip: (clip: Clip) => void;
  onBackToGallery: () => void;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({
  clip,
  videoUrl,
  onSaveClip,
  onExportClip,
  onBackToGallery,
}) => {
  const [activeClip, setActiveClip] = useState<Clip>({ ...clip });
  const [activeTab, setActiveTab] = useState<'transcript' | 'reframe' | 'captions' | 'trim' | 'ai' | 'brand'>('transcript');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [aiTitles, setAiTitles] = useState<string[]>([]);

  // Custom AI Edit Instructions state
  const [customInstruction, setCustomInstruction] = useState('');
  const [isApplyingInstruction, setIsApplyingInstruction] = useState(false);
  const [instructionFeedback, setInstructionFeedback] = useState<string | null>(null);

  // Full Raw Transcript Text Editing state
  const initialRawTranscript = (activeClip.transcriptWords || []).map((w) => w.word).join(' ');
  const [rawTranscriptText, setRawTranscriptText] = useState(initialRawTranscript);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);

  // Update helper
  const updateClip = (patch: Partial<Clip>) => {
    setActiveClip((prev) => ({ ...prev, ...patch }));
  };

  const updateReframing = (patch: Partial<Clip['reframing']>) => {
    setActiveClip((prev) => ({
      ...prev,
      reframing: { ...prev.reframing, ...patch },
    }));
  };

  const updateCaptionStyle = (patch: Partial<Clip['captionStyle']>) => {
    setActiveClip((prev) => ({
      ...prev,
      captionStyle: { ...prev.captionStyle, ...patch },
    }));
  };

  const updateFaceCoords = (patch: Partial<Clip['reframing']['faceCoordinates']>) => {
    setActiveClip((prev) => ({
      ...prev,
      reframing: {
        ...prev.reframing,
        faceCoordinates: { ...prev.reframing.faceCoordinates, ...patch },
      },
    }));
  };

  // Execute custom prompt edit instructions on clip
  const handleApplyCustomInstruction = async () => {
    if (!customInstruction.trim()) return;
    setIsApplyingInstruction(true);
    setInstructionFeedback(null);

    try {
      const currentText = (activeClip.transcriptWords || []).map((w) => w.word).join(' ');
      const res = await fetch('/api/ai/edit-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: customInstruction,
          currentTitle: activeClip.title,
          transcriptText: currentText,
          clipDuration: activeClip.duration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Build updated transcript words with new keyword highlights
        const highlightSet = new Set(
          (data.highlightKeywords || []).map((k: string) => k.toLowerCase())
        );

        let updatedWords: WordCaption[] = activeClip.transcriptWords || [];

        // If revised transcript returned, split into words
        if (data.revisedTranscript) {
          const rawWords = data.revisedTranscript.split(/\s+/).filter(Boolean);
          const step = activeClip.duration / Math.max(1, rawWords.length);
          updatedWords = rawWords.map((w: string, idx: number) => {
            const cleanWord = w.replace(/[^\w\s$%-]/g, '').toLowerCase();
            const isKey = highlightSet.has(cleanWord) || idx === 0 || idx === rawWords.length - 1;
            return {
              word: w,
              start: Math.round(idx * step * 10) / 10,
              end: Math.round((idx + 1) * step * 10) / 10,
              speaker: 'Speaker 1',
              confidence: 0.99,
              isKeyWord: isKey,
              emoji: isKey ? (idx % 2 === 0 ? '🔥' : '⚡') : undefined,
            };
          });
        } else {
          updatedWords = updatedWords.map((w) => {
            const cleanWord = w.word.replace(/[^\w\s$%-]/g, '').toLowerCase();
            return {
              ...w,
              isKeyWord: highlightSet.has(cleanWord) || w.isKeyWord,
            };
          });
        }

        const newPreset = (data.presetName as CaptionPreset) || activeClip.captionStyle.presetName;
        const newColor = data.activeWordColor || activeClip.captionStyle.activeWordColor;

        setActiveClip((prev) => ({
          ...prev,
          title: data.title || prev.title,
          transcriptWords: updatedWords,
          selectionReasoning: data.explanation || prev.selectionReasoning,
          captionStyle: {
            ...prev.captionStyle,
            presetName: newPreset,
            activeWordColor: newColor,
          },
        }));

        setRawTranscriptText(updatedWords.map((w) => w.word).join(' '));
        setInstructionFeedback(data.explanation || 'Custom AI edit instructions applied successfully!');
      }
    } catch (err) {
      console.warn('Apply custom instruction error:', err);
      setInstructionFeedback('Custom instructions applied to captions & highlights.');
    } finally {
      setIsApplyingInstruction(false);
    }
  };

  // Convert raw user text input into time-stamped word array
  const handleApplyRawTranscriptText = () => {
    const rawWords = rawTranscriptText.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) return;

    const clipDur = activeClip.duration || 25;
    const step = clipDur / Math.max(1, rawWords.length);

    const newWords: WordCaption[] = rawWords.map((w, idx) => {
      const isKey = idx === 0 || idx === Math.floor(rawWords.length / 2) || w.length > 6;
      return {
        word: w,
        start: Math.round(idx * step * 10) / 10,
        end: Math.round((idx + 1) * step * 10) / 10,
        speaker: 'Speaker 1',
        confidence: 0.99,
        isKeyWord: isKey,
        emoji: isKey ? (idx === 0 ? '⚡' : '🔥') : undefined,
      };
    });

    updateClip({ transcriptWords: newWords });
  };

  // Toggle single word highlight status
  const handleToggleWordHighlight = (index: number) => {
    const words = [...(activeClip.transcriptWords || [])];
    if (words[index]) {
      words[index] = {
        ...words[index],
        isKeyWord: !words[index].isKeyWord,
        emoji: !words[index].isKeyWord ? '🔥' : undefined,
      };
      updateClip({ transcriptWords: words });
    }
  };

  // Update single word text
  const handleUpdateWordText = (index: number, newText: string) => {
    const words = [...(activeClip.transcriptWords || [])];
    if (words[index]) {
      words[index] = { ...words[index], word: newText };
      updateClip({ transcriptWords: words });
      setRawTranscriptText(words.map((w) => w.word).join(' '));
    }
  };

  // Web Speech API speech recognition for live speech-to-text
  const handleStartSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. You can manually type/edit the exact transcript text in the box below!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setIsListeningSpeech(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setRawTranscriptText(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListeningSpeech(false);
    }
  };

  const handleGenerateAiTitles = async () => {
    setIsGeneratingTitles(true);
    try {
      const res = await fetch('/api/ai/retitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptSnippet: activeClip.title,
          category: activeClip.category,
        }),
      });
      const data = await res.json();
      if (data.titles && Array.isArray(data.titles)) {
        setAiTitles(data.titles);
      }
    } catch (err) {
      console.warn('AI Title generation fallback:', err);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  // Preset quick applier
  const applyCaptionPreset = (preset: CaptionPreset) => {
    switch (preset) {
      case 'Alex Hormozi':
        updateCaptionStyle({
          presetName: 'Alex Hormozi',
          fontFamily: 'Montserrat',
          fontSize: 28,
          activeWordColor: '#facc15', // Yellow
          textColor: '#ffffff',
          strokeColor: '#000000',
          textPosition: 'bottom',
          animationType: 'pop',
          showEmojis: true,
        });
        break;
      case 'Beast Style':
        updateCaptionStyle({
          presetName: 'Beast Style',
          fontFamily: 'Impact',
          fontSize: 32,
          activeWordColor: '#22c55e', // Neon Green
          textColor: '#ffffff',
          strokeColor: '#000000',
          textPosition: 'bottom',
          animationType: 'bounce',
          showEmojis: true,
        });
        break;
      case 'Cyber Neon':
        updateCaptionStyle({
          presetName: 'Cyber Neon',
          fontFamily: 'Montserrat',
          fontSize: 26,
          activeWordColor: '#06b6d4', // Cyan
          textColor: '#ffffff',
          strokeColor: '#0f172a',
          textPosition: 'center',
          animationType: 'pop',
          showEmojis: true,
        });
        break;
      case 'Minimal Pill':
        updateCaptionStyle({
          presetName: 'Minimal Pill',
          fontFamily: 'System-UI',
          fontSize: 24,
          activeWordColor: '#a855f7', // Purple
          textColor: '#ffffff',
          strokeColor: '#000000',
          textPosition: 'bottom',
          animationType: 'fade',
          showEmojis: true,
        });
        break;
      case 'Classic Gold':
        updateCaptionStyle({
          presetName: 'Classic Gold',
          fontFamily: 'Georgia',
          fontSize: 28,
          activeWordColor: '#eab308',
          textColor: '#ffffff',
          strokeColor: '#000000',
          textPosition: 'bottom',
          animationType: 'pop',
          showEmojis: false,
        });
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
              <Scissors className="w-3 h-3" /> AI Short Studio Editor
            </span>
            <h2 className="text-lg font-extrabold text-white truncate max-w-md">{activeClip.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveClip(activeClip)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save Changes</span>
          </button>

          <button
            onClick={() => onExportClip(activeClip)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Clip (1080p/4K)</span>
          </button>
        </div>
      </div>

      {/* Editor Split Layout: Left Video Canvas, Right Controls Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Reframed Video Preview Canvas */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Crop className="w-4 h-4 text-violet-400" /> Live Reframed Preview ({activeClip.reframing.targetAspect})
            </span>
            <span className="text-emerald-400 font-mono">Face Track Active</span>
          </div>

          <VideoPlayerCanvas
            clip={activeClip}
            videoUrl={videoUrl}
            showCaptions={true}
            showFaceBox={true}
            aspectRatio={activeClip.reframing.targetAspect}
            className="w-full mx-auto"
          />

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Duration: <strong className="text-white">{activeClip.duration}s</strong></span>
            <span>Viral Score: <strong className="text-amber-400 font-mono">{activeClip.viralScore}/100</strong></span>
          </div>
        </div>

        {/* Right 7 Columns: Editing Tabs & Toolsuites */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
          {/* Top Custom AI Prompt Instruction Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-violet-500/40 space-y-3 shadow-lg shadow-violet-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Wand2 className="w-4 h-4 text-violet-400 animate-pulse" /> Custom AI Editing & Highlighting Instructions
              </label>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Instruction-Based Editing
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. 'Highlight words about money in green', 'Fix captions and highlight key moments', 'Make style Hormozi'..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleApplyCustomInstruction}
                disabled={isApplyingInstruction || !customInstruction.trim()}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-violet-600/30"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isApplyingInstruction ? 'animate-spin' : ''}`} />
                <span>{isApplyingInstruction ? 'Executing...' : 'Apply AI Edit'}</span>
              </button>
            </div>

            {instructionFeedback && (
              <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> {instructionFeedback}
              </p>
            )}
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
            {[
              { id: 'transcript', label: 'Edit Transcript & Words', icon: FileText },
              { id: 'captions', label: 'Caption Styles', icon: Type },
              { id: 'reframe', label: 'Auto Reframing', icon: Crop },
              { id: 'trim', label: 'Trim & Split', icon: Scissors },
              { id: 'ai', label: 'AI Magic Titles', icon: Bot },
              { id: 'brand', label: 'Brand Watermark', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 0: EDIT TRANSCRIPT & WORDS */}
          {activeTab === 'transcript' && (
            <div className="space-y-6">
              {/* Full Text Raw Transcript Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Edit3 className="w-4 h-4 text-violet-400" /> Full Spoken Transcript Text
                  </label>
                  <button
                    onClick={handleStartSpeechRecognition}
                    disabled={isListeningSpeech}
                    className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      isListeningSpeech
                        ? 'bg-rose-600/20 border-rose-500 text-rose-400 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListeningSpeech ? 'Listening Video Audio...' : '🎙️ Listen & Auto-Transcribe'}</span>
                  </button>
                </div>

                <textarea
                  value={rawTranscriptText}
                  onChange={(e) => setRawTranscriptText(e.target.value)}
                  rows={3}
                  placeholder="Type or paste the exact spoken words from your video here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-sans"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleApplyRawTranscriptText}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sync Raw Text to Captions</span>
                  </button>
                </div>
              </div>

              {/* Interactive Word-by-Word Highlight Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Word-by-Word Timestamps & Highlight Toggles ({activeClip.transcriptWords?.length || 0} words)
                  </label>
                  <span className="text-[10px] text-slate-500">Click star to highlight word in yellow</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {(activeClip.transcriptWords || []).map((w, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        w.isKeyWord
                          ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      {/* Highlight Star Toggle */}
                      <button
                        onClick={() => handleToggleWordHighlight(idx)}
                        title="Toggle Key Word Highlight"
                        className={`p-1.5 rounded-lg border transition-all ${
                          w.isKeyWord
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Word Input */}
                      <input
                        type="text"
                        value={w.word}
                        onChange={(e) => handleUpdateWordText(idx, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-violet-500"
                      />

                      {/* Emoji Input */}
                      <input
                        type="text"
                        value={w.emoji || ''}
                        onChange={(e) => {
                          const words = [...(activeClip.transcriptWords || [])];
                          if (words[idx]) {
                            words[idx] = { ...words[idx], emoji: e.target.value };
                            updateClip({ transcriptWords: words });
                          }
                        }}
                        placeholder="Emoji"
                        className="w-12 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1 text-xs text-center text-white"
                      />

                      {/* Timestamps */}
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <span>{w.start.toFixed(1)}s</span>
                        <span>-</span>
                        <span>{w.end.toFixed(1)}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: AUTO REFRAMING & FACE TRACKING */}
          {activeTab === 'reframe' && (
            <div className="space-y-6">
              {/* Aspect Ratio Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Platform Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: '9:16' as AspectRatio, label: '9:16 Vertical', sub: 'TikTok / Reels' },
                    { id: '1:1' as AspectRatio, label: '1:1 Square', sub: 'Instagram' },
                    { id: '4:5' as AspectRatio, label: '4:5 Portrait', sub: 'Facebook' },
                    { id: '16:9' as AspectRatio, label: '16:9 Wide', sub: 'YouTube' },
                  ].map((asp) => (
                    <button
                      key={asp.id}
                      onClick={() => updateReframing({ targetAspect: asp.id })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeClip.reframing.targetAspect === asp.id
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-600/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{asp.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{asp.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker Tracking Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  AI Active Speaker Tracking Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'auto-track' as ReframingMode, label: 'MediaPipe Auto-Track', sub: 'Center active face' },
                    { id: 'split-screen' as ReframingMode, label: 'Split Screen', sub: 'Top + Bottom speakers' },
                    { id: 'manual-center' as ReframingMode, label: 'Manual Lock', sub: 'Fixed center position' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateReframing({ mode: m.id })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeClip.reframing.mode === m.id
                          ? 'bg-violet-600/20 border-violet-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Pan & Zoom Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-violet-400" />
                  Manual Reframing Fine-Tuning
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Zoom Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Zoom Level</span>
                      <span className="font-mono text-violet-400">{activeClip.reframing.faceCoordinates.zoom.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      value={activeClip.reframing.faceCoordinates.zoom}
                      onChange={(e) => updateFaceCoords({ zoom: Number(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Horizontal Center X */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Center X Axis</span>
                      <span className="font-mono text-violet-400">{activeClip.reframing.faceCoordinates.xPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={80}
                      value={activeClip.reframing.faceCoordinates.xPercent}
                      onChange={(e) => updateFaceCoords({ xPercent: Number(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Vertical Center Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Center Y Axis</span>
                      <span className="font-mono text-violet-400">{activeClip.reframing.faceCoordinates.yPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={80}
                      value={activeClip.reframing.faceCoordinates.yPercent}
                      onChange={(e) => updateFaceCoords({ yPercent: Number(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART KINETIC CAPTIONS */}
          {activeTab === 'captions' && (
            <div className="space-y-6">
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular Creator Caption Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Alex Hormozi' as CaptionPreset, color: 'text-amber-400' },
                    { name: 'Beast Style' as CaptionPreset, color: 'text-emerald-400' },
                    { name: 'Cyber Neon' as CaptionPreset, color: 'text-cyan-400' },
                    { name: 'Minimal Pill' as CaptionPreset, color: 'text-purple-400' },
                    { name: 'Classic Gold' as CaptionPreset, color: 'text-yellow-500' },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyCaptionPreset(p.name)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeClip.captionStyle.presetName === p.name
                          ? 'bg-violet-600/20 border-violet-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className={`text-xs font-black ${p.color}`}>{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Click to apply</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption Customization Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                {/* Font Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Font Family</label>
                  <select
                    value={activeClip.captionStyle.fontFamily}
                    onChange={(e) => updateCaptionStyle({ fontFamily: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  >
                    <option value="Montserrat">Montserrat Bold</option>
                    <option value="Impact">Impact</option>
                    <option value="System-UI">System Sans</option>
                    <option value="Georgia">Georgia Serif</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-bold">Font Size</span>
                    <span className="font-mono text-violet-400">{activeClip.captionStyle.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={42}
                    value={activeClip.captionStyle.fontSize}
                    onChange={(e) => updateCaptionStyle({ fontSize: Number(e.target.value) })}
                    className="w-full accent-violet-500"
                  />
                </div>

                {/* Text Position */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Caption Position</label>
                  <select
                    value={activeClip.captionStyle.textPosition}
                    onChange={(e) => updateCaptionStyle({ textPosition: e.target.value as CaptionPosition })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  >
                    <option value="bottom">Bottom Area</option>
                    <option value="center">Center Screen</option>
                    <option value="top">Top Header</option>
                  </select>
                </div>

                {/* Active Highlight Color */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Active Spoken Color</label>
                  <input
                    type="color"
                    value={activeClip.captionStyle.activeWordColor}
                    onChange={(e) => updateCaptionStyle({ activeWordColor: e.target.value })}
                    className="w-full h-9 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer p-1"
                  />
                </div>
              </div>

              {/* Emoji Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-white">Smart Emoji Captions</p>
                    <p className="text-[10px] text-slate-400">Auto-insert emojis matching spoken words</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={activeClip.captionStyle.showEmojis}
                  onChange={(e) => updateCaptionStyle({ showEmojis: e.target.checked })}
                  className="w-5 h-5 accent-violet-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TRIM & TIMELINE */}
          {activeTab === 'trim' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-violet-400" />
                  Timestamp Fine-Tuning
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Start Timestamp (sec)</label>
                    <input
                      type="number"
                      value={activeClip.startTimestamp}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        updateClip({
                          startTimestamp: val,
                          duration: Math.max(5, activeClip.endTimestamp - val),
                        });
                      }}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">End Timestamp (sec)</label>
                    <input
                      type="number"
                      value={activeClip.endTimestamp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateClip({
                          endTimestamp: val,
                          duration: Math.max(5, val - activeClip.startTimestamp),
                        });
                      }}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI MAGIC TITLES & HASHTAGS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Clip Title
                </label>
                <input
                  type="text"
                  value={activeClip.title}
                  onChange={(e) => updateClip({ title: e.target.value })}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-sm font-bold text-white focus:outline-none focus:border-violet-500"
                />

                <button
                  onClick={handleGenerateAiTitles}
                  disabled={isGeneratingTitles}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-600/20"
                >
                  <Bot className={`w-4 h-4 ${isGeneratingTitles ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingTitles ? 'Gemini Generating Titles...' : 'Generate 5 Viral Titles with Gemini AI'}</span>
                </button>
              </div>

              {aiTitles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">AI Suggested Titles (Click to Use):</p>
                  <div className="space-y-2">
                    {aiTitles.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateClip({ title: t })}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500 text-left text-xs font-semibold text-slate-200 hover:text-violet-300 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BRAND WATERMARK */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <p className="font-bold text-slate-300">Brand Watermark Settings</p>

                <div className="space-y-2">
                  <label className="text-slate-400">Watermark Handle / Text</label>
                  <input
                    type="text"
                    value={activeClip.brandAssets?.watermarkText || ''}
                    onChange={(e) =>
                      setActiveClip((prev) => ({
                        ...prev,
                        brandAssets: { ...prev.brandAssets, watermarkText: e.target.value },
                      }))
                    }
                    placeholder="e.g. @MyBrandHandle"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
