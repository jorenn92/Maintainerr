export const delay = (ms: number, fn?: () => Promise<void> | void) => {
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      if (fn) {
        await fn();
      }
      resolve();
    }, ms);
  });
};
