# Preview and Generated Stills

## Low-quality preview

- File: `docs/preview/shuishou-v5-preview-0113-0133-960x540.mp4`
- Source range: `00:01:13.000` to `00:01:33.000`
- Duration: 20 seconds
- Resolution: 960x540
- Frame rate: 24 fps
- Video: H.264, CRF 28, preset slow
- Audio: AAC mono, 96 kbps
- Size: about 3.2 MB

The preview includes a short excerpt of the copyrighted song audio. Do not redistribute publicly unless the necessary rights have been confirmed.

## Generated keyframe previews

All generated stills are 960x540 JPEG images:

- `docs/generated/shuishou-v5-keyframe-26s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-37s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-45s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-54s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-73s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-103s-960x540.jpg`
- `docs/generated/shuishou-v5-keyframe-110s-960x540.jpg`

A six-frame QA sheet is also included at `out/check/v5_rendered_final_sheet.jpg`.

## Regenerate the preview

Use the full local video as the source:

```powershell
ffmpeg -y -ss 00:01:13.000 -t 20 -i <full-video.mp4> `
  -map 0:v:0 -map 0:a:0 -vf "scale=960:540" -r 24 `
  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p `
  -movflags +faststart -c:a aac -b:a 96k -ac 1 -map_metadata -1 `
  docs/preview/shuishou-v5-preview-0113-0133-960x540.mp4
```