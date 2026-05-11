export const mod: (n: number, m: number) => number = (n: number, m: number) => ((n % m) + m) % m;

export const lerp: (a: number, b: number, t: number) => number = (a: number, b: number, t: number) => a + (b - a) * t;
