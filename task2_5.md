# Task 2.5: Credits Screen (Photo Album) - Detailed Implementation Specification

## 📋 Overview
**Priority:** P2 (Medium)  
**Estimated Time:** 3-4 hours  
**Goal:** Display team credits as an old photo album being flipped through, not a scrolling list.

---

## 🎯 Core Requirements

### 2.5.1 Visual Design Concept

**Theme:** Leather-bound photo album from the 1940s
- Background: Rich leather texture with visible grain and wear
- Pages: Thick cream-colored cardstock with photo corners
- Photos: Sepia-toned portraits in vintage frames
- Captions: Handwritten labels below each photo
- Binding: Visible metal rings or stitching on left edge

**Color Palette:**
- Leather cover: #6B4423 (dark brown), #8B6F47 (medium brown)
- Photo mats: #F5E6D3 (cream), #E8D5B5 (aged beige)
- Photo tones: Sepia gradient (#704214 to #C9A961)
- Handwriting: #2C3E50 (ink blue-black)
- Metal accents: #B87333 (copper/brass)

### 2.5.2 Interaction Model

| Action | Effect | Animation |
|--------|--------|-----------|
| **Click/Tap Page** | Flip to next page | 3D page turn with shadow |
| **Swipe Right** | Previous page | Reverse page turn |
| **Swipe Left** | Next page | Forward page turn |
| **Auto-play Toggle** | Timed flips every 3 seconds | Smooth transitions |
| **Close Button** | Return to main menu | Album closes with fade out |

### 2.5.3 Content Structure

Each spread (2-page view) displays:
- **Left Page:** Team member photo + name
- **Right Page:** Role description + personal message/note

**Example Spread:**
```
┌─────────────────────┬─────────────────────┐
│  [Photo Frame]      │  Marco Rossi        │
│                     │  Lead Artist        │
│                     │                     │
│                     │  "Every brushstroke │
│                     │   tells a story..." │
└─────────────────────┴─────────────────────┘
```

---

## 🏗️ File Structure

```
client/src/
├── components/
│   └── Credits/
│       ├── CreditsModal.tsx           # Main modal container
│       ├── PhotoAlbum.tsx             # Album component with pages
│       ├── AlbumPage.tsx              # Single page spread
│       ├── PhotoFrame.tsx             # Individual photo component
│       ├── PageCorner.tsx             # Decorative corner piece
│       ├── AutoPlayToggle.tsx         # Auto-play control button
│       ├── styles/
│       │   ├── creditsModal.module.css
│       │   ├── album.module.css
│       │   └── pageFlip.module.css
│       └── index.ts
├── assets/
│   └── images/
│       ├── credits/
│       │   ├── album-cover.png        # Front cover texture
│       │   ├── album-back.png         # Back cover texture
│       │   ├── page-texture.png       # Page background
│       │   └── photo-corner.svg       # Decorative corner
│       └── team-photos/
│           ├── marco-rossi.jpg
│           ├── elena-conti.jpg
│           └── ... (all team members)
├── data/
│   └── creditsData.ts                 # Team member information
└── store/
    └── creditsStore.ts                # Zustand store for credits state
```

---

## 💻 Implementation Details

### Data: `creditsData.ts`

```typescript
// client/src/data/creditsData.ts

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  message?: string;
  order: number;
}

export const creditsData: TeamMember[] = [
  {
    id: 'marco-rossi',
    name: 'Marco Rossi',
    role: 'Lead Artist & Director',
    photoUrl: '/assets/images/team-photos/marco-rossi.jpg',
    message: '"Every brushstroke tells a story of Castelvento."',
    order: 1,
  },
  {
    id: 'elena-conti',
    name: 'Elena Conti',
    role: 'Lead Writer & Narrative Designer',
    photoUrl: '/assets/images/team-photos/elena-conti.jpg',
    message: '"Stories hide behind every closed shutter."',
    order: 2,
  },
  {
    id: 'alessandro-bianchi',
    name: 'Alessandro Bianchi',
    role: 'Technical Director',
    photoUrl: '/assets/images/team-photos/alessandro-bianchi.jpg',
    message: '"Code is poetry written in logic."',
    order: 3,
  },
  {
    id: 'sofia-ferrari',
    name: 'Sofia Ferrari',
    role: 'Sound Designer & Composer',
    photoUrl: '/assets/images/team-photos/sofia-ferrari.jpg',
    message: '"Music carries the soul of Italy."',
    order: 4,
  },
  {
    id: 'luca-moretti',
    name: 'Luca Moretti',
    role: 'Environment Artist',
    photoUrl: '/assets/images/team-photos/luca-moretti.jpg',
    message: '"Every stone in Castelvento has a memory."',
    order: 5,
  },
  // Add more team members...
];

// Sort by order
export const sortedCredits = [...creditsData].sort((a, b) => a.order - b.order);
```

### Store: `creditsStore.ts`

```typescript
// client/src/store/creditsStore.ts

import { create } from 'zustand';

interface CreditsState {
  isOpen: boolean;
  currentPage: number;
  totalPages: number;
  isAutoPlaying: boolean;
  autoPlayInterval: number; // milliseconds
  
  // Actions
  openCredits: () => void;
  closeCredits: () => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  toggleAutoPlay: () => void;
  setTotalPages: (total: number) => void;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  isOpen: false,
  currentPage: 0,
  totalPages: 0,
  isAutoPlaying: false,
  autoPlayInterval: 3000,

  openCredits: () => set({ isOpen: true, currentPage: 0 }),
  
  closeCredits: () => set({ 
    isOpen: false, 
    isAutoPlaying: false 
  }),
  
  nextPage: () => set((state) => ({
    currentPage: Math.min(state.currentPage + 1, state.totalPages - 1)
  })),
  
  previousPage: () => set((state) => ({
    currentPage: Math.max(state.currentPage - 1, 0)
  })),
  
  goToPage: (page) => set({ 
    currentPage: Math.max(0, Math.min(page, get().totalPages - 1)) 
  }),
  
  toggleAutoPlay: () => set((state) => ({ 
    isAutoPlaying: !state.isAutoPlaying 
  })),
  
  setTotalPages: (total) => set({ totalPages: total }),
}));
```

### Main Modal: `CreditsModal.tsx`

```typescript
// client/src/components/Credits/CreditsModal.tsx

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreditsStore } from '../../store/creditsStore';
import { PhotoAlbum } from './PhotoAlbum';
import styles from './styles/creditsModal.module.css';

export const CreditsModal: React.FC = () => {
  const { isOpen, closeCredits, isAutoPlaying, nextPage } = useCreditsStore();

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCredits();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCredits]);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && isAutoPlaying) {
      interval = setInterval(() => {
        nextPage();
      }, useCreditsStore.getState().autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isAutoPlaying, nextPage]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCredits();
    }
  }, [closeCredits]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Album Modal */}
          <motion.div
            className={styles.albumContainer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            initial={{ 
              opacity: 0, 
              scale: 0.7,
              rotateX: 20,
              transformOrigin: 'center center'
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateX: 0,
              transformOrigin: 'center center'
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.7,
              rotateX: 20,
              transformOrigin: 'center center'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              duration: 0.6,
            }}
            onClick={handleBackdropClick}
          >
            <h2 id="credits-title" className={styles.srOnly}>
              Team Credits Photo Album
            </h2>
            <PhotoAlbum />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Album Component: `PhotoAlbum.tsx`

```typescript
// client/src/components/Credits/PhotoAlbum.tsx

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreditsStore } from '../../store/creditsStore';
import { sortedCredits } from '../../data/creditsData';
import { AlbumPage } from './AlbumPage';
import { AutoPlayToggle } from './AutoPlayToggle';
import albumCover from '../../assets/images/credits/album-cover.png';
import styles from './styles/album.module.css';

