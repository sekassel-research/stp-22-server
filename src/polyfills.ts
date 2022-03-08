declare global {
  interface Array<T> {
    sum(): number;
  }
}

Array.prototype.sum = function() {
  return this.reduce((a, c) => a + c, 0);
};

export {};
