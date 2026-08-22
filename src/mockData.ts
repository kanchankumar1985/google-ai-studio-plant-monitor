import { SensorReading, TouchEvent, PlantSnapshot, LogEntry, SystemHealth, ESP32PinStatus } from './types';

// Helper to generate realistic historical readings
export function generateInitialReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const count = 48; // 48 data points (every 30 mins over 24h)

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString();
    // Diurnal temperature curve (warmer at midday, cooler at night)
    const hour = new Date(timestamp).getHours();
    const tempBase = 22.5 + 3.8 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    const tempNoise = (Math.random() - 0.5) * 0.4;
    const temp = Number((tempBase + tempNoise).toFixed(1));

    // Humidity inverse relationship with temperature
    const humBase = 58 - 12 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    const humNoise = (Math.random() - 0.5) * 1.5;
    const hum = Number((humBase + humNoise).toFixed(1));

    // Dew point approx
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(hum / 100);
    const dewPoint = Number(((b * alpha) / (a - alpha)).toFixed(1));

    // VPD in kPa
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (hum / 100);
    const vpd = Number((svp - avp).toFixed(2));

    readings.push({
      id: `sr_${count - i}`,
      time: timestamp,
      device_id: 'ESP32_PLANT_01',
      temperature_c: temp,
      humidity_pct: hum,
      led_state: hour >= 7 && hour <= 20 ? 'ON' : 'OFF',
      vpd_kpa: vpd,
      dew_point_c: dewPoint
    });
  }

  return readings;
}

export const initialTouchEvents: TouchEvent[] = [
  {
    id: 'te_1',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    device_id: 'ESP32_PLANT_01',
    state: 'TOUCHED',
    processed_by_workflow: true,
    pump_triggered: true
  },
  {
    id: 'te_2',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    device_id: 'ESP32_PLANT_01',
    state: 'TOUCHED',
    processed_by_workflow: true,
    pump_triggered: false
  },
  {
    id: 'te_3',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    device_id: 'ESP32_PLANT_01',
    state: 'TOUCHED',
    processed_by_workflow: true,
    pump_triggered: true
  }
];

export const initialSnapshots: PlantSnapshot[] = [
  {
    id: 'snap_101',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_160412.jpg',
    boxed_image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_160412_boxed.jpg',
    video_path: '/Volumes/SD-128GB/PlantMonitor/videos/alert_20260821_160412.mp4',
    device_id: 'ESP32_PLANT_01',
    trigger_source: 'TOUCH_EVENT',
    brightness_mean: 114.2,
    std_dev: 48.6,
    is_valid_frame: true,
    validation_status: 'ok',
    yolo_detections: [
      {
        class_id: 0,
        class_name: 'person',
        confidence: 0.88,
        bbox_xyxy: [120, 60, 480, 520]
      }
    ],
    person_detected: true,
    pump_triggered: true,
    pump_trigger_reason: 'PUMP_ON_YELLOW_LEAVES (Person confirmed with 88% confidence)',
    analysis_status: 'completed',
    vlm_analysis: {
      person_present: true,
      person_detected: true,
      person_count: 1,
      position: 'center',
      facing_camera: true,
      image_quality: 'good',
      summary: 'Person standing directly in front of Monstera Deliciosa inspecting upper leaves.',
      leaf_health: 'healthy',
      moisture_assessment: 'optimal',
      suggested_action: 'Watering completed (2.0s pulse). Maintain ambient humidity above 55%.'
    }
  },
  {
    id: 'snap_102',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_153022.jpg',
    boxed_image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_153022_boxed.jpg',
    video_path: '/Volumes/SD-128GB/PlantMonitor/videos/alert_20260821_153022.mp4',
    device_id: 'ESP32_PLANT_01',
    trigger_source: 'TOUCH_EVENT',
    brightness_mean: 92.5,
    std_dev: 41.2,
    is_valid_frame: true,
    validation_status: 'ok',
    yolo_detections: [],
    person_detected: false,
    pump_triggered: false,
    pump_trigger_reason: 'Pump OFF - No person detected in frame',
    analysis_status: 'completed',
    vlm_analysis: {
      person_present: false,
      person_detected: false,
      person_count: 0,
      position: 'unknown',
      facing_camera: false,
      image_quality: 'good',
      summary: 'Plant pot visible in ambient room light with vibrant green foliage, no human subject present.',
      leaf_health: 'healthy',
      moisture_assessment: 'optimal',
      suggested_action: 'Standby mode. No irrigation requested.'
    }
  },
  {
    id: 'snap_103',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_131805.jpg',
    boxed_image_path: '/Volumes/SD-128GB/PlantMonitor/images/plant_20260821_131805_boxed.jpg',
    video_path: '/Volumes/SD-128GB/PlantMonitor/videos/alert_20260821_131805.mp4',
    device_id: 'ESP32_PLANT_01',
    trigger_source: 'TOUCH_EVENT',
    brightness_mean: 108.9,
    std_dev: 52.1,
    is_valid_frame: true,
    validation_status: 'ok',
    yolo_detections: [
      {
        class_id: 0,
        class_name: 'person',
        confidence: 0.76,
        bbox_xyxy: [240, 80, 590, 560]
      }
    ],
    person_detected: true,
    pump_triggered: true,
    pump_trigger_reason: 'PUMP_ON_YELLOW_LEAVES (Caregiver detected touching pot)',
    analysis_status: 'completed',
    vlm_analysis: {
      person_present: true,
      person_detected: true,
      person_count: 1,
      position: 'right',
      facing_camera: true,
      image_quality: 'good',
      summary: 'User interacting with lower sensor stalk, lower leaf shows slight tip yellowing.',
      leaf_health: 'yellowing',
      moisture_assessment: 'dry',
      suggested_action: 'Peristaltic pump activated for 2000ms. Keep scheduled checking.'
    }
  }
];

