/**
 * Unified Domain Types for Castelvento Series
 * 
 * According to AUDIT.md Section 1.2 and Section 2
 * All types are centralized in @castelvento/shared
 */

// ============================================
// TIME SYSTEM TYPES (timeStore)
// ============================================

export type TimeVariant = 'dawn' | 'morning' | 'day' | 'afternoon' | 'evening' | 'night' | 'late_night';

export interface TimeState {
  minutesSinceMidnight: number; // 0-1439
  dayNumber: number;
}

export interface TimeStore extends TimeState {
  getFormattedTime: () => string; // "HH:MM"
  isNight: () => boolean; // true if after 22:00
  getTimeVariant: () => TimeVariant;
  spendTime: (minutes: number) => void;
  setDay: (day: number) => void;
}

// ============================================
// ENERGY SYSTEM TYPES (energyStore)
// ============================================

export interface EnergyState {
  current: number; // 0-100
  max: number; // typically 100
  isExhausted: boolean;
}

export interface EnergyStore extends EnergyState {
  spendEnergy: (amount: number) => boolean; // returns false if not enough
  restoreEnergy: (amount: number) => void;
  setMaxEnergy: (max: number) => void;
}

// ============================================
// ECONOMY SYSTEM TYPES (economyStore)
// ============================================

export type TransactionType = 'earn' | 'spend' | 'refund';

export interface Transaction {
  id: string;
  amount: number; // always integer (no fractional liras)
  type: TransactionType;
  description: string;
  timestamp: number;
}

export interface EconomyState {
  balance: number; // integer only
  transactions: Transaction[];
}

export interface EconomyStore extends EconomyState {
  addTransaction: (amount: number, type: TransactionType, description: string) => boolean;
  getTransactionHistory: (limit?: number) => Transaction[];
}

// ============================================
// ITEM TYPES (inventoryStore & economyStore)
// Unified Item contract per AUDIT.md Section 4.1
// ============================================

export type ItemType = 'quest' | 'consumable' | 'tool' | 'material' | 'collectible' | 'key';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string; // path to asset: '/assets/images/items/...'
  stackable: boolean;
  maxStack: number;
  weight: number; // for inventory weight system
  value: number; // in liras (integer)
  metadata?: Record<string, unknown>; // item-specific data
}

export interface InventorySlot {
  item: Item | null;
  quantity: number; // 0 if empty
}

export interface DragItem {
  slotIndex: number;
  item: Item;
  quantity: number;
}

// ============================================
// QUEST TYPES (questStore)
// ============================================

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type QuestTier = 'main' | 'side' | 'daily' | 'hidden';

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  progress?: number; // e.g., 3/5 items collected
  required?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  tier: QuestTier;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewardLira: number;
  rewardReputation?: Record<string, number>; // factionId -> reputation points
  prerequisites?: string[]; // quest IDs that must be completed
  giverNpcId?: string;
}

export interface QuestStoreState {
  quests: Map<string, Quest>;
  activeQuestIds: Set<string>;
  completedQuestIds: Set<string>;
}

// ============================================
// NPC TYPES (affinityStore & entities/npc)
// ============================================

export type AffinityTier = 'hostile' | 'neutral' | 'friendly' | 'close' | 'intimate';

export interface NPCAffinity {
  npcId: string;
  value: number; // -100 to +100
  tier: AffinityTier;
  lastInteraction?: number; // timestamp
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  role: string;
  location: string; // location ID
  schedule?: Record<string, string>; // time variant -> location
  dialogueTreeId?: string;
  givesQuests: string[]; // quest IDs
  tradesItems?: string[]; // item IDs they trade
}

export interface AffinityStoreState {
  affinities: Map<string, NPCAffinity>; // npcId -> affinity
}

export interface AffinityChange {
  npcId: string;
  delta: number;
  reason: string;
}

// ============================================
// PLAYER TYPES (entities/player)
// ============================================

export interface PlayerProfile {
  name: string;
  avatar?: string;
  playtimeMinutes: number;
}

export interface PlayerStats {
  chaptersCompleted: Set<number>;
  secretsFound: number;
  totalLiraEarned: number;
  totalLiraSpent: number;
  relationshipsUnlocked: number;
}

// ============================================
// LOCATION TYPES (entities/location)
// ============================================

export type LocationType = 'town' | 'countryside' | 'interior' | 'special';

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  backgroundAsset: string; // path to background image
  musicTrack?: string; // path to BGM
  ambienceTrack?: string; // path to ambient sound
  connections: string[]; // connected location IDs
  npcsPresent: string[]; // NPC IDs available here
  interactables?: string[]; // object IDs for interaction
  unlocked: boolean;
}

// ============================================
// PROGRESSION TYPES (progressionStore)
// Per AUDIT.md Section 1.2: Declarative flags based on completedChapters
// ============================================

