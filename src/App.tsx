import { useState, useEffect } from 'react';
import type { Supercar } from './types/car';
import { SUPERCARS_DATABASE } from './data/supercars';
import { supercarAudio } from './services/supercarAudio';
import { SupercarNavbar } from './components/SupercarNavbar';
import { HeroShowcase } from './components/HeroShowcase';
import { ExplodedEngineViewer } from './components/ExplodedEngineViewer';
import { SupercarGrid } from './components/SupercarGrid';
import { SupercarModal } from './components/SupercarModal';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { VipInquiryModal } from './components/VipInquiryModal';
import { SupercarFooter } from './components/SupercarFooter';

export function App() {
  const [activeCar, setActiveCar] = useState<Supercar>(SUPERCARS_DATABASE[0]);
  const [isExplodedOpen, setIsExplodedOpen] = useState(false);
  const [modalCar, setModalCar] = useState<Supercar | null>(null);
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isVipInquiryOpen, setIsVipInquiryOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Sync Audio Powertrain when car changes
  useEffect(() => {
    supercarAudio.setPowertrain(activeCar.powertrainType);
  }, [activeCar]);

  const handleToggleAudio = () => {
    const muted = supercarAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleSelectCar = (car: Supercar) => {
    setActiveCar(car);
    // Smooth scroll to top showcase
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCompare = (car: Supercar) => {
    setComparedCarIds((prev) => {
      if (prev.includes(car.id)) {
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 hypercars simultaneously.');
        return prev;
      }
      return [...prev, car.id];
    });
  };

  const handleRemoveCompareCar = (carId: string) => {
    setComparedCarIds((prev) => prev.filter((id) => id !== carId));
  };

  const handleClearAllCompare = () => {
    setComparedCarIds([]);
  };

  const comparedCars = SUPERCARS_DATABASE.filter((c) => comparedCarIds.includes(c.id));

  // Dynamic Background Styles based on Active Car Theme Color:
  // - White Car -> Black Background
  // - Black Car -> White Background
  // - Red Car   -> Off-White Background
  const isWhite = activeCar.themeColor === 'white';
  const isBlack = activeCar.themeColor === 'black';

  const appBackgroundStyle = isWhite
    ? 'bg-[#000000] text-white'
    : isBlack
    ? 'bg-[#f4f4f6] text-black'
    : 'bg-[#f2efe9] text-zinc-950';

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col justify-between selection:bg-red-600 selection:text-white ${appBackgroundStyle}`}>
      
      {/* Top Luxury Navigation */}
      <SupercarNavbar
        themeColor={activeCar.themeColor}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        compareCount={comparedCarIds.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenVipInquiry={() => setIsVipInquiryOpen(true)}
      />

      {/* Main Showcase Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full flex-1 space-y-12">
        
        {/* Dynamic Hero Stage with Background Atmosphere */}
        <HeroShowcase
          car={activeCar}
          onOpenExplodedView={() => setIsExplodedOpen(true)}
          onOpenModal={() => setModalCar(activeCar)}
          onToggleCompare={handleToggleCompare}
          isCompared={comparedCarIds.includes(activeCar.id)}
        />

        {/* 16 Hypercar Filterable Grid Gallery */}
        <SupercarGrid
          currentCarId={activeCar.id}
          onSelectCar={handleSelectCar}
          onOpenExplodedForCar={(car) => {
            setActiveCar(car);
            setIsExplodedOpen(true);
          }}
          onToggleCompare={handleToggleCompare}
          comparedCarIds={comparedCarIds}
        />

      </main>

      {/* Interactive Exploded Engine / X-Ray Viewer Modal */}
      {isExplodedOpen && (
        <ExplodedEngineViewer
          car={activeCar}
          onClose={() => setIsExplodedOpen(false)}
        />
      )}

      {/* Deep-Dive Supercar Blueprints Modal */}
      {modalCar && (
        <SupercarModal
          car={modalCar}
          onClose={() => setModalCar(null)}
          onOpenExplodedView={() => {
            setActiveCar(modalCar);
            setIsExplodedOpen(true);
          }}
        />
      )}

      {/* Side-by-Side Comparison Matrix */}
      <ComparisonMatrix
        cars={comparedCars}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemoveCar={handleRemoveCompareCar}
        onClearAll={handleClearAllCompare}
      />

      {/* Private Brokerage & VIP Acquisition Modal */}
      <VipInquiryModal
        isOpen={isVipInquiryOpen}
        onClose={() => setIsVipInquiryOpen(false)}
        activeCar={activeCar}
      />

      {/* Luxury Footer */}
      <SupercarFooter />

    </div>
  );
}

export default App;