export const initialLogs: LogEntry[] = [
  {
    id: 'log_1',
    timestamp: '2026-08-21 16:17:42.112',
    level: 'INFO',
    logger: 'serial_reader',
    message: '✓ Inserted 23.8 °C, 56.4 % RH, LED: ON into sensor_readings hypertable',
    file: 'serial_unified_listener.py',
    line: 142
  },
  {
    id: 'log_2',
    timestamp: '2026-08-21 16:17:12.008',
    level: 'DEBUG',
    logger: 'serial_reader',
    message: 'Serial buffer read: {"device":"ESP32_PLANT_01","temp":23.8,"hum":56.4,"touch":0,"led":1}',
    file: 'serial_unified_listener.py',
    line: 98
  },
  {
    id: 'log_3',
    timestamp: '2026-08-21 16:15:30.942',
    level: 'INFO',
    logger: 'api',
    message: 'GET /api/readings/latest HTTP/1.1 - 200 OK (3.2ms)',
    file: 'app.py',
    line: 88
  },
  {
    id: 'log_4',
    timestamp: '2026-08-21 16:14:18.234',
    level: 'INFO',
    logger: 'vlm',
    message: 'VLM job #snap_101 completed in 3.42s using model llava:7b -> status: completed',
    file: 'vlm_worker.py',
    line: 184
  },
  {
    id: 'log_5',
    timestamp: '2026-08-21 16:14:14.810',
    level: 'INFO',
    logger: 'touch_workflow',
    message: 'YOLOv8n detected 1 person (conf: 0.88) -> Sending "PUMP_ON_YELLOW_LEAVES\\n" to USB Serial',
    file: 'touch_workflow.py',
    line: 165
  },
  {
    id: 'log_6',
    timestamp: '2026-08-21 16:14:14.820',
    level: 'INFO',
    logger: 'esp32',
    message: 'ESP32 command matched: PUMP_ON_YELLOW_LEAVES -> GPIO5 HIGH, GPIO19 HIGH (2000ms duration)',
    file: 'touch_sensor_led_pump_unified.ino',
    line: 88
  },
  {
    id: 'log_7',
    timestamp: '2026-08-21 16:14:16.825',
    level: 'INFO',
    logger: 'esp32',
    message: 'ESP32 2000ms timer expired -> GPIO5 LOW, GPIO19 LOW, 60s cooldown engaged',
    file: 'touch_sensor_led_pump_unified.ino',
    line: 112
  },
  {
    id: 'log_8',
    timestamp: '2026-08-21 16:14:12.440',
    level: 'INFO',
    logger: 'camera',
    message: 'Alert video recorded: 30 frames at 10.0 FPS -> alert_20260821_160412.mp4 (1.8MB)',
    file: 'capture_video.py',
    line: 67
  },
  {
    id: 'log_9',
    timestamp: '2026-08-21 16:14:09.110',
    level: 'INFO',
    logger: 'touch_workflow',
    message: 'TTS alert voiced via macOS say: "Sensor touched"',
    file: 'tts_service.py',
    line: 24
  },
  {
    id: 'log_10',
    timestamp: '2026-08-21 16:14:09.050',
    level: 'INFO',
    logger: 'serial_reader',
    message: 'Hardware TOUCHED event received -> insert_touch_event() -> spawning TouchWorkflowOrchestrator daemon',
    file: 'serial_unified_listener.py',
    line: 115
  },
  {
    id: 'log_11',
    timestamp: '2026-08-21 16:12:00.010',
    level: 'INFO',
    logger: 'app',
    message: 'Centralized SD logger verified at /Volumes/SD-128GB/PlantMonitor/logs (daily rotation active)',
    file: 'logging_config.py',
    line: 52
  }
];