export const PhotoAlbum: React.FC = () => {
  const { 
    currentPage, 
    totalPages, 
    isAutoPlaying,
    nextPage, 
    previousPage,
    setTotalPages,
    closeCredits 
  } = useCreditsStore();

  const albumRef = useRef<HTMLDivElement>(null);

  // Calculate total pages (2 members per spread)
  useEffect(() => {
    const totalSpreads = Math.ceil(sortedCredits.length / 2);
    setTotalPages(totalSpreads);
  }, [setTotalPages]);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // pixels

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        nextPage(); // Swipe left = next page
      } else {
        previousPage(); // Swipe right = previous page
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') previousPage();
      if (e.key === 'ArrowRight') nextPage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, previousPage]);

  // Get current spread members
  const getCurrentSpread = useCallback(() => {
    const startIndex = currentPage * 2;
    const leftMember = sortedCredits[startIndex];
    const rightMember = sortedCredits[startIndex + 1];
    
    return { leftMember, rightMember };
  }, [currentPage]);

  const { leftMember, rightMember } = getCurrentSpread();

  // Page flip animation variants
  const pageVariants = {
    enter: { 
      rotateY: -180, 
      opacity: 0,
      transformOrigin: 'left center',
    },
    center: { 
      rotateY: 0, 
      opacity: 1,
      transformOrigin: 'left center',
    },
    exit: { 
      rotateY: 180, 
      opacity: 0,
      transformOrigin: 'left center',
    },
  };

  return (
    <div 
      className={styles.album}
      ref={albumRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Album Cover (Visible when closed or first/last page) */}
      {currentPage === 0 && (
        <motion.div
          className={styles.albumCover}
          style={{ backgroundImage: `url(${albumCover})` }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -10 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          <div className={styles.coverTitle}>
            <h1>Castelvento</h1>
            <p>The Team Behind the Story</p>
          </div>
        </motion.div>
      )}

      {/* Page Spread */}
      <div className={styles.pageSpread}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className={styles.page}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.6,
            }}
          >
            {/* Left Page */}
            {leftMember && (
              <AlbumPage 
                member={leftMember} 
                side="left"
                pageNumber={currentPage * 2 + 1}
              />
            )}

            {/* Right Page */}
            {rightMember && (
              <AlbumPage 
                member={rightMember} 
                side="right"
                pageNumber={currentPage * 2 + 2}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={previousPage}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          ←
        </button>

        <div className={styles.pageIndicator}>
          <span>{currentPage + 1}</span>
          <span> / </span>
          <span>{totalPages}</span>
        </div>

        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          aria-label="Next page"
        >
          →
        </button>

        <AutoPlayToggle />
      </div>

      {/* Close Button */}
      <button
        className={styles.closeButton}
        onClick={closeCredits}
        aria-label="Close credits"
      >
        ✕
      </button>
    </div>
  );
};
```

### Page Component: `AlbumPage.tsx`

```typescript
// client/src/components/Credits/AlbumPage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../../data/creditsData';
import { PhotoFrame } from './PhotoFrame';
import pageTexture from '../../assets/images/credits/page-texture.png';
import styles from './styles/album.module.css';