export interface ProgressionState {
  completedChapters: Set<number>;
  discoveredSecrets: Set<string>;
  globalEventsTriggered: Set<string>;
}

export interface ProgressionStore extends ProgressionState {
  completeChapter: (chapterNumber: number) => void;
  discoverSecret: (secretId: string) => void;
  triggerGlobalEvent: (eventId: string) => void;
  hasCompletedChapter: (chapterNumber: number) => boolean;
  hasDiscoveredSecret: (secretId: string) => boolean;
  hasTriggeredEvent: (eventId: string) => boolean;
}

// ============================================
// APP STATE TYPES (appStore)
// Per AUDIT.md Section 1.2: Boot phases and modal state
// ============================================

export type AppPhase = 'splash' | 'loading' | 'menu' | 'game' | 'cutscene';

export type ModalType = 'settings' | 'credits' | 'support' | 'saveManager' | null;

export interface AppState {
  currentPhase: AppPhase;
  activeModal: ModalType;
  isTransitioning: boolean;
}

export interface AppStore extends AppState {
  setPhase: (phase: AppPhase) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  startTransition: () => void;
  endTransition: () => void;
}

// ============================================
// SETTINGS TYPES (settingsStore)
// Per AUDIT.md Section 1.2: Language, volume, brightness
// ============================================

export type Language = 'ru' | 'en' | 'it';

export interface VolumeSettings {
  master: number; // 0.0 - 1.0
  music: number; // 0.0 - 1.0
  sfx: number; // 0.0 - 1.0
  ambience: number; // 0.0 - 1.0
}

export interface SettingsState {
  language: Language;
  volume: VolumeSettings;
  brightness: number; // percentage 0-100
  isSettingsOpen: boolean;
}

export interface SettingsStore extends SettingsState {
  setLanguage: (lang: Language) => void;
  setVolume: (channel: keyof VolumeSettings, value: number) => void;
  setBrightness: (value: number) => void;
  toggleSettings: () => void;
}

// ============================================
// HUD TYPES (hudStore)
// Per AUDIT.md Section 1.2: UI-only state, NO duplication of energy/money/time
// ============================================

export interface HUDState {
  isNotchExpanded: boolean;
  isHUDVisible: boolean; // hidden during cutscenes
}

export interface HUDStore extends HUDState {
  toggleNotch: () => void;
  expandNotch: () => void;
  collapseNotch: () => void;
  showHUD: () => void;
  hideHUD: () => void;
}

// ============================================
// INVENTORY STORE TYPES (inventoryStore)
// Per AUDIT.md Section 1.2: 16 slots, DnD logic with @dnd-kit
// ============================================

export const INVENTORY_SLOT_COUNT = 16;

export interface InventoryState {
  slots: InventorySlot[]; // exactly 16 slots
  draggedItem: DragItem | null;
  selectedSlotIndex: number | null;
}

export interface InventoryStore extends InventoryState {
  addItem: (item: Item, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => boolean;
  moveItem: (fromSlot: number, toSlot: number) => boolean;
  swapItems: (slot1: number, slot2: number) => boolean;
  getItemQuantity: (itemId: string) => number;
  hasItem: (itemId: string, quantity?: number) => boolean;
  clearInventory: () => void;
  setDraggedItem: (dragItem: DragItem | null) => void;
  setSelectedSlot: (index: number | null) => void;
}

// ============================================
// AUDIO TYPES (core/audio)
// Per AUDIT.md Section 3: AudioManager singleton
// ============================================

export type AudioChannel = 'bgm' | 'ambience' | 'sfx' | 'voice';

export interface AudioConfig {
  src: string[];
  loop?: boolean;
  volume?: number;
  preload?: boolean;
}

export interface AudioManagerInterface {
  unlock: () => void;
  playBGM: (src: string, fadeDuration?: number) => void;
  stopBGM: (fadeDuration?: number) => void;
  playAmbience: (src: string, fadeDuration?: number) => void;
  stopAmbience: (fadeDuration?: number) => void;
  playSFX: (src: string, volumeScale?: number) => void;
  setVolume: (channel: AudioChannel, volume: number) => void;
  pauseAll: () => void;
  resumeAll: () => void;
}

// ============================================
// DIALOGUE ENGINE TYPES (features/dialogue-engine)
// ============================================

export type DialogueNodeType = 'text' | 'choice' | 'action' | 'end';

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  requirements?: {
    affinityNpcId?: string;
    minAffinity?: number;
    requiredQuest?: string;
    requiredItem?: string;
  };
}

export interface DialogueNode {
  id: string;
  type: DialogueNodeType;
  speaker?: string; // NPC name or 'player'
  text?: string;
  choices?: DialogueChoice[];
  action?: () => void; // callback for side effects
}

export interface DialogueTree {
  id: string;
  nodes: Map<string, DialogueNode>;
  startNodeId: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
