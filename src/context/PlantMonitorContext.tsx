import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SensorReading,
  TouchEvent,
  PlantSnapshot,
  LogEntry,
  PumpState,
  SystemHealth,
  ESP32PinStatus,
  ActiveTab
} from '../types';
import {
  generateInitialReadings,
  initialTouchEvents,
  initialSnapshots,
  initialLogs,
  initialSystemHealth,
  esp32PinLayout,
  sampleImageScenarios
} from '../mockData';
import confetti from 'canvas-confetti';

interface PlantMonitorContextType {
  // State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  readings: SensorReading[];
  latestReading: SensorReading | null;
  touchEvents: TouchEvent[];
  snapshots: PlantSnapshot[];
  latestSnapshot: PlantSnapshot | null;
  logs: LogEntry[];
  pumpState: PumpState;
  health: SystemHealth;
  pins: ESP32PinStatus[];
  
  // Settings & Controls
  isLiveTicking: boolean;
  setIsLiveTicking: (v: boolean) => void;
  simSpeedMs: number;
  setSimSpeedMs: (ms: number) => void;
  minYoloConfidence: number;
  setMinYoloConfidence: (v: number) => void;
  enableFrameValidation: boolean;
  setEnableFrameValidation: (v: boolean) => void;
  selectedScenarioId: string;
  setSelectedScenarioId: (id: string) => void;
  isWorkflowRunning: boolean;
  activeWorkflowStep: number; // 0 (idle), 1 (snapshot), 2 (video), 3 (yolo), 4 (pump), 5 (vlm)
  workflowMessage: string;

  // Actions
  triggerTouchEvent: (scenarioIdOverride?: string, customImage?: string) => Promise<void>;
  manualPumpTrigger: (reason?: string) => void;
  emergencyStopPump: () => void;
  addLog: (level: LogEntry['level'], logger: LogEntry['logger'], message: string, file?: string, line?: number) => void;
  clearLogs: () => void;
  resetAllData: () => void;
}

const PlantMonitorContext = createContext<PlantMonitorContextType | undefined>(undefined);

