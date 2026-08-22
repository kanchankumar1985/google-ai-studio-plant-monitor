import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity, Clock, TrendingUp, Filter } from 'lucide-react';

type TimeRange = '1h' | '6h' | '24h' | 'all';

export const SensorCharts: React.FC = () => {
  const { readings } = usePlantMonitor();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [activeMetric, setActiveMetric] = useState<'both' | 'temp' | 'hum'>('both');

  // Filter based on range
  const filteredData = React.useMemo(() => {
    if (readings.length === 0) return [];
    const count =
      timeRange === '1h'
        ? Math.min(readings.length, 12)
        : timeRange === '6h'
        ? Math.min(readings.length, 24)
        : readings.length;

    return readings.slice(-count).map((r) => {
      const d = new Date(r.time);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return {
        ...r,
        displayTime: timeStr
      };
    });
  }, [readings, timeRange]);

  // Statistical calculations
  const stats = React.useMemo(() => {
    if (filteredData.length === 0) return { avgTemp: 0, minTemp: 0, maxTemp: 0, avgHum: 0 };
    const temps = filteredData.map(d => d.temperature_c);
    const hums = filteredData.map(d => d.humidity_pct);

    return {
      avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      minTemp: Math.min(...temps).toFixed(1),
      maxTemp: Math.max(...temps).toFixed(1),
      avgHum: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
      minHum: Math.min(...hums).toFixed(1),
      maxHum: Math.max(...hums).toFixed(1)
    };
  }, [filteredData]);

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 mb-6 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#2a2a2e]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41]"></div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              TimescaleDB Hypertable Telemetry
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider mt-0.5">
            Table: <span className="text-white">sensor_readings</span> &bull; 115200 Baud I2C Bus &bull; Resolution: 100 kHz
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          {/* Metric Selector */}
          <div className="flex items-center bg-[#1a1a1d] p-0.5 border border-[#2a2a2e] text-[10px]">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 uppercase tracking-wider transition ${
                activeMetric === 'both' ? 'bg-[#2a2a2e] text-white font-bold' : 'text-[#666] hover:text-[#888]'
              }`}
            >
              Dual Channels
            </button>
            <button
              onClick={() => setActiveMetric('temp')}
              className={`px-2.5 py-1 uppercase tracking-wider transition ${
                activeMetric === 'temp' ? 'bg-[#00ff41]/20 text-[#00ff41] font-bold border border-[#00ff41]/40' : 'text-[#666] hover:text-[#888]'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveMetric('hum')}
              className={`px-2.5 py-1 uppercase tracking-wider transition ${
                activeMetric === 'hum' ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-800' : 'text-[#666] hover:text-[#888]'
              }`}
            >
              Humidity (% RH)
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#1a1a1d] p-0.5 border border-[#2a2a2e] text-[10px]">
            {(['1h', '6h', '24h', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 uppercase tracking-wider font-mono ${
                  timeRange === r ? 'bg-[#00ff41] text-black font-bold' : 'text-[#666] hover:text-[#888]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Summary Grid Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#1c1c1e] mb-5 font-mono">
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e] text-xs">
          <div className="text-[#666] text-[10px] uppercase tracking-widest">Avg Temp</div>
          <div className="text-white font-mono font-bold text-lg mt-0.5">{stats.avgTemp}°C</div>
          <div className="text-[9px] text-[#555] uppercase mt-0.5">Min {stats.minTemp} &bull; Max {stats.maxTemp}</div>
        </div>
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e] text-xs">
          <div className="text-[#666] text-[10px] uppercase tracking-widest">Avg Humidity</div>
          <div className="text-[#00ff41] font-mono font-bold text-lg mt-0.5">{stats.avgHum}% RH</div>
          <div className="text-[9px] text-[#555] uppercase mt-0.5">Min {stats.minHum} &bull; Max {stats.maxHum}</div>
        </div>
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e] text-xs">
          <div className="text-[#666] text-[10px] uppercase tracking-widest">Sampling Rate</div>
          <div className="text-white font-mono font-bold text-lg mt-0.5">30s PULSE</div>
          <div className="text-[9px] text-[#555] uppercase mt-0.5">ESP32 HDC302x Task</div>
        </div>
        <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e] text-xs">
          <div className="text-[#666] text-[10px] uppercase tracking-widest">DB Compression</div>
          <div className="text-[#00ff41] font-mono font-bold text-lg mt-0.5">91.4% GORILLA</div>
          <div className="text-[9px] text-[#555] uppercase mt-0.5">Chunk: 1-Day Windows</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00ff41" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#2a2a2e" vertical={false} />
            <XAxis dataKey="displayTime" stroke="#666666" fontSize={10} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#ffffff"
              domain={['dataMin - 2', 'dataMax + 2']}
              fontSize={10}
              tickLine={false}
              unit="°C"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#00ff41"
              domain={[20, 90]}
              fontSize={10}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f11',
                borderColor: '#2a2a2e',
                borderRadius: '0px',
                color: '#e0e0e0',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="square" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
            {(activeMetric === 'both' || activeMetric === 'temp') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature_c"
                name="Temperature (°C)"
                stroke="#ffffff"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            )}
            {(activeMetric === 'both' || activeMetric === 'hum') && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="humidity_pct"
                name="Humidity (% RH)"
                stroke="#00ff41"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#humGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
