"use client";

import { useEffect, useState } from "react";

type Props = {
  endsAt: string | null;
};

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function calc(endsAt: string | null): Parts {
  if (!endsAt) {
    return { days: 30, hours: 0, minutes: 0, seconds: 0, done: false };
  }
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: false };
}

export function Countdown({ endsAt }: Props) {
  const [parts, setParts] = useState<Parts>(() => calc(endsAt));

  useEffect(() => {
    setParts(calc(endsAt));
    const id = window.setInterval(() => setParts(calc(endsAt)), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (parts.done) {
    return <p className="countdown-done">Round complete — winner below.</p>;
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Mins", value: parts.minutes },
    { label: "Secs", value: parts.seconds },
  ];

  return (
    <div className="countdown" aria-live="polite">
      {cells.map((cell) => (
        <div key={cell.label} className="countdown-cell">
          <span className="countdown-value">
            {String(cell.value).padStart(2, "0")}
          </span>
          <span className="countdown-label">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
