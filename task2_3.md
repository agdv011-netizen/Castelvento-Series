# Task 2.3: Main Menu Navigation (Object-Based) - Detailed Implementation Specification

## 📋 Overview
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours  
**Goal:** Replace traditional buttons with interactive hand-drawn objects placed around the screen edges for main menu navigation.

---

## 🎯 Core Requirements

### 2.3.1 Interactive Objects List
Create 9 distinct interactive objects, each representing a menu function:

| # | Object Name | Icon/Visual | Function | Target Route/Action |
|---|-------------|-------------|----------|---------------------|
| 1 | Notebook | Open book with handwritten pages | Continue Game | `/game` (load last save) |
| 2 | Map | Folded vintage map with compass rose | New Game | `/new-game` (chapter select) |
| 3 | Camera | Vintage box camera with brass details | Gallery | `/gallery` (unlockable art) |
| 4 | Film Strip | Celluloid strip with 4 frames | Cutscenes | `/cutscenes` (watched cinematics) |
| 5 | Gramophone | Horn speaker with ornate details | Music/SFX Settings | Opens settings modal → audio tab |
| 6 | Backpack | Leather satchel with buckles | Save Manager | `/saves` (load/delete saves) |
| 7 | Pocket Watch | Brass watch with chain | Settings | Opens settings modal → general tab |
| 8 | Book | Hardbound book with gold embossing | Credits | `/credits` (photo album view) |
| 9 | Old Letter | Sealed envelope with wax stamp | Support Project | External link or modal |

### 2.3.2 Visual Design Specifications

**Art Style:**
- Hand-drawn watercolor illustrations
- Pencil outline base with soft watercolor fill
- Vintage 1940s aesthetic (sepia tones, aged paper texture)
- Transparent backgrounds (PNG or SVG)
- Consistent size: 80x80px to 120x120px (varies by object complexity)

