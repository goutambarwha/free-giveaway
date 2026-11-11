import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { Giveaway, Store } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const BLOB_PATHNAME = "giftround/store.json";

const DEFAULT_GIVEAWAY: Giveaway = {
  id: "round-1",
  title: "GiftRound",
  prizeName: "Noise-Cancelling Headphones",
  prizeDescription:
    "One randomly selected entrant wins the product after the free 30-day round ends.",
  startsAt: null,
  endsAt: null,
  winnerUserId: null,
  announcedAt: null,
};

const DEFAULT_STORE: Store = {
  users: [],
  entries: [],
  giveaway: DEFAULT_GIVEAWAY,
};

function normalizeStore(parsed: Partial<Store> | null | undefined): Store {
  return {
    users: parsed?.users ?? [],
    entries: parsed?.entries ?? [],
    giveaway: { ...DEFAULT_GIVEAWAY, ...(parsed?.giveaway ?? {}) },
  };
}

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

async function readFileStore(): Promise<Store> {
  await ensureFileStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return normalizeStore(JSON.parse(raw) as Store);
}

async function writeFileStore(store: Store): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function readBlobStore(): Promise<Store> {
  try {
    const result = await get(BLOB_PATHNAME, {
      access: "private",
      useCache: false,
    });
    if (!result?.stream) return normalizeStore(DEFAULT_STORE);
    const raw = await new Response(result.stream).text();
    return normalizeStore(JSON.parse(raw) as Store);
  } catch {
    return normalizeStore(DEFAULT_STORE);
  }
}

async function writeBlobStore(store: Store): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(store), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readStore(): Promise<Store> {
  if (useBlob()) return readBlobStore();
  return readFileStore();
}

export async function writeStore(store: Store): Promise<void> {
  if (useBlob()) {
    await writeBlobStore(store);
    return;
  }
  await writeFileStore(store);
}

export async function updateStore(
  updater: (store: Store) => Store | Promise<Store>,
): Promise<Store> {
  const current = await readStore();
  const next = await updater(current);
  await writeStore(next);
  return next;
}
