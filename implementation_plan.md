# Real Face Matching — FindMyPhotos

## What we're building
Replace the mock/fake face matching in `FindMyPhotosPage.tsx` with **real, browser-based face detection and matching** using `face-api.js` (runs 100% locally, no server needed).

## How it works
1. User uploads selfie → face-api.js extracts a 128-dimension **face descriptor** (embedding vector)
2. All event photos are loaded one-by-one → face-api.js extracts face descriptors from each
3. **Euclidean distance** is computed between selfie descriptor and each photo's face descriptors
4. Photos with distance < threshold (0.5) are returned as matches, sorted by confidence

## Tech Stack
- **face-api.js** — TensorFlow.js based, runs in browser, no API key needed
- Models loaded from CDN (jsdelivr) or local `/public/models/` folder
- Models needed: `ssd_mobilenetv1` (detection) + `face_landmark_68` + `face_recognition`

> [!IMPORTANT]
> Models are ~6MB total, loaded once on first use. Subsequent uses are instant.

## Open Questions
- Should we show a progress bar while scanning event photos (can be slow for 100+ photos)?
- Use CDN for models or download to `/public/models/`? (CDN = no setup, Local = faster)

## Proposed Changes

### Install dependency
```
npm install face-api.js
```

### [MODIFY] FindMyPhotosPage.tsx
- Add `face-api.js` imports
- Add model loading logic (load once, cache)  
- Replace `handleSearch` mock with real face matching against event photos
- Add per-photo scan progress bar
- Keep all existing UI, just replace the backend logic

### [NEW] src/lib/face-matcher.ts
- `loadModels()` — loads face-api models from CDN
- `getFaceDescriptor(imageElement)` — extracts face embedding from selfie
- `matchFaces(selfieDescriptor, photoUrls[])` — scans all photos, returns matches sorted by confidence

## Verification Plan
- Upload a selfie → processing screen shows → real photos matched
- If no face detected in selfie → error shown
- Works on mobile browser
