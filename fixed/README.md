# Fixed Files Directory

This directory contains corrected files based on the AUDIT.md analysis.

## Order of Implementation

According to the AUDIT.md Implementation Order (Section 5):

### Phase 1: Core & Shared
- [ ] 1.1 FSD structure setup and TypeScript/Vite configuration
- [ ] 1.2 Types in @castelvento/shared (Item, Quest, Time, NPC)
- [ ] 1.3 AudioManager implementation (Howler Wrapper)
- [ ] 1.4 i18next setup (RU, EN, IT)

### Phase 2: Global Stores (State Engine)
- [ ] 2.1 settingsStore + appStore
- [ ] 2.2 timeStore + energyStore + economyStore
- [ ] 2.3 inventoryStore (@dnd-kit integration)
- [ ] 2.4 questStore + affinityStore
- [ ] 2.5 progressionStore

### Phase 3: Entry Screens & Loading
- [ ] 3.1 Task 1.1: Splash Screen (Fixed sequencer)
- [ ] 3.2 Task 1.2: Loading Screen (Smoothed bicycle progress)

### Phase 4: Main Menu
- [ ] 4.1 Task 2.1: Cinemagraph Background (Fixed useTimeOfDay)
- [ ] 4.2 Task 2.2: Characters (Framer Motion without buggy useMemo)
- [ ] 4.3 Task 2.3: Navigation Objects (Separated transformation layers)
- [ ] 4.4 Task 2.4: Settings Modal (Framer Motion Drag + Portal AppShell)
- [ ] 4.5 Task 2.5: Credits Photo Album
- [ ] 4.6 Task 2.6: Dynamic Menu Evolution (Declarative flags)

### Phase 5: HUD & Game UI
- [ ] 5.1 Task 8.1: Top HUD Notch (Selectors without state duplication)
- [ ] 5.2 Task 5.4: Backpack UI (Drag and Drop)
- [ ] 5.3 Task 5.5: Quest Journal & Reputation Panel

### Phase 6: Cutscenes & World
- [ ] 6.1 Task 3.1–3.5: Opening Cinematic Sequence
- [ ] 6.2 Task 6.1–6.2: Map System & First 5 Locations
- [ ] 6.3 Task 7.1–7.2: NPC Schedules & Affinity Integration