**Color Palette:**
- Primary: Warm browns (#8B7355, #A0826D)
- Accent: Muted gold (#C9A961), Deep red (#8B4513)
- Highlights: Cream (#F5E6D3), Soft white (#FFF8E7)
- Shadows: Dark brown (#5C4033), Charcoal (#3E3E3E)

### 2.3.3 Animation States

Each object must have 3 distinct states:

**1. Idle State (Continuous Loop):**
- Gentle floating motion: `translateY(-3px to 3px)` over 2-3 seconds
- Subtle rotation: `rotate(-2deg to 2deg)` 
- Duration: 2.5s ease-in-out infinite
- Opacity: 0.95 (slightly subdued when not interacting)

**2. Hover/Tap State (On Mouse Enter or Touch Start):**
- Pencil lines darken: `filter: brightness(0.85)`
- Watercolor saturation increases: `filter: saturate(1.3)`
- Lift effect: `translateY(-8px)` with spring physics
- Scale: `scale(1.08)`
- Shadow deepens: `box-shadow: 0 12px 24px rgba(0,0,0,0.3)`
- Duration: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)

**3. Click/Press State (On Click or Touch End):**
- Quick scale down: `scale(0.95)`
- Rotation reset: `rotate(0deg)`
- Flash of light overlay (optional): opacity 0.3 → 0 over 0.2s
- Transition trigger: Navigate to target route after 0.15s delay
- Duration: 0.15s ease-out

---

## 🏗️ File Structure

Create the following files in the client codebase:

```
client/src/
├── components/
│   └── MainMenu/
│       ├── NavigationObjects/
│       │   ├── index.tsx              # Main container component
│       │   ├── NavigationObject.tsx   # Reusable object component
│       │   ├── objects/
│       │   │   ├── Notebook.tsx
│       │   │   ├── Map.tsx
│       │   │   ├── Camera.tsx
│       │   │   ├── FilmStrip.tsx
│       │   │   ├── Gramophone.tsx
│       │   │   ├── Backpack.tsx
│       │   │   ├── PocketWatch.tsx
│       │   │   ├── Book.tsx
│       │   │   └── OldLetter.tsx
│       │   └── styles/
│       │       └── navigationObjects.module.css
│       └── MainMenuLayout.tsx         # Layout wrapper with positioning
├── assets/
│   └── images/
│       └── menu-objects/
│           ├── notebook.svg
│           ├── map.svg
│           ├── camera.svg
│           ├── film-strip.svg
│           ├── gramophone.svg
│           ├── backpack.svg
│           ├── pocket-watch.svg
│           ├── book.svg
│           └── old-letter.svg
└── store/
    └── menuStore.ts                   # Zustand store for menu state
```

---

## 💻 Implementation Details

### Component: `NavigationObject.tsx`

```typescript
// client/src/components/MainMenu/NavigationObjects/NavigationObject.tsx

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './styles/navigationObjects.module.css';

interface NavigationObjectProps {
  icon: React.ReactNode;
  label: string;
  targetRoute?: string;
  onClick?: () => void;
  position: {
    desktop: { top?: string; right?: string; bottom?: string; left?: string };
    mobile: { top?: string; right?: string; bottom?: string; left?: string };
  };
  disabled?: boolean;
}

export const NavigationObject: React.FC<NavigationObjectProps> = memo(({
  icon,
  label,
  targetRoute,
  onClick,
  position,
  disabled = false
}) => {
  const navigate = useNavigate();

  const handleInteraction = () => {
    if (disabled) return;
    
    if (targetRoute) {
      navigate(targetRoute);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={styles.navigationObject}
      style={{
        ...position.desktop,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: disabled ? 0.5 : 1, 
        y: disabled ? 20 : [0, -3, 0],
      }}
      whileHover={!disabled ? {
        y: -8,
        scale: 1.08,
        filter: 'brightness(0.85) saturate(1.3)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
      } : {}}
      whileTap={!disabled ? {
        scale: 0.95,
        rotate: 0,
      } : {}}
      transition={{
        y: {
          duration: 2.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
        whileHover: {
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1], // spring-like
        },
        whileTap: {
          duration: 0.15,
          ease: 'easeOut',
        },
      }}
      onClick={handleInteraction}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleInteraction();
        }
      }}
      aria-label={label}
      aria-disabled={disabled}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <span className={styles.objectLabel}>{label}</span>
    </motion.div>
  );
});

NavigationObject.displayName = 'NavigationObject';
```

### CSS Module: `navigationObjects.module.css`

```css
/* client/src/components/MainMenu/NavigationObjects/styles/navigationObjects.module.css */

.navigationObject {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.iconWrapper {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.3s ease;
}

.iconWrapper svg,
.iconWrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.objectLabel {
  margin-top: 8px;
  font-family: 'Caveat', cursive;
  font-size: 14px;
  color: #5C4033;
  text-align: center;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.navigationObject:hover .objectLabel,
.navigationObject:focus-within .objectLabel {
  opacity: 1;
  transform: translateY(0);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .iconWrapper {
    width: 70px;
    height: 70px;
  }

  .objectLabel {
    font-size: 12px;
    margin-top: 4px;
  }
}

/* Accessibility focus state */
.navigationObject:focus {
  outline: 2px solid #C9A961;
  outline-offset: 4px;
  border-radius: 8px;
}

.navigationObject:focus:not(:focus-visible) {
  outline: none;
}

.navigationObject:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 4px;
}

/* Disabled state */
.navigationObject[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(0.8);
}
```

### Main Container: `index.tsx`

```typescript
// client/src/components/MainMenu/NavigationObjects/index.tsx

import React, { memo } from 'react';
import { NavigationObject } from './NavigationObject';
import { Notebook } from './objects/Notebook';
import { Map } from './objects/Map';
import { Camera } from './objects/Camera';
import { FilmStrip } from './objects/FilmStrip';
import { Gramophone } from './objects/Gramophone';
import { Backpack } from './objects/Backpack';
import { PocketWatch } from './objects/PocketWatch';
import { Book } from './objects/Book';
import { OldLetter } from './objects/OldLetter';
import { useMenuStore } from '../../../store/menuStore';
import styles from './styles/navigationObjects.module.css';

export const NavigationObjects: React.FC = memo(() => {
  const { hasSaveGame, openSettings, openCredits, openSupport } = useMenuStore();

  // Position configuration for desktop (1920x1080 reference)
  const positions = {
    notebook: {
      desktop: { top: '15%', left: '8%' },
      mobile: { top: '10%', left: '5%' },
    },
    map: {
      desktop: { top: '15%', right: '8%' },
      mobile: { top: '10%', right: '5%' },
    },
    camera: {
      desktop: { top: '35%', left: '5%' },
      mobile: { top: '25%', left: '3%' },
    },
    filmStrip: {
      desktop: { top: '35%', right: '5%' },
      mobile: { top: '25%', right: '3%' },
    },
    gramophone: {
      desktop: { bottom: '25%', left: '8%' },
      mobile: { bottom: '20%', left: '5%' },
    },
    backpack: {
      desktop: { bottom: '25%', right: '8%' },
      mobile: { bottom: '20%', right: '5%' },
    },
    pocketWatch: {
      desktop: { bottom: '12%', left: '15%' },
      mobile: { bottom: '10%', left: '10%' },
    },
    book: {
      desktop: { bottom: '12%', right: '15%' },
      mobile: { bottom: '10%', right: '10%' },
    },
    oldLetter: {
      desktop: { top: '50%', left: '3%', transform: 'translateY(-50%)' },
      mobile: { top: '50%', left: '2%', transform: 'translateY(-50%)' },
    },
  };

  return (
    <div className={styles.navigationObjectsContainer}>
      {/* Top Left - Continue Game */}
      <NavigationObject
        icon={<Notebook />}
        label="Continue"
        targetRoute="/game"
        position={positions.notebook}
        disabled={!hasSaveGame}
      />

      {/* Top Right - New Game */}
      <NavigationObject
        icon={<Map />}
        label="New Journey"
        targetRoute="/new-game"
        position={positions.map}
      />

      {/* Mid Left - Gallery */}
      <NavigationObject
        icon={<Camera />}
        label="Gallery"
        targetRoute="/gallery"
        position={positions.camera}
      />

      {/* Mid Right - Cutscenes */}
      <NavigationObject
        icon={<FilmStrip />}
        label="Memories"
        targetRoute="/cutscenes"
        position={positions.filmStrip}
      />

      {/* Bottom Left - Audio Settings */}
      <NavigationObject
        icon={<Gramophone />}
        label="Audio"
        onClick={openSettings}
        position={positions.gramophone}
      />

      {/* Bottom Right - Save Manager */}
      <NavigationObject
        icon={<Backpack />}
        label="Saves"
        targetRoute="/saves"
        position={positions.backpack}
      />

      {/* Bottom Center Left - General Settings */}
      <NavigationObject
        icon={<PocketWatch />}
        label="Settings"
        onClick={openSettings}
        position={positions.pocketWatch}
      />

      {/* Bottom Center Right - Credits */}
      <NavigationObject
        icon={<Book />}
        label="Credits"
        onClick={openCredits}
        position={positions.book}
      />

      {/* Far Left - Support */}
      <NavigationObject
        icon={<OldLetter />}
        label="Support"
        onClick={openSupport}
        position={positions.oldLetter}
      />
    </div>
  );
});

NavigationObjects.displayName = 'NavigationObjects';
```

### Individual Object Components (Example: `Notebook.tsx`)

```typescript
// client/src/components/MainMenu/NavigationObjects/objects/Notebook.tsx

import React from 'react';
import notebookIcon from '../../../../assets/images/menu-objects/notebook.svg';

export const Notebook: React.FC = () => {
  return (
    <img 
      src={notebookIcon} 
      alt="Notebook" 
      aria-hidden="true"
    />
  );
};
```

*Repeat similar structure for all 9 objects (Map, Camera, FilmStrip, Gramophone, Backpack, PocketWatch, Book, OldLetter)*

### Zustand Store: `menuStore.ts`

```typescript
// client/src/store/menuStore.ts

import { create } from 'zustand';

interface MenuState {
  hasSaveGame: boolean;
  currentLanguage: 'en' | 'ru' | 'it';
  isSettingsOpen: boolean;
  isCreditsOpen: boolean;
  isSupportOpen: boolean;
  
  // Actions
  setHasSaveGame: (hasSave: boolean) => void;
  setLanguage: (lang: 'en' | 'ru' | 'it') => void;
  openSettings: () => void;
  closeSettings: () => void;
  openCredits: () => void;
  closeCredits: () => void;
  openSupport: () => void;
  closeSupport: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  hasSaveGame: false,
  currentLanguage: 'en',
  isSettingsOpen: false,
  isCreditsOpen: false,
  isSupportOpen: false,

  setHasSaveGame: (hasSave) => set({ hasSaveGame: hasSave }),
  
  setLanguage: (lang) => {
    set({ currentLanguage: lang });
    localStorage.setItem('castelvento_language', lang);
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  
  openCredits: () => set({ isCreditsOpen: true }),
  closeCredits: () => set({ isCreditsOpen: false }),
  
  openSupport: () => set({ isSupportOpen: true }),
  closeSupport: () => set({ isSupportOpen: false }),
}));
```

---

## 📱 Responsive Layout Strategy

### Desktop (>1024px)
- Objects positioned absolutely around screen edges
- Maintain aspect ratio spacing based on 1920x1080 reference
- Labels appear on hover
- Keyboard navigation supported (Tab order: clockwise from top-left)

### Tablet (768px - 1024px)
- Slightly reduced object sizes (80px → 70px)
- Adjusted positions to prevent overlap with central characters
- Labels always visible (no hover required)

### Mobile (<768px)
- Two layout options:
  **Option A:** Vertical carousel on left/right edges (swipe to reveal more)
  **Option B:** Stacked vertically along bottom 20% of screen in 3x3 grid
  
- Object sizes: 60-70px
- Labels simplified or removed (rely on icon recognition)
- Touch targets minimum 44x44px (WCAG compliance)
- Tap feedback more pronounced (larger scale change)

**Recommended Mobile Implementation (Option B - Grid):**

```css
@media (max-width: 768px) {
  .navigationObjectsContainer {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 12px;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 400px;
    z-index: 100;
  }

  .navigationObject {
    position: relative !important;
    transform: none !important;
  }
}
```

---

## ♿ Accessibility Requirements

### Keyboard Navigation
- Tab order: Logical clockwise pattern starting from top-left
- Enter/Space: Activate object
- Focus visible: Golden outline (#C9A961) with 2px stroke
- Skip link: "Skip to main content" for screen readers

### Screen Reader Support
- Each object has `aria-label` with clear description
- Disabled objects have `aria-disabled="true"`
- Icons have `aria-hidden="true"` (decorative)
- Labels programmatically associated

### Touch Accessibility
- Minimum touch target: 44x44px (iOS HIG, Material Design)
- Clear visual feedback on touch start/end
- No hover-dependent functionality (critical actions work without hover)

---

## 🎨 Asset Creation Checklist

For each of the 9 objects, create:

1. **SVG File** (Primary format):
   - ViewBox: 0 0 100 100
   - Layers: Outline, Base Color, Shadows, Highlights
   - Optimized for web (<10KB per file)

2. **PNG Fallback** (If SVG not feasible):
   - Resolution: 200x200px (@2x for retina)
   - Transparent background
   - Optimized with TinyPNG

3. **Hover State Variant** (Optional, can be done via CSS filters):
   - Darkened outlines
   - Increased saturation

4. **Pressed State Variant** (Optional, can be done via CSS transforms):
   - Slightly darker overall
   - Compressed appearance

**Asset Naming Convention:**
```
notebook.svg
notebook-hover.svg (optional)
notebook-pressed.svg (optional)
map.svg
camera.svg
...
```

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] All 9 objects are clickable/tappable
- [ ] Each object navigates to correct route or triggers correct action
- [ ] Disabled state works (e.g., Continue disabled when no save exists)
- [ ] Click animation plays before navigation
- [ ] No navigation errors in console

### Visual Requirements
- [ ] Idle animation loops smoothly at 60 FPS
- [ ] Hover state provides clear visual feedback
- [ ] Press state feels tactile and responsive
- [ ] Objects don't overlap with central characters (Renzo & Elena)
- [ ] Art style consistent across all 9 objects
- [ ] Colors match 1940s vintage palette

### Responsive Requirements
- [ ] Desktop layout displays all objects clearly
- [ ] Tablet layout adjusts positions/sizes appropriately
- [ ] Mobile layout is usable and doesn't feel cramped
- [ ] No objects cut off at any breakpoint
- [ ] Touch targets meet 44x44px minimum on mobile

### Accessibility Requirements
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus states visible and clear
- [ ] Screen readers announce each object correctly
- [ ] Disabled objects announced as such
- [ ] WCAG AA contrast ratio met for labels

### Performance Requirements
- [ ] Initial render under 100ms
- [ ] No layout shift during animation
- [ ] SVG assets under 10KB each
- [ ] Total bundle impact <100KB
- [ ] 60 FPS maintained during all animations

---

## 🔧 Edge Cases & Error Handling

### Case 1: No Save Game Exists
- **Behavior:** Notebook object appears disabled (grayed out, no hover effect)
- **Implementation:** Check localStorage/Zustand on mount
- **Fallback:** Clicking shows toast: "No saved journey found"

### Case 2: Slow Network/Asset Loading
- **Behavior:** Objects appear with placeholder icons until SVGs load
- **Implementation:** Lazy load non-critical objects with IntersectionObserver
- **Fallback:** Show loading spinner if asset takes >2s

### Case 3: Orientation Change (Mobile)
- **Behavior:** Layout recalculates positions smoothly
- **Implementation:** Listen to resize event, recalculate positions
- **Fallback:** Use CSS Grid for automatic reflow

### Case 4: Reduced Motion Preference
- **Behavior:** Animations disabled or minimized
- **Implementation:** Check `prefers-reduced-motion` media query
- **Code:**
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In component:
animate={!prefersReducedMotion}
transition={{
  duration: prefersReducedMotion ? 0 : 0.3
}}
```

### Case 5: Touch Device Without Hover
- **Behavior:** Hover state triggered on first tap, click on second tap
- **Implementation:** Use `onTouchStart` to simulate hover
- **Fallback:** Always show labels on touch devices

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Test on Chrome, Firefox, Safari, Edge (desktop)
- [ ] Test on iOS Safari, Chrome Mobile, Samsung Browser
- [ ] Test keyboard navigation (Tab through all objects)
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Test with reduced motion enabled
- [ ] Test orientation change on mobile
- [ ] Test with slow network (throttle to 3G)

### Automated Testing (if applicable)
```typescript
// Example test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationObjects } from './NavigationObjects';

test('navigates to new game when map is clicked', () => {
  render(<NavigationObjects />);
  const mapButton = screen.getByLabelText('New Journey');
  fireEvent.click(mapButton);
  expect(window.location.pathname).toBe('/new-game');
});

test('notebook is disabled when no save exists', () => {
  render(<NavigationObjects />);
  const notebookButton = screen.getByLabelText('Continue');
  expect(notebookButton).toHaveAttribute('aria-disabled', 'true');
});
```

---

## 📦 Dependencies Required

Already available in project:
- ✅ `framer-motion` - For animations
- ✅ `react-router-dom` - For navigation
- ✅ `zustand` - For state management

No additional dependencies needed.

---

## 🎯 Integration Points

### With Main Menu Layout
```typescript
// MainMenuLayout.tsx
import { NavigationObjects } from './NavigationObjects';
import { Characters } from './Characters';
import { CinemagraphBackground } from './CinemagraphBackground';

export const MainMenuLayout = () => {
  return (
    <div className={mainMenuStyles.container}>
      <CinemagraphBackground />
      <Characters />
      <NavigationObjects />
    </div>
  );
};
```

### With Settings Modal (Task 2.4)
```typescript
// When Gramophone or Pocket Watch clicked
const { openSettings } = useMenuStore();

// Pass which tab to open
openSettings(); // defaults to general
openSettings('audio'); // opens audio tab
```

### With Credits Screen (Task 2.5)
```typescript
// When Book clicked
const { openCredits } = useMenuStore();
openCredits(); // triggers photo album modal
```

---

## 🚀 Post-Implementation Steps

1. **Performance Audit:**
   - Run Lighthouse performance test
   - Check for layout shifts (CLS score)
   - Verify 60 FPS with Chrome DevTools

2. **Accessibility Audit:**
   - Run axe DevTools
   - Test with actual screen reader users if possible
   - Verify keyboard-only navigation

3. **Cross-Browser Testing:**
   - Test on BrowserStack or Sauce Labs
   - Document any browser-specific issues

4. **Asset Optimization:**
   - Compress SVGs with SVGO
   - Generate WebP fallbacks if using PNGs
   - Implement lazy loading for non-critical objects

5. **Documentation:**
   - Update README with usage examples
   - Add Storybook stories for each object (if Storybook configured)
   - Document prop interfaces for future developers

---

## 📝 Developer Notes

### Best Practices
- Keep SVG files inline for better animation control (or use react-svg)
- Use `memo()` to prevent unnecessary re-renders
- Avoid inline styles for complex animations (use CSS modules)
- Test with actual game save data, not just mock data

### Common Pitfalls to Avoid
- ❌ Don't make objects too small on mobile (minimum 44px touch target)
- ❌ Don't rely solely on hover for critical information
- ❌ Don't forget to handle disabled states properly
- ❌ Don't block the central character area with navigation objects
- ❌ Don't use autoplay sounds on interaction (browser policy)

### Performance Tips
- Use `will-change: transform` sparingly (only on animating elements)
- Avoid animating properties that trigger layout (width, height, top, left)
- Use CSS transforms and opacity for smooth 60 FPS animations
- Preload SVG assets during splash screen phase

---

## 🎨 Reference Implementation

See similar implementations in:
- **Disco Elysium** - Object-based menu with thematic items
- **Pentiment** - Hand-drawn UI elements with historical aesthetic
- **The Longest Journey** - Diegetic UI integrated into game world

---

**End of Task 2.3 Specification**
