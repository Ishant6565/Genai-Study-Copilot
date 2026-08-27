import React from 'react';
import type { Supercar } from '../types/car';
import { X, Layers, Trash2 } from 'lucide-react';

interface ComparisonMatrixProps {
  cars: Supercar[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCar: (carId: string) => void;
  onClearAll: () => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  cars,
  isOpen,
  onClose,
  onRemoveCar,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn text-white">
      
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#0e0e12] border border-white/20 shadow-2xl overflow-hidden my-8 space-y-6">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white">
                Hypercar Side-by-Side Comparison Matrix
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                Comparing {cars.length} of 3 engineering benchmarks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cars.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto">
          {cars.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-zinc-400 font-mono text-sm">
                No hypercars selected for comparison yet.
              </p>
              <p className="text-xs text-zinc-600 font-mono">
                Click "+ Compare" on any car card in the gallery to benchmark them side by side.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="py-4 px-4 font-bold uppercase w-48">Specification</th>
                  {cars.map((c) => (
                    <th key={c.id} className="py-4 px-4 font-bold text-white text-center w-72">
                      <div className="space-y-2">
                        <img
                          src={c.heroImage}
                          alt={c.name}
                          className="w-full h-24 object-cover rounded-xl border border-white/10"
                        />
                        <div>
                          <span className="text-sm font-display font-extrabold block text-white uppercase">
                            {c.brand} {c.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">{c.edition}</span>
                        </div>
                        <button
                          onClick={() => onRemoveCar(c.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Engine Core</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-white">
                      {c.engineDisplacement}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Horsepower Output</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-red-400 text-sm">
                      {c.horsepowerHp} HP
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Peak Torque</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-white">
                      {c.torqueNm} Nm
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">0 to 100 KM/H</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-amber-400">
                      {c.zeroToHundredSec} Seconds
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Top Speed</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-green-400 text-sm">
                      {c.topSpeedKmh} KM/H
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Power to Weight</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-white">
                      {c.powerToWeightRatio}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Downforce @ 250 km/h</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-blue-400">
                      {c.downforceKgAt250} kg
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Curb Weight</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-zinc-300">
                      {c.curbWeightKg} kg
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Gearbox</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center text-zinc-300">
                      {c.gearbox}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-zinc-400">Valuation Price</td>
                  {cars.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-center font-bold text-white text-sm">
                      ${(c.priceUsd / 1000000).toFixed(2)}M USD
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-display font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all"
          >
            Close Matrix
          </button>
        </div>

      </div>

    </div>
  );
};