interface AlbumPageProps {
  member: TeamMember;
  side: 'left' | 'right';
  pageNumber: number;
}

export const AlbumPage: React.FC<AlbumPageProps> = ({ member, side, pageNumber }) => {
  return (
    <div 
      className={`${styles.pageSide} ${styles[side]}`}
      style={{ backgroundImage: `url(${pageTexture})` }}
    >
      {/* Photo Corner Decorations */}
      <div className={styles.photoCorners} aria-hidden="true">
        <div className={`${styles.corner} ${styles.topLeft}`} />
        <div className={`${styles.corner} ${styles.topRight}`} />
        <div className={`${styles.corner} ${styles.bottomLeft}`} />
        <div className={`${styles.corner} ${styles.bottomRight}`} />
      </div>

      {/* Photo */}
      <div className={styles.photoContainer}>
        <PhotoFrame imageUrl={member.photoUrl} alt={`${member.name} portrait`} />
      </div>

      {/* Name */}
      <motion.h3 
        className={styles.memberName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {member.name}
      </motion.h3>

      {/* Role */}
      <p className={styles.memberRole}>{member.role}</p>

      {/* Personal Message (if exists) */}
      {member.message && (
        <motion.blockquote
          className={styles.memberMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p>"{member.message}"</p>
        </motion.blockquote>
      )}

      {/* Page Number */}
      <span className={styles.pageNumber}>{pageNumber}</span>
    </div>
  );
};
```

### Photo Frame Component: `PhotoFrame.tsx`

```typescript
// client/src/components/Credits/PhotoFrame.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './styles/album.module.css';

interface PhotoFrameProps {
  imageUrl: string;
  alt: string;
}

export const PhotoFrame: React.FC<PhotoFrameProps> = ({ imageUrl, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={styles.photoFrame}>
      {/* Vintage Frame Border */}
      <div className={styles.frameBorder} aria-hidden="true" />
      
      {/* Photo Mat */}
      <div className={styles.photoMat}>
        {isLoaded && !hasError ? (
          <motion.img
            src={imageUrl}
            alt={alt}
            className={styles.photoImage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              filter: 'sepia(0.6) contrast(1.1)'
            }}
            transition={{ duration: 0.5 }}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          // Placeholder while loading or on error
          <div className={styles.photoPlaceholder}>
            <span>📷</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  );
};
```

### CSS Module: `album.module.css`

```css
/* client/src/components/Credits/styles/album.module.css */

.album {
  position: relative;
  width: 900px;
  height: 650px;
  perspective: 2000px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Album Cover */
.albumCover {
  position: absolute;
  width: 450px;
  height: 600px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.coverTitle {
  text-align: center;
  color: #F5E6D3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.coverTitle h1 {
  font-family: 'Caveat', cursive;
  font-size: 56px;
  margin: 0;
}

.coverTitle p {
  font-family: 'Courier Prime', monospace;
  font-size: 18px;
  margin-top: 10px;
}

/* Page Spread */
.pageSpread {
  position: relative;
  width: 900px;
  height: 600px;
  display: flex;
  transform-style: preserve-3d;
}

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  transform-style: preserve-3d;
}

.pageSide {
  flex: 1;
  position: relative;
  background-size: cover;
  background-color: #F5E6D3;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pageSide.left {
  border-radius: 8px 0 0 8px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.pageSide.right {
  border-radius: 0 8px 8px 0;
}

/* Photo Corners */
.photoCorners {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 180px;
  pointer-events: none;
  z-index: 5;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  background: linear-gradient(
    135deg,
    #B87333 0%,
    #8B6F47 100%
  );
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.corner.topLeft {
  top: 0;
  left: 0;
  transform: rotate(0deg);
}

.corner.topRight {
  top: 0;
  right: 0;
  transform: rotate(90deg);
}

.corner.bottomLeft {
  bottom: 0;
  left: 0;
  transform: rotate(-90deg);
}

.corner.bottomRight {
  bottom: 0;
  right: 0;
  transform: rotate(180deg);
}

/* Photo Frame */
.photoContainer {
  margin-bottom: 20px;
  z-index: 4;
}

.photoFrame {
  position: relative;
  width: 220px;
  height: 280px;
  padding: 15px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.frameBorder {
  position: absolute;
  inset: 0;
  border: 8px solid #8B6F47;
  border-radius: 4px;
  pointer-events: none;
}

.photoMat {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #F5E6D3;
}

.photoImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photoPlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8D5B5;
  font-size: 48px;
}

.loadingOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 230, 211, 0.9);
  z-index: 6;
}

.loadingSpinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E8D5B5;
  border-top-color: #B87333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Typography */
.memberName {
  font-family: 'Caveat', cursive;
  font-size: 32px;
  color: #2C3E50;
  margin: 15px 0 5px 0;
  text-align: center;
}

.memberRole {
  font-family: 'Courier Prime', monospace;
  font-size: 16px;
  color: #5C4033;
  margin: 0 0 15px 0;
  text-align: center;
  font-style: italic;
}

.memberMessage {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  color: #34495E;
  margin: auto 0 0 0;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px dashed rgba(180, 160, 140, 0.5);
}

.pageNumber {
  position: absolute;
  bottom: 15px;
  font-family: 'Courier Prime', monospace;
  font-size: 14px;
  color: #8B6F47;
}

/* Controls */
.controls {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
}

.navButton {
  width: 44px;
  height: 44px;
  border: 2px solid #B87333;
  background: #F5E6D3;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.navButton:hover:not(:disabled) {
  background: #B87333;
  color: #F5E6D3;
}

.navButton:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pageIndicator {
  font-family: 'Courier Prime', monospace;
  font-size: 16px;
  color: #5C4033;
}

.closeButton {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #5C4033;
  cursor: pointer;
  transition: color 0.2s ease;
}

.closeButton:hover {
  color: #B87333;
}

/* Screen reader only */
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 950px) {
  .album {
    width: 95vw;
    height: 70vh;
    max-width: 700px;
    max-height: 500px;
  }

  .pageSpread {
    width: 100%;
    height: 100%;
  }

  .photoFrame {
    width: 180px;
    height: 220px;
  }

  .memberName {
    font-size: 26px;
  }

  .memberMessage {
    font-size: 16px;
    padding: 15px;
  }
}

@media (max-width: 600px) {
  .pageSpread {
    flex-direction: column;
  }

  .pageSide {
    width: 100% !important;
    flex: none;
  }

  .photoFrame {
    width: 150px;
    height: 190px;
  }
}
```

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Left Arrow**: Previous page
- **Right Arrow**: Next page
- **ESC**: Close modal
- **Tab**: Navigate controls (buttons, toggle)

### Screen Reader Support
- Album announced as dialog with title
- Each page announces team member name and role
- Current page number announced (e.g., "Page 3 of 8")
- Auto-play state announced when toggled

### Touch Accessibility
- Swipe gestures for page navigation
- Minimum 44x44px touch targets for buttons
- Clear visual feedback on tap

### Visual Accessibility
- High contrast between text and background
- Reduced motion support via `prefers-reduced-motion`
- Alt text on all photos
- Focus indicators on interactive elements

---

## 🎨 Asset Requirements

### Album Textures
1. **album-cover.png** (450x600px)
   - Leather texture with embossed title
   - Worn edges and corners
   - Rich brown tones

2. **album-back.png** (450x600px)
   - Matching back cover
   - Simpler design (no title)

3. **page-texture.png** (450x600px)
   - Cream cardstock texture
   - Subtle paper grain
   - Optional: Faint deckled edge

### Photo Assets
- **Team photos**: 220x280px minimum, sepia or convertible via CSS
- **photo-corner.svg**: Triangular corner piece (~30x30px)

---

## ✅ Acceptance Criteria

### Functional
- [ ] Album opens/closes smoothly
- [ ] Page turns work with click, swipe, and keyboard
- [ ] Auto-play toggles correctly
- [ ] All team members displayed across pages
- [ ] Page indicator shows correct count
- [ ] Close button works

### Visual
- [ ] Photo album aesthetic consistent
- [ ] Page turn animation feels realistic (3D effect)
- [ ] Photos have vintage sepia tone
- [ ] Handwritten fonts used appropriately
- [ ] Animations smooth at 60 FPS

### Accessibility
- [ ] Keyboard navigation fully functional
- [ ] Screen readers announce content correctly
- [ ] Touch gestures work on mobile
- [ ] Reduced motion preference respected
- [ ] Focus states clearly visible

### Performance
- [ ] Initial render under 300ms
- [ ] Page turns complete in under 600ms
- [ ] Images lazy load appropriately
- [ ] No jank during animations

---

## 🔧 Integration Points

### With Main Menu (Task 2.3)
```typescript
// When Book clicked in main menu
const { openCredits } = useMenuStore();
openCredits(); // Opens credits modal
```

### With Audio System
```typescript
// Play soft nostalgic piano when credits open
useEffect(() => {
  if (isOpen) {
    audioManager.playTrack('credits-theme');
  } else {
    audioManager.fadeOut();
  }
}, [isOpen]);
```

---

## 🚀 Post-Implementation Checklist

1. **Content Verification:**
   - [ ] All team members included
   - [ ] Photos loaded and displaying correctly
   - [ ] Names and roles spelled correctly
   - [ ] Personal messages approved by team

2. **Testing:**
   - [ ] Test on desktop with keyboard
   - [ ] Test on mobile with touch gestures
   - [ ] Test with screen reader
   - [ ] Test auto-play timing
   - [ ] Test rapid page turning

3. **Performance:**
   - [ ] Optimize image sizes
   - [ ] Implement lazy loading if needed
   - [ ] Check FPS during page turns

---

**End of Task 2.5 Specification**
