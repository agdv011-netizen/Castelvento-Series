## 📋 Task Organization
Tasks are grouped by major game components:
1. **Splash & Loading** — Initial app experience
2. **Main Menu** — Dynamic cinemagraph menu system
3. **Opening Cinematic** — 90-second intro sequence
4. **Bedroom Onboarding** — Interactive tutorial scene
5. **Core Systems** — Game mechanics and state management
6. **World & Locations** — Map and environment system
7. **Characters & NPCs** — Relationship and schedule systems
8. **UI/HUD** — Interface components
9. **Audio System** — Soundscapes and music
10. **Polish & Optimization** — Final refinements
---
## 1️⃣ Splash & Loading Screen
### Task 1.1: Splash Screen (Black Screen → Logo)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 2-3 hours
**Description:**  
Create the initial splash screen that plays when the app loads. No UI, just atmosphere.
**Requirements:**
- [ ] Start with completely black screen
- [ ] After 1s: Play wave sound effect (🌊)
- [ ] After 2s: Play bicycle bell sound (🚲)
- [ ] Animate studio logo appearing as pencil sketch
- [ ] Fill logo with watercolor effect over 1s
- [ ] Fade out logo after 1s hold
- [ ] Total duration: ~5 seconds
**Technical Notes:**
- Use Framer Motion for draw-on effect
- Audio via Howler.js with preload
- Logo assets: SVG for pencil lines, PNG for watercolor fill
- Ensure audio plays even on mobile (handle autoplay policies)
**Acceptance Criteria:**
- ✅ Black screen displays immediately on app load
- ✅ Sounds play in correct sequence
- ✅ Logo animation is smooth (60 FPS)
- ✅ Transitions seamlessly to Loading Screen
---
### Task 1.2: Loading Screen with Traveling Bicycle
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-6 hours
**Description:**  
Create an engaging loading screen that shows a bicycle traveling across the Castelvento map instead of a boring progress bar.
**Requirements:**
- [ ] Background: Old postcard aesthetic on wooden desk
- [ ] Decorative elements: pencils, stamps, letters, compass (static)
- [ ] Center: Illustrated map of Castelvento
- [ ] Animation: Small bicycle 🚲 sprite travels along map paths
- [ ] Progress indication: Bicycle reaches checkpoints (street → beach → church → home)
- [ ] Dynamic text at bottom with random phrases:
  - "Exploring Castelvento..."
  - "Preparing today's story..."
  - "Renzo is still sleeping."
  - "The train arrives in minutes."
  - "Some stories hide behind closed shutters."
- [ ] Smooth camera pan following bicycle
**Technical Notes:**
- Map asset: High-res illustration with defined path coordinates
- Bicycle: Sprite sheet with pedaling animation
- Use Framer Motion `useMotionValue` for progress tracking
- Random phrase selector runs on each load
- Preload next scene assets during this phase
**Acceptance Criteria:**
- ✅ Bicycle moves smoothly along predefined path
- ✅ Progress correlates with actual asset loading
- ✅ Random phrases display correctly
- ✅ Visual style matches 1940s postcard aesthetic
- ✅ Works on both desktop and mobile resolutions
---
## 2️⃣ Main Menu (Dynamic Cinemagraph)
### Task 2.1: Main Menu Background (Cinemagraph)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Create a living, breathing panorama of Castelvento that serves as the main menu background. The scene changes based on real-world time.
**Requirements:**
- [ ] Full-screen panoramic illustration of Castelvento
- [ ] Animated elements (subtle, looping):
  - Sea waves moving
  - Flags swaying in wind
  - Birds flying across sky
  - Smoke from chimneys
  - Window lights flickering
  - Distant train passing
  - Lighthouse beam rotating (if night)
  - Leaves rustling
- [ ] Time-based variants:
  - **Morning** (6am-12pm): Warm sunrise, birds chirping, shutters opening
  - **Afternoon** (12pm-6pm): Bright sun, market noise, cyclists
  - **Evening** (6pm-10pm): Golden hour, lamps lighting, café music
  - **Night** (10pm-6am): Dark sky, stars, crickets, distant waves
- [ ] Camera: Extremely slow pan (barely noticeable)
**Technical Notes:**
- Use layered PNGs with CSS animations or Framer Motion
- Time detection: `new Date().getHours()` for time-of-day variant
- Each animated element on separate layer for parallax
- Optimize for mobile (reduce particle count)
- Loop all animations seamlessly
**Acceptance Criteria:**
- ✅ All animated elements loop smoothly
- ✅ Time-of-day changes automatically
- ✅ Performance stays above 60 FPS
- ✅ Mobile devices show simplified version if needed
- ✅ Transition between times is gradual (no hard cuts)
---
### Task 2.2: Main Menu Characters (Renzo & Elena)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Add Renzo and Elena as interactive characters in the main menu. They stand back-to-back center screen with subtle idle animations.
**Requirements:**
- [ ] **Renzo** (left side):
  - Leaning on bicycle
  - Idle: Shifts weight, adjusts cap, blinks, looks at sea
  - Hover: Becomes brighter, watercolor saturates
  - Click: Turns head, smiles, tips cap → Starts New Game
- [ ] **Elena** (right side):
  - Standing calmly
  - Idle: Wind moves hair/dress, tucks hair strand, closes eyes briefly
  - Hover: Slight saturation increase
  - Click: Shows "Her story is still being written..." → Fade out
- [ ] Both characters rendered in hand-drawn style
- [ ] Subtle breathing animation on both
**Technical Notes:**
- Character art: Multiple frames for idle states (Framer Motion `AnimatePresence`)
- Hover effects via CSS filters + Framer Motion spring
- Text appears as handwritten note on paper texture
- Elena locked for future chapters (configurable)
**Acceptance Criteria:**
- ✅ Idle animations loop naturally
- ✅ Hover states provide clear visual feedback
- ✅ Click interactions trigger appropriate actions
- ✅ Art style consistent with game aesthetic
- ✅ Mobile touch events work correctly
---
### Task 2.3: Main Menu Navigation (Object-Based)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Replace traditional buttons with interactive hand-drawn objects placed around the screen edges.
**Requirements:**
- [ ] Create 9 interactive objects:
  | Object | Icon | Function |
  |--------|------|----------|
  | 📖 Notebook | Open book | Continue Game |
  | 🗺 Map | Folded map | New Game |
  | 📷 Camera | Vintage camera | Gallery |
  | 🎞 Film Strip | Celluloid strip | Cutscenes |
  | 🎵 Gramophone | Horn speaker | Music/SFX Settings |
  | 🎒 Backpack | Leather bag | Save Manager |
  | ⚙ Pocket Watch | Brass watch | Settings |
  | 📚 Book | Hardbound book | Credits |
  | ✉ Old Letter | Sealed envelope | Support Project |
- [ ] Each object:
  - Hand-drawn illustration style
  - Subtle idle animation (gentle float/rotation)
  - Hover: Pencil lines darken, watercolor saturates, slight lift (3px)
  - Click: Smooth transition to respective screen
- [ ] Position objects around screen edges (not blocking characters)
- [ ] Responsive layout for mobile (stack vertically or use carousel)
**Technical Notes:**
- Objects as SVG or PNG with transparent backgrounds
- Framer Motion for hover/tap animations
- Modal overlays for settings, credits, etc.
- State persists in Zustand store
**Acceptance Criteria:**
- ✅ All 9 objects functional
- ✅ Hover/tap feedback is clear and satisfying
- ✅ Layout adapts to different screen sizes
- ✅ Transitions to sub-menus are smooth
- ✅ No overlap with central characters
---
### Task 2.4: Settings Modal (Vintage Aesthetic)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Create a settings screen that feels like opening an old diary, not a modern UI panel.
**Requirements:**
- [ ] Background: Old diary/ledger paper texture
- [ ] **Language Selection**: Small flag bookmarks on page edges
  - Click flag → Language changes
  - Available: EN, RU, IT (expandable)
- [ ] **Music Volume**: Old brass radio dial
  - Rotate knob to adjust
  - Visual indicator: Needle on gauge
- [ ] **SFX Volume**: Gramophone horn crank
  - Turn crank to adjust
  - Visual: Horn size/glow changes
- [ ] **Brightness**: Old oil lamp
  - Slide wick up/down
  - Visual: Lamp flame intensity
- [ ] **Close**: Gentle page turn animation
**Technical Notes:**
- Knob/crank controls: Custom slider component styled as vintage objects
- Use SVG for interactive dials
- Settings saved to localStorage + Zustand
- Page turn: Framer Motion `rotateY` animation
**Acceptance Criteria:**
- ✅ All settings adjustable and persist
- ✅ Controls feel tactile and responsive
- ✅ Visual style matches 1940s aesthetic
- ✅ Works with keyboard navigation (desktop)
- ✅ Touch-friendly on mobile
---
### Task 2.5: Credits Screen (Photo Album)
**Priority:** P2 (Medium)  
**Estimated Time:** 3-4 hours
**Description:**  
Display team credits as an old photo album being flipped through, not a scrolling list.
**Requirements:**
- [ ] Background: Leather-bound photo album texture
- [ ] Each team member:
  - Photo in vintage frame (sepia tone)
  - Handwritten name caption below
  - Role description in period font
- [ ] Interaction: Click to flip page (right to left)
- [ ] Page turn animation with shadow depth
- [ ] Background music: Soft nostalgic piano
- [ ] Option to auto-play (timed flips every 3s)
**Technical Notes:**
- 3D page flip: Framer Motion `rotateY` with `transformStyle: preserve-3d`
- Photos: Grayscale with sepia overlay filter
- Font: Handwriting-style Google Font (e.g., "Caveat" or "Dancing Script")
**Acceptance Criteria:**
- ✅ Page flips feel realistic
- ✅ All team members displayed
- ✅ Auto-play option works
- ✅ Can manually navigate at any time
- ✅ Mobile swipe gestures supported
---
### Task 2.6: Dynamic Menu Evolution
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
The main menu evolves as the player progresses through chapters, adding new visual elements.
**Requirements:**
- [ ] Track chapter completion in save data
- [ ] **After Chapter 1**:
  - Add birds flying in background
  - Flowers bloom in foreground
  - Bicycle appears near Renzo
- [ ] **After Chapter 2**:
  - Add evening lighting (lamps on)
  - New NPC appears in distant background
  - Car drives by occasionally
- [ ] **After Chapter 3**:
  - Boat appears on horizon
  - Suitcase near door (travel theme)
  - More vibrant colors overall
