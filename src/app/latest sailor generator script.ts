import { Midi } from '@tonejs/midi';

interface ExtendedVoicing {
  intervals: number[];
  tensions: number[];
  alterations: number[];
  category: 'citypop' | 'fusion' | 'jazz' | 'ballad';
  weight: number;
  era?: '70s' | 'early80s' | 'mid80s' | 'late80s';
  artistStyle?: string;
}

interface ProgressionTemplate {
  roots: number[];
  weights: number[];
  style: string;
  complexity: number;
}

// Add this interface definition near the top of the file, after the existing interfaces
interface ScaleNote {
  inKey: boolean;      // Whether the note is in the current scale
  isTension: boolean;  // Whether the note is a tension note (9, 11, 13)
  isAlteration: boolean; // Whether the note is an alteration (b9, #9, b13)
}

class EnhancedCityPopGenerator {
  private readonly voicings: Record<string, ExtendedVoicing> = {
    // Classic City Pop voicings
    maj9: {
      intervals: [0, 4, 7, 11, 14],
      tensions: [9, 13],
      alterations: [8, 15],
      category: 'citypop',
      weight: 1.0,
      era: 'early80s'
    },
    maj7_13: {
      intervals: [0, 4, 7, 11, 21],
      tensions: [9, 13],
      alterations: [8, 15],
      category: 'citypop',
      weight: 0.8,
      era: 'mid80s'
    },
    min11: {
      intervals: [0, 3, 7, 10, 14, 17],
      tensions: [15, 22],
      alterations: [8],
      category: 'citypop',
      weight: 0.7,
      era: 'early80s'
    },
    // Tatsuro Yamashita style voicings
    maj9_13: {
      intervals: [0, 4, 7, 11, 14, 21],
      tensions: [13, 15],
      alterations: [8, 22],
      category: 'jazz',
      weight: 0.9,
      artistStyle: 'Tatsuro Yamashita'
    },
    // New Sophisticated Ballad voicings
    maj7_9_13: {
      intervals: [0, 4, 7, 11, 14, 21],
      tensions: [13, 15, 22],
      alterations: [8, 15],
      category: 'ballad',
      weight: 0.7,
      artistStyle: 'Mariya Takeuchi'
    },
    // Additional artist-specific voicings
    kadomatsu_fusion: {
      intervals: [0, 4, 7, 10, 15, 21],
      tensions: [9, 13, 15],
      alterations: [8, 22],
      category: 'fusion',
      weight: 0.8,
      artistStyle: 'Toshiki Kadomatsu'
    },
    anri_pop: {
      intervals: [0, 4, 7, 11, 14],
      tensions: [9, 13],
      alterations: [15],
      category: 'citypop',
      weight: 0.85,
      artistStyle: 'Anri'
    }
  };

  private readonly progressionTemplates: ProgressionTemplate[] = [
    // Enhanced progression templates
    {
      roots: [0, 5, 3, 4],
      weights: [1.0, 0.8, 0.7, 0.9],
      style: 'standard',
      complexity: 0.7
    },
    {
      roots: [0, 5, 1, 4],
      weights: [1.0, 0.7, 0.8, 0.9],
      style: 'jazz',
      complexity: 0.8
    },
    {
      roots: [3, 4, 0, 5, 1],  // Extended progression
      weights: [0.8, 0.9, 1.0, 0.7, 0.8],
      style: 'fusion',
      complexity: 0.9
    },
    // Ballad progression
    {
      roots: [0, 2, 5, 1],
      weights: [1.0, 0.6, 0.7, 0.8],
      style: 'ballad',
      complexity: 0.6
    }
  ];

  private readonly styleSettings = {
    ballad: {
      tempoRange: [65, 80],
      velocityRange: [60, 85],
      swingFactor: 0.2
    },
    uptempo: {
      tempoRange: [120, 135],
      velocityRange: [75, 95],
      swingFactor: 0.4
    },
    fusion: {
      tempoRange: [90, 110],
      velocityRange: [70, 90],
      swingFactor: 0.3
    }
  };

