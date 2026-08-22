import React from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Bot, Cpu, Zap, Clock } from 'lucide-react';

export const AIStatusCard: React.FC = () => {
  const { health, minYoloConfidence, enableFrameValidation, snapshots, isWorkflowRunning, activeWorkflowStep } = usePlantMonitor();

  const queuedJobs = snapshots.filter(s => s.analysis_status === 'queued' || s.analysis_status === 'processing').length;
  const completedJobs = snapshots.filter(s => s.analysis_status === 'completed').length;

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 font-mono">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#00ff41]" />
          AI Models & Inference Status
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-[#1a1a1d] text-[#00ff41] border border-[#00ff41]/40 font-bold uppercase">
          Ollama + Ultralytics
        </span>
      </div>

      <div className="space-y-3 text-xs">
        
        {/* YOLOv8 Status */}
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
              <Zap className="w-3.5 h-3.5 text-[#ff4e00]" />
              YOLOv8n Person Detector
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 font-bold">
              ACTIVE / ~45ms
            </span>
          </div>
          <p className="text-[#888] text-[10px] uppercase">
            Model: <span className="text-white">{health.yolo_model}</span> &bull; COCO:0 Person Filter
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#666] mt-2 pt-2 border-t border-[#2a2a2e]">
            <span>CONFIDENCE GATE: <strong className="text-white">{(minYoloConfidence * 100).toFixed(0)}%</strong></span>
            <span>FRAME GUARD: <strong className={enableFrameValidation ? 'text-[#00ff41]' : 'text-[#666]'}>{enableFrameValidation ? 'ACTIVE' : 'DISABLED'}</strong></span>
          </div>
        </div>

        {/* Ollama LLaVA Status */}
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-[#00ff41]" />
              Ollama VLM (Vision Language)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#1c1c1e] text-[#888] border border-[#2a2a2e] font-bold">
              PORT 11434
            </span>
          </div>
          <p className="text-[#888] text-[10px] uppercase">
            Model: <span className="text-white">{health.ollama_model}</span> &bull; Temp: <span className="text-white">0.1 STRICT JSON</span>
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#666] mt-2 pt-2 border-t border-[#2a2a2e]">
            <span>WORKER POLLING: <strong className="text-white">15s</strong></span>
            <span>JOBS: <strong className="text-[#00ff41]">{completedJobs} OK</strong> ({queuedJobs} QUEUED)</span>
          </div>
        </div>

        {/* Real-Time Processing Status */}
        <div className="p-2.5 bg-[#121214] border border-[#2a2a2e] flex items-center justify-between text-[10px]">
          <span className="text-[#666] flex items-center gap-1.5 uppercase">
            <Clock className="w-3.5 h-3.5 text-[#00ff41]" />
            Pipeline Stage:
          </span>
          <span className="font-mono text-white">
            {isWorkflowRunning ? (
              <span className="text-[#ff4e00] font-bold animate-pulse">
                STEP {activeWorkflowStep}/5 IN PROGRESS
              </span>
            ) : (
              <span className="text-[#00ff41] font-bold">IDLE / READY</span>
            )}
          </span>
        </div>

      </div>
    </div>
  );
};
