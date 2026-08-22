import React, { useState } from 'react';
import {
  GitMerge,
  Cpu,
  Terminal,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileText,
  Workflow,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export const ArchitectureExplorer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'30_steps' | 'sequence' | 'false_positive' | 'state_machine' | 'risk_analysis'>('30_steps');
  const [searchTerm, setSearchTerm] = useState('');

  const thirtySteps = [
    { num: 1, component: 'Keyes Touch Sensor', file: 'Hardware', func: 'Capacitive touch', desc: 'Finger touches Keyes sensor on plant pot; output goes HIGH' },
    { num: 2, component: 'ESP32 Firmware', file: 'touch_sensor_led_pump_unified.ino', func: 'handleTouchSensor()', desc: 'digitalRead(GPIO4) returns HIGH' },
    { num: 3, component: 'ESP32 Firmware', file: 'touch_sensor_led_pump_unified.ino', func: 'handleTouchSensor()', desc: '50ms software debounce — state must remain stable before firing' },
    { num: 4, component: 'ESP32 Firmware', file: 'touch_sensor_led_pump_unified.ino', func: 'Serial.println()', desc: 'Sends "TOUCHED\\n" over USB Serial @ 115200 baud' },
    { num: 5, component: 'Python Listener', file: 'serial_unified_listener.py', func: 'main_loop()', desc: 'ser.readline() matches line == "TOUCHED"' },
    { num: 6, component: 'TimescaleDB Insert', file: 'serial_unified_listener.py', func: 'insert_touch_event()', desc: 'INSERT INTO touch_events (device_id, state)' },
    { num: 7, component: 'Python Listener', file: 'serial_unified_listener.py', func: 'orchestrator.set_serial_port()', desc: 'Shares open serial port handle with orchestrator for pump command' },
    { num: 8, component: 'Touch Orchestrator', file: 'services/touch_workflow.py', func: 'handle_touch_event()', desc: 'Calls module singleton TouchWorkflowOrchestrator' },
    { num: 9, component: 'macOS TTS Voice', file: 'services/tts_service.py', func: 'speak_touch_event()', desc: 'Status set to "triggered", executes macOS say "Sensor touched"' },
    { num: 10, component: 'Background Thread', file: 'services/touch_workflow.py', func: 'threading.Thread()', desc: 'Spawns daemon thread running _run_workflow() asynchronously' },
    { num: 11, component: 'Snapshot Capture', file: 'capture_snapshot.py', func: 'capture_webcam_image()', desc: '_capture_snapshot() calls OpenCV VideoCapture(0)' },
    { num: 12, component: 'Webcam Hardware', file: 'capture_snapshot.py', func: 'cap.read()', desc: 'Grabs single JPEG frame from USB webcam' },
    { num: 13, component: 'SD Card Storage', file: 'capture_snapshot.py', func: 'cv2.imwrite()', desc: 'Writes plant_YYYYMMDD_HHMMSS.jpg to /Volumes/SD-128GB/PlantMonitor/images/' },
    { num: 14, component: 'Video Alert Capture', file: 'capture_video.py', func: 'record_video_alert()', desc: '_record_video() records 30 frames at 10.0 FPS (3.0s duration)' },
    { num: 15, component: 'FFmpeg Transcode', file: 'capture_video.py', func: 'ffmpeg transcode', desc: 'Converts raw OpenCV AVI to alert_YYYYMMDD_HHMMSS.mp4' },
    { num: 16, component: 'YOLO Detector', file: 'detect_person.py', func: 'process_image_for_person_detection()', desc: 'Loads image from disk for YOLOv8n inference' },
    { num: 17, component: 'Ultralytics Model', file: 'detect_person.py', func: 'YOLO("yolov8n.pt")', desc: 'Inference runs; filters detections where class_id == 0 (COCO person)' },
    { num: 18, component: 'Person Evaluation', file: 'detect_person.py', func: 'detect_people()', desc: 'person_detected = True if len(person_detections) > 0' },
    { num: 19, component: 'Pump Decision Gate', file: 'services/touch_workflow.py', func: '_run_yolo()', desc: 'Checks self.status.person_detected and self.serial_port' },
    { num: 20, component: 'Pump Trigger Method', file: 'services/touch_workflow.py', func: '_trigger_pump()', desc: 'Attempts serial write (up to 6 retries with 0.5s backoff)' },
    { num: 21, component: 'Serial Write', file: 'services/touch_workflow.py', func: 'port.write()', desc: 'Sends b"PUMP_ON_YELLOW_LEAVES\\n" over USB to ESP32' },
    { num: 22, component: 'ESP32 Serial Parse', file: 'touch_sensor_led_pump_unified.ino', func: 'loop()', desc: 'Serial.readStringUntil(\'\\n\') matches "PUMP_ON_YELLOW_LEAVES"' },
    { num: 23, component: 'ESP32 Hardware Cooldown', file: 'touch_sensor_led_pump_unified.ino', func: 'loop()', desc: 'Verifies !pumpRunning && (millis() - lastPumpRunTime >= 60000)' },
    { num: 24, component: 'Pump Motor ON', file: 'touch_sensor_led_pump_unified.ino', func: 'runPump()', desc: 'digitalWrite(GPIO5, HIGH) -> MOSFET gate HIGH, pump runs' },
    { num: 25, component: 'Blue LED ON', file: 'touch_sensor_led_pump_unified.ino', func: 'runPump()', desc: 'digitalWrite(GPIO19, HIGH) illuminates pump indicator LED' },
    { num: 26, component: 'ESP32 Millis Timer', file: 'touch_sensor_led_pump_unified.ino', func: 'runPump()', desc: 'pumpStartTime = millis() records start timestamp' },
    { num: 27, component: 'ESP32 2000ms Auto-Stop', file: 'touch_sensor_led_pump_unified.ino', func: 'loop()', desc: 'millis() - pumpStartTime >= 2000ms triggers stopPump()' },
    { num: 28, component: 'Pump Motor OFF', file: 'touch_sensor_led_pump_unified.ino', func: 'stopPump()', desc: 'digitalWrite(GPIO5, LOW) and GPIO19 LOW; 60s cooldown timer starts' },
    { num: 29, component: 'TimescaleDB Snapshot', file: 'services/touch_workflow.py', func: '_save_to_database()', desc: 'INSERT INTO plant_snapshots with analysis_status=\'queued\'' },
    { num: 30, component: 'Ollama VLM Worker', file: 'vlm_worker.py', func: 'main_loop()', desc: 'Worker claims queued row, POSTs to localhost:11434 Ollama llava:7b -> updates image_analysis' }
  ];

  const filteredSteps = thirtySteps.filter(s =>
    s.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.func.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Section Nav Bar */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">System Architecture &amp; Technical Reference</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Verified from actual source code inspection across ESP32, Python backend, and TimescaleDB
            </p>
          </div>

          {/* Section Toggle Pills */}
          <div className="flex items-center bg-[#0a0a0b] p-1 border border-[#2a2a2e] overflow-x-auto no-scrollbar gap-1 text-[10px] uppercase font-bold">
            <button
              onClick={() => setActiveSection('30_steps')}
              className={`px-3 py-1 transition whitespace-nowrap ${
                activeSection === '30_steps' ? 'bg-[#00ff41] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              30-Step Trace Table
            </button>
            <button
              onClick={() => setActiveSection('sequence')}
              className={`px-3 py-1 transition whitespace-nowrap ${
                activeSection === 'sequence' ? 'bg-[#00ff41] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              Sequence Diagram
            </button>
            <button
              onClick={() => setActiveSection('false_positive')}
              className={`px-3 py-1 transition whitespace-nowrap ${
                activeSection === 'false_positive' ? 'bg-[#ff4e00] text-white' : 'text-[#888] hover:text-white'
              }`}
            >
              False-Positive Root Cause
            </button>
            <button
              onClick={() => setActiveSection('state_machine')}
              className={`px-3 py-1 transition whitespace-nowrap ${
                activeSection === 'state_machine' ? 'bg-[#00ff41] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              State Machines
            </button>
            <button
              onClick={() => setActiveSection('risk_analysis')}
              className={`px-3 py-1 transition whitespace-nowrap ${
                activeSection === 'risk_analysis' ? 'bg-[#00ff41] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              Architecture Risks
            </button>
          </div>
        </div>

        {/* Section 1: 30-Step Execution Trace Table */}
        {activeSection === '30_steps' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px]">
              <div className="text-[#888] uppercase">
                End-to-End Execution Trace: <span className="text-[#00ff41] font-bold">30 Sequential Steps</span> from Pot Touch to VLM Output
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#666]" />
                <input
                  type="text"
                  placeholder="FILTER 30 STEPS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#2a2a2e] pl-8 pr-3 py-1 text-[10px] uppercase font-mono text-white focus:outline-none focus:border-[#00ff41]"
                />
              </div>
            </div>

            <div className="border border-[#2a2a2e] overflow-hidden bg-[#0a0a0b] max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-[#121214] text-[#666] uppercase text-[9px] sticky top-0 border-b border-[#2a2a2e] z-10">
                  <tr>
                    <th className="py-2 px-3 w-14">#</th>
                    <th className="py-2 px-3 w-40">Component</th>
                    <th className="py-2 px-3 w-56">File &amp; Function</th>
                    <th className="py-2 px-3">Exact Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e] text-[#ccc]">
                  {filteredSteps.map((step) => (
                    <tr key={step.num} className="hover:bg-[#1a1a1d] transition">
                      <td className="py-2 px-3 font-mono text-[#00ff41] font-bold text-[10px]">
                        {String(step.num).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3 font-bold uppercase text-white">
                        {step.component}
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-[#aaa]">
                        <div className="truncate">{step.func}</div>
                        <div className="text-[9px] text-[#666] truncate">{step.file}</div>
                      </td>
                      <td className="py-2 px-3 text-[#ccc] text-[10px] leading-relaxed">
                        {step.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Interactive Sequence Diagram */}
        {activeSection === 'sequence' && (
          <div className="space-y-3 text-xs">
            <div className="bg-[#0a0a0b] p-4 border border-[#2a2a2e] font-mono text-[10px] text-[#00ff41] overflow-x-auto leading-relaxed">
              <pre>{`User         ESP32 (touch_sensor)   serial_listener.py     touch_workflow.py     detect_person.py     TimescaleDB        vlm_worker.py
 │                   │                      │                     │                    │                   │                   │
 ├──Touch pot───────►│ (GPIO4 HIGH)         │                     │                    │                   │                   │
 │                   ├──50ms debounce──────►│                     │                    │                   │                   │
 │                   ├──Serial "TOUCHED"───►│                     │                    │                   │                   │
 │                   │                      ├──insert_touch_event─────────────────────────────────────────►│ (status recorded)│
 │                   │                      ├──handle_touch_event()───────────────────►│                   │                   │
 │                   │                      │                     ├──macOS TTS voice──►│                   │                   │
 │                   │                      │                     ├──capture snapshot─►│ (plant_*.jpg)     │                   │
 │                   │                      │                     ├──record 3s video──►│ (alert_*.mp4)     │                   │
 │                   │                      │                     ├──run YOLOv8n──────────────────────────►│                   │
 │                   │                      │                     │                    ├──person_conf=88%─►│                   │
 │                   │                      │                     │◄──person_detected──┘                   │                   │
 │                   │◄──PUMP_ON_YELLOW_LEAVES────────────────────┤ [Step 4: PUMP FIRES]                   │                   │
 │                   ├──runPump(GPIO5 HIGH) │                     │                                        │                   │
 │                   ├──pump runs 2000ms    │                     │                                        │                   │
 │                   ├──stopPump(GPIO5 LOW) │                     │                                        │                   │
 │                   ├──60s cooldown lock   │                     │                                        │                   │
 │                   │                      │                     ├──INSERT plant_snapshots (queued)──────►│                   │
 │                   │                      │                     │                                        │◄──poll 15s────────┤
 │                   │                      │                     │                                        ├──claim job (LOCK)─┤
 │                   │                      │                     │                                        ├──Ollama LLaVA 7B──┤
 │                   │                      │                     │                                        ├──UPDATE completed─┤`}</pre>
            </div>
            <div className="p-3 bg-[#121214] border border-[#2a2a2e] text-[#ccc] text-[10px] leading-relaxed uppercase">
              <strong className="text-[#00ff41]">Critical Architectural Insight:</strong> The Peristaltic Pump is controlled in real-time by YOLOv8n (&lt;50ms latency) via USB serial. Ollama LLaVA runs asynchronously in the background as a heavy diagnostic worker (1.8s - 3.5s latency) and does NOT block or delay the pump.
            </div>
          </div>
        )}

        {/* Section 3: Camera-Covered False-Positive Root Cause */}
        {activeSection === 'false_positive' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#121214] border border-[#ff4e00] text-[#ccc]">
              <div className="flex items-center gap-2 text-[#ff4e00] font-bold text-xs uppercase mb-1">
                <AlertTriangle className="w-4 h-4" />
                Root Cause Analysis: Why the Pump Fired with a Covered Camera
              </div>
              <p className="text-[#aaa] text-[10px] uppercase leading-relaxed">
                When a user covers the camera lens with a hand, a dark, blurry, skin-toned frame fills the entire camera FOV. In unhardened code, YOLOv8n (trained on COCO dataset where body parts/skin belong to class 0) assigned a low ~25%-35% confidence to this blob. Because the original code used <code className="text-white font-mono">len(person_detections) &gt; 0</code> without a minimum confidence threshold or optical brightness check, the pump erroneously turned on!
              </p>
            </div>

            {/* Code Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Problem Code */}
              <div className="bg-[#0a0a0b] p-3 border border-[#ff4e00]/60">
                <div className="text-[#ff4e00] font-bold text-[10px] uppercase mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ORIGINAL CODE (Problem)
                </div>
                <pre className="font-mono text-[10px] text-[#ccc] leading-relaxed bg-[#121214] p-3 border border-[#2a2a2e] overflow-x-auto">
{`# detect_person.py
results = YOLO('yolov8n.pt')(image_path)
for result in results:
  for box in result.boxes:
    if int(box.cls[0]) == 0:
      person_detections.append({...})

# ❌ BUG: No minimum confidence gate!
# Any detection >= 0.25 triggers pump!
metadata = {
  'person_detected': len(person_detections) > 0
}`}
                </pre>
              </div>

              {/* Fixed Code */}
              <div className="bg-[#0a0a0b] p-3 border border-[#00ff41]/60">
                <div className="text-[#00ff41] font-bold text-[10px] uppercase mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RECOMMENDED FIX (Applied in Testbench)
                </div>
                <pre className="font-mono text-[10px] text-[#00ff41] leading-relaxed bg-[#121214] p-3 border border-[#2a2a2e] overflow-x-auto">
{`# 1. Optical Frame Validation Pre-Check
def validate_frame(image_path):
  img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
  if np.mean(img) < 30: return False, "too_dark"
  if np.std(img) < 15:  return False, "no_detail"
  return True, "ok"

# 2. Strict 60% Minimum Confidence Gate
MIN_CONF = 0.60
high_conf = [d for d in person_detections if d['conf'] >= MIN_CONF]
person_detected = len(high_conf) > 0`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: State Machines */}
        {activeSection === 'state_machine' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* ESP32 Firmware State Machine */}
              <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] font-mono text-[10px]">
                <div className="text-white font-bold text-[10px] uppercase mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00ff41]" />
                  ESP32 Firmware State Machine
                </div>
                <pre className="text-[#ccc] leading-relaxed">
{`[TOUCH STATE]
IDLE 
  ──GPIO4 HIGH──► DEBOUNCING 
  ──50ms stable──► SENT("TOUCHED") 
  ──► IDLE

[PUMP STATE]
PUMP_IDLE 
  ──"PUMP_ON_YELLOW_LEAVES" + !running + cooldown_ok──► PUMP_RUNNING (GPIO5 HIGH)
PUMP_RUNNING 
  ──millis() - startTime >= 2000ms──► PUMP_IDLE (GPIO5 LOW + 60s cooldown)`}
                </pre>
              </div>

              {/* Python Backend & VLM State Machine */}
              <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] font-mono text-[10px]">
                <div className="text-white font-bold text-[10px] uppercase mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00ff41]" />
                  Backend Workflow &amp; VLM Worker
                </div>
                <pre className="text-[#ccc] leading-relaxed">
{`[ORCHESTRATOR WORKFLOW]
IDLE ──"TOUCHED"──► TRIGGERED (TTS say)
  ──► CAPTURE_SNAPSHOT (cv2)
  ──► RECORD_VIDEO (3s @ 10fps)
  ──► RUN_YOLO (validate + detect)
      ├─ person=True ──► PUMP_ON (Serial)
      └─ person=False ──► PUMP_OFF
  ──► QUEUE_VLM ──► DB_SAVED ──► IDLE

[VLM WORKER (Background)]
POLLING(15s) ──queued job──► CLAIM(SKIP LOCKED)
  ──► ANALYZE(Ollama LLaVA 7B)
  ──► UPDATE_DB(completed) ──► POLLING`}
                </pre>
              </div>

            </div>
          </div>
        )}

        {/* Section 5: Architecture Risks Breakdown */}
        {activeSection === 'risk_analysis' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div className="p-3 bg-[#0a0a0b] border border-[#ff4e00]/60">
                <div className="text-[#ff4e00] font-bold text-[10px] uppercase mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#ff4e00]"></span>
                  Critical: Optical Image Pre-check Missing
                </div>
                <p className="text-[#888] text-[9px] uppercase leading-relaxed">
                  Covered camera produces dark frame. Add <code className="text-white">validate_frame()</code> checking <code className="text-white">mean_brightness &gt; 30</code> and <code className="text-white">std_dev &gt; 15</code> before YOLO.
                </p>
              </div>

              <div className="p-3 bg-[#0a0a0b] border border-[#ff4e00]/60">
                <div className="text-[#ff4e00] font-bold text-[10px] uppercase mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#ff4e00]"></span>
                  Critical: No Minimum Confidence Threshold
                </div>
                <p className="text-[#888] text-[9px] uppercase leading-relaxed">
                  Raw COCO detections &ge; 0.25 trigger pump. Require <code className="text-white">MIN_CONFIDENCE = 0.60</code> on bounding box scores.
                </p>
              </div>

              <div className="p-3 bg-[#0a0a0b] border border-[#2a2a2e]">
                <div className="text-white font-bold text-[10px] uppercase mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#ff4e00]"></span>
                  High: Serial Port Read/Write Concurrency
                </div>
                <p className="text-[#888] text-[9px] uppercase leading-relaxed">
                  Shared serial port across listener and pump write threads. Guard writes with <code className="text-white">threading.Lock()</code>.
                </p>
              </div>

              <div className="p-3 bg-[#0a0a0b] border border-[#00ff41]/60">
                <div className="text-[#00ff41] font-bold text-[10px] uppercase mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00ff41]"></span>
                  Hardware Safeguard: ESP32 Cooldown Timer
                </div>
                <p className="text-[#888] text-[9px] uppercase leading-relaxed">
                  ESP32 firmware independently enforces <code className="text-white">60,000ms</code> hardware cooldown and auto-shuts pump at <code className="text-white">2000ms</code> even if backend crashes!
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
