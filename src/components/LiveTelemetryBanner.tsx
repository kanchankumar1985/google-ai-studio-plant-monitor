import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import {
  Thermometer,
  Droplets,
  Zap,
  Power,
  ShieldAlert,
  Gauge,
  Sparkles
} from 'lucide-react';

export const LiveTelemetryBanner: React.FC = () => {
  const { latestReading, pumpState, touchEvents, readings } = usePlantMonitor();
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  if (!latestReading) return null;

  const tempDisplay = useFahrenheit
    ? ((latestReading.temperature_c * 9) / 5 + 32).toFixed(1)
    : latestReading.temperature_c.toFixed(1);
  const tempUnit = useFahrenheit ? '°F' : '°C';

  const isTouched = touchEvents.length > 0 && touchEvents[0].state === 'TOUCHED';
  const latestTouch = touchEvents.length > 0 ? touchEvents[0] : null;
  const touchTimeAgo = latestTouch
    ? Math.max(0, Math.floor((Date.now() - new Date(latestTouch.timestamp).getTime()) / 1000))
    : null;

  const temps = readings.slice(-10).map(r => r.temperature_c);
  const hums = readings.slice(-10).map(r => r.humidity_pct);
  const minTemp = temps.length ? Math.min(...temps).toFixed(1) : '21.0';
  const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : '28.5';
  const minHum = hums.length ? Math.min(...hums).toFixed(1) : '40.0';
  const maxHum = hums.length ? Math.max(...hums).toFixed(1) : '65.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 p-1 bg-[#1c1c1e] mb-6">
      
      {/* 1. HDC302x Temperature Card */}
      <div className="bg-[#0f0f11] p-5 border border-[#2a2a2e] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-1.5 font-mono">
              <Thermometer className="w-3.5 h-3.5 text-[#00ff41]" />
              Temperature (HDC302x)
            </span>
            <button
              onClick={() => setUseFahrenheit(!useFahrenheit)}
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-[#888] hover:text-white border border-[#2a2a2e] transition"
            >
              {useFahrenheit ? '°C' : '°F'}
            </button>
          </div>
          
          <div className="text-4xl lg:text-5xl font-mono text-white tracking-tight mb-1">
            {tempDisplay}
            <span className="text-2xl text-[#666] ml-1">{tempUnit}</span>
          </div>
        </div>

        {/* Sparkline Canvas / SVG */}
        <div className="w-full h-10 bg-[#1a1a1d] mt-3 relative overflow-hidden border border-[#2a2a2e]/60">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00ff41] opacity-20"></div>
          <svg viewBox="0 0 100 20" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
            <path
              d="M0 14 Q 15 8, 30 15 T 60 11 T 85 16 T 100 12"
              fill="none"
              stroke="#00ff41"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="flex justify-between mt-3 text-[10px] font-mono text-[#666] border-t border-[#2a2a2e] pt-2">
          <span>MIN {minTemp}{tempUnit}</span>
          <span>MAX {maxTemp}{tempUnit}</span>
        </div>
      </div>

      {/* 2. HDC302x Humidity Card */}
      <div className="bg-[#0f0f11] p-5 border border-[#2a2a2e] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-1.5 font-mono">
              <Droplets className="w-3.5 h-3.5 text-[#00ff41]" />
              Relative Humidity
            </span>
            <span className="text-[9px] font-mono text-[#00ff41] bg-[#00ff41]/10 px-1.5 py-0.5 border border-[#00ff41]/30">
              OPTIMAL
            </span>
          </div>

          <div className="text-4xl lg:text-5xl font-mono text-[#00ff41] tracking-tight mb-1">
            {latestReading.humidity_pct.toFixed(1)}
            <span className="text-2xl opacity-50 ml-1">%</span>
          </div>
        </div>

        {/* Sparkline Canvas / SVG */}
        <div className="w-full h-10 bg-[#1a1a1d] mt-3 relative overflow-hidden border border-[#2a2a2e]/60">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00ff41] opacity-20"></div>
          <svg viewBox="0 0 100 20" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M0 10 Q 20 16, 40 8 T 70 14 T 90 6 T 100 10"
              fill="none"
              stroke="#00ff41"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="flex justify-between mt-3 text-[10px] font-mono text-[#666] border-t border-[#2a2a2e] pt-2">
          <span>MIN {minHum}%</span>
          <span>VPD {latestReading.vpd_kpa ?? 1.12} kPa</span>
          <span>MAX {maxHum}%</span>
        </div>
      </div>

      {/* 3. GPIO4 Capacitive Touch Sensor */}
      <div className="bg-[#0f0f11] p-5 border border-[#2a2a2e] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-[#ff4e00]" />
              Touch Sensor
            </span>
            {isTouched ? (
              <div className="px-2 py-0.5 bg-[#2a1a10] text-[#ff4e00] text-[9px] font-bold font-mono border border-[#ff4e0044] animate-pulse">
                TOUCHED
              </div>
            ) : (
              <div className="px-2 py-0.5 bg-[#1a1a1d] text-[#666] text-[9px] font-bold font-mono border border-[#2a2a2e]">
                IDLE
              </div>
            )}
          </div>

          <div className="mt-1">
            <div className="text-2xl lg:text-3xl font-mono font-bold tracking-tight text-white mb-2">
              {isTouched ? (
                <span className="text-[#ff4e00] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff4e00] shadow-[0_0_10px_#ff4e00] animate-ping"></span>
                  ACTIVE (GPIO4)
                </span>
              ) : (
                <span className="text-[#888]">STANDBY</span>
              )}
            </div>

            {/* Neon Glow Bar */}
            <div className="h-2 bg-[#1a1a1d] overflow-hidden border border-[#2a2a2e] mt-4">
              <div
                className={`h-full transition-all duration-300 ${
                  isTouched
                    ? 'bg-[#ff4e00] w-full shadow-[0_0_10px_#ff4e00]'
                    : 'bg-[#00ff41] w-1/4 opacity-40'
                }`}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-3 text-[10px] font-mono text-[#666] border-t border-[#2a2a2e] pt-2">
          <span>{touchTimeAgo !== null ? `LAST: ${touchTimeAgo}s AGO` : 'NO EVENTS'}</span>
          <span className="text-[#888]">50ms DEBOUNCE</span>
        </div>
      </div>

      {/* 4. Peristaltic Pump & Hardware Lock (GPIO5) */}
      <div className="bg-[#0f0f11] p-5 border border-[#2a2a2e] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-1.5 font-mono">
              <Power className={`w-3.5 h-3.5 ${pumpState.isRunning ? 'text-[#00ff41]' : 'text-[#666]'}`} />
              Water Pump (GPIO5)
            </span>
            <div className={`px-2 py-0.5 text-[9px] font-bold font-mono border ${
              pumpState.isRunning
                ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41] animate-pulse'
                : pumpState.cooldownActive
                ? 'bg-[#2a1a10] text-[#ff4e00] border-[#ff4e0044]'
                : 'bg-[#1a1a1d] text-[#666] border-[#2a2a2e]'
            }`}>
              {pumpState.isRunning ? 'PUMPING 2.0s' : pumpState.cooldownActive ? 'COOLDOWN' : 'READY'}
            </div>
          </div>

          <div className="mt-1">
            <div className="text-2xl lg:text-3xl font-mono font-bold tracking-tight text-white mb-2">
              {pumpState.isRunning ? (
                <span className="text-[#00ff41] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse"></span>
                  PULSE ACTIVE
                </span>
              ) : pumpState.cooldownActive ? (
                <span className="text-[#ff4e00] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#ff4e00]" />
                  {pumpState.remainingCooldownSec}s REMAINING
                </span>
              ) : (
                <span className="text-white">STANDBY</span>
              )}
            </div>

            {/* Progress / Status Bar */}
            <div className="h-2 bg-[#1a1a1d] overflow-hidden border border-[#2a2a2e] mt-4">
              <div
                className={`h-full transition-all duration-300 ${
                  pumpState.isRunning
                    ? 'bg-[#00ff41] w-full shadow-[0_0_8px_#00ff41]'
                    : pumpState.cooldownActive
                    ? 'bg-[#ff4e00] w-1/2'
                    : 'bg-[#2a2a2e] w-0'
                }`}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-3 text-[10px] font-mono text-[#666] border-t border-[#2a2a2e] pt-2">
          <span>{pumpState.totalRunCount} TOTAL RUNS</span>
          <span className="text-white">{pumpState.totalWaterPumpedMl} ml DELIVERED</span>
        </div>
      </div>

    </div>
  );
};
