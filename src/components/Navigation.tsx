import React from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Zap,
  Eye,
  FileText,
  GitMerge,
  Cpu,
  Database,
  Code2
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, logs, snapshots, pumpState } = usePlantMonitor();

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { 
      id: 'touch_workflow', 
      label: 'Touch-to-Pump Flow', 
      badge: pumpState.isRunning ? 'RUNNING' : undefined,
      icon: Zap 
    },
    { 
      id: 'ai_vision', 
      label: 'AI Vision & VLM', 
      badge: `${snapshots.length}`, 
      icon: Eye 
    },
    { 
      id: 'logs', 
      label: 'LogsPanel', 
      badge: `${logs.length}`, 
      icon: FileText 
    },
    { id: 'architecture', label: 'Architecture & 30 Steps', icon: GitMerge },
    { id: 'hardware', label: 'ESP32 & Pinout', icon: Cpu },
    { id: 'timescaledb', label: 'TimescaleDB', icon: Database },
    { id: 'api_docs', label: 'REST API Console', icon: Code2 }
  ];

  return (
    <nav className="bg-[#121214] border-b border-[#2a2a2e] px-4 lg:px-6 sticky top-[53px] z-30 font-mono">
      <div className="max-w-[1600px] mx-auto flex items-center overflow-x-auto no-scrollbar gap-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#1a1a1d] text-[#00ff41] border-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.15)]'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1d] border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00ff41]' : 'text-[#666]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 font-mono font-bold ${
                    tab.badge === 'RUNNING'
                      ? 'bg-[#00ff41] text-black animate-pulse'
                      : isActive
                      ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/40'
                      : 'bg-[#1a1a1d] text-[#666] border border-[#2a2a2e]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
