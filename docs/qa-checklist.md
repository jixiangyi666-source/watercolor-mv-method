# QA checklist

## Design QA

- [ ] Logline is clear.
- [ ] Every shot has an event and reaction.
- [ ] Shot lengths support readability.
- [ ] Color arc follows the story.
- [ ] Character model is defined before animation.
- [ ] Transitions are intentional and repeatable.
- [ ] Musical accents map to visible changes.
- [ ] Props and motifs carry across shots.

## Renderer QA

- [ ] Same time renders the same image.
- [ ] Frames do not depend on previous frame state.
- [ ] Workers can render out of order.
- [ ] Frame filenames are continuous.
- [ ] No generated frame is under 1 KB.
- [ ] Preview duration matches audio duration.
- [ ] Console has no runtime errors.

## Visual QA

- [ ] Subject is readable at thumbnail size.
- [ ] Character scale fits shot importance.
- [ ] Character silhouette stays stable.
- [ ] Face anatomy is consistent.
- [ ] Hands and feet are not malformed.
- [ ] Costume seams and props stay attached.
- [ ] Foreground, midground, and background separate.
- [ ] Palette does not accidentally collapse.
- [ ] Watercolor texture remains visible.
- [ ] Ink boiling is alive but not distracting.

## Motion QA

- [ ] No frozen shot.
- [ ] Breathing and micro-motion exist.
- [ ] Wind affects cloth, hair, rain, and spray coherently.
- [ ] Weight shifts before major movement.
- [ ] Actions overlap rather than moving as one block.
- [ ] Camera moves have ease-in and ease-out.
- [ ] Transitions preserve direction and continuity.

## Audio and subtitle QA

- [ ] Cut points land on planned beats.
- [ ] Audio begins at the intended offset.
- [ ] Subtitle timing matches audio.
- [ ] No lyric is hidden by important action.
- [ ] Text remains readable over watercolor texture.
- [ ] Authorized fonts are used.

## Export QA

Run:

```bash
ffprobe -v error -show_streams -show_format out/video.mp4
ffmpeg -v error -i out/video.mp4 -map 0:v:0 -map 0:a:0 -f null -
```

Confirm:

- [ ] 1920×1080
- [ ] 24fps
- [ ] H.264
- [ ] AAC
- [ ] faststart
- [ ] no decode errors
- [ ] frame count matches duration
- [ ] audio and video durations match
- [ ] final file size is reasonable
