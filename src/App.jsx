import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const STORAGE_KEY = "midi_practice_trainer_settings_v8";

const SCALE_LIBRARY = {
  major: {
    label: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "7", "8"],
  },
  naturalMinor: {
    label: "Natural Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
  },
  harmonicMinor: {
    label: "Harmonic Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "7", "8"],
  },
  melodicMinor: {
    label: "Melodic Minor",
    intervals: [0, 2, 3, 5, 7, 9, 11, 12],
    degrees: ["1", "2", "b3", "4", "5", "6", "7", "8"],
  },
  dorian: {
    label: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "6", "b7", "8"],
  },
  phrygian: {
    label: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10, 12],
    degrees: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"],
  },
  lydian: {
    label: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11, 12],
    degrees: ["1", "2", "3", "#4", "5", "6", "7", "8"],
  },
  mixolydian: {
    label: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "b7", "8"],
  },
  aeolian: {
    label: "Aeolian",
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
  },
  locrian: {
    label: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10, 12],
    degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7", "8"],
  },
  majorPentatonic: {
    label: "Major Pentatonic",
    intervals: [0, 2, 4, 7, 9, 12],
    degrees: ["1", "2", "3", "5", "6", "8"],
  },
  minorPentatonic: {
    label: "Minor Pentatonic",
    intervals: [0, 3, 5, 7, 10, 12],
    degrees: ["1", "b3", "4", "5", "b7", "8"],
  },
  blues: {
    label: "Blues",
    intervals: [0, 3, 5, 6, 7, 10, 12],
    degrees: ["1", "b3", "4", "#4", "5", "b7", "8"],
  },
  wholeTone: {
    label: "Whole Tone",
    intervals: [0, 2, 4, 6, 8, 10, 12],
    degrees: ["1", "2", "3", "#4", "#5", "b7", "8"],
  },
  diminishedHalfWhole: {
    label: "Diminished Half Whole",
    intervals: [0, 1, 3, 4, 6, 7, 9, 10, 12],
    degrees: ["1", "b2", "#2", "3", "#4", "5", "6", "b7", "8"],
  },
  diminishedWholeHalf: {
    label: "Diminished Whole Half",
    intervals: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    degrees: ["1", "2", "b3", "4", "b5", "b6", "6", "7", "8"],
  },
  chromatic: {
    label: "Chromatic",
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    degrees: ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7", "8"],
  },
  majorBebop: {
    label: "Major Bebop",
    intervals: [0, 2, 4, 5, 7, 8, 9, 11, 12],
    degrees: ["1", "2", "3", "4", "5", "#5", "6", "7", "8"],
  },
  dominantBebop: {
    label: "Dominant Bebop",
    intervals: [0, 2, 4, 5, 7, 9, 10, 11, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "b7", "7", "8"],
  },
  minorBebop: {
    label: "Minor Bebop",
    intervals: [0, 2, 3, 5, 7, 8, 9, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "6", "b7", "8"],
  },
  majorBlues: {
    label: "Major Blues",
    intervals: [0, 2, 3, 4, 7, 9, 12],
    degrees: ["1", "2", "b3", "3", "5", "6", "8"],
  },
  hungarianMinor: {
    label: "Hungarian Minor",
    intervals: [0, 2, 3, 6, 7, 8, 11, 12],
    degrees: ["1", "2", "b3", "#4", "5", "b6", "7", "8"],
  },
  doubleHarmonic: {
    label: "Double Harmonic",
    intervals: [0, 1, 4, 5, 7, 8, 11, 12],
    degrees: ["1", "b2", "3", "4", "5", "b6", "7", "8"],
  },
  persian: {
    label: "Persian",
    intervals: [0, 1, 4, 5, 6, 8, 11, 12],
    degrees: ["1", "b2", "3", "4", "b5", "b6", "7", "8"],
  },
  spanishGypsy: {
    label: "Spanish Gypsy",
    intervals: [0, 1, 4, 5, 7, 8, 10, 12],
    degrees: ["1", "b2", "3", "4", "5", "b6", "b7", "8"],
  },
  lydianDominant: {
    label: "Lydian Dominant",
    intervals: [0, 2, 4, 6, 7, 9, 10, 12],
    degrees: ["1", "2", "3", "#4", "5", "6", "b7", "8"],
  },
  altered: {
    label: "Altered",
    intervals: [0, 1, 3, 4, 6, 8, 10, 12],
    degrees: ["1", "b2", "#2", "3", "b5", "#5", "b7", "8"],
  },
};

const CHORD_LIBRARY = [
  { suffix: "", intervals: [0, 4, 7], aliases: ["maj"], priority: 100, core: [0, 4, 7] },
  { suffix: "m", intervals: [0, 3, 7], aliases: ["min"], priority: 100, core: [0, 3, 7] },
  { suffix: "dim", intervals: [0, 3, 6], aliases: [], priority: 98, core: [0, 3, 6] },
  { suffix: "aug", intervals: [0, 4, 8], aliases: ["+"], priority: 98, core: [0, 4, 8] },
  { suffix: "sus2", intervals: [0, 2, 7], aliases: [], priority: 92, core: [0, 2, 7] },
  { suffix: "sus4", intervals: [0, 5, 7], aliases: ["sus"], priority: 92, core: [0, 5, 7] },
  { suffix: "6", intervals: [0, 4, 7, 9], aliases: [], priority: 94, core: [0, 4, 9] },
  { suffix: "m6", intervals: [0, 3, 7, 9], aliases: [], priority: 94, core: [0, 3, 9] },
  { suffix: "maj7", intervals: [0, 4, 7, 11], aliases: ["M7"], priority: 110, core: [0, 4, 11] },
  { suffix: "7", intervals: [0, 4, 7, 10], aliases: ["dom7"], priority: 110, core: [0, 4, 10] },
  { suffix: "m7", intervals: [0, 3, 7, 10], aliases: [], priority: 108, core: [0, 3, 10] },
  { suffix: "mMaj7", intervals: [0, 3, 7, 11], aliases: ["mM7"], priority: 108, core: [0, 3, 11] },
  { suffix: "dim7", intervals: [0, 3, 6, 9], aliases: [], priority: 106, core: [0, 3, 6, 9] },
  { suffix: "m7b5", intervals: [0, 3, 6, 10], aliases: ["ø7"], priority: 106, core: [0, 3, 6, 10] },
  { suffix: "add9", intervals: [0, 2, 4, 7], aliases: [], priority: 96, core: [0, 2, 4] },
  { suffix: "madd9", intervals: [0, 2, 3, 7], aliases: [], priority: 96, core: [0, 2, 3] },
  { suffix: "add11", intervals: [0, 4, 5, 7], aliases: [], priority: 94, core: [0, 4, 5] },
  { suffix: "madd11", intervals: [0, 3, 5, 7], aliases: [], priority: 94, core: [0, 3, 5] },
  { suffix: "6add9", intervals: [0, 2, 4, 7, 9], aliases: [], priority: 102, core: [0, 2, 4, 9] },
  { suffix: "9", intervals: [0, 2, 4, 7, 10], aliases: [], priority: 114, core: [0, 4, 10, 2] },
  { suffix: "m9", intervals: [0, 2, 3, 7, 10], aliases: [], priority: 112, core: [0, 3, 10, 2] },
  { suffix: "maj9", intervals: [0, 2, 4, 7, 11], aliases: ["M9"], priority: 114, core: [0, 4, 11, 2] },
  { suffix: "11", intervals: [0, 2, 4, 5, 7, 10], aliases: [], priority: 116, core: [0, 4, 10, 5] },
  { suffix: "m11", intervals: [0, 2, 3, 5, 7, 10], aliases: [], priority: 114, core: [0, 3, 10, 5] },
  { suffix: "maj11", intervals: [0, 2, 4, 5, 7, 11], aliases: ["M11"], priority: 116, core: [0, 4, 11, 5] },
  { suffix: "13", intervals: [0, 2, 4, 7, 9, 10], aliases: [], priority: 118, core: [0, 4, 10, 9] },
  { suffix: "m13", intervals: [0, 2, 3, 7, 9, 10], aliases: [], priority: 116, core: [0, 3, 10, 9] },
  { suffix: "maj13", intervals: [0, 2, 4, 7, 9, 11], aliases: ["M13"], priority: 118, core: [0, 4, 11, 9] },
  { suffix: "7sus4", intervals: [0, 5, 7, 10], aliases: [], priority: 108, core: [0, 5, 10] },
  { suffix: "9sus4", intervals: [0, 2, 5, 7, 10], aliases: [], priority: 112, core: [0, 5, 10, 2] },
  { suffix: "maj7#5", intervals: [0, 4, 8, 11], aliases: [], priority: 110, core: [0, 4, 8, 11] },
  { suffix: "7#5", intervals: [0, 4, 8, 10], aliases: ["aug7"], priority: 110, core: [0, 4, 8, 10] },
  { suffix: "7b5", intervals: [0, 4, 6, 10], aliases: [], priority: 110, core: [0, 4, 6, 10] },
  { suffix: "7b9", intervals: [0, 1, 4, 7, 10], aliases: [], priority: 116, core: [0, 4, 10, 1] },
  { suffix: "7#9", intervals: [0, 3, 4, 7, 10], aliases: [], priority: 116, core: [0, 4, 10, 3] },
  { suffix: "7#11", intervals: [0, 2, 4, 6, 7, 10], aliases: [], priority: 118, core: [0, 4, 10, 6] },
  { suffix: "7b13", intervals: [0, 2, 4, 7, 8, 10], aliases: [], priority: 118, core: [0, 4, 10, 8] },
  { suffix: "mMaj9", intervals: [0, 2, 3, 7, 11], aliases: [], priority: 114, core: [0, 3, 11, 2] },
  { suffix: "m6add9", intervals: [0, 2, 3, 7, 9], aliases: [], priority: 102, core: [0, 3, 9, 2] },
];

