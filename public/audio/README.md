# Lo-Fi Music Library for Pomodoro Timer

This folder contains organized playlists of lo-fi music tracks for the Pomodoro timer, categorized by genre and timer mode.

## Folder Structure

```
/public/audio/
├── jazz/
│   ├── focus-1.mp3
│   ├── focus-2.mp3
│   ├── focus-3.mp3
│   ├── short-break-1.mp3
│   ├── short-break-2.mp3
│   ├── long-break-1.mp3
│   └── long-break-2.mp3
├── edm/
│   ├── focus-1.mp3
│   ├── focus-2.mp3
│   ├── focus-3.mp3
│   ├── short-break-1.mp3
│   ├── short-break-2.mp3
│   ├── long-break-1.mp3
│   └── long-break-2.mp3
└── hiphop/
    ├── focus-1.mp3
    ├── focus-2.mp3
    ├── focus-3.mp3
    ├── short-break-1.mp3
    ├── short-break-2.mp3
    ├── long-break-1.mp3
    └── long-break-2.mp3
```

## Genre Categories

### Jazz
Lo-fi jazz fusion tracks with smooth saxophone, piano, and mellow beats

### EDM
Lo-fi electronic dance music with ambient synths and chill beats

### Hip-Hop
Lo-fi hip-hop beats with laid-back rhythms and jazzy samples

## Timer Modes

Each genre has tracks for three different timer modes:

1. **Focus** (Work Session - 25 min) - 3 tracks per genre
   - More upbeat and energizing to maintain concentration

2. **Short Break** (5 min) - 2 tracks per genre
   - Relaxing and calming for quick breaks

3. **Long Break** (15 min) - 2 tracks per genre
   - Even more relaxed for longer rest periods

## How to Add Your Music

1. Create the genre folders: `jazz/`, `edm/`, and `hiphop/` in `/public/audio/`
2. Find or create lo-fi music tracks (royalty-free or your own)
3. Save them as MP3 files following the naming convention above
4. The timer will automatically load and play them when music is enabled

## Music Controls

Users can:
- **Select Genre** - Choose between Jazz, EDM, or Hip-Hop
- **Skip Tracks** - Navigate to next/previous track in the playlist
- **Loop Current Track** - Toggle looping for the current song
- **Auto-Play Next** - When loop is off, automatically plays next track
- **Seek/Scrub** - Click or drag the progress bar to jump to any part of the track
- **View Progress** - See current time and total duration of the track
- **Mode-Specific Playlists** - Playlists automatically switch based on timer mode

## Adding More Tracks

You can easily expand the playlists by:

1. Adding more tracks to any genre folder (e.g., `focus-4.mp3`, `focus-5.mp3`)
2. Updating the playlist in `contexts/timer-context.tsx`:

```typescript
jazz: {
  work: [
    { name: "Jazz Focus 1", path: "/audio/jazz/focus-1.mp3" },
    { name: "Jazz Focus 2", path: "/audio/jazz/focus-2.mp3" },
    { name: "Jazz Focus 3", path: "/audio/jazz/focus-3.mp3" },
    { name: "Jazz Focus 4", path: "/audio/jazz/focus-4.mp3" }, // Add new tracks here
  ],
  // ... other modes
}
```

## Recommended Sources for Lo-Fi Music

- **YouTube Audio Library** (royalty-free)
- **Pixabay Music** (free for commercial use)
- **Free Music Archive**
- **Incompetech** (Creative Commons)
- **Chillhop Music** (lo-fi hip-hop)
- **Lofi Girl** (check licensing)
- Create your own using GarageBand, FL Studio, or Ableton

## Technical Details

- **Volume**: Set to 30% by default (adjustable in `contexts/timer-context.tsx`)
- **Playback**: Music plays when timer is running, pauses when timer pauses
- **Track Switching**: Tracks change when mode changes (work → break) or when manually skipped
- **Audio Scrubber**: Users can seek/scrub through tracks with a progress bar showing current position
- **Format**: **MP3 is strongly recommended** (10-20x smaller than WAV, faster loading)
  - Recommended bitrate: 128-192 kbps for lo-fi music
  - WAV files are uncompressed and unnecessarily large for streaming
  - All modern browsers support MP3 playback
- **File Size**: Keep files under 5MB each for faster loading (easily achieved with MP3 format)

## Notes

- Ensure your audio files are properly licensed for use
- The music player state persists across page navigation
- Genre preference is remembered during the session
- Loop preference applies to all genres and modes
