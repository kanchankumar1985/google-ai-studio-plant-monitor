import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Code2, Play, Copy, Check, Terminal, ExternalLink, Globe } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  category: 'Sensor Readings' | 'Touch Events' | 'Logs API' | 'System & Snapshots';
  description: string;
  sampleBody?: string;
  responseGenerator: (context: any) => any;
}

export const ApiExplorer: React.FC = () => {
  const context = usePlantMonitor();
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/api/readings/latest',
      category: 'Sensor Readings',
      description: 'Returns the most recent HDC302x temperature and humidity reading with calculated VPD and dew point.',
      responseGenerator: (ctx) => ctx.latestReading || {}
    },
    {
      method: 'GET',
      path: '/api/readings/recent?limit=10',
      category: 'Sensor Readings',
      description: 'Returns the last N sensor readings from the TimescaleDB hypertable.',
      responseGenerator: (ctx) => ctx.readings.slice(-10)
    },
    {
      method: 'GET',
      path: '/api/readings/range?start=2026-08-21T00:00:00Z&end=2026-08-21T23:59:59Z',
      category: 'Sensor Readings',
      description: 'Queries historical data over an ISO-8601 start/end time bucket.',
      responseGenerator: (ctx) => ctx.readings.slice(-24)
    },
    {
      method: 'GET',
      path: '/api/touch/latest',
      category: 'Touch Events',
      description: 'Returns latest capacitive touch status and elapsed seconds since last pot interaction.',
      responseGenerator: (ctx) => {
        const last = ctx.touchEvents[0];
        const secAgo = last ? Math.floor((Date.now() - new Date(last.timestamp).getTime()) / 1000) : null;
        return {
          ...last,
          seconds_ago: secAgo
        };
      }
    },
    {
      method: 'GET',
      path: '/api/touch/history?limit=50',
      category: 'Touch Events',
      description: 'Retrieves touch event logs ordered by timestamp DESC.',
      responseGenerator: (ctx) => ctx.touchEvents
    },
    {
      method: 'POST',
      path: '/api/touch-event',
      category: 'Touch Events',
      description: 'Injects a manual touch event with device_id and timestamp.',
      sampleBody: JSON.stringify({ device_id: 'ESP32_PLANT_01', state: 'TOUCHED' }, null, 2),
      responseGenerator: () => ({ status: 'success', message: 'Touch event recorded & workflow queued' })
    },
    {
      method: 'GET',
      path: '/api/logs/latest?limit=100',
      category: 'Logs API',
      description: 'Fetches latest log lines across all modules from centralized SD card storage.',
      responseGenerator: (ctx) => ctx.logs.slice(0, 10)
    },
    {
      method: 'GET',
      path: '/api/logs/files',
      category: 'Logs API',
      description: 'Lists all daily rotated log files in /Volumes/SD-128GB/PlantMonitor/logs.',
      responseGenerator: () => [
        { filename: 'serial_reader_20260821.log', size_kb: 420, modified: '2026-08-21T16:17:42Z' },
        { filename: 'api_20260821.log', size_kb: 184, modified: '2026-08-21T16:15:30Z' },
        { filename: 'camera_20260821.log', size_kb: 92, modified: '2026-08-21T16:14:12Z' },
        { filename: 'app_20260821.log', size_kb: 64, modified: '2026-08-21T16:12:00Z' }
      ]
    },
    {
      method: 'GET',
      path: '/api/logs/stats',
      category: 'Logs API',
      description: 'Returns aggregated log counts grouped by level (INFO/WARN/ERROR/DEBUG).',
      responseGenerator: (ctx) => ({
        total: ctx.logs.length,
        info: ctx.logs.filter((l: any) => l.level === 'INFO').length,
        warning: ctx.logs.filter((l: any) => l.level === 'WARNING').length,
        error: ctx.logs.filter((l: any) => l.level === 'ERROR').length,
        debug: ctx.logs.filter((l: any) => l.level === 'DEBUG').length
      })
    }
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  const handleTestCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setApiResponse(currentEndpoint.responseGenerator(context));
      setIsCalling(false);
    }, 200);
  };

  const curlCommand = `curl -X ${currentEndpoint.method} "http://localhost:8000${currentEndpoint.path}"${
    currentEndpoint.sampleBody ? ` -H "Content-Type: application/json" -d '${currentEndpoint.sampleBody.replace(/\n/g, '')}'` : ''
  }`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Overview */}
      <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00ff41]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">FastAPI REST API Explorer &amp; Curl Testing</h2>
            </div>
            <p className="text-[10px] text-[#666] uppercase mt-0.5">
              Live interactive testing for all backend endpoints mounted at <code className="text-white font-mono">http://localhost:8000/api/*</code>
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 bg-[#1a1a1d] text-[#888] font-mono border border-[#2a2a2e] uppercase font-bold">
            FastAPI 0.110 (Uvicorn :8000)
          </span>
        </div>

        {/* Endpoint Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left 4 cols: Endpoint List */}
          <div className="md:col-span-4 space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {endpoints.map((ep, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedEndpointIndex(i);
                  setApiResponse(null);
                }}
                className={`w-full p-2 border text-left transition text-xs flex items-center gap-2 ${
                  selectedEndpointIndex === i
                    ? 'bg-[#0f0f11] border-[#00ff41] text-white'
                    : 'bg-[#0a0a0b] border-[#2a2a2e] text-[#888] hover:bg-[#1a1a1d] hover:text-white'
                }`}
              >
                <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                  ep.method === 'GET' ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30' : 'bg-[#ff4e00]/10 text-[#ff4e00] border-[#ff4e00]/30'
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono truncate text-[10px] flex-1">{ep.path.split('?')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right 8 cols: Testing Console */}
          <div className="md:col-span-8 space-y-3">
            
            {/* Endpoint Detail Card */}
            <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                    currentEndpoint.method === 'GET' ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30' : 'bg-[#ff4e00]/10 text-[#ff4e00] border-[#ff4e00]/30'
                  }`}>
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{currentEndpoint.path}</span>
                </div>
                <button
                  onClick={handleTestCall}
                  disabled={isCalling}
                  className="px-3 py-1 bg-[#00ff41] hover:bg-[#00e63a] text-black font-bold text-[10px] uppercase flex items-center gap-1.5 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isCalling ? 'SENDING...' : 'SEND REQUEST'}
                </button>
              </div>

              <p className="text-[#888] text-[10px] uppercase leading-relaxed">{currentEndpoint.description}</p>

              {/* Curl Command Snippet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-[#666] uppercase">
                  <span>cURL Command:</span>
                  <button
                    onClick={handleCopyCurl}
                    className="text-[#888] hover:text-[#00ff41] flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#00ff41]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED!' : 'COPY CURL'}</span>
                  </button>
                </div>
                <div className="bg-[#121214] p-2 border border-[#2a2a2e] font-mono text-[10px] text-[#00ff41] overflow-x-auto whitespace-pre">
                  {curlCommand}
                </div>
              </div>
            </div>

            {/* Response Output Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#666]">
                <span>Response Body:</span>
                <span className="font-mono text-[9px] text-[#00ff41]">
                  {apiResponse ? 'Status: 200 OK (application/json)' : 'Ready to execute'}
                </span>
              </div>

              <div className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] font-mono text-[10px] text-[#00ff41] max-h-72 overflow-y-auto">
                {apiResponse ? (
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <div className="text-[#555] py-8 text-center uppercase text-[10px]">
                    Click "SEND REQUEST" or select an endpoint to inspect real JSON telemetry payloads.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
