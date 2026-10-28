/**
 * Deterministischer Zufall für Demo-Mandanten (Konzept D6): FNV-1a über die
 * Teile als Saat, mulberry32 als Generator. Gleiche Teile → gleiche Folge.
 */

export interface Rng {
  /** Gleichverteilt in [0, 1). */
  next(): number;
  /** Ganzzahl in [min, max], beide Grenzen inklusive. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  chance(p: number): boolean;
}

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createRng(...parts: (string | number)[]): Rng {
  let state = fnv1a(parts.join("|"));
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error("createRng.pick: leere Liste");
      return items[int(0, items.length - 1)]!;
    },
    chance: (p: number): boolean => next() < p,
  };
}
