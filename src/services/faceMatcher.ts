/**
 * face-matcher.ts
 * Browser-based face detection & matching using @vladmandic/face-api.
 * Runs 100% locally — no API key or server needed.
 */

import * as faceapi from '@vladmandic/face-api';

// Use CDN for model weights (~6 MB, loaded once and cached by browser)
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';

let _modelsLoaded = false;
let _loadPromise: Promise<void> | null = null;

/** Load face-api models (called once; subsequent calls return immediately). */
export async function loadModels(
  onProgress?: (step: string) => void,
): Promise<void> {
  if (_modelsLoaded) return;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    onProgress?.('Loading face detector…');
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    onProgress?.('Loading landmark model…');
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

    onProgress?.('Loading recognition model…');
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    _modelsLoaded = true;
    onProgress?.('Models ready ✓');
  })();

  return _loadPromise;
}

/** Extract 128-D face embedding from a user-supplied selfie URL/ObjectURL. */
export async function detectFaceDescriptor(
  imageSrc: string,
): Promise<Float32Array | null> {
  const img = await loadImageEl(imageSrc, false); // same-origin OK (ObjectURL)
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 });
  const detection = await faceapi
    .detectSingleFace(img, options)
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return detection?.descriptor ?? null;
}

export interface FaceMatchResult {
  mediaId: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  confidence: number; // 0–1, higher = better match
  distance: number;   // euclidean distance, lower = better
}

/**
 * Scan event photos for faces that match the reference descriptor.
 * Photos that fail to load (CORS etc.) are skipped gracefully.
 */
export async function matchPhotosAgainstFace(
  selfieDescriptor: Float32Array,
  photos: { id: string; url: string; thumbnailUrl: string; filename: string }[],
  onProgress?: (scanned: number, total: number, filename: string) => void,
  threshold = 0.5,
): Promise<FaceMatchResult[]> {
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
  const results: FaceMatchResult[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress?.(i + 1, photos.length, photo.filename);

    try {
      const img = await loadImageEl(photo.url, true);
      const detections = await faceapi
        .detectAllFaces(img, options)
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      let bestDistance = Infinity;
      for (const det of detections) {
        const dist = faceapi.euclideanDistance(selfieDescriptor, det.descriptor);
        if (dist < bestDistance) bestDistance = dist;
      }

      if (bestDistance < threshold) {
        const confidence = parseFloat((1 - bestDistance / threshold).toFixed(3));
        results.push({
          mediaId: photo.id,
          url: photo.url,
          thumbnailUrl: photo.thumbnailUrl,
          filename: photo.filename,
          confidence,
          distance: bestDistance,
        });
      }
    } catch {
      // Skip CORS failures or load errors silently
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function loadImageEl(src: string, crossOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = crossOrigin && !src.startsWith('blob:')
      ? src.includes('?') ? `${src}&_cors=1` : `${src}?_cors=1`
      : src;
  });
}