  private readonly scaleTypes = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };

  constructor(
    private readonly options: {
      era?: '70s' | 'early80s' | 'mid80s' | 'late80s';
      style?: 'ballad' | 'uptempo' | 'fusion';
      artistInfluence?: string;
      complexity?: number;
    } = {}
  ) {}

  private createRichVoicing(
    root: number,
    voicing: ExtendedVoicing,
    complexity: number,
    position: number
  ): number[] {
    const notes = new Set<number>();
    
    // Add base intervals with era-specific modifications
    voicing.intervals.forEach(interval => {
      const note = root + interval;
      notes.add(this.adjustNoteForEra(note));
    });

    // Enhanced tension selection based on era and style
    const tensionCount = Math.floor(complexity * (this.options.era === 'mid80s' ? 3 : 2));
    for (let i = 0; i < tensionCount; i++) {
      if (Math.random() < this.getEraTensionProbability()) {
        const tension = voicing.tensions[Math.floor(Math.random() * voicing.tensions.length)];
        notes.add(root + tension);
      }
    }

    // Artist-specific modifications
    if (voicing.artistStyle === this.options.artistInfluence) {
      this.applyArtistModifications(notes, root);
    }

    // Add deep bass notes with era-appropriate voicing
    const bassNote = root - this.getBassProbability();
    notes.add(bassNote);

    return this.spreadVoicing(Array.from(notes), position);
  }

  private adjustNoteForEra(note: number): number {
    switch (this.options.era) {
      case '70s':
        return note - (Math.random() < 0.3 ? 12 : 0); // More compact voicings
      case 'mid80s':
        return note + (Math.random() < 0.4 ? 12 : 0); // Wider spreads
      default:
        return note;
    }
  }

  private getEraTensionProbability(): number {
    switch (this.options.era) {
      case '70s': return 0.5;
      case 'early80s': return 0.7;
      case 'mid80s': return 0.9;
      case 'late80s': return 0.6;
      default: return 0.7;
    }
  }

  private getBassProbability(): number {
    switch (this.options.era) {
      case '70s': return 12; // Less deep bass
      case 'mid80s': return Math.random() < 0.5 ? 24 : 12; // More variation
      default: return Math.random() < 0.3 ? 24 : 12;
    }
  }

  private applyArtistModifications(notes: Set<number>, root: number): void {
    switch (this.options.artistInfluence) {
      case 'Tatsuro Yamashita':
        notes.add(root + 22); // Characteristic #11
        break;
      case 'Mariya Takeuchi':
        // Closer voicing spacing
        notes.forEach(note => {
          if (note - root > 12) notes.add(note - 12);
        });
        break;
      case 'Toshiki Kadomatsu':
        // More altered tensions
        notes.add(root + 21); // Add 13th
        notes.add(root + 15); // Add #9
        break;
    }
  }

  private applySwing(time: number): number {
    const style = this.options.style || 'uptempo';
    const swingFactor = this.styleSettings[style].swingFactor;
    return time + (Math.random() * swingFactor - swingFactor / 2);
  }

  private checkNoteInScale(note: number, root: number, scaleType: 'major' | 'minor' | 'dorian' | 'mixolydian' = 'major'): ScaleNote {
    const normalizedNote = ((note - root) % 12 + 12) % 12;
    return {
      inKey: this.scaleTypes[scaleType].includes(normalizedNote),
      isTension: [9, 11, 13].includes(normalizedNote), // 9ths, 11ths, 13ths
      isAlteration: [1, 3, 6, 8, 10].includes(normalizedNote) // b9, #9, b13, etc.
    };
  }

  private calculateNoteVelocity(
    note: number,
    root: number,
    baseVelocity: number,
    position: number,
    isChordTone: boolean
  ): number {
    const scaleInfo = this.checkNoteInScale(note, root);
    let velocityMultiplier = 1.0;

    // Reduce velocity for out-of-key notes
    if (!scaleInfo.inKey) {
      velocityMultiplier *= 0.6; // 40% reduction for out-of-key notes
    }

    // Further adjust based on note role
    if (scaleInfo.isTension) {
      velocityMultiplier *= 0.8; // Subtle reduction for tensions
    }
    if (scaleInfo.isAlteration) {
      velocityMultiplier *= 0.7; // More reduction for alterations
    }

    // Chord tone emphasis
    if (isChordTone) {
      velocityMultiplier *= 1.2; // Boost chord tones
    }

    // Position-based dynamics
    const positionFactor = 1 + (Math.sin(position * Math.PI / 4) * 0.1);
    velocityMultiplier *= positionFactor;

    // Range-based adjustments
    const normalizedNote = ((note - 60) / 24); // Normalize around middle C
    const rangeFactor = 1 - (Math.abs(normalizedNote) * 0.1);
    velocityMultiplier *= rangeFactor;

    // Apply style-specific adjustments
    switch (this.options.style) {
      case 'ballad':
        velocityMultiplier *= 0.9; // Generally softer
        break;
      case 'fusion':
        velocityMultiplier *= 1.1; // More dynamic
        break;
    }

    // Era-specific adjustments
    if (this.options.era === 'mid80s') {
      velocityMultiplier *= 1.1; // More pronounced dynamics in mid-80s
    }

    // Apply final randomization
    const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
    velocityMultiplier *= randomFactor;

    // Calculate final velocity
    return Math.min(127, Math.max(1, 
      Math.round(baseVelocity * velocityMultiplier)
    ));
  }

  public generateMidiFile(): { data: Uint8Array; tempo: number; name: string } {
    const midi = new Midi();
    const track = midi.addTrack();
    
    // Get style-specific settings
    const style = this.options.style || 'uptempo';
    const settings = this.styleSettings[style];
    
    // Generate tempo with safety bounds
    const tempo = Math.max(60, Math.min(180,
      settings.tempoRange[0] + 
      Math.random() * (settings.tempoRange[1] - settings.tempoRange[0])
    ));
    midi.header.setTempo(tempo);
    
    const validTemplates = this.progressionTemplates.filter(t => 
      t.style === style || t.style === 'standard'
    );
    const progression = validTemplates[
      Math.floor(Math.random() * validTemplates.length)
    ];
    
    const length = 8;
    const tensionArc = this.generateTensionArc(length);
    
    let time = 0;
    let prevNotes: number[] = [];

    for (let i = 0; i < length; i++) {
      const rootIndex = i % progression.roots.length;
      const root = 60 + progression.roots[rootIndex];
      
      const voicingKeys = Object.keys(this.voicings).filter(key => {
        const v = this.voicings[key];
        return (!this.options.era || v.era === this.options.era) &&
               (!this.options.artistInfluence || v.artistStyle === this.options.artistInfluence);
      });
      
      // Ensure we have valid voicings
      if (voicingKeys.length === 0) {
        voicingKeys.push('maj9'); // fallback to basic voicing
      }
      
      const selectedVoicing = this.voicings[
        voicingKeys[Math.floor(Math.random() * voicingKeys.length)]
      ];
      
      const complexity = Math.max(0, Math.min(1, 
        tensionArc[i] * (progression.complexity || 1)
      ));
      
      let notes = this.createRichVoicing(root, selectedVoicing, complexity, i);
      
      // Ensure notes are within valid MIDI range (0-127)
      notes = notes.filter(note => note >= 0 && note <= 127);
      
      // Skip if no valid notes
      if (notes.length === 0) continue;
      
      // Enhanced voice leading with safety checks
      if (prevNotes.length > 0) {
        notes = notes.map((note, idx) => {
          const closest = prevNotes.reduce((prev, curr) => {
            return Math.abs(curr - note) < Math.abs(prev - note) ? curr : prev;
          });
          if (Math.abs(closest - note) > 7) {
            const adjustedNote = note + (closest > note ? 12 : -12);
            // Ensure adjusted note is within valid MIDI range
            return adjustedNote >= 0 && adjustedNote <= 127 ? adjustedNote : note;
          }
          return note;
        });
      }

      // Replace the strumming code with the original note adding code
      const chordStart = Math.max(0, time + Math.max(-0.01, Math.min(0.01, 
        (Math.random() - 0.5) * 0.02
      )));
      
      notes.forEach(note => {
        const velocity = Math.max(0, Math.min(1,
          (settings.velocityRange[0] + 
          Math.random() * (settings.velocityRange[1] - settings.velocityRange[0])) / 127
        ));
        
        const noteTime = Math.max(0, chordStart + Math.max(-0.005, Math.min(0.005,
          (Math.random() - 0.5) * 0.01
        )));
        
        const duration = Math.max(0.1, Math.min(4,
          1.95 + (Math.random() - 0.5) * 0.1
        ));
        
        try {
          track.addNote({
            midi: Math.floor(Math.max(0, Math.min(127, note))),
            time: noteTime,
            duration: duration,
            velocity: velocity
          });
        } catch (error) {
          console.warn('Skipped invalid note:', { note, time: noteTime, duration, velocity });
        }
      });

      time = Math.max(0, time + 2);
      prevNotes = notes;
    }

    try {
      return {
        data: midi.toArray(),
        tempo,
        name: `citypop-${this.options.era || 'standard'}-${this.options.style || 'uptempo'}-${Date.now()}`
      };
    } catch (error) {
      console.error('Error creating MIDI data:', error);
      // Provide fallback minimal valid MIDI
      const fallbackMidi = new Midi();
      const fallbackTrack = fallbackMidi.addTrack();
      fallbackTrack.addNote({
        midi: 60,
        time: 0,
        duration: 1,
        velocity: 0.8
      });
      
      return {
        data: fallbackMidi.toArray(),
        tempo: 120,
        name: `citypop-fallback-${Date.now()}`
      };
    }
  }

  private generateTensionArc(length: number): number[] {
    const phi = (1 + Math.sqrt(5)) / 2;
    const peak = Math.floor(length / phi);
    
    return Array(length).fill(0).map((_, i) => {
      const baseTension = 0.5 + 0.4 * (1 - Math.abs(i - peak) / (length / 2));
      const randomFactor = (Math.random() - 0.5) * 0.2;
      return Math.max(0.3, Math.min(0.9, baseTension + randomFactor));
    });
  }

  // Add this method to the EnhancedCityPopGenerator class
  private spreadVoicing(notes: number[], position: number): number[] {
    let spread = notes.slice().sort((a, b) => a - b);
    
    // Optimal spacing between notes based on style and position
    const minSpacing = this.options.style === 'ballad' ? 3 : 2;
    const maxSpacing = this.options.style === 'fusion' ? 24 : 12;
    
    // Ensure minimum spacing between adjacent notes
    for (let i = 1; i < spread.length; i++) {
      if (spread[i] - spread[i-1] < minSpacing) {
        spread[i] += 12;
      }
    }

    // Add strategic octave doublings based on style
    if (this.options.style === 'fusion' || Math.random() < 0.4) {
      const noteToDouble = spread[Math.floor(Math.random() * spread.length)];
      spread.push(noteToDouble + 12);
    }

    // Era-specific spread adjustments
    if (this.options.era === 'mid80s') {
      // Wider spreads for mid-80s style
      spread = spread.map(note => {
        if (note > spread[0] + maxSpacing) {
          return note - 12;
        }
        return note;
      });
    } else if (this.options.era === '70s') {
      // Tighter voicings for 70s style
      spread = spread.map(note => {
        if (note > spread[0] + maxSpacing/2) {
          return note - 12;
        }
        return note;
      });
    }

    // Artist-specific adjustments
    if (this.options.artistInfluence) {
      switch(this.options.artistInfluence) {
        case 'Tatsuro Yamashita':
          // Wider spreads with strategic doubles
          if (Math.random() < 0.5) {
            const topNote = Math.max(...spread);
            spread.push(topNote + 12);
          }
          break;
        case 'Mariya Takeuchi':
          // Closer voicings
          spread = spread.map(note => {
            if (note > spread[0] + maxSpacing/1.5) {
              return note - 12;
            }
            return note;
          });
          break;
      }
    }

    // Optimize overall range
    spread = spread.map(note => {
      if (note < 36) return note + 12; // Too low
      if (note > 84) return note - 12; // Too high
      return note;
    });

    // Position-based adjustments for tension arc
    if (position > 0) {
      const positionFactor = position / 8; // Assuming 8-bar progression
      if (Math.random() < positionFactor) {
        // Gradually increase spread range for tension
        const highNote = Math.max(...spread);
        spread.push(highNote + (Math.random() < 0.5 ? 12 : 7));
      }
    }

    return spread.sort((a, b) => a - b);
  }
}

export const generateAndDownloadMidi = (options: {
  era?: '70s' | 'early80s' | 'mid80s' | 'late80s';
  style?: 'ballad' | 'uptempo' | 'fusion';
  artistInfluence?: string;
  complexity?: number;
} = {}): { url: string; filename: string } => {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const generator = new EnhancedCityPopGenerator(options);
      const { data, tempo, name } = generator.generateMidiFile();
      
      const blob = new Blob([data], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const filename = `${name}-${Math.round(tempo)}bpm.mid`;
      
      return { url, filename };
    } catch (error) {
      attempts++;
      console.warn(`MIDI generation attempt ${attempts} failed:`, error);
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate valid MIDI file after multiple attempts');
      }
    }
  }

  throw new Error('Failed to generate MIDI file');
};
