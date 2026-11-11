import { randomInt } from "crypto";
import { updateStore } from "./db";
import { Entry, Giveaway, Store } from "./types";

const ROUND_MS = 30 * 24 * 60 * 60 * 1000;

export function ensureRoundDates(giveaway: Giveaway, now = new Date()): Giveaway {
  if (giveaway.startsAt && giveaway.endsAt) return giveaway;
  const startsAt = now.toISOString();
  const endsAt = new Date(now.getTime() + ROUND_MS).toISOString();
  return { ...giveaway, startsAt, endsAt };
}

export function isRoundOpen(giveaway: Giveaway, now = new Date()) {
  if (!giveaway.startsAt || !giveaway.endsAt) return true;
  const t = now.getTime();
  return t >= new Date(giveaway.startsAt).getTime() && t < new Date(giveaway.endsAt).getTime();
}

export function pickWinner(entries: Entry[]): Entry | null {
  if (entries.length === 0) return null;
  return entries[randomInt(entries.length)] ?? null;
}

export async function resolveGiveawayState(store: Store): Promise<Store> {
  let next: Store = {
    ...store,
    giveaway: ensureRoundDates(store.giveaway),
  };

  const now = new Date();
  const ended =
    next.giveaway.endsAt !== null &&
    now.getTime() >= new Date(next.giveaway.endsAt).getTime();

  if (ended && !next.giveaway.winnerUserId && next.entries.length > 0) {
    const winner = pickWinner(next.entries);
    if (winner) {
      next = {
        ...next,
        giveaway: {
          ...next.giveaway,
          winnerUserId: winner.userId,
          announcedAt: now.toISOString(),
        },
      };
    }
  }

  if (
    next.giveaway.startsAt !== store.giveaway.startsAt ||
    next.giveaway.endsAt !== store.giveaway.endsAt ||
    next.giveaway.winnerUserId !== store.giveaway.winnerUserId ||
    next.giveaway.announcedAt !== store.giveaway.announcedAt
  ) {
    return updateStore(() => next);
  }

  return next;
}

export function publicParticipants(entries: Entry[]) {
  return [...entries]
    .sort((a, b) => a.enteredAt.localeCompare(b.enteredAt))
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      enteredAt: entry.enteredAt,
    }));
}

export function winnerPublic(store: Store) {
  if (!store.giveaway.winnerUserId) return null;
  const entry = store.entries.find((e) => e.userId === store.giveaway.winnerUserId);
  const user = store.users.find((u) => u.id === store.giveaway.winnerUserId);
  const name = entry?.name ?? user?.name;
  if (!name) return null;
  return {
    name,
    announcedAt: store.giveaway.announcedAt,
    prizeName: store.giveaway.prizeName,
  };
}