const CHORD_EXERCISES = [
  { id: "majorTriad", label: "Major triad", intervals: [0, 4, 7] },
  { id: "minorTriad", label: "Minor triad", intervals: [0, 3, 7] },
  { id: "diminishedTriad", label: "Diminished triad", intervals: [0, 3, 6] },
  { id: "augmentedTriad", label: "Augmented triad", intervals: [0, 4, 8] },
  { id: "dominant7", label: "Dominant 7", intervals: [0, 4, 7, 10] },
  { id: "minor7", label: "Minor 7", intervals: [0, 3, 7, 10] },
  { id: "maj7", label: "Major 7", intervals: [0, 4, 7, 11] },
  { id: "m7b5", label: "Half diminished", intervals: [0, 3, 6, 10] },
  { id: "dim7", label: "Diminished 7", intervals: [0, 3, 6, 9] },
  { id: "sus4", label: "Sus4", intervals: [0, 5, 7] },
  { id: "add9", label: "Add9", intervals: [0, 2, 4, 7] },
];

const MODES = {
  chord: "chord",
  scale: "scale",
  chordExercise: "chordExercise",
  combined: "combined",
};

const DIRECTIONS = {
  up: "up",
  down: "down",
  upDown: "upDown",
};

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function midiToPitchClass(midi) {
  return ((midi % 12) + 12) % 12;
}

function midiToNoteName(midi, preferFlats = false) {
  return (preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP)[midiToPitchClass(midi)];
}

function midiToScientificNote(midi, preferFlats = false) {
  const octave = Math.floor(midi / 12) - 1;
  return `${midiToNoteName(midi, preferFlats)}${octave}`;
}

function normalizePitchClasses(notes) {
  return [...new Set(notes.map(midiToPitchClass))].sort((a, b) => a - b);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function isSubsetSet(a, b) {
  return a.every((value) => b.includes(value));
}

function isBlackKey(midi) {
  return [1, 3, 6, 8, 10].includes(midiToPitchClass(midi));
}

function buildKeyboardRange(start = 36, end = 96) {
  const whiteKeys = [];
  const blackKeys = [];
  let whiteIndex = 0;

  for (let midi = start; midi <= end; midi += 1) {
    if (isBlackKey(midi)) {
      blackKeys.push({
        midi,
        leftWhiteIndex: whiteIndex - 1,
      });
    } else {
      whiteKeys.push({
        midi,
        whiteIndex,
      });
      whiteIndex += 1;
    }
  }

  return {
    whiteKeys,
    blackKeys,
    whiteCount: whiteKeys.length,
  };
}

function rotateToRoot(pitchClasses, root) {
  return pitchClasses.map((pc) => ((pc - root + 12) % 12)).sort((a, b) => a - b);
}

function formatChordName(root, suffix, preferFlats = false) {
  const names = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return `${names[root]}${suffix}`;
}

function findBassNote(activeMidiNotes) {
  if (!activeMidiNotes.length) return null;
  return Math.min(...activeMidiNotes);
}

function scoreChordMatch(normalizedPlayed, chordPattern, chordCore, rootPitchClass, bassPitchClass) {
  const playedSet = new Set(normalizedPlayed);
  const patternSet = new Set(chordPattern);
  const coreSet = new Set(chordCore);

  let matchedPattern = 0;
  let matchedCore = 0;

  patternSet.forEach((pc) => {
    if (playedSet.has(pc)) matchedPattern += 1;
  });

  coreSet.forEach((pc) => {
    if (playedSet.has(pc)) matchedCore += 1;
  });

  const missingPattern = chordPattern.length - matchedPattern;
  const extraPlayed = normalizedPlayed.length - matchedPattern;
  const missingCore = chordCore.length - matchedCore;

  let score = 0;
  score += matchedPattern * 14;
  score += matchedCore * 18;
  score -= missingPattern * 7;
  score -= missingCore * 12;
  score -= Math.max(0, extraPlayed) * 4;

  if (playedSet.has(0)) score += 8;
  if (bassPitchClass !== null && bassPitchClass === rootPitchClass) score += 6;
  if (normalizedPlayed.length === chordPattern.length) score += 5;
  if (matchedPattern === chordPattern.length) score += 12;

  return score;
}

function detectChord(activeMidiNotes) {
  if (!activeMidiNotes.length) {
    return {
      label: "No chord",
      alternates: [],
      rootPitchClass: null,
      bassLabel: null,
      suffix: null,
      preferFlats: false,
    };
  }

  const pitchClasses = normalizePitchClasses(activeMidiNotes);
  const bassMidi = findBassNote(activeMidiNotes);
  const bassPitchClass = bassMidi !== null ? midiToPitchClass(bassMidi) : null;

  const exactMatches = [];
  const scoredMatches = [];

  for (let root = 0; root < 12; root += 1) {
    const normalized = rotateToRoot(pitchClasses, root);

    for (const chord of CHORD_LIBRARY) {
      const pattern = [...new Set(chord.intervals)].sort((a, b) => a - b);
      const core = [...new Set(chord.core || chord.intervals)].sort((a, b) => a - b);

      if (arraysEqual(normalized, pattern)) {
        exactMatches.push({
          rootPitchClass: root,
          suffix: chord.suffix,
          score: 1000 + (chord.priority || 0),
        });
      } else {
        const score = scoreChordMatch(normalized, pattern, core, root, bassPitchClass);
        if (score >= 20) {
          scoredMatches.push({
            rootPitchClass: root,
            suffix: chord.suffix,
            score: score + (chord.priority || 0),
          });
        }
      }
    }
  }

  const allMatches = exactMatches.length ? exactMatches : scoredMatches;

  if (!allMatches.length) {
    return {
      label: "Unknown voicing",
      alternates: [],
      rootPitchClass: activeMidiNotes.length ? midiToPitchClass(Math.min(...activeMidiNotes)) : null,
      bassLabel: bassMidi !== null ? midiToScientificNote(bassMidi) : null,
      suffix: null,
      preferFlats: false,
    };
  }

  allMatches.sort((a, b) => b.score - a.score);

  const unique = [];
  const seen = new Set();

  allMatches.forEach((match) => {
    const sharpName = formatChordName(match.rootPitchClass, match.suffix, false);
    const flatName = formatChordName(match.rootPitchClass, match.suffix, true);

    [
      { name: sharpName, preferFlats: false, rootPitchClass: match.rootPitchClass, suffix: match.suffix },
      { name: flatName, preferFlats: true, rootPitchClass: match.rootPitchClass, suffix: match.suffix },
    ].forEach((item) => {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        unique.push(item);
      }
    });
  });

  const best = unique[0];
  const bassName = bassMidi !== null ? midiToNoteName(bassMidi, best?.preferFlats) : null;
  const rootName = best ? midiToNoteName(best.rootPitchClass, best.preferFlats) : null;
  const slashNeeded = bassName && rootName && bassName !== rootName;
  const finalLabel = slashNeeded ? `${best.name}/${bassName}` : best.name;

  return {
    label: finalLabel || "Unknown voicing",
    alternates: unique.slice(1, 5).map((item) => item.name),
    rootPitchClass: best?.rootPitchClass ?? null,
    bassLabel: bassMidi !== null ? midiToScientificNote(bassMidi, best?.preferFlats) : null,
    suffix: best?.suffix ?? null,
    preferFlats: best?.preferFlats ?? false,
  };
}

function buildScaleIntervalsForOctaves(baseIntervals, octaves, direction) {
  const ascent = [];

  for (let octave = 0; octave < octaves; octave += 1) {
    const offset = octave * 12;
    const slice = octave === 0 ? baseIntervals : baseIntervals.slice(1);
    slice.forEach((interval) => ascent.push(interval + offset));
  }

  if (direction === DIRECTIONS.up) {
    return ascent;
  }

  if (direction === DIRECTIONS.down) {
    return [...ascent].reverse();
  }

  const descent = [...ascent].slice(0, -1).reverse();
  return [...ascent, ...descent];
}

function buildScaleDegreesForOctaves(baseDegrees, octaves, direction) {
  const ascent = [];

  for (let octave = 0; octave < octaves; octave += 1) {
    const slice = octave === 0 ? baseDegrees : baseDegrees.slice(1);
    ascent.push(...slice);
  }

  if (direction === DIRECTIONS.up) {
    return ascent;
  }

  if (direction === DIRECTIONS.down) {
    return [...ascent].reverse();
  }

  const descent = [...ascent].slice(0, -1).reverse();
  return [...ascent, ...descent];
}

function buildExpectedScaleSequence(rootMidi, scaleKey, octaves, direction) {
  const scale = SCALE_LIBRARY[scaleKey];
  const intervals = buildScaleIntervalsForOctaves(scale.intervals, octaves, direction);
  return intervals.map((interval) => rootMidi + interval);
}

function buildExpectedScaleDegrees(scaleKey, octaves, direction) {
  const scale = SCALE_LIBRARY[scaleKey];
  return buildScaleDegreesForOctaves(scale.degrees, octaves, direction);
}

function getRootPreviewMidi(rootName) {
  const rootPitchClass = NOTE_NAMES_SHARP.indexOf(rootName);
  return 60 + ((rootPitchClass - midiToPitchClass(60) + 12) % 12);
}

function buildScalePreviewNotes(rootName, scaleKey, octaves, direction) {
  const rootMidi = getRootPreviewMidi(rootName);
  return buildExpectedScaleSequence(rootMidi, scaleKey, octaves, direction);
}

function buildChordPreviewNotes(rootName, chordId) {
  const chord = CHORD_EXERCISES.find((item) => item.id === chordId) ?? CHORD_EXERCISES[0];
  const rootMidi = getRootPreviewMidi(rootName);
  return chord.intervals.map((interval) => rootMidi + interval);
}

