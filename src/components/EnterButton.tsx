"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  loggedIn: boolean;
  hasEntered: boolean;
  isOpen: boolean;
};

export function EnterButton({ loggedIn, hasEntered, isOpen }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function enter() {
    if (!loggedIn) {
      router.push("/signup");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/giveaway/enter", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not enter.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return <p className="status-note">Entries are closed for this round.</p>;
  }

  if (hasEntered) {
    return (
      <p className="status-note status-ok">
        You&apos;re on the public list. Good luck!
      </p>
    );
  }

  return (
    <div className="enter-wrap">
      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={enter}
        disabled={loading}
      >
        {loading ? "Entering…" : loggedIn ? "Enter free giveaway" : "Create free account to enter"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
