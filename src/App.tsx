/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlantMonitorProvider, usePlantMonitor } from './context/PlantMonitorContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LiveTelemetryBanner } from './components/LiveTelemetryBanner';
import { SensorCharts } from './components/SensorCharts';
import { AIStatusCard } from './components/AIStatusCard';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { VideoAnalysisCard } from './components/VideoAnalysisCard';
import { PlantHealthCard } from './components/PlantHealthCard';
import { LogsPanel } from './components/LogsPanel';
import { TouchWorkflowSimulator } from './components/TouchWorkflowSimulator';
import { AiVisionExplorer } from './components/AiVisionExplorer';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { HardwarePinout } from './components/HardwarePinout';
import { TimescaleDBInspector } from './components/TimescaleDBInspector';
import { ApiExplorer } from './components/ApiExplorer';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { activeTab } = usePlantMonitor();

  return (
    <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
      <AnimatePresence mode="wait">
        
        {/* TAB 1: Main Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Live Environmental & Hardware Banner */}
            <LiveTelemetryBanner />

            {/* Time-Series Sensor Charts */}
            <SensorCharts />

            {/* The 4 Core AI Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AIStatusCard />
              <AIAnalysisCard />
              <VideoAnalysisCard />
              <PlantHealthCard />
            </div>

            {/* Integrated Logs Panel Preview */}
            <div className="pt-2">
              <LogsPanel />
            </div>
          </motion.div>
        )}

        {/* TAB 2: Touch-to-Pump Flow Simulator */}
        {activeTab === 'touch_workflow' && (
          <motion.div
            key="touch_workflow"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <TouchWorkflowSimulator />
          </motion.div>
        )}

        {/* TAB 3: AI Vision & VLM Analysis */}
        {activeTab === 'ai_vision' && (
          <motion.div
            key="ai_vision"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <AiVisionExplorer />
          </motion.div>
        )}

        {/* TAB 4: LogsPanel Full View */}
        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <LogsPanel />
          </motion.div>
        )}

        {/* TAB 5: Technical Architecture & 30-Step Trace */}
        {activeTab === 'architecture' && (
          <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <ArchitectureExplorer />
          </motion.div>
        )}

        {/* TAB 6: ESP32 Hardware Pinout & Wiring */}
        {activeTab === 'hardware' && (
          <motion.div
            key="hardware"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <HardwarePinout />
          </motion.div>
        )}

        {/* TAB 7: TimescaleDB & Hypertable */}
        {activeTab === 'timescaledb' && (
          <motion.div
            key="timescaledb"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <TimescaleDBInspector />
          </motion.div>
        )}

        {/* TAB 8: REST API Console */}
        {activeTab === 'api_docs' && (
          <motion.div
            key="api_docs"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <ApiExplorer />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
};

export default function App() {
  return (
    <PlantMonitorProvider>
      <div className="min-h-screen bg-[#0a0a0b] text-[#e0e0e0] font-sans selection:bg-[#00ff41] selection:text-black">
        <Header />
        <Navigation />
        <MainContent />
      </div>
    </PlantMonitorProvider>
  );
}
