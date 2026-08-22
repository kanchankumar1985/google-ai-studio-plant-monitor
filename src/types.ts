export interface SensorReading {
  id: string;
  time: string;
  device_id: string;
  temperature_c: number;
  humidity_pct: number;
  led_state: 'ON' | 'OFF';
  vpd_kpa?: number;
  dew_point_c?: number;
}

export interface TouchEvent {
  id: string;
  timestamp: string;
  device_id: string;
  state: 'TOUCHED' | 'NOT_TOUCHED';
  processed_by_workflow: boolean;
  pump_triggered: boolean;
}

export interface YoloDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox_xyxy: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface VlmAnalysisResult {
  person_present: boolean;
  person_detected: boolean;
  person_count: number;
  position: 'left' | 'center' | 'right' | 'unknown';
  facing_camera: boolean;
  image_quality: 'good' | 'poor' | 'dark' | 'blurry';
  summary: string;
  leaf_health?: 'healthy' | 'yellowing' | 'dry_tips' | 'pest_damage';
  moisture_assessment?: 'optimal' | 'dry' | 'overwatered';
  suggested_action?: string;
}

export interface PlantSnapshot {
  id: string;
  timestamp: string;
  image_path: string;
  boxed_image_path?: string;
  video_path?: string;
  device_id: string;
  trigger_source: 'TOUCH_EVENT' | 'INTERVAL_SCHEDULE' | 'MANUAL';
  brightness_mean: number;
  std_dev: number;
  is_valid_frame: boolean;
  validation_status: 'ok' | 'too_dark' | 'no_detail' | 'unreadable';
  yolo_detections: YoloDetection[];
  person_detected: boolean;
  pump_triggered: boolean;
  pump_trigger_reason?: string;
  analysis_status: 'queued' | 'processing' | 'completed' | 'failed';
  vlm_analysis?: VlmAnalysisResult;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  logger: 'app' | 'api' | 'serial_reader' | 'camera' | 'vlm' | 'esp32' | 'touch_workflow';
  message: string;
  file?: string;
  line?: number;
}

export interface PumpState {
  isRunning: boolean;
  runDurationMs: number;
  startTime: number | null;
  lastRunTime: number | null;
  cooldownDurationMs: number;
  remainingRunSec: number;
  remainingCooldownSec: number;
  cooldownActive: boolean;
  currentReason: string | null;
  totalRunCount: number;
  totalWaterPumpedMl: number;
}

export interface ESP32PinStatus {
  pin: number;
  name: string;
  mode: 'INPUT' | 'OUTPUT' | 'I2C';
  state: 'HIGH' | 'LOW' | 'ACTIVE';
  targetDevice: string;
  description: string;
}

export interface SystemHealth {
  esp32_connected: boolean;
  baud_rate: number;
  serial_port: string;
  timescaledb_status: 'connected' | 'reconnecting' | 'error';
  ollama_status: 'ready' | 'busy' | 'offline';
  ollama_model: string;
  yolo_model: string;
  sd_card_mounted: boolean;
  sd_card_path: string;
  sd_card_free_gb: number;
  sd_card_total_gb: number;
  uptime_seconds: number;
}

export type ActiveTab = 
  | 'dashboard'
  | 'touch_workflow'
  | 'ai_vision'
  | 'logs'
  | 'architecture'
  | 'hardware'
  | 'timescaledb'
  | 'api_docs';
