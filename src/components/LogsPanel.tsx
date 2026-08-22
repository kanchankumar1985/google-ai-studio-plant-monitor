import React, { useState, useEffect, useRef } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { LogEntry } from '../types';
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Bug,
  HardDrive,
  FileText
} from 'lucide-react';

export const LogsPanel: React.FC = () => {
  const { logs, clearLogs, addLog } = usePlantMonitor();
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [levelFilter, setLevelFilter] = useState<'ALL' | LogEntry['level']>('ALL');
  const [loggerFilter, setLoggerFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>('serial_reader_20260821.log');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive if enabled
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0; // our list shows newest at top or bottom depending on user preference
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (loggerFilter !== 'ALL' && log.logger !== loggerFilter) return false;
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      return (
        log.message.toLowerCase().includes(query) ||
        log.logger.toLowerCase().includes(query) ||
        (log.file && log.file.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Calculate statistics
  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'INFO').length,
    warn: logs.filter(l => l.level === 'WARNING').length,
    error: logs.filter(l => l.level === 'ERROR').length,
    debug: logs.filter(l => l.level === 'DEBUG').length
  };

  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] [${l.logger}] ${l.message} (${l.file || 'sys'}:${l.line || 0})`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant_monitor_logs_${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
  };

  const handleManualRefresh = () => {
    addLog('INFO', 'api', 'GET /api/logs/latest?limit=100 HTTP/1.1 - 200 OK (Logs refreshed)', 'routes/logs.py', 42);
  };

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 font-mono mb-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#2a2a2e]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#00ff41]"></div>
            <Terminal className="w-4 h-4 text-[#00ff41]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Centralized System & SD-Card LogsPanel</h2>
            {isLiveActive && (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-ping"></span>
                1s REFRESH
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#666] uppercase tracking-wider mt-0.5">
            Real-time multi-threaded log capture from ESP32 Serial, FastAPI, OpenCV, YOLO, and Ollama VLM
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition border ${
              isLiveActive
                ? 'bg-[#1a1a1d] hover:bg-[#2a2a2e] text-[#ff4e00] border-[#2a2a2e]'
                : 'bg-[#00ff41] text-black border-[#00ff41] hover:bg-[#00ff41]/80'
            }`}
          >
            {isLiveActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isLiveActive ? 'PAUSE STREAM' : 'RESUME STREAM'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-white transition flex items-center gap-1.5"
            title="Fetch latest 100 lines"
          >
            <RotateCcw className="w-3 h-3 text-[#00ff41]" />
            REFRESH
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-white transition flex items-center gap-1.5"
            title="Download full log dump"
          >
            <Download className="w-3 h-3" />
            EXPORT
          </button>

          {/* Clear View */}
          <button
            onClick={clearLogs}
            className="p-1 bg-[#1a1a1d] hover:bg-[#2a2a2e] border border-[#2a2a2e] text-[#666] hover:text-[#ff4e00] transition"
            title="Clear current log view"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 text-xs">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#666]" />
          <input
            type="text"
            placeholder="Search logs by keyword, filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-[#2a2a2e] pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-[#555] focus:outline-none focus:border-[#00ff41] transition font-mono"
          />
        </div>

        {/* Level Filters */}
        <div className="md:col-span-4 flex items-center bg-[#0a0a0b] p-0.5 border border-[#2a2a2e] overflow-x-auto no-scrollbar gap-1">
          {(['ALL', 'INFO', 'WARNING', 'ERROR', 'DEBUG'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition whitespace-nowrap ${
                levelFilter === lvl
                  ? 'bg-[#2a2a2e] text-[#00ff41]'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Module / Logger Filters */}
        <div className="md:col-span-4 flex items-center gap-1.5">
          <select
            value={loggerFilter}
            onChange={(e) => setLoggerFilter(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-[#2a2a2e] px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#00ff41] font-mono uppercase"
          >
            <option value="ALL">ALL MODULES (app, serial, vlm, esp32...)</option>
            <option value="serial_reader">serial_reader (USB Serial + DB)</option>
            <option value="touch_workflow">touch_workflow (Orchestrator)</option>
            <option value="esp32">esp32 (Firmware GPIO/Pumps)</option>
            <option value="camera">camera (OpenCV & Video)</option>
            <option value="vlm">vlm (Ollama LLaVA Worker)</option>
            <option value="api">api (FastAPI REST)</option>
            <option value="app">app (Core Engine)</option>
          </select>
        </div>

      </div>

      {/* Log Level Counters */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#666] mb-3 px-1">
        <span className="text-white">TOTAL: <strong>{stats.total}</strong></span>
        <span className="text-[#00ff41] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> INFO: {stats.info}</span>
        <span className="text-[#ff4e00] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> WARN: {stats.warn}</span>
        <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> ERR: {stats.error}</span>
        <span className="text-[#888] flex items-center gap-1"><Bug className="w-3 h-3" /> DEBUG: {stats.debug}</span>
        <span className="ml-auto text-[#666] text-[9px] uppercase">
          SD MOUNT: <strong className="text-white font-mono">/Volumes/SD-128GB/PlantMonitor/logs</strong>
        </span>
      </div>

      {/* Terminal View Body */}
      <div
        ref={scrollContainerRef}
        className="bg-[#0a0a0b] p-3 border border-[#2a2a2e] font-mono text-xs text-[#ccc] h-96 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#2a2a2e]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-[#555] uppercase">
            No matching log entries found.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const levelStyle =
              log.level === 'INFO'
                ? 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/30'
                : log.level === 'WARNING'
                ? 'text-[#ff4e00] bg-[#ff4e00]/10 border-[#ff4e00]/30'
                : log.level === 'ERROR'
                ? 'text-red-400 bg-red-950/80 border-red-800'
                : 'text-[#888] bg-[#1a1a1d] border-[#2a2a2e]';

            const loggerStyle =
              log.logger === 'serial_reader'
                ? 'text-[#00ff41]'
                : log.logger === 'esp32'
                ? 'text-[#ff4e00]'
                : log.logger === 'vlm'
                ? 'text-purple-400'
                : log.logger === 'touch_workflow'
                ? 'text-cyan-400'
                : log.logger === 'camera'
                ? 'text-blue-400'
                : 'text-[#888]';

            return (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 py-0.5 px-1.5 hover:bg-[#121214] transition text-[10px] leading-relaxed border-l-2 border-transparent hover:border-[#00ff41]"
              >
                {/* Timestamp */}
                <span className="text-[#666] shrink-0 text-[10px] sm:w-44 select-none">
                  {log.timestamp}
                </span>

                {/* Level Badge */}
                <span className={`px-1 py-0.1 border text-[9px] font-bold shrink-0 self-start uppercase ${levelStyle}`}>
                  {log.level}
                </span>

                {/* Logger module */}
                <span className={`font-bold shrink-0 sm:w-28 text-[10px] uppercase ${loggerStyle}`}>
                  [{log.logger}]
                </span>

                {/* Log Message */}
                <span className="text-[#e0e0e0] break-words flex-1 font-mono">
                  {log.message}
                </span>

                {/* File Reference */}
                {log.file && (
                  <span className="text-[#555] text-[9px] shrink-0 font-mono hidden md:inline-block">
                    {log.file}:{log.line}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom SD-Card Files Bar */}
      <div className="mt-3 pt-3 border-t border-[#2a2a2e] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-[#666] gap-2">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-[#ff4e00]" />
          <span className="uppercase">Active Rotation Files:</span>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            {['serial_reader_20260821.log', 'api_20260821.log', 'camera_20260821.log'].map((fname) => (
              <span key={fname} className="bg-[#1a1a1d] px-2 py-0.5 text-[#888] border border-[#2a2a2e]">
                {fname}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-[#666] uppercase">
          FastAPI endpoint: <code className="text-[#00ff41] font-mono">/api/logs/latest?limit=100</code>
        </div>
      </div>

    </div>
  );
};