function pitchClassesFromMidi(notes) {
  return normalizePitchClasses(notes);
}

function getRecommendation(accuracy) {
  if (accuracy >= 95) return "Excellent accuracy. Increase tempo slightly.";
  if (accuracy >= 90) return "Strong work. Keep the shape and raise tempo gradually.";
  if (accuracy >= 75) return "Good progress. Repeat it a few more times for cleaner timing.";
  return "Slow it down and focus on root, shape, and even timing.";
}

function pitchClassToName(pitchClass, preferFlats = false) {
  return (preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP)[pitchClass];
}

function getScaleRecommendationsForChord(chord) {
  if (chord.rootPitchClass === null || !chord.suffix) return [];

  const rootPitchClass = chord.rootPitchClass;
  const add = (scaleKey, reason) => ({
    id: `${rootPitchClass}-${scaleKey}`,
    scaleKey,
    label: `${pitchClassToName(rootPitchClass, chord.preferFlats)} ${SCALE_LIBRARY[scaleKey].label}`,
    rootPitchClass,
    reason,
  });

  const suffix = chord.suffix;
  const results = [];

  if (suffix === "") {
    results.push(add("major", "Stable major sound"));
    results.push(add("lydian", "Brighter major color"));
    results.push(add("majorPentatonic", "Simple consonant option"));
  } else if (suffix === "m") {
    results.push(add("dorian", "Flexible minor sound"));
    results.push(add("aeolian", "Natural minor option"));
    results.push(add("minorPentatonic", "Strong practical choice"));
  } else if (suffix === "maj7" || suffix === "maj9" || suffix === "maj11" || suffix === "maj13") {
    results.push(add("lydian", "Strong jazz major color"));
    results.push(add("major", "Diatonic major option"));
    results.push(add("majorBebop", "Line oriented major option"));
  } else if (
    suffix === "m7" ||
    suffix === "m9" ||
    suffix === "m11" ||
    suffix === "m13" ||
    suffix === "m6" ||
    suffix === "m6add9"
  ) {
    results.push(add("dorian", "Common minor 7 choice"));
    results.push(add("aeolian", "Darker minor option"));
    results.push(add("minorPentatonic", "Simple practical option"));
  } else if (
    suffix === "7" ||
    suffix === "9" ||
    suffix === "11" ||
    suffix === "13" ||
    suffix === "7sus4" ||
    suffix === "9sus4"
  ) {
    results.push(add("mixolydian", "Default dominant option"));
    results.push(add("lydianDominant", "Brighter dominant color"));
    results.push(add("dominantBebop", "Line oriented dominant option"));
    results.push(add("blues", "Blues vocabulary"));
  } else if (
    suffix === "7b9" ||
    suffix === "7#9" ||
    suffix === "7b5" ||
    suffix === "7#5" ||
    suffix === "7#11" ||
    suffix === "7b13"
  ) {
    results.push(add("altered", "Altered dominant tension"));
    results.push(add("diminishedHalfWhole", "Dominant diminished option"));
    results.push(add("lydianDominant", "More open altered dominant option"));
  } else if (suffix === "m7b5") {
    results.push(add("locrian", "Classic half diminished sound"));
    results.push(add("dorian", "Softer minor alternative"));
  } else if (suffix === "dim7") {
    results.push(add("diminishedWholeHalf", "Symmetrical diminished option"));
  } else if (suffix === "dim") {
    results.push(add("locrian", "Diminished triad context"));
    results.push(add("diminishedWholeHalf", "Colorful diminished option"));
  } else if (suffix === "aug" || suffix === "maj7#5") {
    results.push(add("wholeTone", "Classic augmented sound"));
    results.push(add("lydian", "Bright major alternative"));
  } else if (suffix === "sus2" || suffix === "sus4" || suffix === "add9" || suffix === "add11" || suffix === "6" || suffix === "6add9") {
    results.push(add("major", "Stable broad choice"));
    results.push(add("mixolydian", "Open suspended color"));
    results.push(add("majorPentatonic", "Simple consonant option"));
  } else if (suffix === "madd9" || suffix === "madd11" || suffix === "mMaj7" || suffix === "mMaj9") {
    results.push(add("melodicMinor", "Melodic minor color"));
    results.push(add("dorian", "Safer minor alternative"));
  } else {
    results.push(add("major", "General fallback"));
  }

  const deduped = [];
  const seen = new Set();
  for (const item of results) {
    if (!seen.has(item.scaleKey)) {
      seen.add(item.scaleKey);
      deduped.push(item);
    }
  }
  return deduped.slice(0, 4);
}

function buildNearbyGuideNotesForRecommendation(rootPitchClass, scaleKey, centerMidi = 60, spanOctaves = 3) {
  if (rootPitchClass === null || !scaleKey) return [];
  const centerOctaveRoot = centerMidi - midiToPitchClass(centerMidi) + rootPitchClass;
  const startRoot = centerOctaveRoot - 12;
  const notes = [];

  for (let octave = 0; octave < spanOctaves; octave += 1) {
    const rootMidi = startRoot + octave * 12;
    SCALE_LIBRARY[scaleKey].intervals.forEach((interval) => {
      notes.push(rootMidi + interval);
    });
  }

  return [...new Set(notes)].filter((m) => m >= 36 && m <= 96).sort((a, b) => a - b);
}

