/**
 * faceMatcher.ts
 * Browser-based AI Face Detection, Embedding Extraction & Vector Matching.
 * Powered by @vladmandic/face-api (TensorFlow.js backend).
 *
 * Capabilities:
 * 1. Extract 128-D face embeddings from selfies and event photos.
 * 2. Instant matching against pre-computed face descriptors stored in DB/IndexedDB.
 * 3. Graceful fallback for unindexed photos with on-the-fly descriptor caching.
 * 4. 100% private, on-device execution with zero server GPU cost.
 */

import * as faceapi from '@vladmandic/face-api';
import { saveFaceDescriptors, getFaceDescriptors } from './mediaStorage';

// High-speed CDN for neural net weights (~6 MB total, cached by browser Cache API)
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';

let _modelsLoaded = false;
let _loadPromise: Promise<void> | null = null;

/** Load face-api models once; subsequent calls return immediately. */
export async function loadModels(
  onProgress?: (step: string) => void,
): Promise<void> {
  if (_modelsLoaded) return;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      onProgress?.('Loading face detector (TinyFaceDetector)…');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

      onProgress?.('Loading facial landmarks (68 points)…');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

      onProgress?.('Loading face recognition model (ResNet 128-D)…');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      _modelsLoaded = true;
      onProgress?.('AI Models ready ✓');
    } catch (err) {
      _loadPromise = null;
      console.error('Failed to load face-api models:', err);
      throw new Error('Could not load AI face detection models. Please check your internet connection.');
    }
  })();

  return _loadPromise;
}

/** Extract 128-D face embedding from a user-supplied selfie URL/ObjectURL. */
export async function detectFaceDescriptor(
  imageSrc: string,
): Promise<Float32Array | null> {
  await loadModels();
  const img = await loadImageEl(imageSrc, false);
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 });
  const detection = await faceapi
    .detectSingleFace(img, options)
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return detection?.descriptor ?? null;
}

/**
 * Detect ALL faces in an uploaded photo and return 128-D embeddings as serializable number[][].
 * Used during photo upload to index faces in Database / IndexedDB.
 */
export async function detectAllFaceDescriptors(
  imageSrc: string,
): Promise<number[][]> {
  try {
    await loadModels();
    const isLocal = imageSrc.startsWith('data:') || imageSrc.startsWith('blob:');
    const img = await loadImageEl(imageSrc, !isLocal);
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
    const detections = await faceapi
      .detectAllFaces(img, options)
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    return detections.map(d => Array.from(d.descriptor));
  } catch (err) {
    console.warn('Face detection error for photo:', err);
    return [];
  }
}

export interface FaceMatchInputPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  face_descriptors?: number[][];
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
 * Scan event photos for faces that match the selfie reference descriptor.
 * Uses stored database/IndexedDB face descriptors whenever available for instant speed!
 */
export async function matchPhotosAgainstFace(
  selfieDescriptor: Float32Array,
  photos: FaceMatchInputPhoto[],
  onProgress?: (scanned: number, total: number, filename: string) => void,
  threshold = 0.52,
  onDescriptorCached?: (mediaId: string, descriptors: number[][]) => void,
): Promise<FaceMatchResult[]> {
  await loadModels();
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
  const results: FaceMatchResult[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress?.(i + 1, photos.length, photo.filename);

    let descriptors = photo.face_descriptors;

    // Check IndexedDB if not in memory
    if (!descriptors || descriptors.length === 0) {
      const saved = await getFaceDescriptors(photo.id);
      if (saved && saved.length > 0) {
        descriptors = saved;
      }
    }

    let bestDistance = Infinity;

    // If descriptors are already pre-computed in database/storage, match instantly!
    if (descriptors && descriptors.length > 0) {
      for (const desc of descriptors) {
        const dist = faceapi.euclideanDistance(selfieDescriptor, new Float32Array(desc));
        if (dist < bestDistance) bestDistance = dist;
      }
    } else {
      // Dynamic fallback: Load image, run detection, and cache descriptors
      try {
        const isLocal = photo.url.startsWith('data:') || photo.url.startsWith('blob:');
        const img = await loadImageEl(photo.url, !isLocal);
        const detections = await faceapi
          .detectAllFaces(img, options)
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        const extracted = detections.map(d => Array.from(d.descriptor));
        if (extracted.length > 0) {
          saveFaceDescriptors(photo.id, extracted).catch(() => {});
          onDescriptorCached?.(photo.id, extracted);
        }

        for (const det of detections) {
          const dist = faceapi.euclideanDistance(selfieDescriptor, det.descriptor);
          if (dist < bestDistance) bestDistance = dist;
        }
      } catch {
        // Skip CORS or load failures gracefully
      }
    }

    if (bestDistance < threshold) {
      const confidence = parseFloat(Math.max(0, Math.min(1, 1 - bestDistance / threshold)).toFixed(3));
      results.push({
        mediaId: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        filename: photo.filename,
        confidence,
        distance: bestDistance,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function loadImageEl(src: string, crossOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');

    if (crossOrigin && !isDataOrBlob) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src.slice(0, 80)}…`));

    // Only append CORS parameter to external HTTP/HTTPS URLs
    if (crossOrigin && !isDataOrBlob && (src.startsWith('http://') || src.startsWith('https://'))) {
      img.src = src.includes('?') ? `${src}&_cors=1` : `${src}?_cors=1`;
    } else {
      img.src = src;
    }
  });
}
