export type CarThemeColor = 'white' | 'black' | 'red';
export type PowertrainType = 'V12' | 'V8 Twin-Turbo' | 'W16 Quad-Turbo' | 'Hybrid V8' | 'Hybrid V12' | 'Quad-Motor EV';

export interface EngineHotspot {
  id: string;
  name: string;
  category: 'engine' | 'turbo' | 'exhaust' | 'aerodynamics' | 'transmission' | 'brakes';
  xPercent: number; // Position on 2D/3D schematic (0 to 100)
  yPercent: number;
  specTitle: string;
  specValue: string;
  description: string;
  material: string;
  thermalTolerance?: string;
  powerContribution?: string;
}

export interface ExplodedLayer {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  opacity: number;
}

export interface Supercar {
  id: string;
  name: string;
  brand: string;
  edition: string; // e.g. "Frost White Edition", "Obsidian Stealth", "Rosso Corsa Super Sport"
  themeColor: CarThemeColor;
  accentColor: string;
  year: number;
  originCountry: string;
  flag: string;
  
  // High-Res Imagery
  heroImage: string;
  sideImage: string;
  interiorImage: string;
  engineImage: string;
  schematicImage: string;
  
  tagline: string;
  overview: string;
  
  // Pricing & Rarity
  priceUsd: number;
  productionLimit: string;
  
  // Performance Benchmarks
  horsepowerHp: number;
  torqueNm: number;
  topSpeedKmh: number;
  zeroToHundredSec: number;
  zeroToTwoHundredSec: number;
  zeroToFourHundredSec: number;
  quarterMileSec: number;
  downforceKgAt250: number;
  curbWeightKg: number;
  powerToWeightRatio: string; // e.g. "1.00 HP / kg"
  
  // Powertrain & Mechanical Specifications
  powertrainType: PowertrainType;
  engineDisplacement: string; // e.g. "8.0L Quad-Turbocharged W16"
  valvetrain: string;
  maxRpm: number;
  gearbox: string;
  drivetrain: 'AWD' | 'RWD' | 'Torque Vectoring AWD';
  chassisType: string;
  brakeSystem: string;
  
  // Exploded Engine Hotspots
  engineHotspots: EngineHotspot[];
}
