import React from 'react';
import { Sparkles, Plus, Bell, ChevronDown, Check, Video } from 'lucide-react';
import { VideoProject } from '../types';

interface HeaderProps {
  currentProject: VideoProject | null;
  allProjects: VideoProject[];
  onSelectProject: (proj: VideoProject) => void;
  onNewUpload: () => void;
  onOpenExportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  allProjects,
  onSelectProject,
  onNewUpload,
  onOpenExportModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Active Project Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Video className="w-4 h-4" />
          </div>
          <div className="flex flex-col max-w-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Active Project
            </span>
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">
              {currentProject ? currentProject.title : 'Select or Upload Video'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 divide-y divide-slate-800/60">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400">
              Select Video Project ({allProjects.length})
            </div>
            <div className="py-1 max-h-60 overflow-y-auto space-y-1">
              {allProjects.map((p) => {
                const isSelected = currentProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{p.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {p.clips?.length || 0} clips • {p.duration}s
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onNewUpload();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New Video</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Upload</span>
        </button>

        {currentProject && currentProject.clips.length > 0 && onOpenExportModal && (
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Quick Export</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-violet-500/50 object-cover"
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-white leading-tight">Alex Rivera</span>
            <span className="text-[10px] font-bold text-violet-400">Pro Creator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
