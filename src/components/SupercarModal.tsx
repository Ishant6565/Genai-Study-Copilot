import React, { useState } from 'react';
import type { Supercar } from '../types/car';
import { X, Eye } from 'lucide-react';

interface SupercarModalProps {
  car: Supercar | null;
  onClose: () => void;
  onOpenExplodedView: () => void;
}

export const SupercarModal: React.FC<SupercarModalProps> = ({
  car,
  onClose,
  onOpenExplodedView,
}) => {
  const [activeImageTab, setActiveImageTab] = useState<'hero' | 'side' | 'interior' | 'engine'>('hero');

  if (!car) return null;

  const currentImage =
    activeImageTab === 'hero'
      ? car.heroImage
      : activeImageTab === 'side'
      ? car.sideImage
      : activeImageTab === 'interior'
      ? car.interiorImage
      : car.engineImage;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn text-white">
      
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0e0e12] border border-white/20 shadow-2xl overflow-hidden my-8 space-y-6">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
              {car.brand.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white">
                {car.brand} {car.name}
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                {car.edition} &bull; {car.originCountry} {car.flag}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Stage */}
        <div className="px-6 space-y-6">
          
          {/* Gallery Viewport */}
          <div className="space-y-3">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img
                src={currentImage}
                alt={car.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => {
                    onClose();
                    onOpenExplodedView();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Launch 3D X-Ray</span>
                </button>
              </div>
            </div>

            {/* Gallery Thumbnail Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveImageTab('hero')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activeImageTab === 'hero' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Front Profile
              </button>
              <button
                onClick={() => setActiveImageTab('side')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activeImageTab === 'side' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Aerodynamic Profile
              </button>
              <button
                onClick={() => setActiveImageTab('interior')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activeImageTab === 'interior' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Cockpit Interior
              </button>
              <button
                onClick={() => setActiveImageTab('engine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  activeImageTab === 'engine' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Engine Bay
              </button>
            </div>
          </div>

          {/* Full Technical Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Powertrain & Performance */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                Powertrain Architecture
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Engine Type:</span>
                  <span className="text-white font-bold">{car.engineDisplacement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Total Output:</span>
                  <span className="text-white font-bold">{car.horsepowerHp} HP ({car.torqueNm} Nm)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Max Engine Revs:</span>
                  <span className="text-white font-bold">{car.maxRpm.toLocaleString()} RPM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Transmission:</span>
                  <span className="text-white font-bold">{car.gearbox}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Drivetrain:</span>
                  <span className="text-white font-bold">{car.drivetrain}</span>
                </div>
              </div>
            </div>

            {/* Chassis & Aerodynamics */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                Chassis & Aerodynamics
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Chassis Monocoque:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">{car.chassisType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Downforce @ 250 km/h:</span>
                  <span className="text-white font-bold">{car.downforceKgAt250} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Curb Mass:</span>
                  <span className="text-white font-bold">{car.curbWeightKg} kg ({car.powerToWeightRatio})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Braking System:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">{car.brakeSystem}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Production Limit:</span>
                  <span className="text-white font-bold">{car.productionLimit}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            Valuation: <strong className="text-white text-base">${(car.priceUsd / 1000000).toFixed(2)}M USD</strong>
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-display font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all"
          >
            Close Blueprint
          </button>
        </div>

      </div>

    </div>
  );
};
