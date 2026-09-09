/** Demo-only reference numbers: a base offset plus the current record count,
 * with a small random jitter so re-submissions within the same session don't
 * collide. Not a real sequence generator — there is no server behind this. */
export function generateRef(prefix: string, base: number, count: number): string {
  return prefix + (base + count + 1 + Math.floor(Math.random() * 90));
}
