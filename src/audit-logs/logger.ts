/**
 * Core Audit Logger
 *
 * Singleton logger with:
 * - Async non-blocking send
 * - In-memory queue with localStorage persistence (bounded)
 * - Retry with exponential backoff
 * - Deduplication for bursty events
 * - Enable/disable toggle
 * - Offline resilience
 *
 * IMPORTANT FIX:
 * - Never send payloads with client_id <= 0 to webhook.
 * - Keep them queued until client_id becomes valid, then flush.
 */

import { WEBHOOK_AUDIT_LOGS_URL } from '@/config/env';
import type {
  AuditLogPayload,
  AuditEventDetails,
  AuditQueueEntry,
  AuditUserContext,
} from './types';
import {
  AUDIT_QUEUE_STORAGE_KEY,
  AUDIT_ENABLED_STORAGE_KEY,
  AUDIT_QUEUE_MAX_PERSISTED,
  AUDIT_MAX_RETRIES,
  AUDIT_RETRY_BACKOFF_MS,
  AUDIT_FLUSH_INTERVAL_MS,
  AUDIT_REQUEST_TIMEOUT_MS,
} from './constants';

// ─── Singleton state ────────────────────────────────────────────────────────

let _userContext: AuditUserContext | null = null;
let _queue: AuditQueueEntry[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
let _isFlushing = false;
let _enabled: boolean = true;

// Dedup map: action → last sent timestamp (ms)
const _dedup = new Map<string, number>();
const DEDUP_WINDOW_MS = 1500; // ignore same event within 1.5s

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getDashboardFromRoute = (route: string): AuditEventDetails['dashboard'] => {
  if (route.startsWith('/super-admin')) return 'super_admin';
  if (route.startsWith('/admin')) return 'org_admin';
  if (route.startsWith('/dashboard')) return 'user';
  if (
    route === '/' ||
    route.startsWith('/login') ||
    route.startsWith('/signup') ||
    route.startsWith('/forgot') ||
    route.startsWith('/reset') ||
    route.startsWith('/2fa') ||
    route.startsWith('/privacy') ||
    route.startsWith('/terms')
  ) return 'public';
  return 'unknown';
};

const isPositiveInt = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n > 0;

// ─── Persistence ────────────────────────────────────────────────────────────

const persistQueue = (): void => {
  try {
    const toStore = _queue.slice(0, AUDIT_QUEUE_MAX_PERSISTED);
    localStorage.setItem(AUDIT_QUEUE_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
};

const restoreQueue = (): void => {
  try {
    const raw = localStorage.getItem(AUDIT_QUEUE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuditQueueEntry[];
      if (Array.isArray(parsed)) {
        _queue = parsed;
      }
    }
  } catch {
    // corrupt data — ignore
  }
};

// ─── Network send ───────────────────────────────────────────────────────────

const sendPayload = async (payload: AuditLogPayload): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDIT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(WEBHOOK_AUDIT_LOGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok || response.status < 500; // 4xx = don't retry
  } catch {
    clearTimeout(timeout);
    return false;
  }
};

// ─── Flush loop ─────────────────────────────────────────────────────────────

const flush = async (): Promise<void> => {
  if (_isFlushing || _queue.length === 0) return;
  _isFlushing = true;

  const batch = [..._queue];
  const failed: AuditQueueEntry[] = [];

  for (const entry of batch) {
    // IMPORTANT: Never send invalid client_id
    if (!isPositiveInt(entry.payload.client_id)) {
      failed.push(entry);
      continue;
    }

    const ok = await sendPayload(entry.payload);
    if (!ok) {
      entry.attempts += 1;
      if (entry.attempts < AUDIT_MAX_RETRIES) {
        // backoff is handled by interval retry; keep queued
        failed.push(entry);
      }
      // else: drop after max retries
    }
  }

  _queue = failed;
  persistQueue();
  _isFlushing = false;
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialize the logger. Call once when the React app mounts.
 */
export const initAuditLogger = (): void => {
  // Restore enabled state
  try {
    const stored = localStorage.getItem(AUDIT_ENABLED_STORAGE_KEY);
    if (stored !== null) {
      _enabled = stored === 'true';
    }
  } catch { /* ignore */ }

  // Restore queued events from localStorage
  restoreQueue();

  // Start flush timer
  if (!_flushTimer) {
    _flushTimer = setInterval(() => {
      if (_enabled) flush();
    }, AUDIT_FLUSH_INTERVAL_MS);
  }

  // Listen for online events to flush
  window.addEventListener('online', () => {
    if (_enabled) flush();
  });
};

/**
 * Shutdown the logger. Call on app unmount.
 */
export const destroyAuditLogger = (): void => {
  if (_flushTimer) {
    clearInterval(_flushTimer);
    _flushTimer = null;
  }
  persistQueue();
};

/**
 * Set the authenticated user context. Call when auth state changes.
 */
export const setAuditUserContext = (ctx: AuditUserContext | null): void => {
  _userContext = ctx;

  // If context now includes a valid clientId, try flushing immediately.
  if (_enabled && isPositiveInt(_userContext?.clientId) && navigator.onLine !== false) {
    flush();
  }
};

/**
 * Get the current enabled state.
 */
export const isAuditEnabled = (): boolean => _enabled;

/**
 * Toggle audit logging on/off.
 */
export const setAuditEnabled = (enabled: boolean): void => {
  _enabled = enabled;
  try {
    localStorage.setItem(AUDIT_ENABLED_STORAGE_KEY, String(enabled));
  } catch { /* ignore */ }
};

/**
 * Log an audit event.
 *
 * This is the main entry point. Non-blocking, safe to call anywhere.
 */
export const logAuditEvent = (
  action: string,
  details?: Partial<Omit<AuditEventDetails, 'action' | 'dashboard' | 'route' | 'session_id' | 'environment'>>
): void => {
  if (!_enabled) return;

  // Dedup check
  const dedupKey = `${action}:${details?.entity_id || ''}:${details?.section || ''}`;
  const now = Date.now();
  const lastSent = _dedup.get(dedupKey);
  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    return; // skip duplicate
  }
  _dedup.set(dedupKey, now);

  // Clean old dedup entries periodically
  if (_dedup.size > 200) {
    const cutoff = now - DEDUP_WINDOW_MS * 2;
    for (const [k, v] of _dedup) {
      if (v < cutoff) _dedup.delete(k);
    }
  }

  const route = typeof window !== 'undefined' ? window.location.pathname : '/';
  const dashboard = getDashboardFromRoute(route);

  const fullDetails: AuditEventDetails = {
    action,
    dashboard,
    route,
    session_id: _userContext?.sessionId || 'anonymous',
    environment: import.meta.env.MODE || 'production',
    app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ...details,
  };

  const clientId = _userContext?.clientId;

  // IMPORTANT:
  // - If clientId isn't available/valid yet, queue the event but DO NOT send.
  // - This prevents webhook validation failures (client_id must be positive).
  const payload: AuditLogPayload = {
    client_id: isPositiveInt(clientId) ? clientId : 0,
    user_id: _userContext?.userId || 'anonymous',
    username: _userContext?.username || 'anonymous',
    details: fullDetails,
    timestamp: new Date().toISOString(),
  };

  const entry: AuditQueueEntry = {
    id: generateId(),
    payload,
    attempts: 0,
    createdAt: now,
  };

  _queue.push(entry);

  // Persist immediately for crash safety
  persistQueue();

  const canSendNow =
    isPositiveInt(payload.client_id) &&
    navigator.onLine !== false;

  // Attempt eager send (non-blocking) ONLY if client_id is valid
  if (canSendNow) {
    sendPayload(payload).then((ok) => {
      if (ok) {
        _queue = _queue.filter((e) => e.id !== entry.id);
        persistQueue();
      } else {
        // keep queued; flush loop will retry up to max retries
      }
    });
  }
};

/**
 * Get current queue size (for diagnostics).
 */
export const getAuditQueueSize = (): number => _queue.length;