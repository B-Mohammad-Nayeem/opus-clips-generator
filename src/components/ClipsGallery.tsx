import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Download,
  Scissors,
  Flame,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Eye,
  Check,
  Zap,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { Clip, AspectRatio, VideoProject } from '../types';
import { VideoPlayerCanvas } from './VideoPlayerCanvas';

interface ClipsGalleryProps {
  project: VideoProject;
  onEditClip: (clip: Clip) => void;
  onExportClip: (clip: Clip) => void;
  onRefreshClips?: () => void;
}

export const ClipsGallery: React.FC<ClipsGalleryProps> = ({
  project,
  onEditClip,
  onExportClip,
}) => {
  const [clips, setClips] = useState<Clip[]>(project.clips || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [minViralScore, setMinViralScore] = useState<number>(80);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);
  const [captionsEnabledMap, setCaptionsEnabledMap] = useState<Record<string, boolean>>({});

  const toggleCaptions = (clipId: string) => {
    setCaptionsEnabledMap((prev) => ({
      ...prev,
      [clipId]: prev[clipId] === undefined ? false : !prev[clipId],
    }));
  };

  const categories = ['All', 'Controversial', 'Hook', 'Story', 'Insight', 'Laughter', 'Action'];
  const durations = ['All', '15s', '30s', '45s', '60s', '90s'];

  // Filter clips based on controls
  const filteredClips = clips.filter((clip) => {
    const matchesSearch =
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || clip.category === selectedCategory;

    const matchesDuration =
      selectedDuration === 'All' || clip.durationOption === selectedDuration;

    const matchesScore = clip.viralScore >= minViralScore;

    return matchesSearch && matchesCategory && matchesDuration && matchesScore;
  });

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    if (score >= 90) return 'text-violet-400 bg-violet-500/20 border-violet-500/40';
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Header Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Short Clips Gallery ({clips.length} Generated)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">{project.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            AI analyzed {project.duration}s video • Auto-reframed to 9:16 vertical • Kinetic captions ready
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-extrabold font-mono text-amber-400">
              {project.stats.avgViralScore || 94}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-400">Avg Viral Score</p>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-extrabold font-mono text-violet-400">
              {filteredClips.length}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-400">Clips Shown</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Duration, Score Slider, Aspect Toggle */}
      <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clip titles, keywords..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] px-2">Aspect:</span>
            {(['9:16', '1:1', '4:5', '16:9'] as AspectRatio[]).map((asp) => (
              <button
                key={asp}
                onClick={() => setAspectRatio(asp)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  aspectRatio === asp
                    ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {asp}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories & Score Slider Row */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between pt-2 border-t border-slate-800/80">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Viral Score Threshold Slider */}
          <div className="flex items-center gap-3 w-full md:w-auto text-xs font-semibold text-slate-400">
            <span>Viral Score &ge;</span>
            <input
              type="range"
              min={70}
              max={95}
              value={minViralScore}
              onChange={(e) => setMinViralScore(Number(e.target.value))}
              className="accent-violet-500 cursor-pointer w-28"
            />
            <span className="font-mono font-bold text-amber-400 w-6">{minViralScore}</span>
          </div>
        </div>
      </div>

      {/* Clips Display Grid / List */}
      {filteredClips.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Clips Matched Your Filter</h3>
          <p className="text-xs text-slate-400">Try lowering the viral score slider or clearing your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMinViralScore(70);
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredClips.map((clip) => {
            const isCaptionsOn = captionsEnabledMap[clip.id] !== false;
            const isTranscriptOpen = expandedTranscriptId === clip.id;

            return (
              <div
                key={clip.id}
                className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-xl group flex flex-col justify-between"
              >
                {/* Top Clip Info & Video Player Canvas */}
                <div className="space-y-4">
                  {/* Video Player Box */}
                  <div className="relative">
                    <VideoPlayerCanvas
                      clip={clip}
                      videoUrl={project.videoUrl}
                      showCaptions={isCaptionsOn}
                      aspectRatio={aspectRatio}
                      className="w-full mx-auto"
                    />

                    {/* Viral Score Badge */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 backdrop-blur-md shadow-lg ${getScoreColor(
                        clip.viralScore
                      )}`}
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{clip.viralScore} Viral Score</span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-violet-400" />
                      <span>{clip.duration}s</span>
                    </div>
                  </div>

                  {/* Title & Category Tag */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-wider border border-violet-500/20">
                        {clip.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {Math.floor(clip.startTimestamp / 60)}:
                        {String(Math.floor(clip.startTimestamp % 60)).padStart(2, '0')} -{' '}
                        {Math.floor(clip.endTimestamp / 60)}:
                        {String(Math.floor(clip.endTimestamp % 60)).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-violet-300 transition-colors">
                      {clip.title}
                    </h3>
                  </div>

                  {/* AI Explanation Box */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Why AI Selected This Clip:
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {clip.selectionReasoning}
                    </p>
                  </div>

                  {/* Hook & Engagement Score Mini Bars */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-400">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between mb-1">
                        <span>Hook Power</span>
                        <span className="text-violet-400 font-mono">{clip.hookScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full"
                          style={{ width: `${clip.hookScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between mb-1">
                        <span>Retention</span>
                        <span className="text-emerald-400 font-mono">{clip.engagementScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${clip.engagementScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Word Transcript Drawer */}
                  <div>
                    <button
                      onClick={() =>
                        setExpandedTranscriptId(isTranscriptOpen ? null : clip.id)
                      }
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                        Transcript ({clip.transcriptWords?.length || 0} words)
                      </span>
                      {isTranscriptOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isTranscriptOpen && (
                      <div className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-h-36 overflow-y-auto space-y-1">
                        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                          {clip.transcriptWords?.map((w, idx) => (
                            <span key={idx} className="mr-1 hover:text-amber-300">
                              {w.word}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleCaptions(clip.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                      isCaptionsOn
                        ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                    title="Toggle Kinetic Captions"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Captions {isCaptionsOn ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditClip(clip)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Scissors className="w-3.5 h-3.5 text-violet-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onExportClip(clip)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