export const PlantMonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [readings, setReadings] = useState<SensorReading[]>(generateInitialReadings);
  const [touchEvents, setTouchEvents] = useState<TouchEvent[]>(initialTouchEvents);
  const [snapshots, setSnapshots] = useState<PlantSnapshot[]>(initialSnapshots);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [pins, setPins] = useState<ESP32PinStatus[]>(esp32PinLayout);
  const [health, setHealth] = useState<SystemHealth>(initialSystemHealth);

  const [isLiveTicking, setIsLiveTicking] = useState<boolean>(true);
  const [simSpeedMs, setSimSpeedMs] = useState<number>(3000);
  const [minYoloConfidence, setMinYoloConfidence] = useState<number>(0.60);
  const [enableFrameValidation, setEnableFrameValidation] = useState<boolean>(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('person_present');
  
  const [isWorkflowRunning, setIsWorkflowRunning] = useState<boolean>(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [workflowMessage, setWorkflowMessage] = useState<string>('System Standby - Awaiting Touch or Sensor Poll');

  // Pump State Machine
  const [pumpState, setPumpState] = useState<PumpState>({
    isRunning: false,
    runDurationMs: 2000,
    startTime: null,
    lastRunTime: null,
    cooldownDurationMs: 60000,
    remainingRunSec: 0,
    remainingCooldownSec: 0,
    cooldownActive: false,
    currentReason: null,
    totalRunCount: 14,
    totalWaterPumpedMl: 700
  });

  const pumpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add logs cleanly
  const addLog = useCallback((
    level: LogEntry['level'],
    logger: LogEntry['logger'],
    message: string,
    file?: string,
    line?: number
  ) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    
    const newEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      level,
      logger,
      message,
      file,
      line
    };

    setLogs(prev => [newEntry, ...prev.slice(0, 499)]); // keep latest 500
  }, []);

  // Update ESP32 Pin Logic
  const updatePinState = useCallback((pinNumber: number, state: 'HIGH' | 'LOW' | 'ACTIVE') => {
    setPins(prev => prev.map(p => p.pin === pinNumber ? { ...p, state } : p));
  }, []);

  // Manual or Triggered Pump activation (ESP32 emulation)
  const executePumpOn = useCallback((reason: string) => {
    const now = Date.now();

    // Check hardware cooldown (ESP32 side logic)
    if (pumpState.isRunning) {
      addLog('WARNING', 'esp32', 'Command ignored: Pump already active in 2000ms run cycle', 'touch_sensor_led_pump_unified.ino', 84);
      return false;
    }

    if (pumpState.lastRunTime && (now - pumpState.lastRunTime) < pumpState.cooldownDurationMs) {
      const remainingCooldown = Math.ceil((pumpState.cooldownDurationMs - (now - pumpState.lastRunTime)) / 1000);
      addLog('WARNING', 'esp32', `Command blocked by hardware cooldown: ${remainingCooldown}s remaining`, 'touch_sensor_led_pump_unified.ino', 87);
      return false;
    }

    // Fire GPIO5 HIGH & GPIO19 HIGH
    updatePinState(5, 'HIGH');
    updatePinState(19, 'HIGH');

    setPumpState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now,
      remainingRunSec: 2.0,
      currentReason: reason,
      totalRunCount: prev.totalRunCount + 1,
      totalWaterPumpedMl: prev.totalWaterPumpedMl + 50
    }));

    addLog('INFO', 'esp32', `PUMP ON: digitalWrite(GPIO5, HIGH) -> 2000ms duration. Reason: ${reason}`, 'touch_sensor_led_pump_unified.ino', 98);
    addLog('INFO', 'esp32', 'LED ON: digitalWrite(GPIO19, HIGH)', 'touch_sensor_led_pump_unified.ino', 99);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });
    } catch {
      // ignore
    }

    // Clear any existing timer
    if (pumpTimerRef.current) clearTimeout(pumpTimerRef.current);

    // Auto-stop after 2000ms on ESP32
    pumpTimerRef.current = setTimeout(() => {
      updatePinState(5, 'LOW');
      updatePinState(19, 'LOW');
      const stopNow = Date.now();

      setPumpState(prev => ({
        ...prev,
        isRunning: false,
        lastRunTime: stopNow,
        remainingRunSec: 0,
        cooldownActive: true,
        remainingCooldownSec: 60,
        currentReason: null
      }));

      addLog('INFO', 'esp32', 'PUMP OFF: 2000ms timer elapsed -> digitalWrite(GPIO5, LOW), GPIO19 LOW. 60s cooldown initiated.', 'touch_sensor_led_pump_unified.ino', 115);
    }, 2000);

    return true;
  }, [pumpState, addLog, updatePinState]);

  // Emergency Stop Pump
  const emergencyStopPump = useCallback(() => {
    if (pumpTimerRef.current) clearTimeout(pumpTimerRef.current);
    updatePinState(5, 'LOW');
    updatePinState(19, 'LOW');
    setPumpState(prev => ({
      ...prev,
      isRunning: false,
      lastRunTime: Date.now(),
      remainingRunSec: 0,
      cooldownActive: true,
      remainingCooldownSec: 60,
      currentReason: null
    }));
    addLog('ERROR', 'esp32', 'EMERGENCY SHUTDOWN: GPIO5 forced LOW via user override', 'touch_sensor_led_pump_unified.ino', 130);
  }, [addLog, updatePinState]);

  // Tick Cooldown timers every 1s
  useEffect(() => {
    const timer = setInterval(() => {
      setPumpState(prev => {
        if (!prev.lastRunTime) return prev;
        const elapsed = Date.now() - prev.lastRunTime;
        if (elapsed >= prev.cooldownDurationMs) {
          if (prev.cooldownActive) {
            return {
              ...prev,
              cooldownActive: false,
              remainingCooldownSec: 0
            };
          }
          return prev;
        } else {
          return {
            ...prev,
            cooldownActive: true,
            remainingCooldownSec: Math.ceil((prev.cooldownDurationMs - elapsed) / 1000)
          };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Live Telemetry Generator (TimescaleDB simulator)
  useEffect(() => {
    if (!isLiveTicking) return;

    const interval = setInterval(() => {
      setReadings(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const hour = now.getHours();

        // Small realistic drift
        const tempDrift = (Math.random() - 0.49) * 0.15;
        const nextTemp = Number(Math.max(18, Math.min(35, last.temperature_c + tempDrift)).toFixed(1));

        const humDrift = (Math.random() - 0.5) * 0.4;
        const nextHum = Number(Math.max(30, Math.min(85, last.humidity_pct + humDrift)).toFixed(1));

        // Calculate VPD
        const svp = 0.61078 * Math.exp((17.27 * nextTemp) / (nextTemp + 237.3));
        const avp = svp * (nextHum / 100);
        const vpd = Number((svp - avp).toFixed(2));

        // Flash green LED
        updatePinState(18, 'HIGH');
        setTimeout(() => updatePinState(18, 'LOW'), 300);

        const newReading: SensorReading = {
          id: `sr_${Date.now()}`,
          time: now.toISOString(),
          device_id: 'ESP32_PLANT_01',
          temperature_c: nextTemp,
          humidity_pct: nextHum,
          led_state: hour >= 7 && hour <= 20 ? 'ON' : 'OFF',
          vpd_kpa: vpd,
          dew_point_c: Number((nextTemp - ((100 - nextHum) / 5)).toFixed(1))
        };

        return [...prev.slice(1), newReading];
      });

      // Periodic health tick log
      if (Math.random() > 0.65) {
        addLog('INFO', 'serial_reader', `✓ TimescaleDB hypertable insert: Temp=${readings[readings.length - 1]?.temperature_c}°C, Humidity=${readings[readings.length - 1]?.humidity_pct}%, Device=ESP32_PLANT_01`, 'serial_unified_listener.py', 144);
      }
    }, simSpeedMs);

    return () => clearInterval(interval);
  }, [isLiveTicking, simSpeedMs, addLog, updatePinState, readings]);

  // Full 5-Step Touch-to-Pump Flow Execution
  const triggerTouchEvent = useCallback(async (scenarioIdOverride?: string, customImage?: string) => {
    if (isWorkflowRunning) {
      addLog('WARNING', 'serial_reader', '⚠️ Duplicate touch event guard: Workflow already active — ignoring event', 'serial_unified_listener.py', 54);
      return;
    }

    const scenarioId = scenarioIdOverride || selectedScenarioId;
    const scenario = sampleImageScenarios.find(s => s.id === scenarioId) || sampleImageScenarios[0];

    setIsWorkflowRunning(true);
    setActiveWorkflowStep(1);
    setWorkflowMessage('Step 1/5: GPIO4 Touch Detected -> Capturing Webcam Snapshot');

    // Flash Amber Touch LED (GPIO23)
    updatePinState(23, 'HIGH');
    setTimeout(() => updatePinState(23, 'LOW'), 600);

    const now = new Date();
    const timestampStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const snapId = `snap_${Date.now()}`;

    // 1. Log Touch Event
    addLog('INFO', 'esp32', 'handleTouchSensor() triggered: GPIO4 HIGH (50ms debounce validated)', 'touch_sensor_led_pump_unified.ino', 42);
    addLog('INFO', 'serial_reader', 'Serial received: "TOUCHED" -> INSERT INTO touch_events (TimescaleDB)', 'serial_unified_listener.py', 112);
    addLog('INFO', 'touch_workflow', 'TouchWorkflowOrchestrator started -> macOS TTS: "Sensor touched"', 'touch_workflow.py', 58);

    const newTouchEvent: TouchEvent = {
      id: `te_${Date.now()}`,
      timestamp: now.toISOString(),
      device_id: 'ESP32_PLANT_01',
      state: 'TOUCHED',
      processed_by_workflow: true,
      pump_triggered: false // will be updated
    };
    setTouchEvents(prev => [newTouchEvent, ...prev]);

    // Step 1: Snapshot (capture_snapshot.py)
    await new Promise(r => setTimeout(r, 600));
    setActiveWorkflowStep(2);
    setWorkflowMessage('Step 2/5: Recording 3s Alert Video (OpenCV -> ffmpeg MP4)');
    addLog('INFO', 'camera', `cv2.VideoCapture(0) grabbed frame -> plant_${timestampStr}.jpg written to /Volumes/SD-128GB/PlantMonitor/images/`, 'capture_snapshot.py', 38);

    // Step 2: Video Recording (capture_video.py)
    await new Promise(r => setTimeout(r, 800));
    setActiveWorkflowStep(3);
    setWorkflowMessage('Step 3/5: Running YOLOv8 Person Detection (COCO Class 0)');
    addLog('INFO', 'camera', `OpenCV AVI -> ffmpeg MP4 conversion complete: alert_${timestampStr}.mp4 (3.0s, 10fps)`, 'capture_video.py', 82);

    // Step 3: YOLO Inference & Frame Validation
    await new Promise(r => setTimeout(r, 700));

    let frameValid = true;
    let validationStatus: PlantSnapshot['validation_status'] = 'ok';

    if (enableFrameValidation) {
      if (scenario.brightness < 30) {
        frameValid = false;
        validationStatus = 'too_dark';
        addLog('WARNING', 'touch_workflow', `[GUARD ACTIVE] validate_frame() FAILED: Mean brightness ${scenario.brightness} < 30 (Camera Covered / Darkness). YOLO inference aborted to prevent false-positive!`, 'touch_workflow.py', 94);
      } else if (scenario.stdDev < 15) {
        frameValid = false;
        validationStatus = 'no_detail';
        addLog('WARNING', 'touch_workflow', `[GUARD ACTIVE] validate_frame() FAILED: Low standard deviation ${scenario.stdDev} < 15 (Uniform / Obstructed frame).`, 'touch_workflow.py', 97);
      } else {
        addLog('INFO', 'touch_workflow', `[GUARD ACTIVE] validate_frame() PASSED: Brightness=${scenario.brightness}, StdDev=${scenario.stdDev} (Image valid)`, 'touch_workflow.py', 101);
      }
    } else {
      addLog('WARNING', 'touch_workflow', '[UNGUARDED MODE] No optical validation before YOLO. Running raw detector on frame...', 'touch_workflow.py', 105);
    }

    // YOLO detection logic
    let detectedPerson = false;
    let detections: PlantSnapshot['yolo_detections'] = [];

    if (frameValid || !enableFrameValidation) {
      // If frame validation was skipped or passed
      if (scenario.yoloConfidence > 0) {
        const meetsThreshold = scenario.yoloConfidence >= minYoloConfidence;
        if (meetsThreshold) {
          detectedPerson = true;
          detections = [
            {
              class_id: 0,
              class_name: 'person',
              confidence: scenario.yoloConfidence,
              bbox_xyxy: scenario.yoloBBox
            }
          ];
          addLog('INFO', 'touch_workflow', `YOLOv8n: Confirmed 1 person (Confidence: ${(scenario.yoloConfidence * 100).toFixed(1)}% >= ${(minYoloConfidence * 100)}% threshold)`, 'detect_person.py', 65);
        } else {
          addLog('WARNING', 'touch_workflow', `YOLOv8n: Detection confidence ${(scenario.yoloConfidence * 100).toFixed(1)}% is BELOW ${(minYoloConfidence * 100)}% threshold -> Discarded`, 'detect_person.py', 72);
        }
      } else {
        addLog('INFO', 'touch_workflow', 'YOLOv8n: No person objects detected in frame (0 boxes)', 'detect_person.py', 78);
      }
    }

    // Step 4: Pump Decision
    setActiveWorkflowStep(4);
    setWorkflowMessage('Step 4/5: Evaluating Pump Trigger Decision & Serial Command');
    await new Promise(r => setTimeout(r, 500));

    let pumpFired = false;
    let pumpReason = 'Pump OFF - No person detected';

    if (detectedPerson) {
      pumpReason = `PUMP_ON_YELLOW_LEAVES (Person confirmed at ${(scenario.yoloConfidence * 100).toFixed(0)}% confidence)`;
      addLog('INFO', 'touch_workflow', `Triggering Pump: Sending "PUMP_ON_YELLOW_LEAVES\\n" via USB Serial port /dev/cu.usbserial-0001`, 'touch_workflow.py', 188);
      pumpFired = executePumpOn(pumpReason);
    } else {
      addLog('INFO', 'touch_workflow', 'Pump decision: PUMP REMAINS OFF (safe default)', 'touch_workflow.py', 195);
    }

    // Update touch event with pump outcome
    setTouchEvents(prev => prev.map(te => te.id === newTouchEvent.id ? { ...te, pump_triggered: pumpFired } : te));

    // Step 5: VLM Background Worker Queuing
    setActiveWorkflowStep(5);
    setWorkflowMessage('Step 5/5: Background VLM Worker polling TimescaleDB -> Ollama LLaVA 7B Inference');
    addLog('INFO', 'touch_workflow', `INSERT INTO plant_snapshots with analysis_status='queued'`, 'touch_workflow.py', 210);

    const newSnapshot: PlantSnapshot = {
      id: snapId,
      timestamp: now.toISOString(),
      image_path: customImage || `/Volumes/SD-128GB/PlantMonitor/images/plant_${timestampStr}.jpg`,
      boxed_image_path: `/Volumes/SD-128GB/PlantMonitor/images/plant_${timestampStr}_boxed.jpg`,
      video_path: `/Volumes/SD-128GB/PlantMonitor/videos/alert_${timestampStr}.mp4`,
      device_id: 'ESP32_PLANT_01',
      trigger_source: 'TOUCH_EVENT',
      brightness_mean: scenario.brightness,
      std_dev: scenario.stdDev,
      is_valid_frame: frameValid,
      validation_status: validationStatus,
      yolo_detections: detections,
      person_detected: detectedPerson,
      pump_triggered: pumpFired,
      pump_trigger_reason: pumpReason,
      analysis_status: 'processing'
    };

    setSnapshots(prev => [newSnapshot, ...prev]);

    // Simulate Ollama VLM completion after short delay
    setTimeout(() => {
      addLog('INFO', 'vlm', `Ollama HTTP POST localhost:11434/api/generate {model: "llava:7b", format: "json"} -> Status 200 OK (1.82s)`, 'ollama_client.py', 62);
      addLog('INFO', 'vlm', `VLM Analysis JSON parsed: ${scenario.vlmSummary}`, 'vlm_analyzer.py', 140);
      addLog('INFO', 'vlm', `UPDATE plant_snapshots SET analysis_status='completed' & INSERT INTO image_analysis`, 'vlm_worker.py', 230);

      setSnapshots(prev => prev.map(s => {
        if (s.id === snapId) {
          return {
            ...s,
            analysis_status: 'completed',
            vlm_analysis: {
              person_present: detectedPerson,
              person_detected: detectedPerson,
              person_count: detectedPerson ? 1 : 0,
              position: detectedPerson ? 'center' : 'unknown',
              facing_camera: detectedPerson,
              image_quality: scenario.brightness < 30 ? 'dark' : 'good',
              summary: scenario.vlmSummary,
              leaf_health: scenario.type === 'yellow_leaves' ? 'yellowing' : 'healthy',
              moisture_assessment: pumpFired ? 'optimal' : 'optimal',
              suggested_action: pumpFired ? 'Water pulse delivered. Continue normal cycle.' : 'No intervention needed.'
            }
          };
        }
        return s;
      }));
    }, 1800);

    // End workflow state
    await new Promise(r => setTimeout(r, 600));
    setIsWorkflowRunning(false);
    setActiveWorkflowStep(0);
    setWorkflowMessage('Workflow Completed Successfully - System Ready');
  }, [
    isWorkflowRunning,
    selectedScenarioId,
    enableFrameValidation,
    minYoloConfidence,
    addLog,
    updatePinState,
    executePumpOn
  ]);

  const manualPumpTrigger = useCallback((reason = 'Manual UI Irrigation Trigger') => {
    executePumpOn(reason);
  }, [executePumpOn]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('INFO', 'app', 'Logs cleared from memory view (SD card persistence unaffected)', 'logging_config.py', 70);
  }, [addLog]);

  const resetAllData = useCallback(() => {
    setReadings(generateInitialReadings());
    setTouchEvents(initialTouchEvents);
    setSnapshots(initialSnapshots);
    setLogs(initialLogs);
    setPumpState({
      isRunning: false,
      runDurationMs: 2000,
      startTime: null,
      lastRunTime: null,
      cooldownDurationMs: 60000,
      remainingRunSec: 0,
      remainingCooldownSec: 0,
      cooldownActive: false,
      currentReason: null,
      totalRunCount: 14,
      totalWaterPumpedMl: 700
    });
    addLog('INFO', 'app', 'System state reset to baseline telemetry snapshot', 'app.py', 40);
  }, [addLog]);

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;

  return (
    <PlantMonitorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        readings,
        latestReading,
        touchEvents,
        snapshots,
        latestSnapshot,
        logs,
        pumpState,
        health,
        pins,
        isLiveTicking,
        setIsLiveTicking,
        simSpeedMs,
        setSimSpeedMs,
        minYoloConfidence,
        setMinYoloConfidence,
        enableFrameValidation,
        setEnableFrameValidation,
        selectedScenarioId,
        setSelectedScenarioId,
        isWorkflowRunning,
        activeWorkflowStep,
        workflowMessage,
        triggerTouchEvent,
        manualPumpTrigger,
        emergencyStopPump,
        addLog,
        clearLogs,
        resetAllData
      }}
    >
      {children}
    </PlantMonitorContext.Provider>
  );
};

export const usePlantMonitor = () => {
  const context = useContext(PlantMonitorContext);
  if (!context) {
    throw new Error('usePlantMonitor must be used within a PlantMonitorProvider');
  }
  return context;
};