export const initialSystemHealth: SystemHealth = {
  esp32_connected: true,
  baud_rate: 115200,
  serial_port: '/dev/cu.usbserial-0001',
  timescaledb_status: 'connected',
  ollama_status: 'ready',
  ollama_model: 'llava:7b (Q4_0, 4.1GB)',
  yolo_model: 'yolov8n.pt (Nano, 3.2M params)',
  sd_card_mounted: true,
  sd_card_path: '/Volumes/SD-128GB/PlantMonitor',
  sd_card_free_gb: 98.4,
  sd_card_total_gb: 128.0,
  uptime_seconds: 48920
};

export const esp32PinLayout: ESP32PinStatus[] = [
  {
    pin: 4,
    name: 'GPIO4',
    mode: 'INPUT',
    state: 'LOW',
    targetDevice: 'Keyes Capacitive Touch Sensor',
    description: 'Digital input with 50ms software debounce. Pulses HIGH on pot touch.'
  },
  {
    pin: 21,
    name: 'GPIO21 (SDA)',
    mode: 'I2C',
    state: 'ACTIVE',
    targetDevice: 'TI HDC302x Sensor',
    description: 'I2C Data line at 100 kHz. Address 0x44 (fallback 0x45). Measures Temp & RH.'
  },
  {
    pin: 22,
    name: 'GPIO22 (SCL)',
    mode: 'I2C',
    state: 'ACTIVE',
    targetDevice: 'TI HDC302x Sensor',
    description: 'I2C Clock line at 100 kHz. Auto-reinitializes after 3 read failures.'
  },
  {
    pin: 5,
    name: 'GPIO5',
    mode: 'OUTPUT',
    state: 'LOW',
    targetDevice: 'Peristaltic Water Pump (IRF520 MOSFET Gate)',
    description: 'Active HIGH 5V motor drive. Fired for 2000ms on valid person detection; 60s cooldown.'
  },
  {
    pin: 19,
    name: 'GPIO19',
    mode: 'OUTPUT',
    state: 'LOW',
    targetDevice: 'Pump Status LED (Blue)',
    description: 'Illuminates synchronously with GPIO5 pump motor activation.'
  },
  {
    pin: 18,
    name: 'GPIO18',
    mode: 'OUTPUT',
    state: 'HIGH',
    targetDevice: 'Temperature Status LED (Green)',
    description: 'Flashes on successful sensor reading transmission over USB serial.'
  },
  {
    pin: 23,
    name: 'GPIO23',
    mode: 'OUTPUT',
    state: 'LOW',
    targetDevice: 'Touch Event LED (Amber)',
    description: 'Flashes instantaneously when capacitive touch is acknowledged.'
  }
];

export const sampleImageScenarios = [
  {
    id: 'person_present',
    name: 'Caregiver Present (Monstera Leaf Inspection)',
    description: 'Person detected at 89% confidence. Will trigger 2.0s pump activation.',
    type: 'person',
    brightness: 118,
    stdDev: 49,
    isValid: true,
    yoloConfidence: 0.89,
    yoloBBox: [110, 45, 510, 540] as [number, number, number, number],
    vlmSummary: 'Caregiver detected interacting with Monstera pot. Leaf condition good.',
    gradient: 'from-emerald-950 via-slate-900 to-teal-950'
  },
  {
    id: 'plant_only',
    name: 'Healthy Plant Only (No Person)',
    description: 'No person found in frame. Pump remains OFF (safe default).',
    type: 'plant_only',
    brightness: 104,
    stdDev: 42,
    isValid: true,
    yoloConfidence: 0.0,
    yoloBBox: [0, 0, 0, 0] as [number, number, number, number],
    vlmSummary: 'Plant pot resting under grow light. Foliage healthy, no human present.',
    gradient: 'from-emerald-950 via-zinc-900 to-green-950'
  },
  {
    id: 'camera_covered',
    name: 'Camera Lens Covered (Hand Blob / Darkness)',
    description: 'Root cause test case: Mean brightness < 30 & std_dev < 15. Blocked frame guard!',
    type: 'covered',
    brightness: 18,
    stdDev: 9.4,
    isValid: false,
    yoloConfidence: 0.32, // would trigger if no guard!
    yoloBBox: [30, 20, 610, 460] as [number, number, number, number],
    vlmSummary: 'Image too dark / obstructed. Hardware optical guard rejected frame.',
    gradient: 'from-zinc-950 via-stone-950 to-black'
  },
  {
    id: 'yellow_leaves',
    name: 'Yellowing Leaf Alert + Caregiver',
    description: 'Person present and chlorosis detected. High priority irrigation event.',
    type: 'yellow_leaves',
    brightness: 112,
    stdDev: 46,
    isValid: true,
    yoloConfidence: 0.94,
    yoloBBox: [140, 50, 490, 520] as [number, number, number, number],
    vlmSummary: 'Lower foliage shows mild chlorosis (yellow leaves). Peristaltic pulse delivered.',
    gradient: 'from-amber-950 via-slate-900 to-emerald-950'
  }
];
