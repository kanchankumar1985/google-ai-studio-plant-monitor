import React from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Leaf, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export const PlantHealthCard: React.FC = () => {
  const { latestReading, latestSnapshot, pumpState } = usePlantMonitor();

  const leafCondition = latestSnapshot?.vlm_analysis?.leaf_health || 'healthy';
  const isYellowLeafAlert = leafCondition === 'yellowing';

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 font-mono">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#00ff41]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Plant Health & Chlorosis Diagnostic</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase ${
          isYellowLeafAlert
            ? 'bg-[#2a1a10] text-[#ff4e00] border-[#ff4e0044]'
            : 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30'
        }`}>
          {isYellowLeafAlert ? 'CHLOROSIS DETECTED' : 'VIBRANT FOLIAGE'}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        
        {/* Health Diagnostic Banner */}
        <div className={`p-3 border flex items-start gap-2.5 ${
          isYellowLeafAlert
            ? 'bg-[#2a1a10] border-[#ff4e0044] text-[#ff4e00]'
            : 'bg-[#121214] border-[#2a2a2e] text-[#e0e0e0]'
        }`}>
          {isYellowLeafAlert ? (
            <AlertCircle className="w-4 h-4 text-[#ff4e00] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#00ff41] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-xs text-white uppercase">
              {isYellowLeafAlert ? 'PUMP_ON_YELLOW_LEAVES Command Armed' : 'Optimal Growth Parameters'}
            </div>
            <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">
              {isYellowLeafAlert
                ? 'Computer vision detected chlorotic leaf margin. Touch sensor confirmation will trigger automatic 2.0s nutrient pulse.'
                : 'Foliage reflectance and HDC302x ambient humidity confirm optimal transpiration rate.'}
            </p>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#1c1c1e]">
          <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase tracking-wider">Vapor Pressure (VPD)</div>
            <div className="text-base font-bold text-white mt-1 font-mono">
              {latestReading?.vpd_kpa ?? 1.12} kPa
            </div>
            <div className="text-[9px] text-[#00ff41] mt-0.5 uppercase">HEALTHY (0.8 - 1.2 kPa)</div>
          </div>

          <div className="bg-[#1a1a1d] p-2.5 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase tracking-wider">Total Water Delivered</div>
            <div className="text-base font-bold text-[#00ff41] mt-1 font-mono">
              {pumpState.totalWaterPumpedMl} ml
            </div>
            <div className="text-[9px] text-[#888] mt-0.5 uppercase">{pumpState.totalRunCount} PULSE CYCLES</div>
          </div>
        </div>

        {/* Irrigation Safety Lock */}
        <div className="p-2.5 bg-[#121214] border border-[#2a2a2e] flex items-center justify-between text-[10px]">
          <span className="text-[#666] flex items-center gap-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00ff41]" />
            Hardware Lockout:
          </span>
          <span className="font-mono text-white">
            {pumpState.cooldownActive
              ? `ENGAGED (${pumpState.remainingCooldownSec}s remaining)`
              : 'DISARMED (Ready)'}
          </span>
        </div>

      </div>
    </div>
  );
};
