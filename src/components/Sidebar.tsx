import React from 'react';
import {
  Sparkles,
  Upload,
  Film,
  Scissors,
  LayoutDashboard,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
} from 'lucide-react';

export type NavTab = 'upload' | 'clips' | 'editor' | 'dashboard' | 'brandkit' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  clipsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  clipsCount = 0,
}) => {
  const navItems = [
    {
      id: 'upload' as NavTab,
      label: 'Upload & Process',
      icon: Upload,
      description: 'Upload video or use sample',
    },
    {
      id: 'clips' as NavTab,
      label: 'AI Clips Gallery',
      icon: Film,
      badge: clipsCount > 0 ? `${clipsCount}` : undefined,
      description: 'View generated short clips',
    },
    {
      id: 'editor' as NavTab,
      label: 'AI Clip Studio',
      icon: Scissors,
      description: 'Reframe, captions & edit',
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard & History',
      icon: LayoutDashboard,
      description: 'Projects & exports',
    },
    {
      id: 'brandkit' as NavTab,
      label: 'Brand Kits',
      icon: Palette,
      description: 'Saved logos & caption styles',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen bg-slate-950 border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div
          onClick={() => onTabChange('upload')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                OpusClip <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Shorts Generator
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Workspace
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white shadow-md shadow-violet-500/15 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 text-left truncate">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-[11px] font-extrabold bg-fuchsia-500/20 text-fuchsia-300 rounded-full border border-fuchsia-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-400 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* AI Usage / Credits Meter */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>AI Processing Credits</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-violet-400">850 / 1000m</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full w-[85%] rounded-full" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Pro Plan
              </span>
              <button
                onClick={() => onTabChange('settings')}
                className="hover:text-slate-200 underline"
              >
                Upgrade
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2 rounded-xl bg-slate-900 text-amber-400" title="850 / 1000 AI Credits">
            <Zap className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Bottom Settings Link */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};
