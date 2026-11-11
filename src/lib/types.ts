export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type Entry = {
  id: string;
  userId: string;
  name: string;
  email: string;
  enteredAt: string;
};

export type Giveaway = {
  id: string;
  title: string;
  prizeName: string;
  prizeDescription: string;
  startsAt: string | null;
  endsAt: string | null;
  winnerUserId: string | null;
  announcedAt: string | null;
};

export type Store = {
  users: User[];
  entries: Entry[];
  giveaway: Giveaway;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};