export default function App() {
  const stored = readStoredSettings();

  const [midiSupported, setMidiSupported] = useState(true);
  const [midiStatus, setMidiStatus] = useState("Checking MIDI...");
  const [inputs, setInputs] = useState([]);
  const [selectedInputId, setSelectedInputId] = useState(stored?.selectedInputId || "");
  const [midiMappings, setMidiMappings] = useState(stored?.midiMappings || { sustainPedal: 64 });

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(stored?.volume ?? -12);
  const [waveform, setWaveform] = useState(stored?.waveform || "sine");
  const [releaseTime, setReleaseTime] = useState(stored?.releaseTime ?? 0.22);

  const [heldNotes, setHeldNotes] = useState([]);
  const [soundingNotes, setSoundingNotes] = useState([]);
  const [lastMessage, setLastMessage] = useState("No MIDI data yet");
  const [pedalDown, setPedalDown] = useState(false);

  const [metronomeBpm, setMetronomeBpm] = useState(stored?.metronomeBpm ?? 80);
  const [beatsPerBar, setBeatsPerBar] = useState(stored?.beatsPerBar ?? 4);
  const [accentPattern, setAccentPattern] = useState(
    stored?.accentPattern || [true, false, false, false]
  );
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [currentMetronomeBeat, setCurrentMetronomeBeat] = useState(0);

  const [mode, setMode] = useState(stored?.mode || MODES.chord);
  const [selectedRoot, setSelectedRoot] = useState(stored?.selectedRoot || "C");
  const [selectedScale, setSelectedScale] = useState(stored?.selectedScale || "major");
  const [selectedChordExercise, setSelectedChordExercise] = useState(
    stored?.selectedChordExercise || CHORD_EXERCISES[0].id
  );
  const [exerciseBpm, setExerciseBpm] = useState(stored?.exerciseBpm ?? 80);
  const [timingWindowMs, setTimingWindowMs] = useState(stored?.timingWindowMs ?? 180);
  const [countInBeats, setCountInBeats] = useState(stored?.countInBeats ?? 4);
  const [octaves, setOctaves] = useState(stored?.octaves ?? 2);
  const [scaleDirection, setScaleDirection] = useState(
    stored?.scaleDirection || DIRECTIONS.upDown
  );

  const [isExerciseRunning, setIsExerciseRunning] = useState(false);
  const [exerciseStatus, setExerciseStatus] = useState("Ready");
  const [exerciseFeedback, setExerciseFeedback] = useState("Press Start");
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [exerciseBeatDisplay, setExerciseBeatDisplay] = useState(0);
  const [exerciseLockedRootMidi, setExerciseLockedRootMidi] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [correctNotesCount, setCorrectNotesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  const [previewActive, setPreviewActive] = useState(false);
  const [previewPulseNote, setPreviewPulseNote] = useState(null);
  const [previewExpectedNotes, setPreviewExpectedNotes] = useState([]);
  const [showGuideNotes, setShowGuideNotes] = useState(stored?.showGuideNotes ?? true);

  const [loopBpm, setLoopBpm] = useState(stored?.loopBpm ?? 90);
  const [loopOctaves, setLoopOctaves] = useState(stored?.loopOctaves ?? 2);
  const [loopDirection, setLoopDirection] = useState(stored?.loopDirection || DIRECTIONS.upDown);
  const [isScaleLoopRunning, setIsScaleLoopRunning] = useState(false);
  const [loopStepIndex, setLoopStepIndex] = useState(0);
  const [useRecommendedScale, setUseRecommendedScale] = useState(stored?.useRecommendedScale ?? true);

  const synthRef = useRef(null);
  const accentSynthRef = useRef(null);
  const clickSynthRef = useRef(null);
  const exerciseAccentSynthRef = useRef(null);
  const exerciseClickSynthRef = useRef(null);

  const sustainedNotesRef = useRef(new Set());
  const heldNotesRef = useRef(new Set());
  const soundingNotesRef = useRef(new Set());
  const pedalDownRef = useRef(false);

  const metronomeIntervalRef = useRef(null);
  const metronomeBeatRef = useRef(0);

  const exerciseIntervalRef = useRef(null);
  const exerciseBeatRef = useRef(0);
  const exerciseStartTimeRef = useRef(null);
  const exerciseLockedRootMidiRef = useRef(null);
  const exerciseProgressRef = useRef(0);
  const isExerciseRunningRef = useRef(false);

  const previewTimeoutsRef = useRef([]);
  const keyboardScrollRef = useRef(null);
  const autoAudioInitRef = useRef(false);

  const scaleLoopTimeoutRef = useRef(null);
  const scaleLoopSequenceRef = useRef([]);
  const scaleLoopIndexRef = useRef(0);

  const chord = useMemo(() => detectChord(soundingNotes), [soundingNotes]);
  const keyboardData = useMemo(() => buildKeyboardRange(36, 96), []);
  const scaleInfo = SCALE_LIBRARY[selectedScale];
  const recommendedScales = useMemo(() => getScaleRecommendationsForChord(chord), [chord]);

  const activeRecommendedScaleKey = useMemo(() => {
    if (!recommendedScales.length) return null;
    return recommendedScales[0].scaleKey;
  }, [recommendedScales]);

  const activeRecommendedRootName = useMemo(() => {
    if (chord.rootPitchClass === null) return null;
    return NOTE_NAMES_SHARP[chord.rootPitchClass];
  }, [chord.rootPitchClass]);

  const expectedScaleDegrees = useMemo(
    () => buildExpectedScaleDegrees(selectedScale, octaves, scaleDirection),
    [selectedScale, octaves, scaleDirection]
  );

  const lockedScaleSequence = useMemo(() => {
    if (exerciseLockedRootMidi === null) return [];
    return buildExpectedScaleSequence(exerciseLockedRootMidi, selectedScale, octaves, scaleDirection);
  }, [exerciseLockedRootMidi, selectedScale, octaves, scaleDirection]);

  const scalePreviewNotes = useMemo(
    () => buildScalePreviewNotes(selectedRoot, selectedScale, octaves, scaleDirection),
    [selectedRoot, selectedScale, octaves, scaleDirection]
  );

  const chordPreviewNotes = useMemo(
    () => buildChordPreviewNotes(selectedRoot, selectedChordExercise),
    [selectedRoot, selectedChordExercise]
  );

  const recommendationGuideNotes = useMemo(() => {
    if (!showGuideNotes || chord.rootPitchClass === null || !activeRecommendedScaleKey) return [];
    const centerMidi =
      soundingNotes.length > 0
        ? Math.round(soundingNotes.reduce((a, b) => a + b, 0) / soundingNotes.length)
        : getRootPreviewMidi(NOTE_NAMES_SHARP[chord.rootPitchClass]);
    return buildNearbyGuideNotesForRecommendation(
      chord.rootPitchClass,
      activeRecommendedScaleKey,
      centerMidi,
      3
    );
  }, [showGuideNotes, chord.rootPitchClass, activeRecommendedScaleKey, soundingNotes]);

  const activeGuideNotes =
    mode === MODES.scale
      ? scalePreviewNotes
      : mode === MODES.chordExercise
      ? chordPreviewNotes
      : mode === MODES.chord || mode === MODES.combined
      ? recommendationGuideNotes
      : [];

  const displayExpectedNotes = showGuideNotes
    ? previewExpectedNotes.length
      ? previewExpectedNotes
      : activeGuideNotes
    : [];

  const activeLoopRootName =
    useRecommendedScale && activeRecommendedRootName ? activeRecommendedRootName : selectedRoot;

  const activeLoopScaleKey =
    useRecommendedScale && activeRecommendedScaleKey ? activeRecommendedScaleKey : selectedScale;

  const loopPreviewNotes = useMemo(() => {
    return buildScalePreviewNotes(activeLoopRootName, activeLoopScaleKey, loopOctaves, loopDirection);
  }, [activeLoopRootName, activeLoopScaleKey, loopOctaves, loopDirection]);

  const accuracy = attempts > 0 ? Math.round((correctNotesCount / attempts) * 100) : 0;
  const recommendation = getRecommendation(accuracy);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedInputId,
          midiMappings,
          volume,
          waveform,
          releaseTime,
          metronomeBpm,
          beatsPerBar,
          accentPattern,
          mode,
          selectedRoot,
          selectedScale,
          selectedChordExercise,
          exerciseBpm,
          timingWindowMs,
          countInBeats,
          octaves,
          scaleDirection,
          loopBpm,
          loopOctaves,
          loopDirection,
          showGuideNotes,
          useRecommendedScale,
        })
      );
    } catch {
      //
    }
  }, [
    selectedInputId,
    midiMappings,
    volume,
    waveform,
    releaseTime,
    metronomeBpm,
    beatsPerBar,
    accentPattern,
    mode,
    selectedRoot,
    selectedScale,
    selectedChordExercise,
    exerciseBpm,
    timingWindowMs,
    countInBeats,
    octaves,
    scaleDirection,
    loopBpm,
    loopOctaves,
    loopDirection,
    showGuideNotes,
    useRecommendedScale,
  ]);

  useEffect(() => {
    Tone.getContext().lookAhead = 0.005;
    Tone.getContext().updateInterval = 0.01;
    buildSynths(waveform, releaseTime, volume);

    return () => {
      stopMetronome();
      stopExerciseInterval();
      clearPreviewTimeouts();
      stopScaleLooper();
      if (synthRef.current) synthRef.current.dispose();
      if (accentSynthRef.current) accentSynthRef.current.dispose();
      if (clickSynthRef.current) clickSynthRef.current.dispose();
      if (exerciseAccentSynthRef.current) exerciseAccentSynthRef.current.dispose();
      if (exerciseClickSynthRef.current) exerciseClickSynthRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.value = volume;
  }, [volume]);

  useEffect(() => {
    buildSynths(waveform, releaseTime, volume);
  }, [waveform, releaseTime]);

  useEffect(() => {
    setAccentPattern((prev) =>
      Array.from({ length: beatsPerBar }, (_, i) => prev[i] ?? (i === 0))
    );
  }, [beatsPerBar]);

  useEffect(() => {
    if (isMetronomeRunning) {
      stopMetronome();
      startStandaloneMetronome();
    }
  }, [metronomeBpm, beatsPerBar, accentPattern]);

  useEffect(() => {
    if (isScaleLoopRunning) {
      restartScaleLooper();
    }
  }, [loopBpm, loopOctaves, loopDirection, selectedRoot, selectedScale, activeRecommendedScaleKey, activeRecommendedRootName, useRecommendedScale]);

  useEffect(() => {
    const tryStartAudio = async () => {
      if (autoAudioInitRef.current) return;
      autoAudioInitRef.current = true;
      try {
        await Tone.start();
        setAudioEnabled(true);
      } catch {
        autoAudioInitRef.current = false;
      }
    };

    window.addEventListener("pointerdown", tryStartAudio, { once: true });
    window.addEventListener("keydown", tryStartAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", tryStartAudio);
      window.removeEventListener("keydown", tryStartAudio);
    };
  }, []);

  useEffect(() => {
    let midiAccessRef = null;

    async function setupMidi() {
      if (!("requestMIDIAccess" in navigator)) {
        setMidiSupported(false);
        setMidiStatus("Web MIDI is not supported in this browser.");
        return;
      }

      try {
        const midiAccess = await navigator.requestMIDIAccess();
        midiAccessRef = midiAccess;

        const refreshInputs = () => {
          const availableInputs = Array.from(midiAccess.inputs.values()).map((input) => ({
            id: input.id,
            name: input.name || "Unnamed MIDI input",
            manufacturer: input.manufacturer || "Unknown manufacturer",
          }));

          setInputs(availableInputs);

          if (availableInputs.length) {
            setMidiStatus("MIDI ready");
            setSelectedInputId((prev) => {
              if (prev && availableInputs.some((input) => input.id === prev)) return prev;
              return availableInputs[0].id;
            });
          } else {
            setMidiStatus("MIDI connected but no inputs found");
          }
        };

        refreshInputs();
        midiAccess.onstatechange = refreshInputs;
      } catch (error) {
        setMidiStatus(`Could not access MIDI devices: ${error.message}`);
      }
    }

    setupMidi();

    return () => {
      if (midiAccessRef) midiAccessRef.onstatechange = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let currentInput = null;

    async function connectInput() {
      if (!("requestMIDIAccess" in navigator) || !selectedInputId) return;

      const midiAccess = await navigator.requestMIDIAccess();
      const input = midiAccess.inputs.get(selectedInputId);

      if (!input || cancelled) return;
      currentInput = input;
      setMidiStatus(`Connected: ${input.name || "MIDI input"}`);

      input.onmidimessage = (event) => {
        const [status, data1, data2] = event.data;
        const command = status & 0xf0;
        const channel = (status & 0x0f) + 1;

        setLastMessage(`status ${status} data1 ${data1} data2 ${data2} ch ${channel}`);

        const isControlChange = command === 0xb0;
        const isNoteOn = command === 0x90 && data2 > 0;
        const isNoteOff = command === 0x80 || (command === 0x90 && data2 === 0);

        if (isControlChange) {
          const controller = data1;
          const value = data2;

          if (controller === midiMappings.sustainPedal) {
            if (value >= 64) {
              pedalDownRef.current = true;
              setPedalDown(true);
            } else {
              pedalDownRef.current = false;
              setPedalDown(false);

              if (audioEnabled && synthRef.current) {
                synthRef.current.releaseAll();
              }

              heldNotesRef.current.clear();
              soundingNotesRef.current.clear();
              sustainedNotesRef.current.clear();

              syncHeldNotesState();
              syncSoundingNotesState();
            }
          }

          return;
        }

        const note = data1;
        const velocity = data2;
        const noteName = midiToScientificNote(note);

        if (isNoteOn) {
          heldNotesRef.current.add(note);
          soundingNotesRef.current.add(note);
          sustainedNotesRef.current.delete(note);

          syncHeldNotesState();
          syncSoundingNotesState();

          if (audioEnabled && synthRef.current) {
            synthRef.current.triggerAttack(noteName, undefined, Math.max(0.15, velocity / 127));
          }

          if (mode === MODES.scale || mode === MODES.combined) {
            handleScaleExerciseNote(note);
          }

          if (mode === MODES.chordExercise) {
            handleChordExerciseCheck();
          }

          return;
        }

        if (isNoteOff) {
          heldNotesRef.current.delete(note);
          syncHeldNotesState();

          if (pedalDownRef.current) {
            sustainedNotesRef.current.add(note);
          } else {
            soundingNotesRef.current.delete(note);
            sustainedNotesRef.current.delete(note);

            if (audioEnabled && synthRef.current) {
              synthRef.current.triggerRelease(noteName);
            }

            syncSoundingNotesState();

            if (mode === MODES.chordExercise) {
              handleChordExerciseCheck();
            }
          }
        }
      };
    }

    connectInput().catch((error) => {
      setMidiStatus(`Connection error: ${error.message}`);
    });

    return () => {
      cancelled = true;
      if (currentInput) currentInput.onmidimessage = null;
    };
  }, [selectedInputId, audioEnabled, midiMappings, mode, selectedRoot, selectedScale, selectedChordExercise, exerciseBpm, timingWindowMs, octaves, scaleDirection]);

  useEffect(() => {
    const current = keyboardScrollRef.current;
    if (!current) return;
    current.scrollLeft = Math.max(0, (current.scrollWidth - current.clientWidth) / 2);
  }, []);

  useEffect(() => {
    setPreviewExpectedNotes([]);
    setPreviewPulseNote(null);
    clearPreviewTimeouts();
    resetExerciseState("Ready");
  }, [mode]);

  function syncHeldNotesState() {
    setHeldNotes(Array.from(heldNotesRef.current).sort((a, b) => a - b));
  }

  function syncSoundingNotesState() {
    setSoundingNotes(Array.from(soundingNotesRef.current).sort((a, b) => a - b));
  }

  function buildSynths(nextWaveform, nextReleaseTime, nextVolume) {
    if (synthRef.current) synthRef.current.dispose();
    if (accentSynthRef.current) accentSynthRef.current.dispose();
    if (clickSynthRef.current) clickSynthRef.current.dispose();
    if (exerciseAccentSynthRef.current) exerciseAccentSynthRef.current.dispose();
    if (exerciseClickSynthRef.current) exerciseClickSynthRef.current.dispose();

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: nextWaveform },
      envelope: {
        attack: 0.002,
        decay: 0.04,
        sustain: 0.25,
        release: nextReleaseTime,
      },
    }).toDestination();
    synthRef.current.volume.value = nextVolume;

    accentSynthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    }).toDestination();
    accentSynthRef.current.volume.value = -10;

    clickSynthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    }).toDestination();
    clickSynthRef.current.volume.value = -18;

    exerciseAccentSynthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    }).toDestination();
    exerciseAccentSynthRef.current.volume.value = -8;

    exerciseClickSynthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    }).toDestination();
    exerciseClickSynthRef.current.volume.value = -16;
  }

  async function handleEnableAudioManually() {
    try {
      await Tone.start();
      setAudioEnabled(true);
    } catch {
      //
    }
  }

  function releaseAllNotes() {
    if (audioEnabled && synthRef.current) {
      synthRef.current.releaseAll();
    }
    heldNotesRef.current.clear();
    soundingNotesRef.current.clear();
    sustainedNotesRef.current.clear();
    pedalDownRef.current = false;
    setPedalDown(false);
    syncHeldNotesState();
    syncSoundingNotesState();
  }

  function stopMetronome() {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }
    metronomeBeatRef.current = 0;
    setCurrentMetronomeBeat(0);
    setIsMetronomeRunning(false);
  }

  function startStandaloneMetronome() {
    stopMetronome();
    setIsMetronomeRunning(true);

    const intervalMs = (60 / metronomeBpm) * 1000;
    metronomeBeatRef.current = 0;

    metronomeIntervalRef.current = setInterval(() => {
      const beatInBar = (metronomeBeatRef.current % beatsPerBar) + 1;
      const accented = accentPattern[beatInBar - 1];

      if (audioEnabled) {
        if (accented) {
          accentSynthRef.current?.triggerAttackRelease("C6", 0.05);
        } else {
          clickSynthRef.current?.triggerAttackRelease("G5", 0.05);
        }
      }

      setCurrentMetronomeBeat(beatInBar);
      metronomeBeatRef.current += 1;
    }, intervalMs);
  }

  function handleToggleMetronome() {
    if (isMetronomeRunning) {
      stopMetronome();
    } else {
      startStandaloneMetronome();
    }
  }

  function handleAccentToggle(index) {
    setAccentPattern((prev) => prev.map((value, i) => (i === index ? !value : value)));
  }

  function stopExerciseInterval() {
    if (exerciseIntervalRef.current) {
      clearInterval(exerciseIntervalRef.current);
      exerciseIntervalRef.current = null;
    }
    exerciseBeatRef.current = 0;
    setExerciseBeatDisplay(0);
  }

  function resetExerciseState(message = "Ready") {
    stopExerciseInterval();
    isExerciseRunningRef.current = false;
    exerciseStartTimeRef.current = null;
    exerciseLockedRootMidiRef.current = null;
    exerciseProgressRef.current = 0;
    setIsExerciseRunning(false);
    setExerciseStatus(message);
    setExerciseFeedback("Press Start");
    setExerciseProgress(0);
    setExerciseLockedRootMidi(null);
    setAttempts(0);
    setCorrectNotesCount(0);
    setMistakesCount(0);
  }

  function startExerciseInterval() {
    stopExerciseInterval();

    const intervalMs = (60 / exerciseBpm) * 1000;
    exerciseBeatRef.current = 0;

    exerciseIntervalRef.current = setInterval(() => {
      const beatNumber = exerciseBeatRef.current + 1;

      if (audioEnabled) {
        if (beatNumber <= countInBeats) {
          if (beatNumber === 1) {
            exerciseAccentSynthRef.current?.triggerAttackRelease("E6", 0.05);
          } else {
            exerciseClickSynthRef.current?.triggerAttackRelease("C6", 0.05);
          }
        } else {
          exerciseClickSynthRef.current?.triggerAttackRelease("A5", 0.04);
        }
      }

      setExerciseBeatDisplay(beatNumber);
      exerciseBeatRef.current += 1;
    }, intervalMs);
  }

  function handleStartExercise() {
    if (mode === MODES.chord) return;

    const beatDuration = 60 / exerciseBpm;
    const startTime = Tone.now() + countInBeats * beatDuration;

    stopExerciseInterval();
    exerciseStartTimeRef.current = startTime;
    exerciseLockedRootMidiRef.current = null;
    exerciseProgressRef.current = 0;
    isExerciseRunningRef.current = true;

    setIsExerciseRunning(true);
    setExerciseStatus(`Count in ${countInBeats}`);
    setExerciseFeedback(
      mode === MODES.scale || mode === MODES.combined
        ? `Play ${selectedRoot} ${scaleInfo.label}`
        : `Play ${selectedRoot} ${currentChordExercise().label}`
    );
    setExerciseProgress(0);
    setExerciseLockedRootMidi(null);
    setAttempts(0);
    setCorrectNotesCount(0);
    setMistakesCount(0);
    setShowGuideNotes(true);

    startExerciseInterval();
  }

  function handleStopExercise() {
    resetExerciseState("Stopped");
  }

  function handleScaleExerciseNote(note) {
    if (!isExerciseRunningRef.current || exerciseStartTimeRef.current === null) return;

    const now = Tone.now();
    if (now < exerciseStartTimeRef.current) return;

    const beatDuration = 60 / exerciseBpm;
    const progressIndex = exerciseProgressRef.current;
    const rootPitchClass = NOTE_NAMES_SHARP.indexOf(selectedRoot);

    if (exerciseLockedRootMidiRef.current === null) {
      if (midiToPitchClass(note) !== rootPitchClass) {
        setAttempts((prev) => prev + 1);
        setMistakesCount((prev) => prev + 1);
        setExerciseFeedback(`Start on ${selectedRoot}`);
        return;
      }
      exerciseLockedRootMidiRef.current = note;
      setExerciseLockedRootMidi(note);
    }

    const expectedSequence = buildExpectedScaleSequence(
      exerciseLockedRootMidiRef.current,
      selectedScale,
      octaves,
      scaleDirection
    );

    if (progressIndex >= expectedSequence.length) return;

    const expectedNote = expectedSequence[progressIndex];
    const expectedTime = exerciseStartTimeRef.current + progressIndex * beatDuration;
    const deltaMs = (now - expectedTime) * 1000;
    const absDeltaMs = Math.abs(deltaMs);

    setAttempts((prev) => prev + 1);

    if (note === expectedNote && absDeltaMs <= timingWindowMs) {
      const nextProgress = progressIndex + 1;
      exerciseProgressRef.current = nextProgress;
      setExerciseProgress(nextProgress);
      setCorrectNotesCount((prev) => prev + 1);
      setExerciseFeedback(`Correct ${Math.round(deltaMs)} ms`);

      if (nextProgress >= expectedSequence.length) {
        isExerciseRunningRef.current = false;
        stopExerciseInterval();
        setIsExerciseRunning(false);
        setExerciseStatus("Complete");
        setExerciseFeedback("Completed");
      } else {
        setExerciseStatus("Active");
      }
      return;
    }

    setMistakesCount((prev) => prev + 1);

    if (absDeltaMs > timingWindowMs) {
      setExerciseFeedback(`Timing miss ${deltaMs > 0 ? "late" : "early"} ${Math.round(absDeltaMs)} ms`);
    } else {
      setExerciseFeedback(
        `Wrong note. Expected ${midiToScientificNote(expectedNote)} got ${midiToScientificNote(note)}`
      );
    }
  }

  function handleChordExerciseCheck() {
    if (!isExerciseRunningRef.current || mode !== MODES.chordExercise) return;

    const targetNotes = buildChordPreviewNotes(selectedRoot, selectedChordExercise);
    const targetPitchClasses = pitchClassesFromMidi(targetNotes);
    const currentPitchClasses = pitchClassesFromMidi(Array.from(soundingNotesRef.current));

    if (!currentPitchClasses.length) return;

    setAttempts((prev) => prev + 1);

    if (arraysEqual(currentPitchClasses, targetPitchClasses)) {
      setCorrectNotesCount((prev) => prev + 1);
      setExerciseProgress(1);
      setExerciseStatus("Complete");
      setExerciseFeedback("Correct chord");
      isExerciseRunningRef.current = false;
      stopExerciseInterval();
      setIsExerciseRunning(false);
    } else if (isSubsetSet(currentPitchClasses, targetPitchClasses)) {
      setExerciseStatus("Active");
      setExerciseFeedback("Partial chord. Keep adding notes.");
    } else {
      setMistakesCount((prev) => prev + 1);
      setExerciseStatus("Active");
      setExerciseFeedback("Wrong chord shape");
    }
  }

  function clearPreviewTimeouts() {
    previewTimeoutsRef.current.forEach((id) => clearTimeout(id));
    previewTimeoutsRef.current = [];
  }

  async function handlePreviewExercise() {
    if (!audioEnabled) {
      await handleEnableAudioManually();
    }

    clearPreviewTimeouts();

    let notes = [];
    if (mode === MODES.scale || mode === MODES.combined) {
      notes = scalePreviewNotes;
    } else if (mode === MODES.chordExercise) {
      notes = chordPreviewNotes;
    } else {
      notes = loopPreviewNotes;
    }

    setPreviewExpectedNotes(notes);
    setShowGuideNotes(true);
    setPreviewActive(true);
    setPreviewPulseNote(null);

    const stepMs = Math.round((60 / Math.max(40, exerciseBpm)) * 1000);
    const playSynth = synthRef.current;

    notes.forEach((midi, index) => {
      const startDelay = index * stepMs;

      const pulseId = setTimeout(() => {
        setPreviewPulseNote(midi);
        if (playSynth) {
          playSynth.triggerAttackRelease(
            midiToScientificNote(midi),
            Math.max(0.12, Math.min(0.45, stepMs / 1000 * 0.8)),
            undefined,
            0.75
          );
        }
      }, startDelay);

      const clearId = setTimeout(() => {
        setPreviewPulseNote((prev) => (prev === midi ? null : prev));
      }, startDelay + Math.max(140, stepMs * 0.75));

      previewTimeoutsRef.current.push(pulseId, clearId);
    });

    const endId = setTimeout(() => {
      setPreviewPulseNote(null);
      setPreviewActive(false);
    }, notes.length * stepMs + 200);

    previewTimeoutsRef.current.push(endId);
  }

  function handleToggleGuideNotes() {
    setShowGuideNotes((prev) => !prev);
  }

  function currentChordExercise() {
    return CHORD_EXERCISES.find((item) => item.id === selectedChordExercise) ?? CHORD_EXERCISES[0];
  }

  function stopScaleLooper() {
    if (scaleLoopTimeoutRef.current) {
      clearTimeout(scaleLoopTimeoutRef.current);
      scaleLoopTimeoutRef.current = null;
    }
    scaleLoopSequenceRef.current = [];
    scaleLoopIndexRef.current = 0;
    setIsScaleLoopRunning(false);
    setLoopStepIndex(0);
    setPreviewPulseNote(null);
  }

  function scheduleNextScaleLoopStep() {
    const seq = scaleLoopSequenceRef.current;
    if (!seq.length) {
      stopScaleLooper();
      return;
    }

    const idx = scaleLoopIndexRef.current % seq.length;
    const midi = seq[idx];
    const durationSec = Math.max(0.08, (60 / Math.max(30, loopBpm)) * 0.72);
    const waitMs = Math.max(60, (60 / Math.max(30, loopBpm)) * 1000);

    setLoopStepIndex(idx + 1);
    setPreviewPulseNote(midi);

    if (audioEnabled && synthRef.current) {
      synthRef.current.triggerAttackRelease(midiToScientificNote(midi), durationSec, undefined, 0.85);
    }

    scaleLoopIndexRef.current = idx + 1;
    scaleLoopTimeoutRef.current = setTimeout(() => {
      scheduleNextScaleLoopStep();
    }, waitMs);
  }

  async function startScaleLooper() {
    if (!audioEnabled) {
      await handleEnableAudioManually();
    }

    stopScaleLooper();

    const seq = buildScalePreviewNotes(activeLoopRootName, activeLoopScaleKey, loopOctaves, loopDirection);
    if (!seq.length) return;

    setShowGuideNotes(true);
    setPreviewExpectedNotes(seq);
    scaleLoopSequenceRef.current = seq;
    scaleLoopIndexRef.current = 0;
    setIsScaleLoopRunning(true);
    scheduleNextScaleLoopStep();
  }

  function restartScaleLooper() {
    if (!isScaleLoopRunning) return;
    stopScaleLooper();
    startScaleLooper();
  }

  function handleToggleScaleLooper() {
    if (isScaleLoopRunning) {
      stopScaleLooper();
    } else {
      startScaleLooper();
    }
  }

  function applyRecommendedScaleToTarget() {
    if (!activeRecommendedScaleKey || chord.rootPitchClass === null) return;
    setSelectedRoot(NOTE_NAMES_SHARP[chord.rootPitchClass]);
    setSelectedScale(activeRecommendedScaleKey);
  }

  const whiteKeyWidth = 40;
  const blackKeyWidth = 24;
  const blackKeyOffset = 12;

  const whiteKeyElements = keyboardData.whiteKeys.map((key) => {
    const sounding = soundingNotes.includes(key.midi);
    const held = heldNotes.includes(key.midi);
    const expected = displayExpectedNotes.includes(key.midi);
    const previewNow = previewPulseNote === key.midi;
    const isRoot = chord.rootPitchClass !== null && midiToPitchClass(key.midi) === chord.rootPitchClass;

    const overlay =
      previewNow
        ? "rgba(250, 204, 21, 0.75)"
        : isRoot
        ? "rgba(239, 68, 68, 0.38)"
        : expected
        ? "rgba(34, 197, 94, 0.52)"
        : sounding
        ? "rgba(59, 130, 246, 0.46)"
        : held
        ? "rgba(96, 165, 250, 0.22)"
        : "transparent";

    return (
      <div
        key={key.midi}
        style={{
          ...styles.whiteKey,
          width: whiteKeyWidth,
          background: `linear-gradient(180deg, ${overlay} 0%, ${overlay} 100%), linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%)`,
          outline: isRoot ? "2px solid rgba(239, 68, 68, 0.95)" : "1px solid #334155",
        }}
        title={midiToScientificNote(key.midi)}
      >
        <div style={styles.whiteKeyLabel}>{midiToNoteName(key.midi)}</div>
      </div>
    );
  });

  const blackKeyElements = keyboardData.blackKeys.map((key) => {
    const sounding = soundingNotes.includes(key.midi);
    const held = heldNotes.includes(key.midi);
    const expected = displayExpectedNotes.includes(key.midi);
    const previewNow = previewPulseNote === key.midi;
    const isRoot = chord.rootPitchClass !== null && midiToPitchClass(key.midi) === chord.rootPitchClass;

    const overlay =
      previewNow
        ? "rgba(250, 204, 21, 0.68)"
        : isRoot
        ? "rgba(239, 68, 68, 0.34)"
        : expected
        ? "rgba(34, 197, 94, 0.46)"
        : sounding
        ? "rgba(56, 189, 248, 0.50)"
        : held
        ? "rgba(71, 85, 105, 0.50)"
        : "transparent";

    return (
      <div
        key={key.midi}
        style={{
          ...styles.blackKey,
          width: blackKeyWidth,
          left: key.leftWhiteIndex * whiteKeyWidth + (whiteKeyWidth - blackKeyOffset),
          background: `linear-gradient(180deg, ${overlay} 0%, ${overlay} 100%), linear-gradient(180deg, #111827 0%, #030712 100%)`,
          outline: isRoot ? "2px solid rgba(239, 68, 68, 0.92)" : "1px solid #020617",
        }}
        title={midiToScientificNote(key.midi)}
      />
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={{ ...styles.compactCard, ...styles.purpleCard }}>
          <div style={styles.compactLabel}>Input</div>
          <select
            style={styles.select}
            value={selectedInputId}
            onChange={(e) => setSelectedInputId(e.target.value)}
          >
            <option value="">Select MIDI input</option>
            {inputs.map((input) => (
              <option key={input.id} value={input.id}>
                {input.name} | {input.manufacturer}
              </option>
            ))}
          </select>
          <div style={styles.microText}>{midiSupported ? midiStatus : "MIDI not supported"}</div>
        </div>

        <div style={{ ...styles.compactCard, ...styles.blueCard }}>
          <div style={styles.compactLabel}>Audio</div>
          <div style={styles.inlineButtonRow}>
            <button
              onClick={handleEnableAudioManually}
              style={{
                ...styles.smallButton,
                backgroundColor: audioEnabled ? "#16a34a" : "#2563eb",
              }}
            >
              {audioEnabled ? "Audio On" : "Enable Audio"}
            </button>
            <button
              onClick={releaseAllNotes}
              style={{ ...styles.smallButton, backgroundColor: "#dc2626" }}
            >
              Panic
            </button>
          </div>
          <div style={styles.inlineMiniGrid}>
            <div>
              <div style={styles.sliderLabel}>Vol {volume} dB</div>
              <input
                type="range"
                min="-30"
                max="0"
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={styles.slider}
              />
            </div>
            <div>
              <div style={styles.sliderLabel}>Release {releaseTime.toFixed(2)} s</div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.01"
                value={releaseTime}
                onChange={(e) => setReleaseTime(Number(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>
          <div style={styles.inlineMiniGrid}>
            <div>
              <div style={styles.sliderLabel}>Tone</div>
              <select style={styles.select} value={waveform} onChange={(e) => setWaveform(e.target.value)}>
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
              </select>
            </div>
            <div>
              <div style={styles.sliderLabel}>Pedal CC</div>
              <input
                type="number"
                min="0"
                max="127"
                value={midiMappings.sustainPedal}
                onChange={(e) =>
                  setMidiMappings((prev) => ({
                    ...prev,
                    sustainPedal: Number(e.target.value),
                  }))
                }
                style={styles.numberInput}
              />
            </div>
          </div>
        </div>

        <div style={{ ...styles.compactCard, ...styles.orangeCard }}>
          <div style={styles.compactLabel}>Metronome</div>
          <div style={styles.inlineMiniGrid}>
            <div>
              <div style={styles.sliderLabel}>BPM {metronomeBpm}</div>
              <input
                type="range"
                min="40"
                max="180"
                step="1"
                value={metronomeBpm}
                onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                style={styles.slider}
              />
            </div>
            <div>
              <div style={styles.sliderLabel}>Beats</div>
              <select
                style={styles.select}
                value={beatsPerBar}
                onChange={(e) => setBeatsPerBar(Number(e.target.value))}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
          </div>

          <div style={styles.accentRow}>
            {Array.from({ length: beatsPerBar }, (_, i) => (
              <label key={i} style={styles.accentPill}>
                <input
                  type="checkbox"
                  checked={accentPattern[i] || false}
                  onChange={() => handleAccentToggle(i)}
                />
                <span>{i + 1}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleToggleMetronome}
            style={{
              ...styles.smallButton,
              width: "100%",
              backgroundColor: isMetronomeRunning ? "#ea580c" : "#2563eb",
            }}
          >
            {isMetronomeRunning ? "Stop Metronome" : "Start Metronome"}
          </button>

          <div style={styles.microText}>Beat {currentMetronomeBeat || "-"}</div>
        </div>
      </div>

      <div style={styles.keyboardCard}>
        <div style={styles.keyboardTopRow}>
          <div style={{ ...styles.readoutBox, ...styles.greenCard }}>
            <div style={styles.readoutSub}>Mode</div>
            <select style={styles.select} value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value={MODES.chord}>Chord mode</option>
              <option value={MODES.scale}>Scale exercise</option>
              <option value={MODES.chordExercise}>Chord exercise</option>
              <option value={MODES.combined}>Combined mode</option>
            </select>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={handlePreviewExercise}
                style={{ ...styles.smallButton, backgroundColor: "#16a34a", width: "100%", marginBottom: 8 }}
              >
                {previewActive ? "Playing..." : "Play Example"}
              </button>
              <button
                onClick={handleToggleGuideNotes}
                style={{ ...styles.smallButton, backgroundColor: "#0f766e", width: "100%" }}
              >
                {showGuideNotes ? "Hide Guide" : "Show Guide"}
              </button>
            </div>
          </div>

          <div style={{ ...styles.readoutBox, ...styles.darkCenterCard }}>
            <div style={styles.readoutSub}>Chord</div>
            <div style={styles.centerChord}>{chord.label}</div>
            <div style={styles.readoutSmallLight}>
              {chord.alternates.length ? `Also: ${chord.alternates.join("  ·  ")}` : "Play a chord"}
            </div>
            {chord.bassLabel && chord.label !== "No chord" && (
              <div style={styles.readoutSmallLight}>Bass: {chord.bassLabel}</div>
            )}
            {recommendedScales.length > 0 && (
              <div style={{ ...styles.readoutSmallLight, marginTop: 10 }}>
                Best scale: {recommendedScales[0].label}
              </div>
            )}
          </div>
        </div>

        <div style={styles.keyboardScroll} ref={keyboardScrollRef}>
          <div style={{ ...styles.keyboardFrame, minWidth: keyboardData.whiteCount * whiteKeyWidth }}>
            <div style={styles.whiteKeysRow}>{whiteKeyElements}</div>
            <div style={styles.blackKeysLayer}>{blackKeyElements}</div>
          </div>
        </div>

        <div style={styles.bottomMetaRow}>
          <div style={styles.smallMetaPill}>Pedal {pedalDown ? "Down" : "Up"}</div>
          <div style={styles.smallMetaPill}>Held {heldNotes.length}</div>
          <div style={styles.smallMetaPill}>Sounding {soundingNotes.length}</div>
          <div style={styles.smallMetaPill}>Last {lastMessage}</div>
        </div>

        {recommendedScales.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.compactLabel}>Recommended scales</div>
            <div style={styles.noteWrap}>
              {recommendedScales.map((item, index) => (
                <span
                  key={item.id}
                  style={index === 0 ? styles.correctBadge : styles.secondaryBadge}
                  title={item.reason}
                >
                  {item.label}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={applyRecommendedScaleToTarget}
                style={{ ...styles.smallButton, backgroundColor: "#2563eb" }}
              >
                Use best recommendation
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.exerciseCard}>
        <div style={styles.exerciseTopGrid}>
          <div style={{ ...styles.compactCard, ...styles.blueSoftCard }}>
            <div style={styles.compactLabelDark}>Target</div>
            <div style={styles.inlineMiniGrid}>
              <div>
                <div style={styles.sliderLabelDark}>Root</div>
                <select
                  style={styles.select}
                  value={selectedRoot}
                  onChange={(e) => setSelectedRoot(e.target.value)}
                >
                  {NOTE_NAMES_SHARP.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>

              {(mode === MODES.scale || mode === MODES.combined) && (
                <div>
                  <div style={styles.sliderLabelDark}>Scale</div>
                  <select
                    style={styles.select}
                    value={selectedScale}
                    onChange={(e) => setSelectedScale(e.target.value)}
                  >
                    {Object.entries(SCALE_LIBRARY).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mode === MODES.chordExercise && (
                <div>
                  <div style={styles.sliderLabelDark}>Chord</div>
                  <select
                    style={styles.select}
                    value={selectedChordExercise}
                    onChange={(e) => setSelectedChordExercise(e.target.value)}
                  >
                    {CHORD_EXERCISES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div style={{ ...styles.compactCard, ...styles.orangeSoftCard }}>
            <div style={styles.compactLabelDark}>Timing</div>
            <div style={styles.inlineMiniGrid}>
              <div>
                <div style={styles.sliderLabelDark}>BPM {exerciseBpm}</div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="1"
                  value={exerciseBpm}
                  onChange={(e) => setExerciseBpm(Number(e.target.value))}
                  style={styles.slider}
                />
              </div>
              <div>
                <div style={styles.sliderLabelDark}>Window {timingWindowMs} ms</div>
                <input
                  type="range"
                  min="60"
                  max="300"
                  step="10"
                  value={timingWindowMs}
                  onChange={(e) => setTimingWindowMs(Number(e.target.value))}
                  style={styles.slider}
                />
              </div>
            </div>
          </div>

          <div style={{ ...styles.compactCard, ...styles.greenSoftCard }}>
            <div style={styles.compactLabelDark}>Progression</div>
            <div style={styles.inlineMiniGrid}>
              <div>
                <div style={styles.sliderLabelDark}>Count in</div>
                <select
                  style={styles.select}
                  value={countInBeats}
                  onChange={(e) => setCountInBeats(Number(e.target.value))}
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                </select>
              </div>

              {(mode === MODES.scale || mode === MODES.combined) && (
                <>
                  <div>
                    <div style={styles.sliderLabelDark}>Direction</div>
                    <select
                      style={styles.select}
                      value={scaleDirection}
                      onChange={(e) => setScaleDirection(e.target.value)}
                    >
                      <option value={DIRECTIONS.up}>Up only</option>
                      <option value={DIRECTIONS.down}>Down only</option>
                      <option value={DIRECTIONS.upDown}>Up and down</option>
                    </select>
                  </div>
                  <div>
                    <div style={styles.sliderLabelDark}>Octaves</div>
                    <select
                      style={styles.select}
                      value={octaves}
                      onChange={(e) => setOctaves(Number(e.target.value))}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {mode !== MODES.chord && (
          <div style={styles.exerciseActionRow}>
            <button onClick={handleStartExercise} style={{ ...styles.actionButton, backgroundColor: "#2563eb" }}>
              Start
            </button>
            <button onClick={handleStopExercise} style={{ ...styles.actionButton, backgroundColor: "#64748b" }}>
              Stop
            </button>
          </div>
        )}

        <div style={styles.exerciseInfoGrid}>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Target</div>
            <div style={styles.infoTileValue}>
              {mode === MODES.scale || mode === MODES.combined
                ? `${selectedRoot} ${scaleInfo.label}`
                : mode === MODES.chordExercise
                ? `${selectedRoot} ${currentChordExercise().label}`
                : "Free chord play"}
            </div>
          </div>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Status</div>
            <div style={styles.infoTileValue}>{exerciseStatus}</div>
          </div>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Feedback</div>
            <div style={styles.infoTileValue}>{exerciseFeedback}</div>
          </div>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Beat</div>
            <div style={styles.infoTileValue}>{exerciseBeatDisplay || "-"}</div>
          </div>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Progress</div>
            <div style={styles.infoTileValue}>
              {mode === MODES.scale || mode === MODES.combined ? `${exerciseProgress} / ${expectedScaleDegrees.length}` : `${exerciseProgress}`}
            </div>
          </div>
          <div style={styles.infoTile}>
            <div style={styles.infoTileLabel}>Accuracy</div>
            <div style={styles.infoTileValue}>{accuracy}%</div>
          </div>
        </div>

        {(mode === MODES.scale || mode === MODES.combined || mode === MODES.chord || mode === MODES.combined) && (
          <div style={{ ...styles.degreeSection, marginBottom: 10 }}>
            <div style={styles.degreeHeaderRow}>
              <div style={styles.compactLabelDark}>Scale player</div>
              <div style={styles.microTextDark}>
                {useRecommendedScale && activeRecommendedScaleKey
                  ? `Using recommendation: ${activeLoopRootName} ${SCALE_LIBRARY[activeLoopScaleKey].label}`
                  : `Using selected target: ${activeLoopRootName} ${SCALE_LIBRARY[activeLoopScaleKey].label}`}
              </div>
            </div>

            <div style={styles.inlineMiniGridTriple}>
              <div>
                <div style={styles.sliderLabelDark}>Loop BPM {loopBpm}</div>
                <input
                  type="range"
                  min="40"
                  max="220"
                  step="1"
                  value={loopBpm}
                  onChange={(e) => setLoopBpm(Number(e.target.value))}
                  style={styles.slider}
                />
              </div>
              <div>
                <div style={styles.sliderLabelDark}>Loop direction</div>
                <select
                  style={styles.select}
                  value={loopDirection}
                  onChange={(e) => setLoopDirection(e.target.value)}
                >
                  <option value={DIRECTIONS.up}>Up only</option>
                  <option value={DIRECTIONS.down}>Down only</option>
                  <option value={DIRECTIONS.upDown}>Up and down</option>
                </select>
              </div>
              <div>
                <div style={styles.sliderLabelDark}>Loop octaves</div>
                <select
                  style={styles.select}
                  value={loopOctaves}
                  onChange={(e) => setLoopOctaves(Number(e.target.value))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>

            <div style={{ ...styles.inlineButtonRow, marginTop: 10 }}>
              <button
                onClick={handleToggleScaleLooper}
                style={{
                  ...styles.smallButton,
                  backgroundColor: isScaleLoopRunning ? "#dc2626" : "#16a34a",
                }}
              >
                {isScaleLoopRunning ? "Stop Scale Loop" : "Start Scale Loop"}
              </button>

              <button
                onClick={() => setUseRecommendedScale((prev) => !prev)}
                style={{
                  ...styles.smallButton,
                  backgroundColor: useRecommendedScale ? "#7c3aed" : "#475569",
                }}
              >
                {useRecommendedScale ? "Using Recommended Scale" : "Using Selected Scale"}
              </button>
            </div>

            <div style={{ marginTop: 10 }} className="note-list">
              <div style={styles.noteWrap}>
                {loopPreviewNotes.map((note, index) => (
                  <span
                    key={`${note}-${index}`}
                    style={index + 1 === loopStepIndex ? styles.correctBadge : styles.secondaryBadge}
                  >
                    {midiToScientificNote(note)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(mode === MODES.scale || mode === MODES.combined) && (
          <div style={styles.degreeSection}>
            <div style={styles.degreeHeaderRow}>
              <div style={styles.compactLabelDark}>Expected degrees</div>
              <div style={styles.microTextDark}>{recommendation}</div>
            </div>
            <div style={styles.noteWrap}>
              {expectedScaleDegrees.map((degree, index) => (
                <span
                  key={`${degree}-${index}`}
                  style={index < exerciseProgress ? styles.correctBadge : styles.secondaryBadge}
                >
                  {degree}
                </span>
              ))}
            </div>
          </div>
        )}

        {mode === MODES.chordExercise && (
          <div style={styles.degreeSection}>
            <div style={styles.degreeHeaderRow}>
              <div style={styles.compactLabelDark}>Expected chord tones</div>
              <div style={styles.microTextDark}>{recommendation}</div>
            </div>
            <div style={styles.noteWrap}>
              {chordPreviewNotes.map((note) => (
                <span key={note} style={styles.secondaryBadge}>
                  {midiToScientificNote(note)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Attempts</div>
            <div style={styles.statValue}>{attempts}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Correct</div>
            <div style={styles.statValue}>{correctNotesCount}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Mistakes</div>
            <div style={styles.statValue}>{mistakesCount}</div>
          </div>
        </div>

        {(mode === MODES.scale || mode === MODES.combined) && lockedScaleSequence.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={styles.compactLabelDark}>Locked sequence</div>
            <div style={styles.noteWrap}>
              {lockedScaleSequence.map((note, index) => (
                <span
                  key={`${note}-${index}`}
                  style={index < exerciseProgress ? styles.correctBadge : styles.primaryBadge}
                >
                  {midiToScientificNote(note)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1020 0%, #111827 100%)",
    color: "#e5eefc",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "10px",
    boxSizing: "border-box",
  },
  topStrip: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr 0.9fr",
    gap: "8px",
    marginBottom: "8px",
  },
  compactCard: {
    borderRadius: "16px",
    padding: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  purpleCard: {
    background: "linear-gradient(135deg, rgba(88, 28, 135, 0.75), rgba(30, 41, 59, 0.95))",
  },
  blueCard: {
    background: "linear-gradient(135deg, rgba(30, 64, 175, 0.78), rgba(15, 23, 42, 0.95))",
  },
  orangeCard: {
    background: "linear-gradient(135deg, rgba(154, 52, 18, 0.8), rgba(30, 41, 59, 0.95))",
  },
  blueSoftCard: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#0f172a",
  },
  orangeSoftCard: {
    background: "linear-gradient(135deg, #ffedd5, #fff7ed)",
    color: "#0f172a",
  },
  greenSoftCard: {
    background: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
    color: "#0f172a",
  },
  greenCard: {
    background: "linear-gradient(135deg, rgba(6, 95, 70, 0.94), rgba(17, 24, 39, 0.98))",
  },
  darkCenterCard: {
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
  },
  compactLabel: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
    opacity: 0.9,
  },
  compactLabelDark: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
    color: "#334155",
  },
  microText: {
    marginTop: "6px",
    fontSize: "11px",
    opacity: 0.9,
    color: "#dbeafe",
  },
  microTextDark: {
    marginTop: "2px",
    fontSize: "12px",
    color: "#64748b",
  },
  inlineButtonRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "6px",
    flexWrap: "wrap",
  },
  inlineMiniGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    marginTop: "6px",
  },
  inlineMiniGridTriple: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "6px",
    marginTop: "6px",
  },
  sliderLabel: {
    fontSize: "11px",
    fontWeight: 700,
    marginBottom: "3px",
    color: "#dbeafe",
  },
  sliderLabelDark: {
    fontSize: "11px",
    fontWeight: 700,
    marginBottom: "3px",
    color: "#334155",
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.5)",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.96)",
    color: "#0f172a",
  },
  numberInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.5)",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.96)",
    color: "#0f172a",
  },
  slider: {
    width: "100%",
  },
  smallButton: {
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    padding: "9px 10px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  actionButton: {
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    padding: "11px 16px",
    fontSize: "15px",
    fontWeight: 800,
    minWidth: "140px",
    cursor: "pointer",
  },
  accentRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    margin: "8px 0",
  },
  accentPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: "999px",
    fontSize: "12px",
  },
  keyboardCard: {
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.98))",
    borderRadius: "20px",
    padding: "10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "8px",
  },
  keyboardTopRow: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.5fr",
    gap: "8px",
    marginBottom: "8px",
  },
  readoutBox: {
    borderRadius: "16px",
    padding: "10px",
    minHeight: "94px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
  },
  readoutSub: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.85,
    marginBottom: "6px",
  },
  centerChord: {
    fontSize: "34px",
    fontWeight: 900,
    textAlign: "center",
    lineHeight: 1.1,
    marginTop: "4px",
  },
  readoutSmallLight: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 1.35,
  },
  keyboardScroll: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "6px",
  },
  keyboardFrame: {
    position: "relative",
    width: "100%",
    height: "220px",
  },
  whiteKeysRow: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "stretch",
    gap: 0,
  },
  blackKeysLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  whiteKey: {
    position: "relative",
    height: "220px",
    borderRadius: "0 0 10px 10px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    border: "1px solid #334155",
  },
  blackKey: {
    position: "absolute",
    top: 0,
    height: "130px",
    borderRadius: "0 0 8px 8px",
    boxSizing: "border-box",
    zIndex: 3,
  },
  whiteKeyLabel: {
    fontSize: "11px",
    color: "#334155",
    marginBottom: "8px",
    fontWeight: 800,
    textShadow: "0 1px 0 rgba(255,255,255,0.65)",
  },
  bottomMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px",
    alignItems: "center",
  },
  smallMetaPill: {
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.08)",
    fontSize: "12px",
    color: "#cbd5e1",
    maxWidth: "100%",
  },
  exerciseCard: {
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    color: "#0f172a",
    borderRadius: "20px",
    padding: "10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.24)",
  },
  exerciseTopGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginBottom: "8px",
  },
  exerciseActionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  exerciseInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: "8px",
    marginBottom: "10px",
  },
  infoTile: {
    backgroundColor: "#f1f5f9",
    borderRadius: "14px",
    padding: "10px",
    border: "1px solid #e2e8f0",
  },
  infoTileLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "4px",
  },
  infoTileValue: {
    fontSize: "16px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  degreeSection: {
    backgroundColor: "#eef2ff",
    borderRadius: "16px",
    padding: "12px",
  },
  degreeHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  noteWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  primaryBadge: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
  },
  secondaryBadge: {
    backgroundColor: "#cbd5e1",
    color: "#0f172a",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
  },
  correctBadge: {
    backgroundColor: "#16a34a",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 700,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "8px",
    marginTop: "10px",
  },
  statBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 900,
    marginTop: "4px",
  },
};