- [ ] Changes persist across sessions
- [ ] First launch: Menu slightly faded/penciled (incomplete feel)
**Technical Notes:**
- Check save file on menu mount
- Conditionally render evolution layers
- Use Zustand for global progression state
- Fade-in new elements gradually (don't jar player)
**Acceptance Criteria:**
- ✅ Menu visibly changes after each chapter
- ✅ Changes persist after reload
- ✅ First-time launch has "sketchy" appearance
- ✅ Transitions are smooth, not abrupt
- ✅ Performance not impacted by extra elements
---
## 3️⃣ Opening Cinematic (90 Seconds)
### Task 3.1: Cinematic Scene 1-3 (Black Screen → Bicycle Ride)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Implement the first 30 seconds of the opening cinematic: audio build-up and bicycle ride reveal.
**Scenes:**
1. **Black Screen** (5s): Waves, birds, bicycle chain sounds
2. **The Wheel** (10s): Low-angle shot of spinning wheel on cobblestones
3. **The Ride** (15s): Camera follows legs/pedals, sea visible in distance
**Requirements:**
- [ ] Scene 1: Black screen with layered audio (waves → birds → bike chain)
- [ ] Scene 2: Close-up wheel animation
  - Spokes blur with speed
  - Sun glints off metal
  - Dust particles kick up
  - Shadow slides across ground
- [ ] Scene 3: Legs and pedals
  - Rolled-up pants, white socks, old shoes
  - Hands gripping handlebars
  - Bag hanging from handlebars
  - Sea appears in background
**Technical Notes:**
- Use Framer Motion for camera movements
- Audio sync critical: Use `useAnimation` with timeline
- Assets: Separate layers for parallax (wheel, ground, background)
- Consider using Lottie for complex animations
**Acceptance Criteria:**
- ✅ Audio builds atmospherically
- ✅ Animations are smooth (60 FPS)
- ✅ Camera movements feel cinematic
- ✅ Transitions between scenes seamless
- ✅ Period details accurate (clothing, bike style)
---
### Task 3.2: Cinematic Scene 4-6 (Through Town → Market Chaos)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Renzo races through the town, interacting with locals, showcasing the lively atmosphere.
**Scenes:**
4. **The Promenade** (15s): Racing along waterfront, greeting locals
5. **The Market** (15s): Dodging through market stalls, chaos ensues
6. **The Hill** (15s): Climbing uphill, camera reveals town panorama
**Requirements:**
- [ ] Scene 4: Waterfront race
  - Fishermen mending nets (wave back)
  - Woman watering flowers (looks up, smiles)
  - Café opening (owner calls out)
  - Kids playing soccer (nearly hit ball)
  - Italian dialogue: "Scusi!" "Buongiorno!"
- [ ] Scene 5: Market chaos
  - Chickens scatter
  - Fruit cart nearly tips
  - Vendor yells: "Ragazzo!"
  - Woman shakes head
  - Renzo rings bell: "Dzyń! Dzyń!"
- [ ] Scene 6: Hill climb
  - Camera rises gradually
  - Half town visible: roofs, church, square
  - Train at station releases steam
  - Train whistle sounds
  - Main theme music swells
**Technical Notes:**
- Crowd NPCs: Simple looped animations
- Dialogue as floating handwritten text (subtitles optional)
- Camera rise: Framer Motion `scale` + `y` translation
- Music crossfades into title card
**Acceptance Criteria:**
- ✅ Town feels alive with activity
- ✅ Renzo's personality shines through (cheerful, reckless)
- ✅ Italian phrases authentic (native speaker review)
- ✅ Camera movement creates sense of scale
- ✅ Music timing matches emotional beat
---
### Task 3.3: Cinematic Scene 7-9 (Title Reveal)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
The grand reveal of the full town and title card.
**Scenes:**
7. **The Reveal** (10s): Full town panorama, Renzo becomes small figure
8. **Title Card** (10s): "CASTELVENTO 1940s" appears in watercolor style
9. **Transition** (5s): Camera descends to Renzo's house, seamless cut to gameplay
**Requirements:**
- [ ] Scene 7: Panoramic reveal
  - Red rooftops
  - Church bell tower
  - Lighthouse in distance
  - Sea sparkling
  - Seagulls fly past camera
  - Sun rays reflect on water
- [ ] Scene 8: Title animation
  - First: Light pencil sketch lines
  - Then: Watercolor fills in
  - Text: "CASTELVENTO 1940s"
  - Subtitle: "Every street has a story." or "Every life hides a story."
  - Hold for 3s, then fade
- [ ] Scene 9: Descent
  - Camera flies toward Renzo's house
  - No cut—seamless transition to bedroom scene
  - Player gains control immediately upon landing
**Technical Notes:**
- Panorama: High-res composite image with parallax layers
- Title: SVG with stroke-dashoffset for draw effect
- Transition: Match cut from exterior to interior (same color palette)
- Preload bedroom scene during title fade
**Acceptance Criteria:**
- ✅ Panorama breathtaking and detailed
- ✅ Title animation feels hand-crafted
- ✅ Subtitle resonates emotionally
- ✅ Transition to gameplay is invisible (no loading screen)
- ✅ Player immediately understands they're in control
---
### Task 3.4: Cinematic Scene 10-12 (The Gang & Race)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Renzo meets his friends, and they race together to the promenade.
**Scenes:**
10. **The Gang** (10s): Friends call out, gather with bikes
11. **The Race** (15s): Joyful race through narrow streets
12. **The Promenade Stop** (10s): They arrive, park bikes, look expectantly
**Requirements:**
- [ ] Scene 10: Friend group
  - 3-4 boys age 13-15
  - Distinct designs (tall, short, chubby, glasses)
  - Dialogue: "Renato!" "Andiamo!" "Sbrigati!"
  - Renzo: "Che succede?" "Vedrai..."
  - Laughter, bike bells ringing
- [ ] Scene 11: Group race
  - Boys weave through streets
  - One jumps curb
  - Another rides no-hands
  - Elderly woman: "Sempre di corsa..." (shakes head)
  - Upbeat, faster music tempo
- [ ] Scene 12: Arrival
  - Bikes lean against parapet simultaneously
  - Some sit on stone wall, legs dangling
  - All look in same direction (off-screen)
  - Renzo last to arrive, confused: "Che aspettiamo?"
  - Friend smiles: "Guarda..."
  - Silence falls, only sea and seagulls heard
**Technical Notes:**
- Multiple character models needed
- Sync dialogue with mouth movements (simplified)
- Camera follows pack dynamically
- Music shifts from energetic to quiet anticipation
**Acceptance Criteria:**
- ✅ Each friend has distinct personality
- ✅ Race feels dynamic and fun
- ✅ Transition to silence is impactful
- ✅ Italian dialogue natural and age-appropriate
- ✅ Sets up Elena's introduction perfectly
---
### Task 3.5: Cinematic Scene 13-16 (Elena's Introduction)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 8-10 hours
**Description:**  
Elena's dramatic introduction—the moment that defines the game's emotional core.
**Scenes:**
13. **Elena's Presence** (15s): Build-up through atmosphere before showing her
14. **The Silence** (10s): Boys mesmerized, world stops
15. **Life Goes On** (10s): Moment breaks, friends laugh it off
16. **Transition to Game** (5s): Follow Renzo to bedroom
**Requirements:**
- [ ] Scene 13: Elena reveal
  - Start with environmental cues:
    - Bougainvillea sways in breeze
    - Passerby's dress flutters
    - People turn heads
  - Show feet first: Elegant shoes, confident steps
  - Camera rises slowly: Dress, gloves, handbag
  - Sunlight filters through leaves onto silhouette
  - Finally face: Calm, beautiful, thoughtful
  - She doesn't seek attention—just walks purposefully
  - Music fades to almost nothing, only sea remains
- [ ] Scene 14: Boys' reaction
  - Complete silence (5 seconds)
  - Even noisy boys frozen
  - Renzo stares seriously for first time
  - Text overlay (handwritten):
    > **ELENA**  
    > "Some people change a whole city without trying."
  - Text fades slowly
- [ ] Scene 15: Breaking tension
  - Friend #1: "Let's go or we'll be late!"
  - Laughter returns
  - Grab bikes, one drops his (comedy)
  - Friends tease him
  - They race off again
  - Renzo lingers 2s, then smiles and catches up
- [ ] Scene 16: To gameplay
  - Camera follows Renzo through narrow street
  - Smooth fade/cut to bedroom interior
  - Player gains control instantly
**Technical Notes:**
- Elena model: Highest quality, multiple detail levels
- Slow-motion effect during reveal (time dilation)
- Text: Handwritten font with fade-in animation
- Color grading shifts cooler during her presence
- Seamless cut requires matching lighting between exterior/interior
**Acceptance Criteria:**
- ✅ Elena captivating without sexualization
- ✅ Emotional impact lands (silence felt)
- ✅ Text quote memorable and thematic
- ✅ Transition back to normalcy feels natural
- ✅ Player eager to start gameplay after cinematic
---
## 4️⃣ Bedroom Onboarding (Interactive Tutorial)
### Task 4.1: Bedroom Scene Setup
**Priority:** P0 (Critical Path)  
**Estimated Time:** 5-6 hours
**Description:**  
Create Renzo's bedroom as the first playable location. No UI initially—pure exploration.
**Requirements:**
- [ ] Background: High-res watercolor illustration of 1940s bedroom
  - Single bed with rumpled sheets
  - Wooden wardrobe (slightly open)
  - Desk with notebook, inkwell, pen
  - Wall clock (ticking, shows time)
  - Backpack on floor near bed
  - Window with view of street outside
  - Chair, small bookshelf, family photo on wall
- [ ] Lighting: Morning sunlight streaming through window
- [ ] Ambient sounds: Distant birds, clock ticking, faint street noise
- [ ] No HUD visible at start
- [ ] No tooltips or prompts
- [ ] First-person perspective (mouse/finger moves viewpoint slightly)
**Technical Notes:**
- Parallax layers for depth (foreground objects move more than background)
- Clickable hotspots defined as polygon regions
- Use React refs for interactive elements
- Tailwind for responsive container sizing
**Acceptance Criteria:**
- ✅ Room feels lived-in and authentic
- ✅ All key objects clearly visible
- ✅ Lighting sets warm morning mood
- ✅ No UI elements present initially
- ✅ Works on mobile (touch targets large enough)
---
### Task 4.2: Interactive Object System
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-7 hours
**Description:**  
Implement point-and-click interaction system for bedroom objects.
**Requirements:**
- [ ] Click detection on interactive objects:
  - Backpack
  - Notebook
  - Wardrobe
  - Wall Clock
  - Window (look outside)
  - Bed (sleep/rest)
  - Photo frame (examine)
- [ ] Cursor changes on hover (hand icon or subtle glow)
- [ ] Click feedback:
  - Object highlights briefly
  - Sound effect (thud, rustle, creak depending on object)
  - Small animation (backpack lifts, notebook opens slightly)
- [ ] First click on each object triggers unlock sequence
- [ ] Subsequent clicks show flavor text or minor interaction
- [ ] Support both mouse click and touch tap
**Technical Notes:**
- Hotspot system: Array of clickable regions with IDs
- Zustand store tracks `clickedObjects: string[]`
- Framer Motion for object micro-animations
- Audio pool for SFX (prevent overlap issues)
**Acceptance Criteria:**
- ✅ All objects clickable and responsive
- ✅ Hover states clear on desktop and mobile
- ✅ Feedback immediate (<100ms)
- ✅ Interactions feel tactile
- ✅ No false positives/negatives on clicks
---
### Task 4.3: UI Unlock Sequence
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
When player clicks specific objects, corresponding UI elements unlock and appear.
**Requirements:**
- [ ] **Backpack click** → Inventory button appears (bottom-right)
  - Animation: Button draws itself in pencil, fills with watercolor
  - Tooltip: "Your belongings" (fades after 3s)
  - Store: `hasBackpack = true`
- [ ] **Notebook click** → Quest/Reputation log appears (bottom-left)
  - Same animation style
  - Tooltip: "Your thoughts and promises"
  - Store: `hasNotebook = true`
- [ ] **Wardrobe click** → Dress-up mini-interaction
  - Brief animation: Clothes rustle
  - Character model updates (if implemented)
  - Flavor text: "Ready for the day."
- [ ] **Clock click** → Top HUD appears (Time/Energy/Money notch)
  - Slides down from top center
  - Shows current time, full energy bar, starting money (50 Liras)
  - Store: `hasHUD = true`
- [ ] Order doesn't matter—all must be clicked to proceed
- [ ] After all 4 unlocked: Gentle prompt appears (optional)
**Technical Notes:**
- UI components conditionally rendered based on Zustand state
- Framer Motion `layoutId` for smooth shared-element transitions
- Persist unlock state to save immediately
- Optional: Subtle glow on remaining objects after 30s of inactivity
**Acceptance Criteria:**
- ✅ Each UI element appears with satisfying animation
- ✅ Tooltips helpful but not intrusive
- ✅ HUD displays correct initial values
- ✅ State persists after reload
- ✅ Player understands what each UI element does
---
### Task 4.4: Character Customization Modal
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Allow players to customize Renzo's name and family relationships before or during first gameplay session.
**Requirements:**
- [ ] Trigger: Click photo frame on wall OR prompt after unlocking all UI
- [ ] Modal opens: "Who are you in Castelvento?"
- [ ] **Name Input**:
  - Default: "Renzo Moretti"
  - Editable text field (max 20 chars)
  - Preview shows name in handwritten style
- [ ] **Family Relation Dropdown**:
  - Options:
    - "Adopted son" (default)
    - "Stepson (mother remarried)"
    - "Foster child"
    - "Living with guardian"
  - Description text explains each choice
- [ ] **Sister Relation Toggle**:
  - "Older sister (no blood relation)" default
  - Option to customize sister's name too
- [ ] **Confirm Button**: "Begin Story"
- [ ] Choices saved to save file immediately
- [ ] Can be changed later via Settings menu
**Technical Notes:**
- Modal styled as old parchment paper
- Inputs use vintage-style fonts
- Validation: Name cannot be empty
- Zustand stores: `playerName`, `familyRelation`, `sisterName`
**Acceptance Criteria:**
- ✅ Customization intuitive and quick
- ✅ All options clearly explained
- ✅ Names display correctly throughout game
- ✅ Family relation affects dialogue (placeholder for now)
- ✅ Changes persist across sessions
---
### Task 4.5: Transition to First Quest
**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours
**Description:**  
After onboarding complete, guide player to their first objective.
**Requirements:**
- [ ] After all UI unlocked + customization done:
  - Notebook animates (wiggles slightly)
  - Optional: Soft chime sound
- [ ] Player opens notebook (or auto-opens after 10s)
- [ ] First quest entry appears:
  > **"A New Day in Castelvento"**  
  > *Mother says breakfast is ready. Head downstairs and start your first day.*
- [ ] Arrow or subtle highlight points to bedroom door
- [ ] Door becomes interactive (click to exit)
- [ ] Exiting bedroom → Hallway scene (next task)
**Technical Notes:**
- Quest system placeholder (hardcoded for now)
- Door hotspot enabled only after prerequisites met
- Smooth camera pan toward door
- Background music shifts to gentle adventure theme
**Acceptance Criteria:**
- ✅ Player knows what to do next without confusion
- ✅ First quest feels personal and grounded
- ✅ Transition to hallway smooth
- ✅ No dead ends or soft locks
- ✅ Tone set for rest of game
---
## 5️⃣ Core Systems (Game Mechanics)
### Task 5.1: Zustand State Management Setup
**Priority:** P0 (Critical Path)  
**Estimated Time:** 3-4 hours
**Description:**  
Set up global state management using Zustand for all game variables.
**Requirements:**
- [ ] Install Zustand: `npm install zustand`
- [ ] Create store with slices:
  ```typescript
  interface GameState {
    // Progression
    hasBackpack: boolean;
    hasNotebook: boolean;
    hasHUD: boolean;
    currentChapter: number;
    
    // Resources
    energy: number; // 0-100
    maxEnergy: number;
    money: number; // Liras
    time: TimeOfDay; // { hour: number, minute: number }
    
    // Player
    playerName: string;
    familyRelation: string;
    reputation: Record<string, number>;
    
    // Inventory
    inventory: Item[];
    
    // Quests
    activeQuests: Quest[];
    completedQuests: string[];
    
    // Relationships
    relationships: Record<string, number>; // NPC ID -> affinity
    
    // Actions
    setHasBackpack: () => void;
    addEnergy: (amount: number) => void;
    spendTime: (minutes: number) => void;
    // ...etc
  }
  ```
- [ ] Persist to localStorage automatically
- [ ] DevTools integration for debugging
- [ ] TypeScript types for all state properties
**Technical Notes:**
- Use `persist` middleware for localStorage
- Separate action creators for clarity
- Avoid deep nesting in state
- Add selectors for derived state
**Acceptance Criteria:**
- ✅ Store initialized correctly on app load
- ✅ State persists after refresh
- ✅ Actions update state immutably
- ✅ TypeScript compilation succeeds
- ✅ DevTools shows state changes in real-time
---
### Task 5.2: Time & Energy System
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
Implement core resource mechanics: time passes and energy depletes with actions.
**Requirements:**
- [ ] **Time System**:
  - Starts at 8:00 AM each day
  - Actions consume minutes (varies by action)
  - Day ends at 10:00 PM (auto-sleep)
  - Display format: "8:30 AM" or "14:45"
  - Time affects available activities (shops close, NPCs leave)
- [ ] **Energy System**:
  - Starts at 100 each morning
  - Actions drain energy (working: -20, exploring: -5, talking: -2)
  - Resting restores energy (bed: +50, café: +20)
  - At 0 energy: Forced to sleep, lose remaining day
  - Display: Bar with color gradient (green → yellow → red)
- [ ] **Interdependence**:
  - Some actions require minimum energy
  - Time-sensitive quests fail if not completed in time
  - Energy regenerates fully after sleep
**Technical Notes:**
- Time stored as minutes since midnight (0-1440)
- Formatter utility for display
- Zustand actions: `spendTime(minutes)`, `addEnergy(amount)`
- Warning modal at low energy (<10)
**Acceptance Criteria:**
- ✅ Time advances correctly with actions
- ✅ Energy drains/restores as expected
- ✅ Day/night cycle affects gameplay
- ✅ UI displays resources clearly
- ✅ Edge cases handled (midnight, zero energy)
---
### Task 5.3: Money & Economy System
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Create currency system with earning and spending mechanics.
**Requirements:**
- [ ] **Currency**: Italian Lira (₤)
- [ ] **Starting Amount**: 50 Liras
- [ ] **Earning Methods**:
  - Jobs: Fixed pay per action (market helper: ₤20, newspaper delivery: ₤15)
  - Quests: Variable rewards (₤10-₤100)
  - Selling items: Based on item value
  - Finding money: Rare spawns in environment
- [ ] **Spending Methods**:
  - Shop items (food, tools, gifts)
  - Transportation (train tickets, boat rides)
  - Gifts for NPCs (increases relationship)
  - Mini-games (gambling, optional)
- [ ] **Display**: Top HUD, right side (sun/moon icon)
- [ ] **Balance Goals**:
  - Early game: ₤50-200
  - Mid game: ₤200-500
  - Late game: ₤500+
**Technical Notes:**
- Integer math only (no decimals for simplicity)
- Transaction log for debugging
- Prevent negative money (block purchases if insufficient)
- Sound effect on earn/spend (coin clink)
**Acceptance Criteria:**
- ✅ Money updates correctly after transactions
- ✅ Cannot spend more than have
- ✅ Earning methods diverse and balanced
- ✅ UI shows amount clearly
- ✅ Economy feels rewarding but not grindy
---
### Task 5.4: Inventory System (Drag & Drop)
**Priority:** P1 (High)  
**Estimated Time:** 6-7 hours
**Description:**  
Implement backpack inventory with drag-and-drop item usage.
**Requirements:**
- [ ] **Inventory Grid**: 4x4 slots (16 items max)
- [ ] **Item Types**:
  - Consumables (food, medicine)
  - Quest items (letters, keys)
  - Tools (flashlight, fishing rod)
  - Gifts (flowers, jewelry)
  - Collectibles (stamps, postcards)
- [ ] **Drag & Drop**:
  - Drag item from inventory to hotspot on screen
  - Valid drop targets highlight on drag
  - Invalid drops: Item snaps back
  - Successful use: Item consumed or added to context
- [ ] **Item Details Modal**:
  - Click item to see description
  - Usage hints
  - Value (for selling)
- [ ] **Stacking**: Consumables stack up to 99
- [ ] **Sorting**: Manual rearrange or auto-sort by type
**Technical Notes:**
- Use `@dnd-kit/core` and `@dnd-kit/sortable` for DnD
- Item schema: `{ id, name, type, description, value, stackable }`
- Framer Motion for drag animations
- Mobile: Long-press to initiate drag
**Acceptance Criteria:**
- ✅ Items can be picked up and dropped
- ✅ Valid/invalid targets clear visually
- ✅ Item details readable
- ✅ Stacking works correctly
- ✅ Mobile touch DnD functional
---
### Task 5.5: Quest & Reputation System
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Track active quests and reputation with different town factions.
**Requirements:**
- [ ] **Quest Structure**:
  ```typescript
  interface Quest {
    id: string;
    title: string;
    description: string;
    giver: string; // NPC name
    objectives: Objective[];
    reward: { money?: number; reputation?: Record<string, number> };
    completed: boolean;
    failed: boolean;
    timeLimit?: number; // in-game minutes
  }
  ```
- [ ] **Quest Log** (Notebook UI):
  - Active tab: Current quests
  - Completed tab: History
  - Failed tab: Missed opportunities
  - Each quest expandable for details
- [ ] **Reputation System**:
  - Factions: Families, Shops, Church, Fishermen, etc.
  - Score: -100 (hated) to +100 (beloved)
  - Affected by quest choices, gossip, repeated actions
  - High rep unlocks discounts, special quests
  - Low rep blocks areas, raises prices
- [ ] **Notifications**:
  - Quest received: Popup with title
  - Quest completed: Celebration animation
  - Reputation changed: Small badge shows delta
**Technical Notes:**
- Quests stored in JSON for easy editing
- Reputation persisted per faction
- Use Zustand computed values for status thresholds
- Notebook UI uses accordion pattern
**Acceptance Criteria:**
- ✅ Quests tracked accurately
- ✅ Objectives update as player progresses
- ✅ Reputation affects NPC dialogue (placeholder)
- ✅ Quest log readable and organized
- ✅ Notifications timely and non-intrusive
---
## 6️⃣ World & Locations
### Task 6.1: Map & Travel System
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Create interactive map for traveling between locations.
**Requirements:**
- [ ] **Map View**:
  - Hand-drawn illustration of Castelvento
  - Key locations marked with icons
  - Player location highlighted
  - Fog of war for unvisited areas (optional)
- [ ] **Travel Mechanics**:
  - Click location to travel
  - Travel time varies (5-30 minutes)
  - Travel cost (free for walking, ₤5 for train)
  - Locked locations grayed out (require quest progress)
- [ ] **Fast Travel Rules**:
  - Must have visited location first
  - Some locations only accessible at certain times
  - Cannot travel while quest in progress (optional)
- [ ] **Visual Feedback**:
  - Route line draws from current to target
  - Bicycle icon moves along path
  - Loading screen with location facts during travel
**Technical Notes:**
- Map as SVG with clickable `<path>` elements
- Travel function: `travelTo(locationId)` in Zustand
- Fade-out/fade-in transition between locations
- Preload next location assets during travel
**Acceptance Criteria:**
- ✅ Map displays all planned locations
- ✅ Travel consumes time/money correctly
- ✅ Locked locations inaccessible until unlocked
- ✅ Transitions smooth and performant
- ✅ Mobile-friendly (pinch-zoom if needed)
---
### Task 6.2: Location Framework (First 5 Areas)
**Priority:** P1 (High)  
**Estimated Time:** 8-10 hours
**Description:**  
Build framework for interactive locations. Implement first 5 as examples.
**Locations:**
1. **Renzo's House** (Bedroom, Hallway, Kitchen, Garden)
2. **Town Square** (Church, Fountain, Benches, Bulletin Board)
3. **Market Street** (Stalls, Shops, Cafés)
4. **Beach Promenade** (Sea, Pier, Lifeguard Station)
5. **Train Station** (Platform, Ticket Booth, Waiting Room)
**Requirements (per location):**
- [ ] Background: High-res watercolor illustration
- [ ] Interactive hotspots (5-10 per location)
- [ ] NPCs with schedules (2-5 per location)
- [ ] Ambient sounds unique to location
- [ ] Time-of-day variations (lighting changes)
- [ ] Enter/exit transitions
- [ ] At least one quest-related object
**Technical Notes:**
- Location component template for reusability
- Hotspot config as JSON per location
- Lazy load location assets
- Sound crossfades on enter/exit
**Acceptance Criteria:**
- ✅ All 5 locations visually distinct
- ✅ Interactions responsive and varied
- ✅ NPCs present and animated
- ✅ Soundscapes immersive
- ✅ No performance degradation switching locations
---
## 7️⃣ Characters & NPCs
### Task 7.1: NPC Schedule System (Basic)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
NPCs follow daily schedules, moving between locations.
**Requirements:**
- [ ] **Schedule Structure**:
  ```typescript
  interface Schedule {
    npcId: string;
    activities: {
      startTime: number; // minutes since midnight
      endTime: number;
      locationId: string;
      position: { x: number; y: number }; // within location
      animation: string; // idle animation name
    }[];
  }
  ```
- [ ] **Example NPC: Maria (Baker)**:
  - 5:00-14:00: Bakery (kneading dough animation)
  - 14:00-15:00: Market (buying supplies)
  - 15:00-18:00: Home (resting)
  - 18:00-20:00: Church (prayer)
  - 20:00-5:00: Home (sleeping)
- [ ] **Implementation**:
  - Check time every in-game minute
  - Move NPC if schedule changes
  - Show/hide NPCs based on location
  - Dialogue changes based on current activity
- [ ] **Edge Cases**:
  - Player interrupts activity (quest trigger)
  - Special event days override schedule
  - Weather affects outdoor activities
**Technical Notes:**
- Scheduler runs in `useEffect` with time subscription
- NPC position interpolated during travel between spots
- Use Web Workers if calculation heavy (unlikely)
- Config-driven schedules (JSON files)
**Acceptance Criteria:**
- ✅ NPCs appear/disappear at correct times
- ✅ Positions update smoothly
- ✅ Dialogue reflects current activity
- ✅ Schedules editable without code changes
- ✅ No NPCs stuck in wrong locations
---
### Task 7.2: Relationship System (Affinity Tracking)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Track player relationship with each NPC, affecting dialogue and quest availability.
**Requirements:**
- [ ] **Affinity Scale**: -100 to +100
  - -100 to -50: Hostile (insults, refuses help)
  - -49 to -10: Unfriendly (cold, short responses)
  - -9 to +9: Neutral (polite, basic info)
  - +10 to +49: Friendly (warm, discounts, side quests)
  - +50 to +100: Close (gifts, secrets, romance options)
- [ ] **Affinity Changes**:
  - Positive: Help with tasks (+5), give gifts (+10), agree in dialogue (+2)
  - Negative: Steal (-20), insult (-10), refuse help (-5)
  - Daily decay: -1 if no interaction (optional)
- [ ] **Visual Indicators**:
  - Heart icon in NPC dialogue box
  - Color-coded (red → gray → green → gold)
  - Tooltip shows exact number on hover
- [ ] **Effects**:
  - Dialogue branches based on affinity
  - Shop prices scale (-10% at +50, +20% at -50)
  - Quest givers only approach if affinity > 0
**Technical Notes:**
- Store as `Record<npcId, number>` in Zustand
- Computed selectors for affinity tier
- Dialogue system checks affinity before branching
- Persist to save file
**Acceptance Criteria:**
- ✅ Affinity updates correctly after interactions
- ✅ Dialogue reflects relationship level
- ✅ Price modifiers apply correctly
- ✅ Visual indicators clear but not obtrusive
- ✅ System scalable to 50+ NPCs
---
## 8️⃣ UI/HUD Components
### Task 8.1: Top HUD ("The Notch")
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
Create the vintage-style top HUD displaying time, energy, and money.
**Requirements:**
- [ ] **Design**: Hand-drawn "notch" shape at top center
  - Resembles vintage car dashboard or pocket watch
  - Sepia tones, pencil outlines
  - Slight paper texture overlay
- [ ] **Left Section**: Energy bar
  - Horizontal bar with gradient (green → yellow → red)
  - Numerical value optional on hover
  - Depletes/restores in real-time
- [ ] **Center**: Time indicator
  - Sun icon (day) or moon icon (night)
  - Rotates slightly based on exact time
  - Digital time below (e.g., "14:30")
- [ ] **Right Section**: Money
  - Coin icon + amount (e.g., "₤150")
  - Green text when earned, red when spent
  - Pulse animation on change
- [ ] **Behavior**:
  - Slides down from top when unlocked
  - Always visible during gameplay
  - Hides during cinematics/dialogue (optional)
  - Click to expand detailed stats (optional)
**Technical Notes:**
- SVG for notch shape with CSS animations
- Framer Motion for slide-in/out
- Zustand selectors for reactive updates
- Tailwind for responsive positioning
**Acceptance Criteria:**
- ✅ HUD appears smoothly after clock click
- ✅ All three indicators update in real-time
- ✅ Design matches 1940s aesthetic
- ✅ Readable on all screen sizes
- ✅ Doesn't obstruct gameplay view
---
### Task 8.2: Floating Action Buttons (Notebook & Backpack)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 3-4 hours
**Description:**  
Create dynamic floating buttons for quick access to inventory and quest log.
**Requirements:**
- [ ] **Backpack Button** (bottom-right):
  - Icon: Hand-drawn leather backpack
  - Badge: Number of items (e.g., "7/16")
  - State changes:
    - Normal: Backpack closed
    - New item acquired: Backpack wiggles, exclamation mark
    - Empty: Slightly faded
  - Click: Opens inventory modal
- [ ] **Notebook Button** (bottom-left):
  - Icon: Open leather notebook
  - Badge: Unread quests (e.g., "3!")
  - State changes:
    - Normal: Notebook flat
    - New quest: Notebook bounces, quill appears
    - All quests complete: Ribbon bookmark visible
  - Click: Opens quest log modal
- [ ] **Animations**:
  - Draw-on effect when first unlocked
  - Subtle idle float (2px up/down)
  - Scale on click (0.95)
  - Tooltip on hover (desktop only)
- [ ] **Mobile Adaptation**:
  - Larger touch targets (min 48x48px)
  - Bottom placement for thumb reach
  - Long-press for tooltip
**Technical Notes:**
- Framer Motion for all animations
- Zustand for badge counts
- Modals use `AnimatePresence` for enter/exit
- Position fixed to viewport
**Acceptance Criteria:**
- ✅ Buttons appear after respective object clicks
- ✅ Badges update accurately
- ✅ State animations clear and delightful
- ✅ Modals open/close smoothly
- ✅ Mobile touch targets ergonomic
---
### Task 8.3: Dialogue System (Placeholder)
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
Basic dialogue system for NPC conversations (full branching comes later).
**Requirements:**
- [ ] **Dialogue Box**:
  - Position: Bottom third of screen
  - Style: Parchment scroll unfurling
  - Speaker name: Handwritten above box
  - Portrait: Small sketch of speaker (left side)
- [ ] **Text Display**:
  - Typewriter effect (letter-by-letter)
  - Speed: 30ms per character
  - Click to skip animation
  - Auto-advance after 5s pause (optional)
- [ ] **Choices** (simple):
  - 2-3 response options
  - Appear below dialogue
  - Hover highlights choice
  - Click selects and continues
- [ ] **Exit**:
  - "End conversation" option
  - Or walk away to cancel
  - Dialogue box rolls up
**Technical Notes:**
- Dialogue data as JSON: `{ speaker, text, choices: [] }`
- Typewriter: `setTimeout` loop or Framer Motion `delay`
- Choice effects update Zustand (affinity, quests)
- Pause game time during dialogue (optional)
**Acceptance Criteria:**
- ✅ Dialogue boxes appear positioned correctly
- ✅ Text types smoothly
- ✅ Choices selectable and functional
- ✅ Conversations can be exited cleanly
- ✅ Supports multiple speakers in sequence
---
## 9️⃣ Audio System
### Task 9.1: Dynamic Soundscape Manager
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Manage ambient sounds that change based on location, time, and weather.
**Requirements:**
- [ ] **Sound Layers**:
  - Base: Location ambience (market chatter, waves, birds)
  - Time: Day/night additions (roosters, crickets)
  - Weather: Rain, wind, thunder (if implemented)
  - Events: Church bells (hourly), train whistle, bicycle bells
- [ ] **Crossfading**:
  - Smooth transitions between locations (2s fade)
  - Time changes gradual (10s fade)
  - Volume ducks during dialogue
- [ ] **Spatial Audio** (basic):
  - Louder when near sound source
  - Stereo panning based on object position
- [ ] **Mute Options**:
  - Separate sliders for Music, SFX, Ambience
  - Mute all button
  - Persist settings
**Technical Notes:**
- Howler.js for audio playback
- Web Audio API for volume mixing
- Preload all ambient loops
- Use `useAudio` custom hook for React integration
**Acceptance Criteria:**
- ✅ Ambience matches location/time
- ✅ Transitions imperceptible
- ✅ Volume balanced across layers
- ✅ Settings persist and apply immediately
- ✅ No audio glitches or cutoffs
---
### Task 9.2: Music System with Context Switching
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Background music that adapts to gameplay context.
**Requirements:**
- [ ] **Music Tracks**:
  - Main Theme (menu)
  - Exploration (calm, curious)
  - Tension (mystery, danger)
  - Romance (soft, emotional)
  - Celebration (quest complete)
  - Sadness (failure, loss)
- [ ] **Context Detection**:
  - Default: Exploration
  - Dialogue with Elena: Romance
  - Quest timer running: Tension
  - Quest complete: Celebration (short sting)
  - Night time: Slower, quieter version
- [ ] **Transitions**:
  - Crossfade between tracks (3s)
  - No abrupt cuts
  - Volume dips during important dialogue
- [ ] **Looping**:
  - Seamless loops for all tracks
  - No audible seam
**Technical Notes:**
- Howler.js with `loop: true` and `fade()` method
- Context state in Zustand
- Priority system for overlapping triggers
- Mobile: Reduce quality if memory constrained
**Acceptance Criteria:**
- ✅ Music matches emotional context
- ✅ Transitions smooth and unnoticeable
- ✅ Loops seamlessly
- ✅ Volume appropriate (not overpowering)
- ✅ Works across all devices
---
## 🔟 Polish & Optimization
### Task 10.1: Mobile Responsiveness Audit
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Ensure game works flawlessly on mobile devices (iOS/Android).
**Requirements:**
- [ ] **Breakpoints Tested**:
  - iPhone SE (375x667)
  - iPhone 14 Pro (393x852)
  - iPad Mini (768x1024)
  - Android phones (various)
- [ ] **Touch Targets**:
  - All buttons min 48x48px
  - Adequate spacing between targets
  - No hover-dependent interactions
- [ ] **Layout Adjustments**:
  - HUD scales appropriately
  - Modals full-screen on small devices
  - Keyboard doesn't obscure inputs
  - Landscape mode supported (optional)
- [ ] **Performance**:
  - 60 FPS target on mid-range devices
  - Reduced particle count on mobile
  - Lazy load images
  - Compress audio for mobile
**Technical Notes:**
- Tailwind breakpoints: `sm`, `md`, `lg`, `xl`
- Use `useMediaQuery` hook for conditional rendering
- Chrome DevTools device emulation + real device testing
- Lighthouse performance score >90
**Acceptance Criteria:**
- ✅ All screens usable on smallest supported device
- ✅ No overflow or clipping issues
- ✅ Touch interactions responsive
- ✅ Performance smooth (no jank)
- ✅ Text readable without zooming
---
### Task 10.2: Performance Optimization
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Optimize game for consistent 60 FPS across devices.
**Requirements:**
- [ ] **Image Optimization**:
  - WebP format with fallbacks
  - Responsive images (`srcSet`)
  - Lazy loading for off-screen assets
  - Max resolution capped (no 4K textures on mobile)
- [ ] **Animation Optimization**:
  - Use CSS transforms (GPU-accelerated)
  - Avoid layout thrashing
  - Limit simultaneous animations
  - `will-change` hint for animated elements
- [ ] **Code Splitting**:
  - Next.js dynamic imports for routes
  - Split cinematic from gameplay bundle
  - Prefetch next location assets
- [ ] **State Updates**:
  - Memoize expensive computations
  - Batch Zustand updates
  - Avoid re-renders with `React.memo`
**Technical Notes:**
- Next.js Image component for auto-optimization
- React Profiler to identify bottlenecks
- Webpack bundle analyzer
- Request Animation Frame for custom loops
**Acceptance Criteria:**
- ✅ 60 FPS maintained during heavy scenes
- ✅ Initial load <3s on fast connection
- ✅ Memory usage stable (no leaks)
- ✅ Bundle size <2MB initial, <10MB total
- ✅ No long tasks (>50ms) in profiling
---
### Task 10.3: Accessibility Features
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
Make game accessible to players with disabilities.
**Requirements:**
- [ ] **Visual**:
  - High contrast mode toggle
  - Text size scaler (100%, 125%, 150%)
  - Colorblind-friendly palette option
  - Screen reader support (ARIA labels)
- [ ] **Auditory**:
  - Subtitles for all dialogue (toggle)
  - Visual indicators for sound cues
  - Separate volume controls
- [ ] **Motor**:
  - Full keyboard navigation
  - Sticky keys support
  - No rapid repeated inputs required
  - Touch hold alternatives to swipe
- [ ] **Cognitive**:
  - Clear, simple language
  - Consistent UI patterns
  - Option to disable time pressure
  - Quest reminders always visible
**Technical Notes:**
- ARIA attributes on interactive elements
- `prefers-reduced-motion` media query
- Keyboard event listeners for all actions
- Accessibility audit with axe DevTools
**Acceptance Criteria:**
- ✅ Navigable with keyboard alone
- ✅ Screen readers announce all content
- ✅ Text scalable without breaking layout
- ✅ Color not sole indicator of meaning
- ✅ WCAG 2.1 AA compliance (automated check)
---
## 📝 How to Use This Document
1. **Prioritize**: Start with P0 tasks (Critical Path)
2. **Assign**: Each task can be assigned to a developer
3. **Track**: Check off boxes as completed
4. **Estimate**: Use provided time estimates for sprint planning
5. **Adapt**: Modify requirements as design evolves
---
## 🔄 Task Status Legend
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⚠️ Blocked
- ❌ Cancelled
---
*Last Updated: [Current Date]*  
*Version: 1.0*  
*Project: Castelvento 1940s*
EOF
cat > /workspace/TASKS.md << 'EOF'
# Castelvento Stories — Development Tasks
This document breaks down the development of **Castelvento 1940s** into discrete, actionable tasks organized by major features. Each task includes clear acceptance criteria and technical notes.
---
## 📋 Task Organization
Tasks are grouped by major game components:
1. **Splash & Loading** — Initial app experience
2. **Main Menu** — Dynamic cinemagraph menu system
3. **Opening Cinematic** — 90-second intro sequence
4. **Bedroom Onboarding** — Interactive tutorial scene
5. **Core Systems** — Game mechanics and state management
6. **World & Locations** — Map and environment system
7. **Characters & NPCs** — Relationship and schedule systems
8. **UI/HUD** — Interface components
9. **Audio System** — Soundscapes and music
10. **Polish & Optimization** — Final refinements
---
## 1️⃣ Splash & Loading Screen
### Task 1.1: Splash Screen (Black Screen → Logo)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 2-3 hours
**Description:**  
Create the initial splash screen that plays when the app loads. No UI, just atmosphere.
**Requirements:**
- [ ] Start with completely black screen
- [ ] After 1s: Play wave sound effect (🌊)
- [ ] After 2s: Play bicycle bell sound (🚲)
- [ ] Animate studio logo appearing as pencil sketch
- [ ] Fill logo with watercolor effect over 1s
- [ ] Fade out logo after 1s hold
- [ ] Total duration: ~5 seconds
**Technical Notes:**
- Use Framer Motion for draw-on effect
- Audio via Howler.js with preload
- Logo assets: SVG for pencil lines, PNG for watercolor fill
- Ensure audio plays even on mobile (handle autoplay policies)
**Acceptance Criteria:**
- ✅ Black screen displays immediately on app load
- ✅ Sounds play in correct sequence
- ✅ Logo animation is smooth (60 FPS)
- ✅ Transitions seamlessly to Loading Screen
---
### Task 1.2: Loading Screen with Traveling Bicycle
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-6 hours
**Description:**  
Create an engaging loading screen that shows a bicycle traveling across the Castelvento map instead of a boring progress bar.
**Requirements:**
- [ ] Background: Old postcard aesthetic on wooden desk
- [ ] Decorative elements: pencils, stamps, letters, compass (static)
- [ ] Center: Illustrated map of Castelvento
- [ ] Animation: Small bicycle 🚲 sprite travels along map paths
- [ ] Progress indication: Bicycle reaches checkpoints (street → beach → church → home)
- [ ] Dynamic text at bottom with random phrases:
  - "Exploring Castelvento..."
  - "Preparing today's story..."
  - "Renzo is still sleeping."
  - "The train arrives in minutes."
  - "Some stories hide behind closed shutters."
- [ ] Smooth camera pan following bicycle
**Technical Notes:**
- Map asset: High-res illustration with defined path coordinates
- Bicycle: Sprite sheet with pedaling animation
- Use Framer Motion `useMotionValue` for progress tracking
- Random phrase selector runs on each load
- Preload next scene assets during this phase
**Acceptance Criteria:**
- ✅ Bicycle moves smoothly along predefined path
- ✅ Progress correlates with actual asset loading
- ✅ Random phrases display correctly
- ✅ Visual style matches 1940s postcard aesthetic
- ✅ Works on both desktop and mobile resolutions
---
## 2️⃣ Main Menu (Dynamic Cinemagraph)
### Task 2.1: Main Menu Background (Cinemagraph)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Create a living, breathing panorama of Castelvento that serves as the main menu background. The scene changes based on real-world time.
**Requirements:**
- [ ] Full-screen panoramic illustration of Castelvento
- [ ] Animated elements (subtle, looping):
  - Sea waves moving
  - Flags swaying in wind
  - Birds flying across sky
  - Smoke from chimneys
  - Window lights flickering
  - Distant train passing
  - Lighthouse beam rotating (if night)
  - Leaves rustling
- [ ] Time-based variants:
  - **Morning** (6am-12pm): Warm sunrise, birds chirping, shutters opening
  - **Afternoon** (12pm-6pm): Bright sun, market noise, cyclists
  - **Evening** (6pm-10pm): Golden hour, lamps lighting, café music
  - **Night** (10pm-6am): Dark sky, stars, crickets, distant waves
- [ ] Camera: Extremely slow pan (barely noticeable)
**Technical Notes:**
- Use layered PNGs with CSS animations or Framer Motion
- Time detection: `new Date().getHours()` for time-of-day variant
- Each animated element on separate layer for parallax
- Optimize for mobile (reduce particle count)
- Loop all animations seamlessly
**Acceptance Criteria:**
- ✅ All animated elements loop smoothly
- ✅ Time-of-day changes automatically
- ✅ Performance stays above 60 FPS
- ✅ Mobile devices show simplified version if needed
- ✅ Transition between times is gradual (no hard cuts)
---
### Task 2.2: Main Menu Characters (Renzo & Elena)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Add Renzo and Elena as interactive characters in the main menu. They stand back-to-back center screen with subtle idle animations.
**Requirements:**
- [ ] **Renzo** (left side):
  - Leaning on bicycle
  - Idle: Shifts weight, adjusts cap, blinks, looks at sea
  - Hover: Becomes brighter, watercolor saturates
  - Click: Turns head, smiles, tips cap → Starts New Game
- [ ] **Elena** (right side):
  - Standing calmly
  - Idle: Wind moves hair/dress, tucks hair strand, closes eyes briefly
  - Hover: Slight saturation increase
  - Click: Shows "Her story is still being written..." → Fade out
- [ ] Both characters rendered in hand-drawn style
- [ ] Subtle breathing animation on both
**Technical Notes:**
- Character art: Multiple frames for idle states (Framer Motion `AnimatePresence`)
- Hover effects via CSS filters + Framer Motion spring
- Text appears as handwritten note on paper texture
- Elena locked for future chapters (configurable)
**Acceptance Criteria:**
- ✅ Idle animations loop naturally
- ✅ Hover states provide clear visual feedback
- ✅ Click interactions trigger appropriate actions
- ✅ Art style consistent with game aesthetic
- ✅ Mobile touch events work correctly
---
### Task 2.3: Main Menu Navigation (Object-Based)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Replace traditional buttons with interactive hand-drawn objects placed around the screen edges.
**Requirements:**
- [ ] Create 9 interactive objects:
  | Object | Icon | Function |
  |--------|------|----------|
  | 📖 Notebook | Open book | Continue Game |
  | 🗺 Map | Folded map | New Game |
  | 📷 Camera | Vintage camera | Gallery |
  | 🎞 Film Strip | Celluloid strip | Cutscenes |
  | 🎵 Gramophone | Horn speaker | Music/SFX Settings |
  | 🎒 Backpack | Leather bag | Save Manager |
  | ⚙ Pocket Watch | Brass watch | Settings |
  | 📚 Book | Hardbound book | Credits |
  | ✉ Old Letter | Sealed envelope | Support Project |
- [ ] Each object:
  - Hand-drawn illustration style
  - Subtle idle animation (gentle float/rotation)
  - Hover: Pencil lines darken, watercolor saturates, slight lift (3px)
  - Click: Smooth transition to respective screen
- [ ] Position objects around screen edges (not blocking characters)
- [ ] Responsive layout for mobile (stack vertically or use carousel)
**Technical Notes:**
- Objects as SVG or PNG with transparent backgrounds
- Framer Motion for hover/tap animations
- Modal overlays for settings, credits, etc.
- State persists in Zustand store
**Acceptance Criteria:**
- ✅ All 9 objects functional
- ✅ Hover/tap feedback is clear and satisfying
- ✅ Layout adapts to different screen sizes
- ✅ Transitions to sub-menus are smooth
- ✅ No overlap with central characters
---
### Task 2.4: Settings Modal (Vintage Aesthetic)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Create a settings screen that feels like opening an old diary, not a modern UI panel.
**Requirements:**
- [ ] Background: Old diary/ledger paper texture
- [ ] **Language Selection**: Small flag bookmarks on page edges
  - Click flag → Language changes
  - Available: EN, RU, IT (expandable)
- [ ] **Music Volume**: Old brass radio dial
  - Rotate knob to adjust
  - Visual indicator: Needle on gauge
- [ ] **SFX Volume**: Gramophone horn crank
  - Turn crank to adjust
  - Visual: Horn size/glow changes
- [ ] **Brightness**: Old oil lamp
  - Slide wick up/down
  - Visual: Lamp flame intensity
- [ ] **Close**: Gentle page turn animation
**Technical Notes:**
- Knob/crank controls: Custom slider component styled as vintage objects
- Use SVG for interactive dials
- Settings saved to localStorage + Zustand
- Page turn: Framer Motion `rotateY` animation
**Acceptance Criteria:**
- ✅ All settings adjustable and persist
- ✅ Controls feel tactile and responsive
- ✅ Visual style matches 1940s aesthetic
- ✅ Works with keyboard navigation (desktop)
- ✅ Touch-friendly on mobile
---
### Task 2.5: Credits Screen (Photo Album)
**Priority:** P2 (Medium)  
**Estimated Time:** 3-4 hours
**Description:**  
Display team credits as an old photo album being flipped through, not a scrolling list.
**Requirements:**
- [ ] Background: Leather-bound photo album texture
- [ ] Each team member:
  - Photo in vintage frame (sepia tone)
  - Handwritten name caption below
  - Role description in period font
- [ ] Interaction: Click to flip page (right to left)
- [ ] Page turn animation with shadow depth
- [ ] Background music: Soft nostalgic piano
- [ ] Option to auto-play (timed flips every 3s)
**Technical Notes:**
- 3D page flip: Framer Motion `rotateY` with `transformStyle: preserve-3d`
- Photos: Grayscale with sepia overlay filter
- Font: Handwriting-style Google Font (e.g., "Caveat" or "Dancing Script")
**Acceptance Criteria:**
- ✅ Page flips feel realistic
- ✅ All team members displayed
- ✅ Auto-play option works
- ✅ Can manually navigate at any time
- ✅ Mobile swipe gestures supported
---
### Task 2.6: Dynamic Menu Evolution
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
The main menu evolves as the player progresses through chapters, adding new visual elements.
**Requirements:**
- [ ] Track chapter completion in save data
- [ ] **After Chapter 1**:
  - Add birds flying in background
  - Flowers bloom in foreground
  - Bicycle appears near Renzo
- [ ] **After Chapter 2**:
  - Add evening lighting (lamps on)
  - New NPC appears in distant background
  - Car drives by occasionally
- [ ] **After Chapter 3**:
  - Boat appears on horizon
  - Suitcase near door (travel theme)
  - More vibrant colors overall
- [ ] Changes persist across sessions
- [ ] First launch: Menu slightly faded/penciled (incomplete feel)
**Technical Notes:**
- Check save file on menu mount
- Conditionally render evolution layers
- Use Zustand for global progression state
- Fade-in new elements gradually (don't jar player)
**Acceptance Criteria:**
- ✅ Menu visibly changes after each chapter
- ✅ Changes persist after reload
- ✅ First-time launch has "sketchy" appearance
- ✅ Transitions are smooth, not abrupt
- ✅ Performance not impacted by extra elements
---
## 3️⃣ Opening Cinematic (90 Seconds)
### Task 3.1: Cinematic Scene 1-3 (Black Screen → Bicycle Ride)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Implement the first 30 seconds of the opening cinematic: audio build-up and bicycle ride reveal.
**Scenes:**
1. **Black Screen** (5s): Waves, birds, bicycle chain sounds
2. **The Wheel** (10s): Low-angle shot of spinning wheel on cobblestones
3. **The Ride** (15s): Camera follows legs/pedals, sea visible in distance
**Requirements:**
- [ ] Scene 1: Black screen with layered audio (waves → birds → bike chain)
- [ ] Scene 2: Close-up wheel animation
  - Spokes blur with speed
  - Sun glints off metal
  - Dust particles kick up
  - Shadow slides across ground
- [ ] Scene 3: Legs and pedals
  - Rolled-up pants, white socks, old shoes
  - Hands gripping handlebars
  - Bag hanging from handlebars
  - Sea appears in background
**Technical Notes:**
- Use Framer Motion for camera movements
- Audio sync critical: Use `useAnimation` with timeline
- Assets: Separate layers for parallax (wheel, ground, background)
- Consider using Lottie for complex animations
**Acceptance Criteria:**
- ✅ Audio builds atmospherically
- ✅ Animations are smooth (60 FPS)
- ✅ Camera movements feel cinematic
- ✅ Transitions between scenes seamless
- ✅ Period details accurate (clothing, bike style)
---
### Task 3.2: Cinematic Scene 4-6 (Through Town → Market Chaos)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Renzo races through the town, interacting with locals, showcasing the lively atmosphere.
**Scenes:**
4. **The Promenade** (15s): Racing along waterfront, greeting locals
5. **The Market** (15s): Dodging through market stalls, chaos ensues
6. **The Hill** (15s): Climbing uphill, camera reveals town panorama
**Requirements:**
- [ ] Scene 4: Waterfront race
  - Fishermen mending nets (wave back)
  - Woman watering flowers (looks up, smiles)
  - Café opening (owner calls out)
  - Kids playing soccer (nearly hit ball)
  - Italian dialogue: "Scusi!" "Buongiorno!"
- [ ] Scene 5: Market chaos
  - Chickens scatter
  - Fruit cart nearly tips
  - Vendor yells: "Ragazzo!"
  - Woman shakes head
  - Renzo rings bell: "Dzyń! Dzyń!"
- [ ] Scene 6: Hill climb
  - Camera rises gradually
  - Half town visible: roofs, church, square
  - Train at station releases steam
  - Train whistle sounds
  - Main theme music swells
**Technical Notes:**
- Crowd NPCs: Simple looped animations
- Dialogue as floating handwritten text (subtitles optional)
- Camera rise: Framer Motion `scale` + `y` translation
- Music crossfades into title card
**Acceptance Criteria:**
- ✅ Town feels alive with activity
- ✅ Renzo's personality shines through (cheerful, reckless)
- ✅ Italian phrases authentic (native speaker review)
- ✅ Camera movement creates sense of scale
- ✅ Music timing matches emotional beat
---
### Task 3.3: Cinematic Scene 7-9 (Title Reveal)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
The grand reveal of the full town and title card.
**Scenes:**
7. **The Reveal** (10s): Full town panorama, Renzo becomes small figure
8. **Title Card** (10s): "CASTELVENTO 1940s" appears in watercolor style
9. **Transition** (5s): Camera descends to Renzo's house, seamless cut to gameplay
**Requirements:**
- [ ] Scene 7: Panoramic reveal
  - Red rooftops
  - Church bell tower
  - Lighthouse in distance
  - Sea sparkling
  - Seagulls fly past camera
  - Sun rays reflect on water
- [ ] Scene 8: Title animation
  - First: Light pencil sketch lines
  - Then: Watercolor fills in
  - Text: "CASTELVENTO 1940s"
  - Subtitle: "Every street has a story." or "Every life hides a story."
  - Hold for 3s, then fade
- [ ] Scene 9: Descent
  - Camera flies toward Renzo's house
  - No cut—seamless transition to bedroom scene
  - Player gains control immediately upon landing
**Technical Notes:**
- Panorama: High-res composite image with parallax layers
- Title: SVG with stroke-dashoffset for draw effect
- Transition: Match cut from exterior to interior (same color palette)
- Preload bedroom scene during title fade
**Acceptance Criteria:**
- ✅ Panorama breathtaking and detailed
- ✅ Title animation feels hand-crafted
- ✅ Subtitle resonates emotionally
- ✅ Transition to gameplay is invisible (no loading screen)
- ✅ Player immediately understands they're in control
---
### Task 3.4: Cinematic Scene 10-12 (The Gang & Race)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Renzo meets his friends, and they race together to the promenade.
**Scenes:**
10. **The Gang** (10s): Friends call out, gather with bikes
11. **The Race** (15s): Joyful race through narrow streets
12. **The Promenade Stop** (10s): They arrive, park bikes, look expectantly
**Requirements:**
- [ ] Scene 10: Friend group
  - 3-4 boys age 13-15
  - Distinct designs (tall, short, chubby, glasses)
  - Dialogue: "Renato!" "Andiamo!" "Sbrigati!"
  - Renzo: "Che succede?" "Vedrai..."
  - Laughter, bike bells ringing
- [ ] Scene 11: Group race
  - Boys weave through streets
  - One jumps curb
  - Another rides no-hands
  - Elderly woman: "Sempre di corsa..." (shakes head)
  - Upbeat, faster music tempo
- [ ] Scene 12: Arrival
  - Bikes lean against parapet simultaneously
  - Some sit on stone wall, legs dangling
  - All look in same direction (off-screen)
  - Renzo last to arrive, confused: "Che aspettiamo?"
  - Friend smiles: "Guarda..."
  - Silence falls, only sea and seagulls heard
**Technical Notes:**
- Multiple character models needed
- Sync dialogue with mouth movements (simplified)
- Camera follows pack dynamically
- Music shifts from energetic to quiet anticipation
**Acceptance Criteria:**
- ✅ Each friend has distinct personality
- ✅ Race feels dynamic and fun
- ✅ Transition to silence is impactful
- ✅ Italian dialogue natural and age-appropriate
- ✅ Sets up Elena's introduction perfectly
---
### Task 3.5: Cinematic Scene 13-16 (Elena's Introduction)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 8-10 hours
**Description:**  
Elena's dramatic introduction—the moment that defines the game's emotional core.
**Scenes:**
13. **Elena's Presence** (15s): Build-up through atmosphere before showing her
14. **The Silence** (10s): Boys mesmerized, world stops
15. **Life Goes On** (10s): Moment breaks, friends laugh it off
16. **Transition to Game** (5s): Follow Renzo to bedroom
**Requirements:**
- [ ] Scene 13: Elena reveal
  - Start with environmental cues:
    - Bougainvillea sways in breeze
    - Passerby's dress flutters
    - People turn heads
  - Show feet first: Elegant shoes, confident steps
  - Camera rises slowly: Dress, gloves, handbag
  - Sunlight filters through leaves onto silhouette
  - Finally face: Calm, beautiful, thoughtful
  - She doesn't seek attention—just walks purposefully
  - Music fades to almost nothing, only sea remains
- [ ] Scene 14: Boys' reaction
  - Complete silence (5 seconds)
  - Even noisy boys frozen
  - Renzo stares seriously for first time
  - Text overlay (handwritten):
    > **ELENA**  
    > "Some people change a whole city without trying."
  - Text fades slowly
- [ ] Scene 15: Breaking tension
  - Friend #1: "Let's go or we'll be late!"
  - Laughter returns
  - Grab bikes, one drops his (comedy)
  - Friends tease him
  - They race off again
  - Renzo lingers 2s, then smiles and catches up
- [ ] Scene 16: To gameplay
  - Camera follows Renzo through narrow street
  - Smooth fade/cut to bedroom interior
  - Player gains control instantly
**Technical Notes:**
- Elena model: Highest quality, multiple detail levels
- Slow-motion effect during reveal (time dilation)
- Text: Handwritten font with fade-in animation
- Color grading shifts cooler during her presence
- Seamless cut requires matching lighting between exterior/interior
**Acceptance Criteria:**
- ✅ Elena captivating without sexualization
- ✅ Emotional impact lands (silence felt)
- ✅ Text quote memorable and thematic
- ✅ Transition back to normalcy feels natural
- ✅ Player eager to start gameplay after cinematic
---
## 4️⃣ Bedroom Onboarding (Interactive Tutorial)
### Task 4.1: Bedroom Scene Setup
**Priority:** P0 (Critical Path)  
**Estimated Time:** 5-6 hours
**Description:**  
Create Renzo's bedroom as the first playable location. No UI initially—pure exploration.
**Requirements:**
- [ ] Background: High-res watercolor illustration of 1940s bedroom
  - Single bed with rumpled sheets
  - Wooden wardrobe (slightly open)
  - Desk with notebook, inkwell, pen
  - Wall clock (ticking, shows time)
  - Backpack on floor near bed
  - Window with view of street outside
  - Chair, small bookshelf, family photo on wall
- [ ] Lighting: Morning sunlight streaming through window
- [ ] Ambient sounds: Distant birds, clock ticking, faint street noise
- [ ] No HUD visible at start
- [ ] No tooltips or prompts
- [ ] First-person perspective (mouse/finger moves viewpoint slightly)
**Technical Notes:**
- Parallax layers for depth (foreground objects move more than background)
- Clickable hotspots defined as polygon regions
- Use React refs for interactive elements
- Tailwind for responsive container sizing
**Acceptance Criteria:**
- ✅ Room feels lived-in and authentic
- ✅ All key objects clearly visible
- ✅ Lighting sets warm morning mood
- ✅ No UI elements present initially
- ✅ Works on mobile (touch targets large enough)
---
### Task 4.2: Interactive Object System
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-7 hours
**Description:**  
Implement point-and-click interaction system for bedroom objects.
**Requirements:**
- [ ] Click detection on interactive objects:
  - Backpack
  - Notebook
  - Wardrobe
  - Wall Clock
  - Window (look outside)
  - Bed (sleep/rest)
  - Photo frame (examine)
- [ ] Cursor changes on hover (hand icon or subtle glow)
- [ ] Click feedback:
  - Object highlights briefly
  - Sound effect (thud, rustle, creak depending on object)
  - Small animation (backpack lifts, notebook opens slightly)
- [ ] First click on each object triggers unlock sequence
- [ ] Subsequent clicks show flavor text or minor interaction
- [ ] Support both mouse click and touch tap
**Technical Notes:**
- Hotspot system: Array of clickable regions with IDs
- Zustand store tracks `clickedObjects: string[]`
- Framer Motion for object micro-animations
- Audio pool for SFX (prevent overlap issues)
**Acceptance Criteria:**
- ✅ All objects clickable and responsive
- ✅ Hover states clear on desktop and mobile
- ✅ Feedback immediate (<100ms)
- ✅ Interactions feel tactile
- ✅ No false positives/negatives on clicks
---
### Task 4.3: UI Unlock Sequence
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
When player clicks specific objects, corresponding UI elements unlock and appear.
**Requirements:**
- [ ] **Backpack click** → Inventory button appears (bottom-right)
  - Animation: Button draws itself in pencil, fills with watercolor
  - Tooltip: "Your belongings" (fades after 3s)
  - Store: `hasBackpack = true`
- [ ] **Notebook click** → Quest/Reputation log appears (bottom-left)
  - Same animation style
  - Tooltip: "Your thoughts and promises"
  - Store: `hasNotebook = true`
- [ ] **Wardrobe click** → Dress-up mini-interaction
  - Brief animation: Clothes rustle
  - Character model updates (if implemented)
  - Flavor text: "Ready for the day."
- [ ] **Clock click** → Top HUD appears (Time/Energy/Money notch)
  - Slides down from top center
  - Shows current time, full energy bar, starting money (50 Liras)
  - Store: `hasHUD = true`
- [ ] Order doesn't matter—all must be clicked to proceed
- [ ] After all 4 unlocked: Gentle prompt appears (optional)
**Technical Notes:**
- UI components conditionally rendered based on Zustand state
- Framer Motion `layoutId` for smooth shared-element transitions
- Persist unlock state to save immediately
- Optional: Subtle glow on remaining objects after 30s of inactivity
**Acceptance Criteria:**
- ✅ Each UI element appears with satisfying animation
- ✅ Tooltips helpful but not intrusive
- ✅ HUD displays correct initial values
- ✅ State persists after reload
- ✅ Player understands what each UI element does
---
### Task 4.4: Character Customization Modal
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Allow players to customize Renzo's name and family relationships before or during first gameplay session.
**Requirements:**
- [ ] Trigger: Click photo frame on wall OR prompt after unlocking all UI
- [ ] Modal opens: "Who are you in Castelvento?"
- [ ] **Name Input**:
  - Default: "Renzo Moretti"
  - Editable text field (max 20 chars)
  - Preview shows name in handwritten style
- [ ] **Family Relation Dropdown**:
  - Options:
    - "Adopted son" (default)
    - "Stepson (mother remarried)"
    - "Foster child"
    - "Living with guardian"
  - Description text explains each choice
- [ ] **Sister Relation Toggle**:
  - "Older sister (no blood relation)" default
  - Option to customize sister's name too
- [ ] **Confirm Button**: "Begin Story"
- [ ] Choices saved to save file immediately
- [ ] Can be changed later via Settings menu
**Technical Notes:**
- Modal styled as old parchment paper
- Inputs use vintage-style fonts
- Validation: Name cannot be empty
- Zustand stores: `playerName`, `familyRelation`, `sisterName`
**Acceptance Criteria:**
- ✅ Customization intuitive and quick
- ✅ All options clearly explained
- ✅ Names display correctly throughout game
- ✅ Family relation affects dialogue (placeholder for now)
- ✅ Changes persist across sessions
---
### Task 4.5: Transition to First Quest
**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours
**Description:**  
After onboarding complete, guide player to their first objective.
**Requirements:**
- [ ] After all UI unlocked + customization done:
  - Notebook animates (wiggles slightly)
  - Optional: Soft chime sound
- [ ] Player opens notebook (or auto-opens after 10s)
- [ ] First quest entry appears:
  > **"A New Day in Castelvento"**  
  > *Mother says breakfast is ready. Head downstairs and start your first day.*
- [ ] Arrow or subtle highlight points to bedroom door
- [ ] Door becomes interactive (click to exit)
- [ ] Exiting bedroom → Hallway scene (next task)
**Technical Notes:**
- Quest system placeholder (hardcoded for now)
- Door hotspot enabled only after prerequisites met
- Smooth camera pan toward door
- Background music shifts to gentle adventure theme
**Acceptance Criteria:**
- ✅ Player knows what to do next without confusion
- ✅ First quest feels personal and grounded
- ✅ Transition to hallway smooth
- ✅ No dead ends or soft locks
- ✅ Tone set for rest of game
---
## 5️⃣ Core Systems (Game Mechanics)
### Task 5.1: Zustand State Management Setup
**Priority:** P0 (Critical Path)  
**Estimated Time:** 3-4 hours
**Description:**  
Set up global state management using Zustand for all game variables.
**Requirements:**
- [ ] Install Zustand: `npm install zustand`
- [ ] Create store with slices:
  ```typescript
  interface GameState {
    // Progression
    hasBackpack: boolean;
    hasNotebook: boolean;
    hasHUD: boolean;
    currentChapter: number;
    
    // Resources
    energy: number; // 0-100
    maxEnergy: number;
    money: number; // Liras
    time: TimeOfDay; // { hour: number, minute: number }
    
    // Player
    playerName: string;
    familyRelation: string;
    reputation: Record<string, number>;
    
    // Inventory
    inventory: Item[];
    
    // Quests
    activeQuests: Quest[];
    completedQuests: string[];
    
    // Relationships
    relationships: Record<string, number>; // NPC ID -> affinity
    
    // Actions
    setHasBackpack: () => void;
    addEnergy: (amount: number) => void;
    spendTime: (minutes: number) => void;
    // ...etc
  }
  ```
- [ ] Persist to localStorage automatically
- [ ] DevTools integration for debugging
- [ ] TypeScript types for all state properties
**Technical Notes:**
- Use `persist` middleware for localStorage
- Separate action creators for clarity
- Avoid deep nesting in state
- Add selectors for derived state
**Acceptance Criteria:**
- ✅ Store initialized correctly on app load
- ✅ State persists after refresh
- ✅ Actions update state immutably
- ✅ TypeScript compilation succeeds
- ✅ DevTools shows state changes in real-time
---
### Task 5.2: Time & Energy System
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
Implement core resource mechanics: time passes and energy depletes with actions.
**Requirements:**
- [ ] **Time System**:
  - Starts at 8:00 AM each day
  - Actions consume minutes (varies by action)
  - Day ends at 10:00 PM (auto-sleep)
  - Display format: "8:30 AM" or "14:45"
  - Time affects available activities (shops close, NPCs leave)
- [ ] **Energy System**:
  - Starts at 100 each morning
  - Actions drain energy (working: -20, exploring: -5, talking: -2)
  - Resting restores energy (bed: +50, café: +20)
  - At 0 energy: Forced to sleep, lose remaining day
  - Display: Bar with color gradient (green → yellow → red)
- [ ] **Interdependence**:
  - Some actions require minimum energy
  - Time-sensitive quests fail if not completed in time
  - Energy regenerates fully after sleep
**Technical Notes:**
- Time stored as minutes since midnight (0-1440)
- Formatter utility for display
- Zustand actions: `spendTime(minutes)`, `addEnergy(amount)`
- Warning modal at low energy (<10)
**Acceptance Criteria:**
- ✅ Time advances correctly with actions
- ✅ Energy drains/restores as expected
- ✅ Day/night cycle affects gameplay
- ✅ UI displays resources clearly
- ✅ Edge cases handled (midnight, zero energy)
---
### Task 5.3: Money & Economy System
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Create currency system with earning and spending mechanics.
**Requirements:**
- [ ] **Currency**: Italian Lira (₤)
- [ ] **Starting Amount**: 50 Liras
- [ ] **Earning Methods**:
  - Jobs: Fixed pay per action (market helper: ₤20, newspaper delivery: ₤15)
  - Quests: Variable rewards (₤10-₤100)
  - Selling items: Based on item value
  - Finding money: Rare spawns in environment
- [ ] **Spending Methods**:
  - Shop items (food, tools, gifts)
  - Transportation (train tickets, boat rides)
  - Gifts for NPCs (increases relationship)
  - Mini-games (gambling, optional)
- [ ] **Display**: Top HUD, right side (sun/moon icon)
- [ ] **Balance Goals**:
  - Early game: ₤50-200
  - Mid game: ₤200-500
  - Late game: ₤500+
**Technical Notes:**
- Integer math only (no decimals for simplicity)
- Transaction log for debugging
- Prevent negative money (block purchases if insufficient)
- Sound effect on earn/spend (coin clink)
**Acceptance Criteria:**
- ✅ Money updates correctly after transactions
- ✅ Cannot spend more than have
- ✅ Earning methods diverse and balanced
- ✅ UI shows amount clearly
- ✅ Economy feels rewarding but not grindy
---
### Task 5.4: Inventory System (Drag & Drop)
**Priority:** P1 (High)  
**Estimated Time:** 6-7 hours
**Description:**  
Implement backpack inventory with drag-and-drop item usage.
**Requirements:**
- [ ] **Inventory Grid**: 4x4 slots (16 items max)
- [ ] **Item Types**:
  - Consumables (food, medicine)
  - Quest items (letters, keys)
  - Tools (flashlight, fishing rod)
  - Gifts (flowers, jewelry)
  - Collectibles (stamps, postcards)
- [ ] **Drag & Drop**:
  - Drag item from inventory to hotspot on screen
  - Valid drop targets highlight on drag
  - Invalid drops: Item snaps back
  - Successful use: Item consumed or added to context
- [ ] **Item Details Modal**:
  - Click item to see description
  - Usage hints
  - Value (for selling)
- [ ] **Stacking**: Consumables stack up to 99
- [ ] **Sorting**: Manual rearrange or auto-sort by type
**Technical Notes:**
- Use `@dnd-kit/core` and `@dnd-kit/sortable` for DnD
- Item schema: `{ id, name, type, description, value, stackable }`
- Framer Motion for drag animations
- Mobile: Long-press to initiate drag
**Acceptance Criteria:**
- ✅ Items can be picked up and dropped
- ✅ Valid/invalid targets clear visually
- ✅ Item details readable
- ✅ Stacking works correctly
- ✅ Mobile touch DnD functional
---
### Task 5.5: Quest & Reputation System
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Track active quests and reputation with different town factions.
**Requirements:**
- [ ] **Quest Structure**:
  ```typescript
  interface Quest {
    id: string;
    title: string;
    description: string;
    giver: string; // NPC name
    objectives: Objective[];
    reward: { money?: number; reputation?: Record<string, number> };
    completed: boolean;
    failed: boolean;
    timeLimit?: number; // in-game minutes
  }
  ```
- [ ] **Quest Log** (Notebook UI):
  - Active tab: Current quests
  - Completed tab: History
  - Failed tab: Missed opportunities
  - Each quest expandable for details
- [ ] **Reputation System**:
  - Factions: Families, Shops, Church, Fishermen, etc.
  - Score: -100 (hated) to +100 (beloved)
  - Affected by quest choices, gossip, repeated actions
  - High rep unlocks discounts, special quests
  - Low rep blocks areas, raises prices
- [ ] **Notifications**:
  - Quest received: Popup with title
  - Quest completed: Celebration animation
  - Reputation changed: Small badge shows delta
**Technical Notes:**
- Quests stored in JSON for easy editing
- Reputation persisted per faction
- Use Zustand computed values for status thresholds
- Notebook UI uses accordion pattern
**Acceptance Criteria:**
- ✅ Quests tracked accurately
- ✅ Objectives update as player progresses
- ✅ Reputation affects NPC dialogue (placeholder)
- ✅ Quest log readable and organized
- ✅ Notifications timely and non-intrusive
---
## 6️⃣ World & Locations
### Task 6.1: Map & Travel System
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Create interactive map for traveling between locations.
**Requirements:**
- [ ] **Map View**:
  - Hand-drawn illustration of Castelvento
  - Key locations marked with icons
  - Player location highlighted
  - Fog of war for unvisited areas (optional)
- [ ] **Travel Mechanics**:
  - Click location to travel
  - Travel time varies (5-30 minutes)
  - Travel cost (free for walking, ₤5 for train)
  - Locked locations grayed out (require quest progress)
- [ ] **Fast Travel Rules**:
  - Must have visited location first
  - Some locations only accessible at certain times
  - Cannot travel while quest in progress (optional)
- [ ] **Visual Feedback**:
  - Route line draws from current to target
  - Bicycle icon moves along path
  - Loading screen with location facts during travel
**Technical Notes:**
- Map as SVG with clickable `<path>` elements
- Travel function: `travelTo(locationId)` in Zustand
- Fade-out/fade-in transition between locations
- Preload next location assets during travel
**Acceptance Criteria:**
- ✅ Map displays all planned locations
- ✅ Travel consumes time/money correctly
- ✅ Locked locations inaccessible until unlocked
- ✅ Transitions smooth and performant
- ✅ Mobile-friendly (pinch-zoom if needed)
---
### Task 6.2: Location Framework (First 5 Areas)
**Priority:** P1 (High)  
**Estimated Time:** 8-10 hours
**Description:**  
Build framework for interactive locations. Implement first 5 as examples.
**Locations:**
1. **Renzo's House** (Bedroom, Hallway, Kitchen, Garden)
2. **Town Square** (Church, Fountain, Benches, Bulletin Board)
3. **Market Street** (Stalls, Shops, Cafés)
4. **Beach Promenade** (Sea, Pier, Lifeguard Station)
5. **Train Station** (Platform, Ticket Booth, Waiting Room)
**Requirements (per location):**
- [ ] Background: High-res watercolor illustration
- [ ] Interactive hotspots (5-10 per location)
- [ ] NPCs with schedules (2-5 per location)
- [ ] Ambient sounds unique to location
- [ ] Time-of-day variations (lighting changes)
- [ ] Enter/exit transitions
- [ ] At least one quest-related object
**Technical Notes:**
- Location component template for reusability
- Hotspot config as JSON per location
- Lazy load location assets
- Sound crossfades on enter/exit
**Acceptance Criteria:**
- ✅ All 5 locations visually distinct
- ✅ Interactions responsive and varied
- ✅ NPCs present and animated
- ✅ Soundscapes immersive
- ✅ No performance degradation switching locations
---
## 7️⃣ Characters & NPCs
### Task 7.1: NPC Schedule System (Basic)
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
NPCs follow daily schedules, moving between locations.
**Requirements:**
- [ ] **Schedule Structure**:
  ```typescript
  interface Schedule {
    npcId: string;
    activities: {
      startTime: number; // minutes since midnight
      endTime: number;
      locationId: string;
      position: { x: number; y: number }; // within location
      animation: string; // idle animation name
    }[];
  }
  ```
- [ ] **Example NPC: Maria (Baker)**:
  - 5:00-14:00: Bakery (kneading dough animation)
  - 14:00-15:00: Market (buying supplies)
  - 15:00-18:00: Home (resting)
  - 18:00-20:00: Church (prayer)
  - 20:00-5:00: Home (sleeping)
- [ ] **Implementation**:
  - Check time every in-game minute
  - Move NPC if schedule changes
  - Show/hide NPCs based on location
  - Dialogue changes based on current activity
- [ ] **Edge Cases**:
  - Player interrupts activity (quest trigger)
  - Special event days override schedule
  - Weather affects outdoor activities
**Technical Notes:**
- Scheduler runs in `useEffect` with time subscription
- NPC position interpolated during travel between spots
- Use Web Workers if calculation heavy (unlikely)
- Config-driven schedules (JSON files)
**Acceptance Criteria:**
- ✅ NPCs appear/disappear at correct times
- ✅ Positions update smoothly
- ✅ Dialogue reflects current activity
- ✅ Schedules editable without code changes
- ✅ No NPCs stuck in wrong locations
---
### Task 7.2: Relationship System (Affinity Tracking)
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Track player relationship with each NPC, affecting dialogue and quest availability.
**Requirements:**
- [ ] **Affinity Scale**: -100 to +100
  - -100 to -50: Hostile (insults, refuses help)
  - -49 to -10: Unfriendly (cold, short responses)
  - -9 to +9: Neutral (polite, basic info)
  - +10 to +49: Friendly (warm, discounts, side quests)
  - +50 to +100: Close (gifts, secrets, romance options)
- [ ] **Affinity Changes**:
  - Positive: Help with tasks (+5), give gifts (+10), agree in dialogue (+2)
  - Negative: Steal (-20), insult (-10), refuse help (-5)
  - Daily decay: -1 if no interaction (optional)
- [ ] **Visual Indicators**:
  - Heart icon in NPC dialogue box
  - Color-coded (red → gray → green → gold)
  - Tooltip shows exact number on hover
- [ ] **Effects**:
  - Dialogue branches based on affinity
  - Shop prices scale (-10% at +50, +20% at -50)
  - Quest givers only approach if affinity > 0
**Technical Notes:**
- Store as `Record<npcId, number>` in Zustand
- Computed selectors for affinity tier
- Dialogue system checks affinity before branching
- Persist to save file
**Acceptance Criteria:**
- ✅ Affinity updates correctly after interactions
- ✅ Dialogue reflects relationship level
- ✅ Price modifiers apply correctly
- ✅ Visual indicators clear but not obtrusive
- ✅ System scalable to 50+ NPCs
---
## 8️⃣ UI/HUD Components
### Task 8.1: Top HUD ("The Notch")
**Priority:** P0 (Critical Path)  
**Estimated Time:** 4-5 hours
**Description:**  
Create the vintage-style top HUD displaying time, energy, and money.
**Requirements:**
- [ ] **Design**: Hand-drawn "notch" shape at top center
  - Resembles vintage car dashboard or pocket watch
  - Sepia tones, pencil outlines
  - Slight paper texture overlay
- [ ] **Left Section**: Energy bar
  - Horizontal bar with gradient (green → yellow → red)
  - Numerical value optional on hover
  - Depletes/restores in real-time
- [ ] **Center**: Time indicator
  - Sun icon (day) or moon icon (night)
  - Rotates slightly based on exact time
  - Digital time below (e.g., "14:30")
- [ ] **Right Section**: Money
  - Coin icon + amount (e.g., "₤150")
  - Green text when earned, red when spent
  - Pulse animation on change
- [ ] **Behavior**:
  - Slides down from top when unlocked
  - Always visible during gameplay
  - Hides during cinematics/dialogue (optional)
  - Click to expand detailed stats (optional)
**Technical Notes:**
- SVG for notch shape with CSS animations
- Framer Motion for slide-in/out
- Zustand selectors for reactive updates
- Tailwind for responsive positioning
**Acceptance Criteria:**
- ✅ HUD appears smoothly after clock click
- ✅ All three indicators update in real-time
- ✅ Design matches 1940s aesthetic
- ✅ Readable on all screen sizes
- ✅ Doesn't obstruct gameplay view
---
### Task 8.2: Floating Action Buttons (Notebook & Backpack)
**Priority:** P0 (Critical Path)  
**Estimated Time:** 3-4 hours
**Description:**  
Create dynamic floating buttons for quick access to inventory and quest log.
**Requirements:**
- [ ] **Backpack Button** (bottom-right):
  - Icon: Hand-drawn leather backpack
  - Badge: Number of items (e.g., "7/16")
  - State changes:
    - Normal: Backpack closed
    - New item acquired: Backpack wiggles, exclamation mark
    - Empty: Slightly faded
  - Click: Opens inventory modal
- [ ] **Notebook Button** (bottom-left):
  - Icon: Open leather notebook
  - Badge: Unread quests (e.g., "3!")
  - State changes:
    - Normal: Notebook flat
    - New quest: Notebook bounces, quill appears
    - All quests complete: Ribbon bookmark visible
  - Click: Opens quest log modal
- [ ] **Animations**:
  - Draw-on effect when first unlocked
  - Subtle idle float (2px up/down)
  - Scale on click (0.95)
  - Tooltip on hover (desktop only)
- [ ] **Mobile Adaptation**:
  - Larger touch targets (min 48x48px)
  - Bottom placement for thumb reach
  - Long-press for tooltip
**Technical Notes:**
- Framer Motion for all animations
- Zustand for badge counts
- Modals use `AnimatePresence` for enter/exit
- Position fixed to viewport
**Acceptance Criteria:**
- ✅ Buttons appear after respective object clicks
- ✅ Badges update accurately
- ✅ State animations clear and delightful
- ✅ Modals open/close smoothly
- ✅ Mobile touch targets ergonomic
---
### Task 8.3: Dialogue System (Placeholder)
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
Basic dialogue system for NPC conversations (full branching comes later).
**Requirements:**
- [ ] **Dialogue Box**:
  - Position: Bottom third of screen
  - Style: Parchment scroll unfurling
  - Speaker name: Handwritten above box
  - Portrait: Small sketch of speaker (left side)
- [ ] **Text Display**:
  - Typewriter effect (letter-by-letter)
  - Speed: 30ms per character
  - Click to skip animation
  - Auto-advance after 5s pause (optional)
- [ ] **Choices** (simple):
  - 2-3 response options
  - Appear below dialogue
  - Hover highlights choice
  - Click selects and continues
- [ ] **Exit**:
  - "End conversation" option
  - Or walk away to cancel
  - Dialogue box rolls up
**Technical Notes:**
- Dialogue data as JSON: `{ speaker, text, choices: [] }`
- Typewriter: `setTimeout` loop or Framer Motion `delay`
- Choice effects update Zustand (affinity, quests)
- Pause game time during dialogue (optional)
**Acceptance Criteria:**
- ✅ Dialogue boxes appear positioned correctly
- ✅ Text types smoothly
- ✅ Choices selectable and functional
- ✅ Conversations can be exited cleanly
- ✅ Supports multiple speakers in sequence
---
## 9️⃣ Audio System
### Task 9.1: Dynamic Soundscape Manager
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Manage ambient sounds that change based on location, time, and weather.
**Requirements:**
- [ ] **Sound Layers**:
  - Base: Location ambience (market chatter, waves, birds)
  - Time: Day/night additions (roosters, crickets)
  - Weather: Rain, wind, thunder (if implemented)
  - Events: Church bells (hourly), train whistle, bicycle bells
- [ ] **Crossfading**:
  - Smooth transitions between locations (2s fade)
  - Time changes gradual (10s fade)
  - Volume ducks during dialogue
- [ ] **Spatial Audio** (basic):
  - Louder when near sound source
  - Stereo panning based on object position
- [ ] **Mute Options**:
  - Separate sliders for Music, SFX, Ambience
  - Mute all button
  - Persist settings
**Technical Notes:**
- Howler.js for audio playback
- Web Audio API for volume mixing
- Preload all ambient loops
- Use `useAudio` custom hook for React integration
**Acceptance Criteria:**
- ✅ Ambience matches location/time
- ✅ Transitions imperceptible
- ✅ Volume balanced across layers
- ✅ Settings persist and apply immediately
- ✅ No audio glitches or cutoffs
---
### Task 9.2: Music System with Context Switching
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours
**Description:**  
Background music that adapts to gameplay context.
**Requirements:**
- [ ] **Music Tracks**:
  - Main Theme (menu)
  - Exploration (calm, curious)
  - Tension (mystery, danger)
  - Romance (soft, emotional)
  - Celebration (quest complete)
  - Sadness (failure, loss)
- [ ] **Context Detection**:
  - Default: Exploration
  - Dialogue with Elena: Romance
  - Quest timer running: Tension
  - Quest complete: Celebration (short sting)
  - Night time: Slower, quieter version
- [ ] **Transitions**:
  - Crossfade between tracks (3s)
  - No abrupt cuts
  - Volume dips during important dialogue
- [ ] **Looping**:
  - Seamless loops for all tracks
  - No audible seam
**Technical Notes:**
- Howler.js with `loop: true` and `fade()` method
- Context state in Zustand
- Priority system for overlapping triggers
- Mobile: Reduce quality if memory constrained
**Acceptance Criteria:**
- ✅ Music matches emotional context
- ✅ Transitions smooth and unnoticeable
- ✅ Loops seamlessly
- ✅ Volume appropriate (not overpowering)
- ✅ Works across all devices
---
## 🔟 Polish & Optimization
### Task 10.1: Mobile Responsiveness Audit
**Priority:** P0 (Critical Path)  
**Estimated Time:** 6-8 hours
**Description:**  
Ensure game works flawlessly on mobile devices (iOS/Android).
**Requirements:**
- [ ] **Breakpoints Tested**:
  - iPhone SE (375x667)
  - iPhone 14 Pro (393x852)
  - iPad Mini (768x1024)
  - Android phones (various)
- [ ] **Touch Targets**:
  - All buttons min 48x48px
  - Adequate spacing between targets
  - No hover-dependent interactions
- [ ] **Layout Adjustments**:
  - HUD scales appropriately
  - Modals full-screen on small devices
  - Keyboard doesn't obscure inputs
  - Landscape mode supported (optional)
- [ ] **Performance**:
  - 60 FPS target on mid-range devices
  - Reduced particle count on mobile
  - Lazy load images
  - Compress audio for mobile
**Technical Notes:**
- Tailwind breakpoints: `sm`, `md`, `lg`, `xl`
- Use `useMediaQuery` hook for conditional rendering
- Chrome DevTools device emulation + real device testing
- Lighthouse performance score >90
**Acceptance Criteria:**
- ✅ All screens usable on smallest supported device
- ✅ No overflow or clipping issues
- ✅ Touch interactions responsive
- ✅ Performance smooth (no jank)
- ✅ Text readable without zooming
---
### Task 10.2: Performance Optimization
**Priority:** P1 (High)  
**Estimated Time:** 5-6 hours
**Description:**  
Optimize game for consistent 60 FPS across devices.
**Requirements:**
- [ ] **Image Optimization**:
  - WebP format with fallbacks
  - Responsive images (`srcSet`)
  - Lazy loading for off-screen assets
  - Max resolution capped (no 4K textures on mobile)
- [ ] **Animation Optimization**:
  - Use CSS transforms (GPU-accelerated)
  - Avoid layout thrashing
  - Limit simultaneous animations
  - `will-change` hint for animated elements
- [ ] **Code Splitting**:
  - Next.js dynamic imports for routes
  - Split cinematic from gameplay bundle
  - Prefetch next location assets
- [ ] **State Updates**:
  - Memoize expensive computations
  - Batch Zustand updates
  - Avoid re-renders with `React.memo`
**Technical Notes:**
- Next.js Image component for auto-optimization
- React Profiler to identify bottlenecks
- Webpack bundle analyzer
- Request Animation Frame for custom loops
**Acceptance Criteria:**
- ✅ 60 FPS maintained during heavy scenes
- ✅ Initial load <3s on fast connection
- ✅ Memory usage stable (no leaks)
- ✅ Bundle size <2MB initial, <10MB total
- ✅ No long tasks (>50ms) in profiling
---
### Task 10.3: Accessibility Features
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours
**Description:**  
Make game accessible to players with disabilities.
**Requirements:**
- [ ] **Visual**:
  - High contrast mode toggle
  - Text size scaler (100%, 125%, 150%)
  - Colorblind-friendly palette option
  - Screen reader support (ARIA labels)
- [ ] **Auditory**:
  - Subtitles for all dialogue (toggle)
  - Visual indicators for sound cues
  - Separate volume controls
- [ ] **Motor**:
  - Full keyboard navigation
  - Sticky keys support
  - No rapid repeated inputs required
  - Touch hold alternatives to swipe
- [ ] **Cognitive**:
  - Clear, simple language
  - Consistent UI patterns
  - Option to disable time pressure
  - Quest reminders always visible
**Technical Notes:**
- ARIA attributes on interactive elements
- `prefers-reduced-motion` media query
- Keyboard event listeners for all actions
- Accessibility audit with axe DevTools
**Acceptance Criteria:**
- ✅ Navigable with keyboard alone
- ✅ Screen readers announce all content
- ✅ Text scalable without breaking layout
- ✅ Color not sole indicator of meaning
- ✅ WCAG 2.1 AA compliance (automated check)
---
## 📝 How to Use This Document
1. **Prioritize**: Start with P0 tasks (Critical Path)
2. **Assign**: Each task can be assigned to a developer
3. **Track**: Check off boxes as completed
4. **Estimate**: Use provided time estimates for sprint planning
5. **Adapt**: Modify requirements as design evolves
---
## 🔄 Task Status Legend
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⚠️ Blocked
- ❌ Cancelled