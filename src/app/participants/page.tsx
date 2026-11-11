import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth";
import { readStore } from "@/lib/db";
import {
  publicParticipants,
  resolveGiveawayState,
  winnerPublic,
} from "@/lib/giveaway";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/participants");
  }

  const store = await resolveGiveawayState(await readStore());
  const participants = publicParticipants(store.entries);
  const winner = winnerPublic(store);

  return (
    <>
      <SiteHeader
        user={{ id: session.userId, name: session.name, email: session.email }}
      />

      <section className="section" style={{ marginTop: "1.5rem" }}>
        <h2>All participants</h2>
        <p className="lead">
          Everyone who entered this free round. {participants.length} total.
        </p>

        {winner ? (
          <div className="winner-banner" style={{ marginBottom: "1rem" }}>
            <h3>Announced winner: {winner.name}</h3>
            <p>Prize: {winner.prizeName}</p>
          </div>
        ) : null}

        {participants.length === 0 ? (
          <p className="status-note">
            The list is empty. <Link href="/">Enter from the home page</Link>.
          </p>
        ) : (
          <ol className="participant-list">
            {participants.map((p) => (
              <li key={`${p.rank}-${p.name}-${p.enteredAt}`}>
                <span className="rank">{p.rank}</span>
                <span>{p.name}</span>
                <span className="when">
                  {new Date(p.enteredAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
