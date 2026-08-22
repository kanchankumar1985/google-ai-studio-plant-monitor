import React, { useState } from 'react';
import { usePlantMonitor } from '../context/PlantMonitorContext';
import { Play, Pause, Film, HardDrive } from 'lucide-react';

export const VideoAnalysisCard: React.FC = () => {
  const { latestSnapshot } = usePlantMonitor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFrame, setActiveFrame] = useState(1);

  if (!latestSnapshot) return null;

  return (
    <div className="bg-[#0f0f11] border border-[#2a2a2e] p-5 font-mono">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-[#00ff41]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Touch-Alert Video Capture</h3>
        </div>
        <span className="text-[10px] font-mono text-[#888] uppercase">
          3.0s @ 10 FPS (MP4)
        </span>
      </div>

      <div className="space-y-3 text-xs">
        
        {/* Video Player Mock with bounding box & timestamp */}
        <div className="relative overflow-hidden bg-[#000000] aspect-video border border-[#2a2a2e] flex items-center justify-center group">
          {/* Simulated webcam visual based on scenario */}
          <div className={`absolute inset-0 bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center`}>
            
            {latestSnapshot.brightness_mean < 30 ? (
              <div className="text-[#666] font-mono text-xs uppercase">
                [Camera Obstructed / Lens Covered]
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#1a1a1d] border border-[#2a2a2e] flex items-center justify-center text-[#00ff41] mb-2">
                  <Film className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-xs uppercase tracking-wider">PLANT MONITOR OPTICAL FEED</div>
                <div className="text-[9px] text-[#666] uppercase mt-0.5">OpenCV VideoCapture(0) &bull; 640x480 RAW</div>
              </div>
            )}

            {/* YOLO bounding box overlay if person detected */}
            {latestSnapshot.person_detected && latestSnapshot.yolo_detections.length > 0 && (
              <div className="absolute inset-x-12 inset-y-6 border-2 border-[#00ff41] bg-[#00ff41]/10 flex items-start justify-between p-1.5 animate-pulse pointer-events-none">
                <span className="bg-[#00ff41] text-black font-mono font-bold text-[9px] px-1.5 py-0.2 uppercase shadow">
                  PERSON: {(latestSnapshot.yolo_detections[0].confidence * 100).toFixed(0)}%
                </span>
                <span className="text-[9px] text-[#00ff41] font-mono bg-black/80 px-1 border border-[#00ff41]/40">
                  COCO:0
                </span>
              </div>
            )}
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-[#0a0a0b]/90 border-t border-[#2a2a2e] flex items-center justify-between">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2 py-1 bg-[#1a1a1d] hover:bg-[#2a2a2e] text-white border border-[#2a2a2e] transition flex items-center gap-1 text-[10px] uppercase font-bold"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#00ff41]" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY CLIP'}</span>
            </button>

            <div className="text-[10px] font-mono text-[#888]">
              00:0{isPlaying ? (activeFrame % 3) + 1 : 1} / 00:03
            </div>

            <div className="text-[9px] text-[#00ff41] bg-[#1a1a1d] px-2 py-0.5 border border-[#2a2a2e] uppercase font-bold">
              FFMPEG H.264
            </div>
          </div>
        </div>

        {/* Video File Storage Path */}
        <div className="p-2.5 bg-[#1a1a1d] border border-[#2a2a2e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px]">
          <span className="text-[#666] flex items-center gap-1.5 uppercase">
            <HardDrive className="w-3.5 h-3.5 text-[#ff4e00]" />
            SD Archive:
          </span>
          <span className="font-mono text-[9px] text-[#888] truncate max-w-full">
            {latestSnapshot.video_path}
          </span>
        </div>

      </div>
    </div>
  );
};
