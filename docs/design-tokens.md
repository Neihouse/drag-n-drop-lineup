# Design Tokens - Primordial Groove

This document outlines the design token system for the Primordial Groove lineup planner application.

## Overview

Design tokens provide a single source of truth for design decisions. They enable consistent theming across different platforms and make it easy to maintain and update the design system.

## Token Structure

### Colors

#### Background Hierarchy
- `bg-primordial-background-primary` - Main app background (#121417)
- `bg-primordial-background-secondary` - Content areas (#1a1a1a)  
- `bg-primordial-background-tertiary` - Panels and headers (#2a2a2a)
- `bg-primordial-background-quaternary` - Input fields and cards (#3a3a3a)
- `bg-primordial-background-hover` - Hover states (#4a4a4a)

#### Accent Colors
- `bg-primordial-accent-primary` - Primary buttons and highlights (#dae4f5)
- `bg-primordial-accent-hover` - Accent hover states (#c1d3f0)
- `text-primordial-background-primary` - Text on accent backgrounds (#121417)

#### Avatar Colors
- `bg-avatar-amber` - DJ Nova (#fbbf24)
- `bg-avatar-orange` - DJ Echo (#fb923c)
- `bg-avatar-rose` - DJ Pulse (#fb7185)
- `bg-avatar-teal` - DJ Rhythm (#2dd4bf)
- `bg-avatar-blue` - Additional avatars (#60a5fa)
- `bg-avatar-purple` - Additional avatars (#a78bfa)
- `bg-avatar-green` - Additional avatars (#34d399)
- `bg-avatar-red` - Additional avatars (#f87171)

### Typography

#### Font Families
- Primary: "Space Grotesk", "Noto Sans", system-ui, sans-serif
- Monospace: var(--font-geist-mono), monospace

## Usage in Code

### Tailwind Classes
```tsx
// Background hierarchy
<div className="bg-primordial-background-primary">
  <div className="bg-primordial-background-tertiary">
    <input className="bg-primordial-background-quaternary" />
  </div>
</div>

// Accent colors
<button className="bg-primordial-accent-primary hover:bg-primordial-accent-hover">
  Click me
</button>

// Avatar colors
<div className="bg-avatar-amber">DN</div>
```

### CSS Variables
```css
/* Available in globals.css */
--color-primordial-background-primary: #121417;
--color-primordial-accent-primary: #dae4f5;
--color-avatar-amber: #fbbf24;
```

## File Structure

```
/design-tokens.json          # Complete token definitions
/app/globals.css             # CSS variables and Tailwind theme
/docs/design-tokens.md       # This documentation
```

## Benefits for CTO Implementation

1. **Consistency** - All colors reference the same source
2. **Maintainability** - Change one value to update everywhere
3. **Platform Agnostic** - JSON can be consumed by any framework
4. **Type Safety** - Clear naming prevents color misuse
5. **Documentation** - Self-documenting design system

## Migration Notes

All hardcoded hex values have been replaced with semantic token names:
- `bg-[#121417]` → `bg-primordial-background-primary`
- `bg-[#2a2a2a]` → `bg-primordial-background-tertiary`
- `bg-[#dae4f5]` → `bg-primordial-accent-primary`
- `bg-amber-400` → `bg-avatar-amber`

## Next Steps

These tokens can be:
1. Imported into React Native for mobile apps
2. Consumed by CSS-in-JS libraries
3. Generated into iOS/Android native formats
4. Extended with additional semantic tokens as needed 