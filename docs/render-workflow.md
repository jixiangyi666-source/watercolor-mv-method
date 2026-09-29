# Render workflow

## Phase 1 — Prepare

1. Put authorized audio at `audio/audio.m4a`.
2. Prepare `storyboard.md`.
3. Prepare local `lyrics.lrc` or `subtitles.srt`.
4. Confirm target duration, BPM, and musical accents.
5. Do not add copyrighted material to the repository.

## Phase 2 — Design

Create and approve:

- shot list
- color arc
- character model rules
- environment list
- transition language
- keyframe times
- risk list for faces, hands, storms, water, crowds, and subtitles

Do not start full rendering until these are approved.

## Phase 3 — Implement

Implement in this order:

1. `src/config.js`
2. `src/core.js`
3. `src/timeline.js`
4. scene modules
5. subtitle module
6. preview page
7. render CLI
8. encode CLI

Keep each frame a pure function of time.

## Phase 4 — Visual QA

Run contact sheets first:

```bash
node render.mjs --sheet=26,37,45,54,103,110 --cols=3 --out=out/check/sheet.jpg
```

Then inspect motion strips:

```bash
node render.mjs --strip=40:41 --cols=6 --out=out/check/storm-strip.jpg
node render.mjs --strip=103:104 --cols=6 --out=out/check/dream-strip.jpg
```

Then inspect crops:

```bash
node render.mjs --sheet=45,54 --crop=760,300,400,400 --w=600 --out=out/check/face.jpg
```

Fix composition, anatomy, motion, transition, and subtitle problems before full rendering.

## Phase 5 — Full render

```bash
node render.mjs --frames --workers=4
```

Check:

- frame count
- missing frames
- files under 1 KB
- unexpected blank frames
- output duration

## Phase 6 — Encode

```bash
node render.mjs --encode --out=out/video.mp4 --audio=audio/audio.m4a
```

Expected settings:

- H.264
- CRF 17
- preset slow
- 24fps
- yuv420p
- faststart
- AAC 192kbps

## Phase 7 — Final acceptance

Verify:

```bash
ffprobe -v error -show_streams -show_format out/video.mp4
ffmpeg -v error -i out/video.mp4 -map 0:v:0 -map 0:a:0 -f null -
```

Pass conditions:

- 1920×1080
- 24fps
- frame count matches duration
- audio/video duration matches
- no decode errors
- visual style stable
- subtitles readable
