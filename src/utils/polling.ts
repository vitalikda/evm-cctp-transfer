export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollFunction<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  interval = 3000,
  maxAttempts = 10,
  attempt = 1,
): Promise<T | undefined> {
  if (attempt > maxAttempts) return;

  const result = await fn();
  console.log(attempt, result);
  if (condition(result)) {
    return result;
  }

  await delay(interval);

  return pollFunction(fn, condition, interval, maxAttempts, attempt + 1);
}
