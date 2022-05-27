declare global {
  interface Array<T> {
    sum(): number;
    shuffle(): T[];
  }

  interface Math {
    randInt(maxExclusive: number): number;
  }
}

Array.prototype.sum = function() {
  return this.reduce((a, c) => a + c, 0);
};

Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.randInt(i + 1);
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this;
}

Math.randInt = function(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

export {};
