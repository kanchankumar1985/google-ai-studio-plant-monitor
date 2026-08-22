import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Database, Play, CheckCircle2, HardDrive, Table, Layers, Code2, Server } from 'lucide-react';

export const TimescaleDBInspector: React.FC = () => {
  const { readings, touchEvents, snapshots } = usePlantMonitor();
  const [selectedQuery, setSelectedQuery] = useState<string>(
    'SELECT time, temperature_c, humidity_pct, led_state FROM sensor_readings ORDER BY time DESC LIMIT 10;'
  );
  const [queryResult, setQueryResult] = useState<any[]>(readings.slice(-10).reverse());
  const [activeTable, setActiveTable] = useState<'sensor_readings' | 'touch_events' | 'plant_snapshots'>('sensor_readings');

  const handleRunQuery = () => {
    if (selectedQuery.includes('sensor_readings')) {
      setQueryResult(readings.slice(-10).reverse());
      setActiveTable('sensor_readings');
    } else if (selectedQuery.includes('touch_events')) {
      setQueryResult(touchEvents);
      setActiveTable('touch_events');
    } else {
      setQueryResult(snapshots);
      setActiveTable('plant_snapshots');
    }
  };

  const presetQueries = [
    {
      name: 'Latest 10 Sensor Readings (Hypertable)',
      sql: 'SELECT time, temperature_c, humidity_pct, led_state FROM sensor_readings ORDER BY time DESC LIMIT 10;'
    },
    {
      name: 'Touch Events History (TimescaleDB)',
      sql: 'SELECT id, timestamp, device_id, state FROM touch_events ORDER BY timestamp DESC LIMIT 50;'
    },
    {
      name: 'Plant Snapshots & YOLO/VLM Status',
      sql: 'SELECT id, timestamp, person_detected, pump_triggered, analysis_status FROM plant_snapshots ORDER BY timestamp DESC;'
    },
    {
      name: 'Hypertable Compression & Chunk Status',
      sql: 'SELECT chunk_name, range_start, range_end, is_compressed FROM timescaledb_information.chunks;'
    }
  ];

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Overview Card */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">TimescaleDB Hypertable &amp; SQL Query Console</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Container: <code className="text-white font-mono">plant-timescaledb</code> &bull; Port: <code className="text-[#00ff41] font-mono">5433:5432</code> &bull; Database: <code className="text-white font-mono">plantdb</code>
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 bg-[#1a1a1d] text-[#00ff41] font-mono border border-[#00ff41]/40 uppercase font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            PostgreSQL 16 + TimescaleDB 2.14
          </span>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#1c1c1e] mb-4 text-xs">
          <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase">Total Sensor Rows</div>
            <div className="text-[#00ff41] font-mono font-bold text-base mt-0.5">{readings.length + 1420}</div>
            <div className="text-[9px] text-[#555] uppercase">Hypertable partition</div>
          </div>

          <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase">Touch Events Logged</div>
            <div className="text-[#ff4e00] font-mono font-bold text-base mt-0.5">{touchEvents.length}</div>
            <div className="text-[9px] text-[#555] uppercase">Indexed on timestamp DESC</div>
          </div>

          <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase">Snapshots Archived</div>
            <div className="text-white font-mono font-bold text-base mt-0.5">{snapshots.length}</div>
            <div className="text-[9px] text-[#555] uppercase">Linked with MP4 video</div>
          </div>

          <div className="bg-[#1a1a1d] p-3 border border-[#2a2a2e]">
            <div className="text-[#666] text-[9px] uppercase">Compression Ratio</div>
            <div className="text-[#00ff41] font-mono font-bold text-base mt-0.5">91.4%</div>
            <div className="text-[9px] text-[#555] uppercase">Gorilla + delta-of-delta</div>
          </div>
        </div>

        {/* Query Editor & Presets */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[10px] font-bold text-[#666] uppercase">
              Interactive SQL Console:
            </label>
            <div className="flex flex-wrap gap-1">
              {presetQueries.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedQuery(p.sql);
                  }}
                  className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-[#ccc] border border-[#2a2a2e] transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={selectedQuery}
              onChange={(e) => setSelectedQuery(e.target.value)}
              className="w-full bg-[#0a0a0b] font-mono text-[11px] text-[#00ff41] p-3 border border-[#2a2a2e] focus:outline-none focus:border-[#00ff41] resize-none"
            />
            <button
              onClick={handleRunQuery}
              className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-[#00ff41] hover:bg-[#00e63a] text-black font-bold text-[10px] uppercase flex items-center gap-1.5 transition"
            >
              <Play className="w-3 h-3 fill-current" />
              EXECUTE SQL
            </button>
          </div>
        </div>

        {/* Query Results Table */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase text-[#666]">
            <span>Query Results: <strong className="text-white font-mono">{queryResult.length} rows</strong></span>
            <span className="font-mono text-[9px] text-[#00ff41]">Execution time: 1.4ms</span>
          </div>

          <div className="border border-[#2a2a2e] overflow-x-auto bg-[#0a0a0b] max-h-72 overflow-y-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#121214] text-[#666] uppercase text-[9px] border-b border-[#2a2a2e] sticky top-0">
                <tr>
                  {queryResult.length > 0 &&
                    Object.keys(queryResult[0]).slice(0, 6).map((key) => (
                      <th key={key} className="py-1.5 px-3">{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2e] text-[#ccc]">
                {queryResult.map((row, i) => (
                  <tr key={i} className="hover:bg-[#1a1a1d] transition">
                    {Object.values(row).slice(0, 6).map((val: any, j) => (
                      <td key={j} className="py-1.5 px-3 truncate max-w-xs text-[10px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
