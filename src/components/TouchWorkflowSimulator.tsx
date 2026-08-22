import React, { useState, useRef } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { sampleImageScenarios } from '../mockData';
import {
  Zap,
  Camera,
  Film,
  Eye,
  Droplets,
  Database,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const TouchWorkflowSimulator: React.FC = () => {
  const {
    triggerTouchEvent,
    isWorkflowRunning,
    activeWorkflowStep,
    workflowMessage,
    selectedScenarioId,
    setSelectedScenarioId,
    minYoloConfidence,
    setMinYoloConfidence,
    enableFrameValidation,
    setEnableFrameValidation,
    pumpState,
    snapshots
  } = usePlantMonitor();

  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeScenario =
    sampleImageScenarios.find((s) => s.id === selectedScenarioId) || sampleImageScenarios[0];

  const handleStartWebcam = async () => {
    try {
      setUseWebcam(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
      }
    } catch (err) {
      console.error('Camera access error', err);
      alert('Camera access was not granted or not available in this browser environment. Using simulation presets.');
      setUseWebcam(false);
    }
  };

  const handleStopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    setUseWebcam(false);
  };

  const steps = [
    {
      num: 1,
      title: 'Snapshot Capture',
      subtitle: 'capture_snapshot.py',
      desc: 'cv2.VideoCapture(0) grabs frame plant_*.jpg (85% JPEG quality)',
      icon: Camera
    },
    {
      num: 2,
      title: '3s Video Alert',
      subtitle: 'capture_video.py',
      desc: 'OpenCV writes 30 frames at 10 FPS -> ffmpeg encodes alert_*.mp4',
      icon: Film
    },
    {
      num: 3,
      title: 'YOLOv8 Detection',
      subtitle: 'detect_person.py',
      desc: 'Inference with yolov8n.pt -> COCO class 0 (person) + Frame validation pre-check',
      icon: Eye
    },
    {
      num: 4,
      title: 'Pump Command',
      subtitle: 'touch_workflow.py',
      desc: 'PUMP_ON_YELLOW_LEAVES\\n sent via USB Serial -> ESP32 GPIO5 HIGH (2s)',
      icon: Droplets
    },
    {
      num: 5,
      title: 'VLM Async Queue',
      subtitle: 'vlm_worker.py',
      desc: 'Ollama LLaVA 7B extracts structured JSON diagnosis into TimescaleDB',
      icon: Database
    }
  ];

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Banner & Scenario Switcher */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Touch-Triggered Autonomous Pump Pipeline</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Simulate or execute the full hardware-to-AI pipeline from ESP32 capacitive touch to YOLO detection & peristaltic irrigation
            </p>
          </div>

          {/* Trigger Button & Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerTouchEvent()}
              disabled={isWorkflowRunning}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition border ${
                isWorkflowRunning
                  ? 'bg-[#2a1a10] text-[#ff4e00] border-[#ff4e0044] cursor-wait animate-pulse'
                  : 'bg-[#00ff41] hover:bg-[#00ff41]/90 text-black border-[#00ff41]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {isWorkflowRunning ? `EXECUTING STEP ${activeWorkflowStep}/5...` : 'TOUCH POT & RUN WORKFLOW'}
            </button>
          </div>
        </div>

        {/* 5-Step Pipeline Breadcrumb / Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-1 p-1 bg-[#1c1c1e] mb-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeWorkflowStep === step.num;
            const isPast = activeWorkflowStep > step.num;

            return (
              <div
                key={step.num}
                className={`p-3 border transition relative ${
                  isCurrent
                    ? 'bg-[#0f0f11] border-[#00ff41] text-white'
                    : isPast
                    ? 'bg-[#1a1a1d] border-[#2a2a2e] text-[#ccc]'
                    : 'bg-[#121214] border-[#2a2a2e] text-[#666]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 font-bold uppercase border ${
                    isCurrent
                      ? 'bg-[#00ff41] text-black border-[#00ff41]'
                      : isPast
                      ? 'bg-[#2a2a2e] text-[#00ff41] border-[#00ff41]/30'
                      : 'bg-[#1a1a1d] text-[#666] border-[#2a2a2e]'
                  }`}>
                    STEP 0{step.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#00ff41] animate-bounce' : isPast ? 'text-[#00ff41]' : 'text-[#555]'}`} />
                </div>
                <div className="font-bold text-xs text-white uppercase truncate">{step.title}</div>
                <div className="text-[9px] font-mono text-[#00ff41] mb-1 uppercase">{step.subtitle}</div>
                <div className="text-[10px] text-[#888] line-clamp-2 leading-tight">{step.desc}</div>

                {isCurrent && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00ff41] animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Pipeline Status Message */}
        <div className="p-2.5 bg-[#0a0a0b] border border-[#2a2a2e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isWorkflowRunning ? 'bg-[#ff4e00] animate-ping' : 'bg-[#00ff41]'}`}></span>
            <span className="text-white font-mono text-[11px] uppercase">{workflowMessage}</span>
          </div>
          <div className="text-[10px] font-mono text-[#666] hidden sm:block uppercase">
            Lock: threading.Lock() &bull; Cooldown: {pumpState.remainingCooldownSec}s
          </div>
        </div>
      </div>

      {/* Main Simulation Bench: Camera Feed, Scenario Chooser & Architecture Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 7 cols: Scenario Test Matrix & Visual Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#00ff41]" />
                Optical Feed & Test Scenarios
              </h3>
              <div className="flex items-center gap-2">
                {!useWebcam ? (
                  <button
                    onClick={handleStartWebcam}
                    className="text-[10px] uppercase font-bold px-2.5 py-1 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-white border border-[#2a2a2e] transition"
                  >
                    Enable Real Webcam
                  </button>
                ) : (
                  <button
                    onClick={handleStopWebcam}
                    className="text-[10px] uppercase font-bold px-2.5 py-1 bg-[#2a1a10] text-[#ff4e00] border border-[#ff4e0044] transition"
                  >
                    Disconnect Webcam
                  </button>
                )}
              </div>
            </div>

            {/* Visual Frame Stage */}
            <div className="relative overflow-hidden aspect-video bg-[#000000] border border-[#2a2a2e] mb-4 flex items-center justify-center">
              {useWebcam && (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              )}

              {!useWebcam && (
                <div className={`w-full h-full bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center transition-all duration-300`}>
                  {activeScenario.type === 'covered' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-[#1a1a1d] border border-[#ff4e0044] flex items-center justify-center text-[#ff4e00] mb-3">
                        <AlertTriangle className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <div className="text-white font-bold text-xs uppercase">Camera Lens Covered / Obstructed</div>
                      <p className="text-[10px] text-[#888] max-w-sm mt-1 uppercase font-mono">
                        Mean brightness: {activeScenario.brightness} (&lt; 30) &bull; StdDev: {activeScenario.stdDev} (&lt; 15)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-[#1a1a1d] border border-[#2a2a2e] flex items-center justify-center text-[#00ff41] mb-3">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="text-white font-bold text-xs uppercase">{activeScenario.name}</div>
                      <p className="text-[10px] text-[#888] max-w-sm mt-1 leading-relaxed">{activeScenario.description}</p>
                    </div>
                  )}

                  {/* YOLO Bounding Box overlay */}
                  {activeScenario.yoloConfidence > 0 && (
                    <div className="absolute inset-x-12 inset-y-8 border-2 border-[#00ff41] bg-[#00ff41]/10 flex items-start justify-between p-2 pointer-events-none">
                      <span className="bg-[#00ff41] text-black font-mono font-bold text-[9px] px-1.5 py-0.2 uppercase shadow">
                        PERSON: {(activeScenario.yoloConfidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] text-[#00ff41] font-mono bg-black/80 px-1.5 py-0.5 border border-[#00ff41]/40">
                        YOLOv8n Class:0
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Badge */}
              <div className="absolute top-2.5 left-2.5 bg-[#0a0a0b]/90 border border-[#2a2a2e] px-2 py-0.5 text-[9px] font-mono text-[#e0e0e0] flex items-center gap-1.5 uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse"></span>
                {useWebcam ? 'LIVE WEBCAM' : 'PRESET OPTICAL MATRIX'}
              </div>
            </div>

            {/* Scenario Chooser Radios */}
            <div className="space-y-2 text-xs">
              <label className="text-[#666] font-bold text-[10px] uppercase block mb-1">
                Select Scenario to Evaluate Against Pipeline:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1 bg-[#1c1c1e]">
                {sampleImageScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-2.5 border text-left transition flex flex-col justify-between ${
                      selectedScenarioId === sc.id
                        ? 'bg-[#0f0f11] border-[#00ff41] text-white'
                        : 'bg-[#1a1a1d] border-[#2a2a2e] text-[#ccc] hover:bg-[#2a2a2e]'
                    }`}
                  >
                    <div className="font-bold text-xs text-white uppercase">{sc.name}</div>
                    <div className="text-[10px] text-[#888] mt-1 line-clamp-2 leading-tight">{sc.description}</div>
                    <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[#666] pt-1 border-t border-[#2a2a2e]">
                      <span>CONF: {(sc.yoloConfidence * 100).toFixed(0)}%</span>
                      <span className={sc.isValid ? 'text-[#00ff41] font-bold' : 'text-[#ff4e00] font-bold'}>
                        {sc.isValid ? 'VALID FRAME' : 'COVERED TEST'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right 5 cols: Architectural Safety Guards & Hardware Cooldown */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Architecture Guard Settings (The Recommended Fixes from Docs) */}
          <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00ff41]" />
                Architecture Safety Guards
              </h3>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30">
                Fix 1 &amp; Fix 2
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Fix 1: Optical Frame Validation */}
              <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-xs uppercase">
                      Fix 1: Frame Optical Validation
                    </div>
                    <p className="text-[10px] text-[#888] mt-0.5 leading-relaxed">
                      Checks <code className="text-[#00ff41] font-mono">brightness &gt;= 30</code> &amp; <code className="text-[#00ff41] font-mono">std_dev &gt;= 15</code> before calling YOLO.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="chk-frame-val"
                    checked={enableFrameValidation}
                    onChange={(e) => setEnableFrameValidation(e.target.checked)}
                    className="w-4 h-4 rounded-none text-[#00ff41] focus:ring-0 focus:outline-none accent-[#00ff41] cursor-pointer mt-0.5"
                  />
                </div>
                <div className="text-[9px] text-[#666] mt-2 uppercase">
                  Prevents camera-covered hand false-positives from firing the pump.
                </div>
              </div>

              {/* Fix 2: Minimum YOLO Confidence Slider */}
              <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs uppercase">
                    Fix 2: Min Confidence Threshold
                  </span>
                  <span className="font-mono text-[#00ff41] font-bold text-xs">
                    {(minYoloConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.95"
                  step="0.05"
                  value={minYoloConfidence}
                  onChange={(e) => setMinYoloConfidence(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#2a2a2e] rounded-none appearance-none cursor-pointer accent-[#00ff41]"
                />
                <div className="flex justify-between text-[9px] text-[#666] font-mono mt-1 uppercase">
                  <span>20% (Raw YOLO)</span>
                  <span className="text-[#00ff41] font-bold">60% (Recommended)</span>
                  <span>95% (Strict)</span>
                </div>
              </div>

              {/* Cooldown Status & Hardware Timer */}
              <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#00ff41]" />
                    ESP32 Pump Hardware Lock
                  </span>
                  <span className="text-[9px] font-mono text-[#888]">GPIO5</span>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 bg-[#1c1c1e] text-[10px] font-mono">
                  <div className="bg-[#1a1a1d] p-2 border border-[#2a2a2e]">
                    <div className="text-[#666] text-[9px] uppercase">Run Duration</div>
                    <div className="text-white font-bold text-sm mt-0.5 font-mono">2000 ms</div>
                  </div>
                  <div className="bg-[#1a1a1d] p-2 border border-[#2a2a2e]">
                    <div className="text-[#666] text-[9px] uppercase">Hardware Cooldown</div>
                    <div className={`font-bold text-sm mt-0.5 font-mono ${pumpState.cooldownActive ? 'text-[#ff4e00]' : 'text-[#00ff41]'}`}>
                      {pumpState.cooldownActive ? `${pumpState.remainingCooldownSec}s left` : '0s (Ready)'}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-[#666] mt-2 uppercase">
                  Protected on ESP32 firmware in <code className="text-white">touch_sensor_led_pump_unified.ino</code>.
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
