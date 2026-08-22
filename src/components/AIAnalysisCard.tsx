import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Sparkles, CheckCircle2, XCircle, FileCode2, Eye } from 'lucide-react';

export const AIAnalysisCard: React.FC = () => {
  const { latestSnapshot } = usePlantMonitor();
  const [showJson, setShowJson] = useState(false);

  if (!latestSnapshot) {
    return (
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 text-center py-10 font-mono">
        <Sparkles className="w-8 h-8 text-[#666] mx-auto mb-2" />
        <p className="text-xs text-[#888] uppercase tracking-wider">No snapshot analysis available yet.</p>
        <p className="text-[10px] text-[#555] uppercase mt-1">Trigger a pot touch or test scenario to run VLM.</p>
      </div>
    );
  }

  const vlm = latestSnapshot.vlm_analysis;

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 font-mono">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00ff41]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Latest VLM Image Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className="text-[10px] px-2 py-0.5 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-white flex items-center gap-1 border border-[#2a2a2e] uppercase transition"
          >
            <FileCode2 className="w-3 h-3 text-[#00ff41]" />
            {showJson ? 'FORMATTED' : 'RAW JSON'}
          </button>
          <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase ${
            latestSnapshot.analysis_status === 'completed'
              ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30'
              : 'bg-[#2a1a10] text-[#ff4e00] border-[#ff4e0044] animate-pulse'
          }`}>
            {latestSnapshot.analysis_status}
          </span>
        </div>
      </div>

      {showJson ? (
        <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] font-mono text-[11px] text-[#00ff41] overflow-x-auto max-h-56">
          <pre>{JSON.stringify(vlm || { status: latestSnapshot.analysis_status }, null, 2)}</pre>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          
          {/* Summary Quote Box */}
          <div className="bg-[#121214] border border-[#2a2a2e] p-3 text-[#e0e0e0]">
            <div className="text-[10px] font-bold text-[#00ff41] mb-1 flex items-center gap-1.5 uppercase">
              <Eye className="w-3.5 h-3.5" />
              Vision Summary (Ollama LLaVA 7B)
            </div>
            <p className="text-[11px] text-[#ccc] leading-relaxed">
              "{vlm?.summary || 'Analysis in progress...'}"
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#1c1c1e]">
            <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
              <div className="text-[#666] text-[9px] uppercase tracking-wider">Person Present</div>
              <div className="font-bold text-white mt-1 flex items-center gap-1 text-[11px]">
                {vlm?.person_present ? (
                  <span className="text-[#00ff41] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> YES ({vlm.person_count})
                  </span>
                ) : (
                  <span className="text-[#666] flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-[#555]" /> NO
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
              <div className="text-[#666] text-[9px] uppercase tracking-wider">Position</div>
              <div className="font-bold text-white mt-1 uppercase text-[11px]">
                {vlm?.position || 'UNKNOWN'}
              </div>
            </div>

            <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
              <div className="text-[#666] text-[9px] uppercase tracking-wider">Quality</div>
              <div className="font-bold text-white mt-1 uppercase text-[11px]">
                <span className={vlm?.image_quality === 'good' ? 'text-[#00ff41]' : 'text-[#ff4e00]'}>
                  {vlm?.image_quality || 'GOOD'}
                </span>
              </div>
            </div>

            <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
              <div className="text-[#666] text-[9px] uppercase tracking-wider">Leaf State</div>
              <div className="font-bold text-white mt-1 uppercase text-[11px]">
                <span className={vlm?.leaf_health === 'healthy' ? 'text-[#00ff41]' : 'text-[#ff4e00]'}>
                  {vlm?.leaf_health || 'HEALTHY'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          {vlm?.suggested_action && (
            <div className="p-2.5 bg-[#1a1a1d] border border-[#2a2a2e] flex items-center justify-between text-[10px]">
              <span className="text-[#666] uppercase">Recommendation:</span>
              <span className="font-bold text-[#00ff41]">{vlm.suggested_action}</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
