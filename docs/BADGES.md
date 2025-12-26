# Badge System Guide

Complete guide for creating and managing achievement badges in the gamification system.

## Quick Start

The system currently uses **emoji-based badges** which work perfectly out of the box. Custom PNG/SVG badges are entirely optional upgrades.

## Badge Specifications

### Technical Requirements
- **Format**: PNG with transparency (recommended) or SVG
- **Dimensions**: 512x512px
- **File Size**: < 50KB per badge (optimized)
- **Location**: `/public/badges/{achievement-key}.png`
- **Fallback**: Emoji (already implemented)

### File Naming
Use the achievement `key` as the filename:
- `first-note.png`
- `notes-10.png`
- `tasks-completed-100.png`
- `streak-365.png`
- `level-100.png`

### Directory Structure

**Option 1: Flat Structure (Recommended)**
```
public/
└── badges/
    ├── welcome.png
    ├── first-note.png
    ├── notes-10.png
    └── ... (all badges)
```

**Option 2: Organized by Tier**
```
public/
└── badges/
    ├── bronze/
    ├── silver/
    ├── gold/
    └── platinum/
```

## Design Guidelines

### Tier Color Palettes

**Bronze Tier**
- Primary: `#CD7F32`
- Light: `#DEB887`
- Dark: `#8B4513`
- Style: Simple, clean, welcoming

**Silver Tier**
- Primary: `#C0C0C0`
- Light: `#E8E8E8`
- Dark: `#808080`
- Style: Refined, polished

**Gold Tier**
- Primary: `#FFD700`
- Light: `#FFFF00`
- Dark: `#FFA500`
- Style: Prestigious, impressive

**Platinum Tier**
- Primary: `#E5E4E2`
- Light: `#F5F5F5`
- Dark: `#B8B8D0`
- Style: Elite, legendary

### Design Principles

1. **Clarity**: Badge should be recognizable at 32x32px
2. **Simplicity**: Avoid excessive detail or text
3. **Consistency**: All badges should feel like part of a set
4. **Tier Progression**: Higher tiers should look more ornate

### Safe Zones
```
512x512px Canvas
├─ 16px Padding (outer)
├─ 480x480px Badge Area
│  ├─ 16px Internal Padding
│  └─ 448x448px Safe Zone (main content)
└─ Center: 384x384px (critical elements)
```

### Do's and Don'ts

**Do**:
- ✅ Use tier-appropriate color palette
- ✅ Ensure good contrast for light/dark modes
- ✅ Keep colors vibrant but not garish
- ✅ Test on both light and dark backgrounds
- ✅ Use symbols/icons (not text)

**Don't**:
- ❌ Use pure white (#FFFFFF) or pure black (#000000)
- ❌ Use neon or overly saturated colors
- ❌ Use more than 4-5 colors per badge
- ❌ Use text or photos

## Implementation

### Using Badge Images in Code

**Method 1: Direct Path**
```typescript
const badgeUrl = `/badges/${achievement.key}.png`;

<img
  src={badgeUrl}
  alt={achievement.name}
  className="w-16 h-16"
/>
```

**Method 2: Next.js Image (Recommended)**
```typescript
import Image from 'next/image';

<Image
  src={`/badges/${achievement.key}.png`}
  alt={achievement.name}
  width={64}
  height={64}
  className="rounded-full"
/>
```

### Fallback to Emoji

The system automatically falls back to emoji if badge images don't exist:

```typescript
const [imageError, setImageError] = useState(false);

if (imageError) {
  return <div style={{ fontSize: size * 0.6 }}>{achievement.icon}</div>;
}

return (
  <Image
    src={`/badges/${achievement.key}.png`}
    onError={() => setImageError(true)}
    // ...
  />
);
```

## Optimization

### Export Settings

**Adobe Photoshop/Illustrator**
```
Format: PNG-24
Transparency: Yes
Size: 512x512px
Resolution: 72 DPI
Color Profile: sRGB IEC61966-2.1
```

**Figma/Sketch**
```
Export as: PNG
Scale: 1x
Size: 512x512px
Include transparency: Yes
Optimize for web: Yes
```

### Compression Tools

1. **TinyPNG** (https://tinypng.com/) - Reduces 50-70% file size
2. **ImageOptim** (macOS) - Batch lossless optimization
3. **Squoosh** (https://squoosh.app/) - Web-based with quality comparison

### Batch Optimization Script

```bash
#!/bin/bash
cd public/badges

for file in *.png; do
  echo "Optimizing $file..."
  pngquant --quality=85-95 --force --ext .png "$file"
done

echo "✅ All badges optimized!"
```

## Quality Checklist

Before finalizing each badge:

- [ ] Size: Exactly 512x512px
- [ ] Background: Fully transparent
- [ ] File Size: < 50KB (ideally < 30KB)
- [ ] Format: PNG-24 or PNG-32 with alpha
- [ ] Visibility: Clear at 32x32px
- [ ] Contrast: Works on light and dark backgrounds
- [ ] Tier Appropriate: Matches tier color palette
- [ ] Consistent Style: Feels like part of the set
- [ ] No Text: Uses only symbols/icons
- [ ] Centered: Main elements properly centered
- [ ] Optimized: Compressed
- [ ] Named Correctly: Matches achievement key exactly

## Development Strategy

### Phase 1: Use Emojis (Current State ✅)
- System works perfectly with emojis
- No badge images needed
- Zero setup required

### Phase 2: Add High-Priority Badges (Optional)
Create custom images for:
1. Welcome badge (first impression)
2. All Platinum tier badges (6 badges)
3. Special achievements (Perfect Score, Year of Excellence)

**Total: ~15 badges**

### Phase 3: Complete Collection (Optional)
Add remaining badges over time as needed.

## Design Resources

### Recommended Software

**Vector (Best for badges)**:
- Figma (free, collaborative)
- Adobe Illustrator (professional)
- Inkscape (free, open-source)
- Affinity Designer (one-time purchase)

**Raster**:
- Adobe Photoshop (professional)
- GIMP (free, open-source)

### Icon Resources

For inspiration and elements:
- Lucide Icons (https://lucide.dev/)
- Heroicons (https://heroicons.com/)
- Flaticon (https://www.flaticon.com/)
- Noun Project (https://thenounproject.com/)

**Note**: Ensure you have rights to use any icons/elements in your badges.

## Summary

**Total Badges**: 60 achievements across 8 categories

**Current System**: Emoji-based (fully functional)

**Custom Badges**: Optional enhancement

**Recommendation**: Start with emojis, gradually create custom badges for platinum tier and special achievements.

The emoji-based system is production-ready and looks great. Custom badges are purely optional visual upgrades you can add at your own pace.
