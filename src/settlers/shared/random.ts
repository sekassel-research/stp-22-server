export function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffle(a: unknown[]) { // fisher-yates shuffle
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
