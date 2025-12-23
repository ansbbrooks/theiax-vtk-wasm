/**
 * Create a future that returns
 * @returns { promise, resolve, reject }
 */
export function createFuture() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
