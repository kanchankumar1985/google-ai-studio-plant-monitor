import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { PlantSnapshot } from '../types';
import {
  Eye,
  Sparkles,
  Bot,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Code2,
  Sliders
} from 'lucide-react';

export const AiVisionExplorer: React.FC = () => {
  const { snapshots, latestSnapshot } = usePlantMonitor();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    latestSnapshot ? latestSnapshot.id : snapshots[0]?.id || ''
  );
  const [showPromptModal, setShowPromptModal] = useState(false);

  const activeSnap =
    snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[0] || latestSnapshot;

  const ollamaPrompt = `Return ONLY valid JSON. Do not include any extra text.
{
  "person_present": true or false,
  "person_detected": true or false,
  "person_count": integer,
  "position": "left"|"center"|"right"|"unknown",
  "facing_camera": true or false,
  "image_quality": "good"|"poor"|"dark"|"blurry",
  "summary": "1 concise sentence about person presence and pose"
}
Rules:
- Output must be valid JSON only
- If no person visible, return person_present=false, person_count=0`;

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Banner */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">AI Vision &amp; Ollama LLaVA 7B Pipeline</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Dual-layer Computer Vision: Fast YOLOv8n hardware trigger + Asynchronous Ollama LLaVA diagnostic report
            </p>
          </div>
          <button
            onClick={() => setShowPromptModal(!showPromptModal)}
            className="text-[10px] uppercase font-bold px-3 py-1 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-white border border-[#2a2a2e] transition flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-[#00ff41]" />
            {showPromptModal ? 'HIDE OLLAMA PROMPT' : 'VIEW OLLAMA PROMPT'}
          </button>
        </div>

        {/* Prompt Card Dropdown */}
        {showPromptModal && (
          <div className="bg-[#0a0a0b] p-4 border border-[#2a2a2e] mb-4 text-xs">
            <div className="text-white font-bold text-xs uppercase mb-2 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#00ff41]" />
              PERSON_DETAILED_JSON_PROMPT (vlm/prompt_templates.py)
            </div>
            <pre className="bg-[#121214] p-3 font-mono text-[10px] text-[#00ff41] overflow-x-auto border border-[#2a2a2e]">
              {ollamaPrompt}
            </pre>
          </div>
        )}

        {/* Snapshot Selector Carousel & Active Inspector */}
        {activeSnap && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left 6 cols: Visual Frame & Detections */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative overflow-hidden aspect-video bg-[#000000] border border-[#2a2a2e] flex items-center justify-center">
                <div className={`w-full h-full bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center`}>
                  
                  <div className="w-14 h-14 bg-[#1a1a1d] border border-[#2a2a2e] flex items-center justify-center text-[#00ff41] mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-white font-bold text-xs uppercase truncate max-w-sm">
                    {activeSnap.image_path.split('/').pop()}
                  </div>
                  <div className="text-[9px] text-[#666] font-mono mt-0.5 uppercase">
                    Mean Brightness: {activeSnap.brightness_mean.toFixed(1)} &bull; StdDev: {activeSnap.std_dev.toFixed(1)}
                  </div>

                  {/* Bounding box */}
                  {activeSnap.person_detected && activeSnap.yolo_detections.length > 0 && (
                    <div className="absolute inset-x-12 inset-y-6 border-2 border-[#00ff41] bg-[#00ff41]/10 flex items-start justify-between p-1.5 pointer-events-none animate-pulse">
                      <span className="bg-[#00ff41] text-black font-mono font-bold text-[9px] px-1.5 py-0.2 uppercase shadow">
                        PERSON: {(activeSnap.yolo_detections[0].confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] text-[#00ff41] font-mono bg-black/80 px-1 border border-[#00ff41]/40">
                        YOLOv8n Class:0
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span className={`text-[9px] font-mono px-2 py-0.5 border font-bold uppercase ${
                    activeSnap.person_detected
                      ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30'
                      : 'bg-[#1a1a1d] text-[#666] border-[#2a2a2e]'
                  }`}>
                    {activeSnap.person_detected ? 'PERSON DETECTED' : 'NO PERSON'}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-[#1a1a1d] text-[#888] border border-[#2a2a2e]">
                    {new Date(activeSnap.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Snapshot History Thumbnails */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#666] uppercase">Archived Snapshots:</div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {snapshots.map((snap) => (
                    <button
                      key={snap.id}
                      onClick={() => setSelectedSnapshotId(snap.id)}
                      className={`p-2 border text-left shrink-0 w-36 transition text-xs ${
                        selectedSnapshotId === snap.id
                          ? 'bg-[#0f0f11] border-[#00ff41] text-white'
                          : 'bg-[#1a1a1d] border-[#2a2a2e] text-[#888] hover:bg-[#2a2a2e]'
                      }`}
                    >
                      <div className="font-mono text-[9px] truncate text-white">
                        {new Date(snap.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`text-[9px] font-bold uppercase mt-1 ${snap.person_detected ? 'text-[#00ff41]' : 'text-[#666]'}`}>
                        {snap.person_detected ? 'Person Found' : 'No Detection'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 6 cols: Deep Diagnostics */}
            <div className="lg:col-span-6 space-y-3 text-xs">
              
              {/* Snapshot Metadata Box */}
              <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] space-y-3">
                <div className="text-xs font-bold text-white uppercase flex items-center justify-between">
                  <span>Diagnostic Pipeline Report</span>
                  <span className="font-mono text-[10px] text-[#00ff41]">{activeSnap.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 bg-[#1c1c1e] text-[10px] font-mono">
                  <div className="bg-[#1a1a1d] p-2 border border-[#2a2a2e]">
                    <div className="text-[#666] text-[9px] uppercase">Optical Quality</div>
                    <div className={`font-bold mt-0.5 ${activeSnap.is_valid_frame ? 'text-[#00ff41]' : 'text-[#ff4e00]'}`}>
                      {activeSnap.validation_status.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-[#1a1a1d] p-2 border border-[#2a2a2e]">
                    <div className="text-[#666] text-[9px] uppercase">Pump Action</div>
                    <div className={`font-bold mt-0.5 ${activeSnap.pump_triggered ? 'text-[#00ff41]' : 'text-[#666]'}`}>
                      {activeSnap.pump_triggered ? 'PUMP ACTIVATED (2s)' : 'PUMP OFF'}
                    </div>
                  </div>
                </div>

                {/* VLM Detailed Findings */}
                {activeSnap.vlm_analysis && (
                  <div className="bg-[#121214] border border-[#2a2a2e] p-3 space-y-2">
                    <div className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00ff41]" />
                      Ollama LLaVA 7B Diagnosis:
                    </div>
                    <p className="text-[11px] text-[#ccc] italic leading-relaxed">
                      "{activeSnap.vlm_analysis.summary}"
                    </p>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] font-mono uppercase">
                      <div className="bg-[#1a1a1d] p-1.5 border border-[#2a2a2e] text-center">
                        <div className="text-[#666]">Pose</div>
                        <div className="text-white mt-0.5">{activeSnap.vlm_analysis.position}</div>
                      </div>
                      <div className="bg-[#1a1a1d] p-1.5 border border-[#2a2a2e] text-center">
                        <div className="text-[#666]">Facing</div>
                        <div className="text-white mt-0.5">{activeSnap.vlm_analysis.facing_camera ? 'YES' : 'NO'}</div>
                      </div>
                      <div className="bg-[#1a1a1d] p-1.5 border border-[#2a2a2e] text-center">
                        <div className="text-[#666]">Leaf Condition</div>
                        <div className="text-[#00ff41] font-bold mt-0.5">{activeSnap.vlm_analysis.leaf_health || 'HEALTHY'}</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
