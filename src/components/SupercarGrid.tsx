import React, { useState } from 'react';
import type { Supercar, CarThemeColor } from '../types/car';
import { SUPERCARS_DATABASE } from '../data/supercars';
import { Eye, Layers, Sparkles, Check } from 'lucide-react';

interface SupercarGridProps {
  currentCarId: string;
  onSelectCar: (car: Supercar) => void;
  onOpenExplodedForCar: (car: Supercar) => void;
  onToggleCompare: (car: Supercar) => void;
  comparedCarIds: string[];
}

export const SupercarGrid: React.FC<SupercarGridProps> = ({
  currentCarId,
  onSelectCar,
  onOpenExplodedForCar,
  onToggleCompare,
  comparedCarIds,
}) => {
  const [colorFilter, setColorFilter] = useState<'all' | CarThemeColor>('all');
  const [powertrainFilter, setPowertrainFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredCars = SUPERCARS_DATABASE.filter((car) => {
    const matchesColor = colorFilter === 'all' || car.themeColor === colorFilter;
    const matchesPowertrain =
      powertrainFilter === 'all' ||
      (powertrainFilter === 'V12' && (car.powertrainType === 'V12' || car.powertrainType === 'Hybrid V12')) ||
      (powertrainFilter === 'V8' && (car.powertrainType === 'V8 Twin-Turbo' || car.powertrainType === 'Hybrid V8')) ||
      (powertrainFilter === 'W16' && car.powertrainType === 'W16 Quad-Turbo') ||
      (powertrainFilter === 'EV' && car.powertrainType === 'Quad-Motor EV');

    const matchesSearch =
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.powertrainType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesColor && matchesPowertrain && matchesSearch;
  });

  return (
    <div className="w-full space-y-8">
      
      {/* Header & Filter System */}
      <div className="space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-white">
                World Hypercar & Supercar Collection
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
              Select any vehicle to adapt the dynamic atmosphere & inspect internal blueprints (16 Engineering Marvels)
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by model, brand, engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#141418] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills (Color Themes & Powertrain) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0f0f13] border border-white/10">
          
          {/* Color Edition Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase mr-1">
              Finish:
            </span>
            
            <button
              onClick={() => setColorFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                colorFilter === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              All (16)
            </button>

            <button
              onClick={() => setColorFilter('white')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                colorFilter === 'white'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20" />
              <span>Glacier White (Black BG)</span>
            </button>

            <button
              onClick={() => setColorFilter('black')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                colorFilter === 'black'
                  ? 'bg-zinc-800 text-white shadow-md border border-white/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/40" />
              <span>Obsidian Black (White BG)</span>
            </button>

            <button
              onClick={() => setColorFilter('red')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                colorFilter === 'red'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Rosso Corsa (Off-White BG)</span>
            </button>
          </div>

          {/* Powertrain Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase mr-1">
              Engine:
            </span>

            {['all', 'V12', 'V8', 'W16', 'EV'].map((pt) => (
              <button
                key={pt}
                onClick={() => setPowertrainFilter(pt)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  powertrainFilter === pt
                    ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {pt.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* 16 Hypercar Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => {
          const isActive = car.id === currentCarId;
          const isCompared = comparedCarIds.includes(car.id);

          return (
            <div
              key={car.id}
              className={`group rounded-3xl overflow-hidden border transition-all duration-500 bg-[#0d0d11] flex flex-col justify-between ${
                isActive
                  ? 'border-red-500 shadow-2xl shadow-red-950/40 ring-1 ring-red-500'
                  : 'border-white/10 hover:border-white/30 hover:shadow-xl'
              }`}
            >
              {/* Card Image Stage */}
              <div 
                className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer bg-zinc-950"
                onClick={() => onSelectCar(car)}
              >
                <img 
                  src={car.heroImage} 
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-extrabold bg-black/80 text-white border border-white/20 backdrop-blur-md">
                      {car.brand}
                    </span>
                    <span className="text-xs">{car.flag}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-zinc-300 border border-white/20 backdrop-blur-md">
                    ${(car.priceUsd / 1000000).toFixed(2)}M
                  </span>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white shadow-lg shadow-red-900/50 animate-pulse">
                      <Check className="w-3 h-3" /> ACTIVE SHOWCASE
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-display font-extrabold text-white group-hover:text-red-400 transition-colors uppercase">
                      {car.name}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {car.year}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5 line-clamp-1">
                    {car.edition}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">Power</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{car.horsepowerHp} HP</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">0-100</span>
                    <span className="text-sm font-bold text-amber-400 mt-0.5 block">{car.zeroToHundredSec}s</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">Top Speed</span>
                    <span className="text-sm font-bold text-red-400 mt-0.5 block">{car.topSpeedKmh} <small className="text-[9px]">km/h</small></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  
                  {/* Exploded View Trigger */}
                  <button
                    onClick={() => onOpenExplodedForCar(car)}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>X-Ray Engine</span>
                  </button>

                  {/* Add to Compare */}
                  <button
                    onClick={() => onToggleCompare(car)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      isCompared
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-white/[0.03] hover:bg-white/10 text-zinc-300 border-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'In Compare' : '+ Compare'}</span>
                  </button>

                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
