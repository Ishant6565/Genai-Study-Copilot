export interface OpeningRecord {
  eco: string;
  name: string;
  moves: string[]; // SAN moves e.g. ["e4", "c5"]
  description: string;
}

export const OPENINGS_DATABASE: OpeningRecord[] = [
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    description: 'One of the most complex, dynamic, and revered sharp counterattacking weapons in chess history, favored by Fischer and Kasparov.'
  },
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: ['e4', 'c5'],
    description: 'The most popular and highest-scoring response to 1.e4, creating an immediate asymmetrical battle for central control.'
  },
  {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'A cornerstone of classical chess dating back to the 16th century, placing direct pressure on Black’s defending c6 knight.'
  },
  {
    eco: 'D30',
    name: "Queen's Gambit Declined",
    moves: ['d4', 'd5', 'c4', 'e6'],
    description: 'A deeply solid, classical setup where Black securely anchors the central d5 strongpoint.'
  },
  {
    eco: 'D20',
    name: "Queen's Gambit Accepted",
    moves: ['d4', 'd5', 'c4', 'dxc4'],
    description: 'Black captures the offered flank pawn, opting for rapid active piece play while conceding center space.'
  },
  {
    eco: 'E60',
    name: "King's Indian Defense",
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    description: 'A hypermodern masterpiece where Black allows White a broad pawn center to launch a vicious kingside pawn storm.'
  },
  {
    eco: 'C00',
    name: 'French Defense',
    moves: ['e4', 'e6', 'd4', 'd5'],
    description: 'A resilient, counter-punching defense resulting in locked pawn chains and sharp tactical pawn breaks on c5 and f6.'
  },
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: ['e4', 'c6', 'd4', 'd5'],
    description: 'Renowned for producing ultra-solid pawn structures and clean bishop diagonals, beloved by Anatoly Karpov.'
  },
  {
    eco: 'C50',
    name: 'Italian Game (Giuoco Piano)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    description: 'The harmonious "Quiet Game" focusing on rapid development and pressure on the vulnerable f7 square.'
  },
  {
    eco: 'A10',
    name: 'English Opening',
    moves: ['c4'],
    description: 'A flexible flank opening controlling the d5 square from afar and frequently transposing into Sicilian Reversed structures.'
  },
  {
    eco: 'B01',
    name: 'Scandinavian Defense',
    moves: ['e4', 'd5'],
    description: 'An immediate frontal challenge to White’s central e4 pawn on move one.'
  }
];

export function identifyOpening(moveHistory: { san: string }[]): OpeningRecord | null {
  const sans = moveHistory.map(m => m.san);
  
  let bestMatch: OpeningRecord | null = null;
  let maxMatchedMoves = 0;

  for (const op of OPENINGS_DATABASE) {
    if (op.moves.length <= sans.length) {
      let isMatch = true;
      for (let i = 0; i < op.moves.length; i++) {
        if (op.moves[i] !== sans[i]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch && op.moves.length > maxMatchedMoves) {
        maxMatchedMoves = op.moves.length;
        bestMatch = op;
      }
    }
  }

  return bestMatch;
}
