import React from 'react';
import {
  Video,
  Film,
  Zap,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  FileCheck,
  Plus,
} from 'lucide-react';
import { VideoProject, ExportJob } from '../types';

interface DashboardProps {
  projects: VideoProject[];
  exports: ExportJob[];
  onSelectProject: (proj: VideoProject) => void;
  onNewUpload: () => void;
  onDownloadExport: (exp: ExportJob) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  exports,
  onSelectProject,
  onNewUpload,
  onDownloadExport,
}) => {
  const totalClips = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
  const totalMinutes = Math.round(projects.reduce((acc, p) => acc + p.duration, 0) / 60);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Dashboard & Activity</h1>
          <p className="text-xs text-slate-400">
            Manage uploaded videos, generated short clips, and exported MP4 files.
          </p>
        </div>

        <button
          onClick={onNewUpload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Video</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Uploaded Videos</span>
            <Video className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{projects.length}</p>
          <p className="text-[10px] text-slate-500">{totalMinutes} minutes processed</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Clips Generated</span>
            <Film className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{totalClips}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">+100% viral algorithm ready</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Avg Viral Index</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">95.4 / 100</p>
          <p className="text-[10px] text-slate-500">Peak hook retention rate</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Exports Completed</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{exports.length}</p>
          <p className="text-[10px] text-slate-500">1080p & 4K MP4 downloads</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Video className="w-4 h-4 text-violet-400" />
            Uploaded Video Projects ({projects.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Project / Title</th>
                <th className="py-3 px-2">Duration</th>
                <th className="py-3 px-2">Viral Clips</th>
                <th className="py-3 px-2">Upload Date</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        className="w-12 h-9 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="truncate max-w-xs">
                        <p className="font-extrabold text-white truncate">{proj.title}</p>
                        <p className="text-[10px] text-slate-400">{proj.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 font-mono font-semibold">{proj.duration}s</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 font-extrabold border border-violet-500/30">
                      {proj.clips?.length || 0} Clips
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-400">{proj.uploadDate}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onSelectProject(proj)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Open Clips</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export History Table */}
      {exports.length > 0 && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Recent Export History ({exports.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Clip Title</th>
                  <th className="py-3 px-2">Resolution</th>
                  <th className="py-3 px-2">FPS</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {exports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-2 font-bold text-white truncate max-w-xs">{exp.clipTitle}</td>
                    <td className="py-3 px-2 font-mono text-amber-400">{exp.resolution}</td>
                    <td className="py-3 px-2 font-mono">{exp.fps} FPS</td>
                    <td className="py-3 px-2 text-slate-400">{exp.createdAt}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onDownloadExport(exp)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download MP4</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
