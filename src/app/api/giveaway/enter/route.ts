import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { ensureRoundDates, isRoundOpen, resolveGiveawayState } from "@/lib/giveaway";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in to enter the free giveaway." }, { status: 401 });
  }

  const current = await resolveGiveawayState(await readStore());

  if (!isRoundOpen(current.giveaway)) {
    return NextResponse.json(
      { error: "This round is closed. Check the winner announcement." },
      { status: 400 },
    );
  }

  if (current.entries.some((e) => e.userId === session.userId)) {
    return NextResponse.json({ error: "You are already on the list." }, { status: 409 });
  }

  const store = await updateStore((s) => {
    const giveaway = ensureRoundDates(s.giveaway);
    if (!isRoundOpen(giveaway)) return s;
    if (s.entries.some((e) => e.userId === session.userId)) return s;

    return {
      ...s,
      giveaway,
      entries: [
        ...s.entries,
        {
          id: randomUUID(),
          userId: session.userId,
          name: session.name,
          email: session.email,
          enteredAt: new Date().toISOString(),
        },
      ],
    };
  });

  return NextResponse.json({
    ok: true,
    entryCount: store.entries.length,
  });
}
