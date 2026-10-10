/**
 * Mark extensions as enabled, as the boot payload does. Core types `flarum.extensions`
 * as read-only, but under Jest it is a plain object the tests own.
 */
export default function enableExtensions(...ids: string[]): void {
  (flarum as any).extensions = Object.fromEntries(ids.map((id) => [id, {}]));
}
