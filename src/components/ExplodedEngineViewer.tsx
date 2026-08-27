import React, { useState } from 'react';
import type { Supercar, EngineHotspot } from '../types/car';
import { ZoomIn, ZoomOut, Cpu, X, Sparkles } from 'lucide-react';

interface ExplodedEngineViewerProps {
  car: Supercar;
  onClose: () => void;
}

export const ExplodedEngineViewer: React.FC<ExplodedEngineViewerProps> = ({ car, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.5); // 1.0x to 4.0x
  const [selectedHotspot, setSelectedHotspot] = useState<EngineHotspot>(car.engineHotspots[0] || null);
  const [activeLayers, setActiveLayers] = useState({
    bodywork: true,
    aerodynamics: true,
    monocoque: true,
    engineCore: true,
    exhaust: true,
    brakes: true,
  });
  const [isXrayMode, setIsXrayMode] = useState(true);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(4.0, +(prev + 0.5).toFixed(1)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1.0, +(prev - 0.5).toFixed(1)));

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-fadeIn text-white">
      
      {/* Top Header Bar */}
      <div className="w-full px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-red-600/30">
            X-RAY
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg text-white uppercase tracking-wider">
                {car.brand} {car.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-zinc-300 border border-white/20">
                {car.engineDisplacement}
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Interactive 3D Exploded Engine Blueprint & Component Telemetry
            </p>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-3">
          
          {/* X-Ray / Blueprint Visual Toggle */}
          <button
            onClick={() => setIsXrayMode(!isXrayMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isXrayMode
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-900/30'
                : 'bg-white/5 text-zinc-400 border-white/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isXrayMode ? 'X-Ray Filter Active' : 'Photorealistic'}</span>
          </button>

          {/* Close Exploded View */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            title="Close Exploded View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden p-4 sm:p-8">
        
        {/* Animated Cybernetic Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Central Exploded Stage */}
        <div 
          className="relative max-w-4xl w-full aspect-[16/10] flex items-center justify-center transition-transform duration-500 ease-out select-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          
          {/* Layer 1: Base Chassis & Engine Schematic Backdrop */}
          <img 
            src={car.schematicImage} 
            alt={`${car.name} Internal Schematic`}
            className={`w-full h-full object-contain filter transition-all duration-700 ${
              isXrayMode ? 'invert hue-rotate-180 contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(59,130,246,0.3)]' : 'brightness-90 contrast-110'
            }`}
          />

          {/* Layer 2: Powertrain Engine Block Layer Overlay */}
          {activeLayers.engineCore && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-44 rounded-3xl border border-red-500/40 bg-red-500/10 backdrop-blur-[1px] animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-red-500/30">
                  POWERTRAIN CORE ACTIVE
                </span>
              </div>
            </div>
          )}

          {/* Interactive Hotspot Radar Pins */}
          {car.engineHotspots.map((hotspot) => {
            const isSelected = selectedHotspot?.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                onClick={() => setSelectedHotspot(hotspot)}
                className="absolute cursor-pointer group z-30 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${hotspot.xPercent}%`, top: `${hotspot.yPercent}%` }}
              >
                {/* Outer Pulsating Ring */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-600/30 scale-125 shadow-lg shadow-red-600/50'
                    : 'border-white/40 bg-black/60 group-hover:border-white group-hover:scale-110'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isSelected ? 'bg-red-500 animate-ping' : 'bg-white'
                  }`} />
                </div>

                {/* Micro Label Tag */}
                <div className={`absolute top-9 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-red-900/50 scale-105'
                    : 'bg-black/80 text-zinc-300 border border-white/20 opacity-0 group-hover:opacity-100'
                }`}>
                  {hotspot.name}
                </div>
              </div>
            );
          })}

        </div>

        {/* Floating Zoom & Perspective Controls (Bottom-Left) */}
        <div className="absolute bottom-6 left-6 z-40 p-3 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-xl shadow-2xl space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
            Optical Zoom: {zoomLevel}x
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30"
              disabled={zoomLevel <= 1.0}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-28 accent-red-600 cursor-pointer"
            />

            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30"
              disabled={zoomLevel >= 4.0}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Layer Deconstruction Peeler (Bottom-Center) */}
        <div className="hidden md:flex absolute bottom-6 z-40 p-2 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-xl shadow-2xl items-center gap-2">
          
          <button
            onClick={() => toggleLayer('bodywork')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
              activeLayers.bodywork ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'
            }`}
          >
            Body Skin
          </button>

          <button
            onClick={() => toggleLayer('engineCore')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
              activeLayers.engineCore ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-zinc-400 border-white/10'
            }`}
          >
            Powertrain
          </button>

          <button
            onClick={() => toggleLayer('exhaust')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
              activeLayers.exhaust ? 'bg-amber-600 text-white border-amber-500' : 'bg-white/5 text-zinc-400 border-white/10'
            }`}
          >
            Exhaust
          </button>

          <button
            onClick={() => toggleLayer('brakes')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
              activeLayers.brakes ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-zinc-400 border-white/10'
            }`}
          >
            Ceramics
          </button>

        </div>

        {/* Selected Hotspot Micro-Spec HUD Card (Right Sidebar) */}
        {selectedHotspot && (
          <div className="absolute top-6 right-6 z-40 max-w-sm w-full p-5 rounded-3xl bg-black/90 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Component Telemetry
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {selectedHotspot.category.toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-display font-extrabold text-white">
                {selectedHotspot.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                {selectedHotspot.specTitle}: <strong className="text-white">{selectedHotspot.specValue}</strong>
              </p>
            </div>

            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {selectedHotspot.description}
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
                <span className="text-[10px] text-zinc-400 uppercase block">Material Construction:</span>
                <span className="text-zinc-200 font-semibold">{selectedHotspot.material}</span>
              </div>

              {selectedHotspot.thermalTolerance && (
                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-mono flex items-center justify-between">
                  <span className="text-[10px] text-red-400 uppercase">Thermal Peak Limit:</span>
                  <span className="text-red-300 font-bold">{selectedHotspot.thermalTolerance}</span>
                </div>
              )}

              {selectedHotspot.powerContribution && (
                <div className="p-2.5 rounded-xl bg-green-950/20 border border-green-500/30 text-xs font-mono flex items-center justify-between">
                  <span className="text-[10px] text-green-400 uppercase">Output Gain:</span>
                  <span className="text-green-300 font-bold">{selectedHotspot.powerContribution}</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
