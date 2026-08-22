import React from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import {
  Sprout,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Droplets,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldCheck,
  Flame,
  Terminal
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    health,
    pumpState,
    isLiveTicking,
    setIsLiveTicking,
    triggerTouchEvent,
    manualPumpTrigger,
    emergencyStopPump,
    resetAllData,
    isWorkflowRunning,
    activeWorkflowStep
  } = usePlantMonitor();

  return (
    <header className="bg-[#121214] border-b border-[#2a2a2e] text-[#e0e0e0] sticky top-0 z-40 px-4 lg:px-6 py-3 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Brand & Telemetry Pulse */}
        <div className="flex items-center gap-3.5">
          <div className="w-3 h-3 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] shrink-0 animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-white uppercase flex items-center font-mono">
                🌱 PlantMonitor.io
                <span className="font-normal text-[#666] ml-2 text-[10px] font-mono tracking-normal border border-[#2a2a2e] px-1.5 py-0.5 bg-[#1a1a1d]">
                  v2.4.0-STABLE
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-[#888] font-mono uppercase tracking-wider flex items-center gap-2 mt-0.5">
              <span>ESP32-WROOM-32</span>
              <span className="text-[#444]">&bull;</span>
              <span>HDC302x I2C</span>
              <span className="text-[#444]">&bull;</span>
              <span className="text-[#00ff41]">Ollama LLaVA 7B + YOLOv8</span>
            </p>
          </div>
        </div>

        {/* Center: System Status Badges in Technical Monospace Grid */}
        <div className="hidden xl:flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-[#888]">
          {/* Serial Port */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#666]">ESP32:</span>
            <span className="text-[#00ff41]">CONNECTED (tty.usbserial)</span>
          </div>

          {/* Database */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#666]">DB:</span>
            <span className="text-[#00ff41]">SYNCED (TimescaleDB :5433)</span>
          </div>

          {/* SD Card Storage */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#666]">SD-128GB:</span>
            <span className="text-white">{health.sd_card_free_gb}GB FREE</span>
          </div>

          {/* Pump Status Indicator */}
          <div>
            <span className="text-[#666]">PUMP: </span>
            {pumpState.isRunning ? (
              <span className="text-[#00ff41] bg-[#00ff41]/10 px-1.5 py-0.5 border border-[#00ff41]/40 animate-pulse font-bold">
                ON (2.0s ACTIVE)
              </span>
            ) : pumpState.cooldownActive ? (
              <span className="text-[#ff4e00] bg-[#2a1a10] px-1.5 py-0.5 border border-[#ff4e0044]">
                COOLDOWN ({pumpState.remainingCooldownSec}s)
              </span>
            ) : (
              <span className="text-[#555]">STANDBY (GPIO5)</span>
            )}
          </div>
        </div>

        {/* Right: Interactive Trigger Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end font-mono">
          {/* Simulate Touch Sensor */}
          <button
            id="btn-trigger-touch"
            onClick={() => triggerTouchEvent()}
            disabled={isWorkflowRunning}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition border ${
              isWorkflowRunning
                ? 'bg-[#2a1a10] text-[#ff4e00] border-[#ff4e00] shadow-[0_0_10px_#ff4e00] cursor-wait'
                : 'bg-[#ff4e00]/20 hover:bg-[#ff4e00]/30 text-[#ff4e00] border-[#ff4e00]/60 hover:border-[#ff4e00]'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            {isWorkflowRunning ? `STEP ${activeWorkflowStep}/5 PROCESSING` : 'TOUCH SENSOR (GPIO4)'}
          </button>

          {/* Direct Water Pump Button */}
          <button
            id="btn-manual-pump"
            onClick={() => manualPumpTrigger('Manual Caregiver Action')}
            disabled={pumpState.isRunning || pumpState.cooldownActive}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition border ${
              pumpState.isRunning
                ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_8px_#00ff41]'
                : pumpState.cooldownActive
                ? 'bg-[#1a1a1d] text-[#444] border-[#2a2a2e] cursor-not-allowed'
                : 'bg-[#1a1a1d] hover:bg-[#2a2a2e] text-[#00ff41] border-[#2a2a2e] hover:border-[#00ff41]/50'
            }`}
            title={pumpState.cooldownActive ? `Hardware cooldown: ${pumpState.remainingCooldownSec}s left` : 'Trigger 2000ms pump run'}
          >
            <Droplets className="w-3 h-3 text-[#00ff41]" />
            WATER (2s)
          </button>

          {/* Emergency Stop if running */}
          {pumpState.isRunning && (
            <button
              id="btn-emergency-stop"
              onClick={emergencyStopPump}
              className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-600 flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"
              title="Emergency shutdown pump"
            >
              <AlertCircle className="w-3 h-3" />
              ABORT
            </button>
          )}

          {/* Pause / Resume Live Telemetry */}
          <button
            id="btn-toggle-telemetry"
            onClick={() => setIsLiveTicking(!isLiveTicking)}
            className="p-1.5 bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-[#888] hover:text-white transition"
            title={isLiveTicking ? 'Pause simulated telemetry' : 'Resume live telemetry'}
          >
            {isLiveTicking ? <Pause className="w-3.5 h-3.5 text-[#ff4e00]" /> : <Play className="w-3.5 h-3.5 text-[#00ff41]" />}
          </button>

          {/* Reset Baseline */}
          <button
            id="btn-reset-data"
            onClick={resetAllData}
            className="p-1.5 bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-[#666] hover:text-white transition"
            title="Reset telemetry & logs to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
