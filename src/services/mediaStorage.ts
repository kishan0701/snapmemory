/**
 * mediaStorage.ts
 *
 * IndexedDB storage engine for SnapMemory.
 * Solves the browser localStorage 5MB limit so users can upload
 * and persist multiple high-resolution photos and videos across reloads.
 * Also stores precomputed 128-D face descriptors for instant face search.
 */

const DB_NAME = 'snapmemory_db';
const DB_VERSION = 1;
const STORE_MEDIA = 'media_blobs';
const STORE_DESCRIPTORS = 'face_descriptors';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DESCRIPTORS)) {
        db.createObjectStore(STORE_DESCRIPTORS, { keyPath: 'mediaId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/** Store a media file/blob/dataURL in IndexedDB */
export async function saveMediaData(id: string, dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put({ id, dataUrl, savedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveMediaData warning:', err);
  }
}

/** Retrieve a media dataURL from IndexedDB */
export async function getMediaData(id: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getMediaData warning:', err);
    return null;
  }
}

/** Delete a media file from IndexedDB */
export async function deleteMediaData(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteMediaData warning:', err);
  }
}

/** Store 128-D face descriptors for a media item */
export async function saveFaceDescriptors(mediaId: string, descriptors: number[][]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DESCRIPTORS, 'readwrite');
      const store = tx.objectStore(STORE_DESCRIPTORS);
      const req = store.put({ mediaId, descriptors, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveFaceDescriptors warning:', err);
  }
}

/** Retrieve 128-D face descriptors for a media item */
export async function getFaceDescriptors(mediaId: string): Promise<number[][] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DESCRIPTORS, 'readonly');
      const store = tx.objectStore(STORE_DESCRIPTORS);
      const req = store.get(mediaId);
      req.onsuccess = () => {
        resolve(req.result ? req.result.descriptors : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getFaceDescriptors warning:', err);
    return null;
  }
}
