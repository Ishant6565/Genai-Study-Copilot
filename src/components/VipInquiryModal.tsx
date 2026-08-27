import React, { useState } from 'react';
import type { Supercar } from '../types/car';
import { X, ShieldCheck, Download, Send, CheckCircle2 } from 'lucide-react';

interface VipInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCar: Supercar;
}

export const VipInquiryModal: React.FC<VipInquiryModalProps> = ({
  isOpen,
  onClose,
  activeCar,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'Acquisition & Brokerage',
    notes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  const handleDownloadSpecs = () => {
    const specSheet = `=====================================================
APEX HYPERCARS — OFFICIAL TECHNICAL SPECIFICATION SHEET
Curated by Ishant6565 Private Brokerage & Engineering
=====================================================

VEHICLE MODEL: ${activeCar.brand} ${activeCar.name} (${activeCar.year})
EDITION: ${activeCar.edition}
ORIGIN: ${activeCar.originCountry} ${activeCar.flag}
PRICE / VALUATION: $${(activeCar.priceUsd / 1000000).toFixed(2)}M USD
PRODUCTION LIMIT: ${activeCar.productionLimit}

-----------------------------------------------------
POWERTRAIN & MECHANICAL PERFORMANCE
-----------------------------------------------------
Engine Displacement: ${activeCar.engineDisplacement}
Total Output: ${activeCar.horsepowerHp} HP @ ${activeCar.maxRpm} RPM
Peak Torque: ${activeCar.torqueNm} Nm
Top Speed: ${activeCar.topSpeedKmh} KM/H
0 to 100 km/h: ${activeCar.zeroToHundredSec} Seconds
0 to 200 km/h: ${activeCar.zeroToTwoHundredSec} Seconds
0 to 400 km/h: ${activeCar.zeroToFourHundredSec} Seconds
Quarter Mile: ${activeCar.quarterMileSec} Seconds
Power to Weight Ratio: ${activeCar.powerToWeightRatio}
Curb Weight: ${activeCar.curbWeightKg} kg
Downforce at 250 km/h: ${activeCar.downforceKgAt250} kg

-----------------------------------------------------
TRANSMISSION & CHASSIS
-----------------------------------------------------
Gearbox: ${activeCar.gearbox}
Drivetrain: ${activeCar.drivetrain}
Chassis Monocoque: ${activeCar.chassisType}
Brakes: ${activeCar.brakeSystem}

=====================================================
Verified & Certified by Ishant6565 APEX Supercar Platform
=====================================================`;

    const blob = new Blob([specSheet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeCar.brand}_${activeCar.name}_SpecSheet.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn text-white">
      
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e0e12] border border-white/20 shadow-2xl overflow-hidden my-8 space-y-6">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black uppercase text-white">
                Private Brokerage & VIP Acquisition
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                Inquiry regarding: <strong className="text-white">{activeCar.brand} {activeCar.name}</strong>
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-display font-black text-white">
                Inquiry Successfully Logged!
              </h3>
              <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto">
                A private client concierge will contact you regarding allocation, transport logistics, and escrow procedures.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Quick Spec Download Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Download Certified Blueprint Sheet
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Full engineering & performance telemetry export
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSpecs}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export TXT</span>
                </button>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">Client Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">Direct Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client@privateoffice.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">Contact Telephone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">Inquiry Purpose</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="Acquisition & Brokerage">Acquisition & Allocation Brokerage</option>
                    <option value="VIP Track Test Drive">VIP Private Track Test Drive</option>
                    <option value="Collection Consignment">Private Collection Consignment</option>
                    <option value="Commercial License">Commercial Platform Purchase</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">Confidential Notes / Custom Requests</label>
                <textarea
                  rows={3}
                  placeholder="Specify delivery destination, escrow preferences, or bespoke bespoke customization requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-900/30"
              >
                <Send className="w-4 h-4" />
                <span>Submit Confidential Inquiry</span>
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
