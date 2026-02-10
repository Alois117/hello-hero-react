/**
 * Read/Unread state persistence utility.
 * Uses localStorage scoped per user (Keycloak sub/email) to track
 * which dashboard items (alerts, insights, reports) the user has viewed.
 *
 * Storage format: key = `avis:read:<userId>`, value = JSON array of item IDs.
 * Max tracked items capped to prevent unbounded growth.
 */

const STORAGE_PREFIX = 'avis:read:';
const MAX_TRACKED_ITEMS = 2000;

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function getReadSet(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
    return new Set();
  } catch {
    return new Set();
  }
}

function persistReadSet(userId: string, readSet: Set<string>): void {
  try {
    // Cap size: keep most recent entries by converting to array and slicing
    let arr = Array.from(readSet);
    if (arr.length > MAX_TRACKED_ITEMS) {
      arr = arr.slice(arr.length - MAX_TRACKED_ITEMS);
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(arr));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Check if an item has been read by the current user.
 */
export function isItemRead(userId: string, itemId: string): boolean {
  if (!userId || !itemId) return false;
  return getReadSet(userId).has(itemId);
}

/**
 * Mark an item as read for the current user.
 */
export function markItemRead(userId: string, itemId: string): void {
  if (!userId || !itemId) return;
  const readSet = getReadSet(userId);
  if (readSet.has(itemId)) return; // already marked
  readSet.add(itemId);
  persistReadSet(userId, readSet);
}

/**
 * Generate a stable item key for items without a unique ID.
 * Uses source + distinguishing fields to create a deterministic key.
 */
export function makeItemKey(source: string, ...parts: (string | number | undefined | null)[]): string {
  return `${source}:${parts.filter(Boolean).join(':')}`;
}
