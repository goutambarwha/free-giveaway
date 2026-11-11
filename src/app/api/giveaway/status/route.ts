import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readStore } from "@/lib/db";
import {
  isRoundOpen,
  publicParticipants,
  resolveGiveawayState,
  winnerPublic,
} from "@/lib/giveaway";

export async function GET() {
  const store = await resolveGiveawayState(await readStore());
  const session = await getSession();
  const hasEntered = session
    ? store.entries.some((e) => e.userId === session.userId)
    : false;

  return NextResponse.json({
    giveaway: {
      title: store.giveaway.title,
      prizeName: store.giveaway.prizeName,
      prizeDescription: store.giveaway.prizeDescription,
      startsAt: store.giveaway.startsAt,
      endsAt: store.giveaway.endsAt,
      isOpen: isRoundOpen(store.giveaway),
      entryCount: store.entries.length,
    },
    participants: publicParticipants(store.entries),
    winner: winnerPublic(store),
    user: session
      ? { id: session.userId, name: session.name, email: session.email, hasEntered }
      : null,
  });
}
