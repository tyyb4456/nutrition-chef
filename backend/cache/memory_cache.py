"""
cache/memory_cache.py

Process-level in-memory TTL cache.

Used when Redis is unavailable (the common case in this environment).
Keys expire automatically after their TTL — no background thread needed;
expiry is checked lazily on every get().

Usage:
    from cache.memory_cache import mem_cache

    mem_cache.set("mykey", value, ttl=300)   # 5 minutes
    value = mem_cache.get("mykey")           # None if expired / missing
    mem_cache.delete("mykey")
    mem_cache.delete_prefix("adherence:")    # bust all keys starting with prefix
"""

from __future__ import annotations

import time
import threading
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class MemoryCache:
    """
    Thread-safe in-memory key/value store with per-entry TTL.
    Entries are never mutated in place — set() always replaces.
    Expired entries are removed lazily on get() and proactively
    purged every `_purge_interval` seconds to prevent unbounded growth.
    """

    def __init__(self, purge_interval: int = 120) -> None:
        self._store: dict[str, tuple[Any, float]] = {}   # key → (value, expires_at)
        self._lock  = threading.Lock()
        self._purge_interval = purge_interval
        self._last_purge     = time.monotonic()

    # ── Public API ────────────────────────────────────────────────────────────

    def get(self, key: str) -> Optional[Any]:
        """Return the cached value, or None if missing/expired."""
        with self._lock:
            self._maybe_purge()
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                logger.debug("Cache EXPIRED: %s", key)
                return None
            logger.debug("Cache HIT: %s", key)
            return value

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Store value under key, expiring after `ttl` seconds."""
        with self._lock:
            self._store[key] = (value, time.monotonic() + ttl)
            logger.debug("Cache SET: %s (ttl=%ds)", key, ttl)

    def delete(self, key: str) -> None:
        """Remove a single key (no-op if missing)."""
        with self._lock:
            self._store.pop(key, None)
            logger.debug("Cache DELETE: %s", key)

    def delete_prefix(self, prefix: str) -> int:
        """Remove all keys that start with `prefix`. Returns count removed."""
        with self._lock:
            victims = [k for k in self._store if k.startswith(prefix)]
            for k in victims:
                del self._store[k]
            if victims:
                logger.debug("Cache DELETE prefix=%r → removed %d keys", prefix, len(victims))
            return len(victims)

    def clear(self) -> None:
        """Wipe everything (useful in tests)."""
        with self._lock:
            self._store.clear()

    # ── Internal ──────────────────────────────────────────────────────────────

    def _maybe_purge(self) -> None:
        """Evict all expired entries if the purge interval has elapsed."""
        now = time.monotonic()
        if now - self._last_purge < self._purge_interval:
            return
        self._last_purge = now
        expired = [k for k, (_, exp) in self._store.items() if now > exp]
        for k in expired:
            del self._store[k]
        if expired:
            logger.debug("Cache purge: removed %d expired entries", len(expired))


# ── Singleton ──────────────────────────────────────────────────────────────────
mem_cache = MemoryCache()

# ── TTLs (seconds) ────────────────────────────────────────────────────────────
TTL_ADHERENCE       = 5  * 60   #  5 min  — stale only if meal logged/deleted
TTL_PREFERENCES     = 10 * 60   # 10 min  — stale only if feedback processed
TTL_PROGRESS_REPORT = 10 * 60   # 10 min  — stale only if report regenerated
TTL_RECIPE          = 30 * 60   # 30 min  — recipes are immutable after creation
TTL_RECIPE_LIST     = 5  * 60   #  5 min  — busted whenever a new recipe is saved
