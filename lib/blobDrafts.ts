const DB_NAME = "arco-local-drafts";
const STORE_NAME = "blob-drafts";
const VERSION = 1;

type StoredFile = {
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("INDEXED_DB_UNAVAILABLE"));
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("INDEXED_DB_OPEN_FAILED"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("INDEXED_DB_REQUEST_FAILED"));
      transaction.onabort = () => reject(transaction.error ?? new Error("INDEXED_DB_ABORTED"));
    });
  } finally {
    database.close();
  }
}

export async function saveFileDraft(key: string, files: File[]) {
  if (files.length === 0) {
    await clearFileDraft(key);
    return;
  }
  const stored: StoredFile[] = files.map((file) => ({
    blob: file,
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
  }));
  await withStore("readwrite", (store) => store.put(stored, key));
}

export async function loadFileDraft(key: string): Promise<File[]> {
  const stored = await withStore<StoredFile[] | undefined>("readonly", (store) => store.get(key));
  return (stored ?? []).map(
    (item) =>
      new File([item.blob], item.name, {
        type: item.type,
        lastModified: item.lastModified,
      }),
  );
}

export async function clearFileDraft(key: string) {
  await withStore("readwrite", (store) => store.delete(key));
}
