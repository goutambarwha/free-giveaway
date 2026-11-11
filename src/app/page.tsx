import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { EnterButton } from "@/components/EnterButton";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth";
import { readStore } from "@/lib/db";
import {
  isRoundOpen,
  publicParticipants,
  resolveGiveawayState,
  winnerPublic,
} from "@/lib/giveaway";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await resolveGiveawayState(await readStore());
  const session = await getSession();
  const participants = publicParticipants(store.entries).slice(0, 8);
  const winner = winnerPublic(store);
  const hasEntered = session
    ? store.entries.some((e) => e.userId === session.userId)
    : false;
  const open = isRoundOpen(store.giveaway);

  return (
    <>
      <SiteHeader
        user={
          session
            ? { id: session.userId, name: session.name, email: session.email }
            : null
        }
      />

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-brand">GiftRound</p>
          <h2>Enter free. See everyone on the list. One product winner in 30 days.</h2>
          <p>
            No payment. Create an account, join the public participant list, and after
            the round ends a random name is announced for the prize.
          </p>
          <div className="hero-actions">
            <EnterButton
              loggedIn={Boolean(session)}
              hasEntered={hasEntered}
              isOpen={open}
            />
            <Link href="/participants" className="btn btn-ghost">
              View full list
            </Link>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Prize product preview">
          <div className="hero-caption">{store.giveaway.prizeName}</div>
        </div>
      </section>

      <section className="section">
        <h2>Round timer</h2>
        <p className="lead">
          Entries stay open for 30 days from the start of this round. When time is up,
          one entrant is chosen at random.
        </p>
        <Countdown endsAt={store.giveaway.endsAt} />
        {winner ? (
          <div className="winner-banner">
            <h3>Winner: {winner.name}</h3>
            <p>
              Publicly selected for {winner.prizeName}
              {winner.announcedAt
                ? ` on ${new Date(winner.announcedAt).toLocaleString()}`
                : ""}
              .
            </p>
          </div>
        ) : null}
      </section>

      <section className="section">
        <h2>Recent participants</h2>
        <p className="lead">
          {store.entries.length === 0
            ? "No one has entered yet — be the first."
            : `${store.entries.length} people on the list. Logged-in users can see everyone.`}
        </p>
        {participants.length > 0 ? (
          <ol className="participant-list">
            {participants.map((p) => (
              <li key={`${p.rank}-${p.name}`}>
                <span className="rank">{p.rank}</span>
                <span>{p.name}</span>
                <span className="when">
                  {new Date(p.enteredAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
        <p style={{ marginTop: "1rem" }}>
          <Link href="/participants">See all participants →</Link>
        </p>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <ol className="rules">
          <li>Sign up for free — there is no entry fee and no payment gateway.</li>
          <li>Enter once. Your name appears on the public participant list.</li>
          <li>After 30 days, one random entrant is announced as the winner.</li>
          <li>The prize is a product ({store.giveaway.prizeName}), not cash.</li>
        </ol>
      </section>

      <footer className="footer">
        GiftRound is a free giveaway demo. Change the prize name in{" "}
        <code>data/store.json</code>. Always follow your local promotion laws.
      </footer>
    </>
  );
}
