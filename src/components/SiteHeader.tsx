"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string } | null;

export function SiteHeader({ user }: { user: User }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        GiftRound
      </Link>
      <nav className="nav">
        <Link href="/participants">Participants</Link>
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="btn btn-primary">
              Join free
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
