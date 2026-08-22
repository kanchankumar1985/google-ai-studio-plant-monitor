import React from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Cpu, Zap, Power, ShieldCheck, Activity, Layers, Terminal } from 'lucide-react';

export const HardwarePinout: React.FC = () => {
  const { pins, pumpState, touchEvents, latestReading } = usePlantMonitor();

  const wiringSpecs = [
    {
      sensor: 'TI HDC302x Sensor',
      purpose: 'Precision Temperature (±0.1°C) & Relative Humidity (±1.5%)',
      pins: 'SDA → GPIO21, SCL → GPIO22, VCC → 3.3V, GND → GND',
      bus: 'I2C @ 100 kHz (Addr 0x44 / 0x45 fallback)',
      notes: 'Firmware auto-reinitializes after 3 read failures. Emits touch-only JSON while sensor is recovering.'
    },
    {
      sensor: 'Keyes Capacitive Touch Sensor',
      purpose: 'Detects caregiver fingertip touch on plant pot or copper electrode',
      pins: 'SIGNAL → GPIO4, VCC → 3.3V, GND → GND',
      bus: 'Digital Input (Active HIGH)',
      notes: '50ms software debounce inside handleTouchSensor() to suppress electromagnetic bounce.'
    },
    {
      sensor: 'Peristaltic Water Pump (12V/5V DC)',
      purpose: 'Delivers 2.0s nutrient water pulse into plant substrate',
      pins: 'GATE → GPIO5 via IRF520 / 2N7000 MOSFET, VCC → External 5V/12V, GND → Common GND',
      bus: 'Digital Output (Active HIGH)',
      notes: 'Firmware enforces strict 2000ms hardware timer + 60,000ms non-blocking cooldown.'
    },
    {
      sensor: 'Status LED Array',
      purpose: 'Visual telemetry feedback for debugging without USB monitor',
      pins: 'Pump LED (Blue) → GPIO19, Temp LED (Green) → GPIO18, Touch LED (Amber) → GPIO23',
      bus: 'Digital Outputs (Current limiting 220Ω resistors)',
      notes: 'Synchronously mirrors MOSFET gate state and I2C transaction completions.'
    }
  ];

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Overview */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">ESP32 Hardware Pinout &amp; I/O Matrix</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Pin assignments and circuit logic for <code className="text-white font-mono">touch_sensor_led_pump_unified.ino</code>
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 bg-[#1a1a1d] text-[#888] font-mono border border-[#2a2a2e] uppercase font-bold">
            NodeMCU ESP32-WROOM-32
          </span>
        </div>

        {/* Live Pin State Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-5">
          {pins.map((pin) => {
            const isHigh = pin.state === 'HIGH';
            const isActive = pin.state === 'ACTIVE';

            return (
              <div
                key={pin.pin}
                className={`p-3 border transition ${
                  isHigh
                    ? 'bg-[#1a1a1d] border-[#ff4e00]'
                    : isActive
                    ? 'bg-[#1a1a1d] border-[#00ff41]'
                    : 'bg-[#0a0a0b] border-[#2a2a2e]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-[10px] text-white bg-[#121214] px-1.5 py-0.5 border border-[#2a2a2e]">
                    {pin.name}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 font-bold uppercase border ${
                    isHigh
                      ? 'bg-[#ff4e00]/10 text-[#ff4e00] border-[#ff4e00]/40 animate-pulse'
                      : isActive
                      ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/40'
                      : 'bg-[#121214] text-[#666] border-[#2a2a2e]'
                  }`}>
                    {pin.mode} : {pin.state}
                  </span>
                </div>

                <div className="font-bold text-[11px] uppercase text-white truncate mb-1">
                  {pin.targetDevice}
                </div>
                <p className="text-[9px] text-[#888] leading-tight uppercase">
                  {pin.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Wiring & Circuit Specifications */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-wider">
            Hardware Wiring Table
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {wiringSpecs.map((spec, i) => (
              <div key={i} className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] space-y-1.5">
                <div className="font-bold text-[#00ff41] text-[11px] uppercase flex items-center justify-between">
                  <span>{spec.sensor}</span>
                  <span className="text-[9px] font-mono text-[#666] font-normal">{spec.bus}</span>
                </div>
                <div className="text-[#ccc] text-[10px] uppercase">{spec.purpose}</div>
                <div className="bg-[#121214] p-2 border border-[#2a2a2e] font-mono text-[10px] text-[#00ff41]">
                  {spec.pins}
                </div>
                <p className="text-[9px] text-[#666] uppercase italic pt-0.5">
                  {spec.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
