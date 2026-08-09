# Task 8.3: Dialogue System (Placeholder) — Detailed Implementation Specification

## 📋 Overview

**Task ID:** 8.3  
**Title:** Dialogue System (Placeholder)  
**Priority:** P2 (Medium)  
**Parent Feature:** UI/HUD System  
**Dependencies:** Task 4.1 (Dialogue System & Branching), Task 8.1 (Top HUD), Task 7.2 (Relationship Tracking)  

---

## 🎯 Objective

Реализовать базовую систему диалогов для NPC-разговоров с эффектом печатной машинки, выбором реплик и плавными анимациями появления/исчезновения. Это упрощенная версия (placeholder) для полной системы ветвления диалогов из Задачи 4.1.

---

## 🏗️ Architecture

### Component Hierarchy

```
src/
├── client/
│   ├── components/
│   │   └── ui/
│   │       ├── Dialogue/
│   │       │   ├── DialogueBox.tsx
│   │       │   ├── DialogueBox.styles.ts
│   │       │   ├── DialoguePortrait.tsx
│   │       │   ├── DialogueChoices.tsx
│   │       │   ├── TypewriterText.tsx
│   │       │   └── index.ts
│   │       └── HUD/
│   │           └── DialogueOverlay.tsx
│   ├── stores/
│   │   └── dialogueStore.ts
│   ├── types/
│   │   └── dialogue.ts
│   └── data/
│       └── dialogues/
│           └── sample-dialogue.json
```

---

## 📦 Data Structures

### 1. Dialogue Data Model

```typescript
// src/client/types/dialogue.ts

export interface DialogueNode {
  /** Уникальный идентификатор узла */
  id: string;
  
  /** Имя говорящего персонажа */
  speaker: string;
  
  /** Текст реплики */
  text: string;
  
  /** URL портрета персонажа (SVG/PNG) */
  portraitUrl?: string;
  
  /** Доступные выборы ответов */
  choices?: DialogueChoice[];
  
  /** Следующий узел по умолчанию (если нет choices) */
  nextNodeId?: string;
  
  /** Действия при входе в узел (обновление стейта) */
  onEnter?: DialogueAction[];
  
  /** Действия при выходе из узла */
  onExit?: DialogueAction[];
}

export interface DialogueChoice {
  /** Текст варианта ответа */
  text: string;
  
  /** ID следующего узла при выборе */
  nextNodeId: string;
  
  /** Условия доступности выбора (опционально) */
  condition?: DialogueCondition;
  
  /** Действия при выборе */
  onChoose?: DialogueAction[];
}

export interface DialogueAction {
  /** Тип действия */
  type: 'setFlag' | 'updateAffinity' | 'addQuest' | 'addItem';
  
  /** Параметр действия */
  payload: {
    key?: string;
    value?: any;
    questId?: string;
    itemId?: string;
    amount?: number;
  };
}

export interface DialogueCondition {
  /** Тип условия */
  type: 'hasFlag' | 'affinityGreaterThan' | 'hasItem' | 'questStatus';
  
  /** Параметр условия */
  payload: {
    key?: string;
    value?: any;
    threshold?: number;
    itemId?: string;
    questId?: string;
    status?: 'active' | 'completed' | 'failed';
  };
}

export interface DialogueData {
  /** Метаданные диалога */
  meta: {
    id: string;
    title: string;
    version: string;
  };
  
  /** Стартовый узел */
  startNodeId: string;
  
  /** Все узлы диалога */
  nodes: Record<string, DialogueNode>;
}
```

### 2. Dialogue Store State

```typescript
// src/client/stores/dialogueStore.ts

import { create } from 'zustand';
import { DialogueData, DialogueNode, DialogueChoice } from '../types/dialogue';

interface DialogueState {
  // Active dialogue
  activeDialogue: DialogueData | null;
  currentNode: DialogueNode | null;
  isDialogueActive: boolean;
  isTyping: boolean;
  
  // Display settings
  typewriterSpeed: number; // ms per character
  autoAdvanceDelay: number; // ms after typing completes
  
  // Actions
  startDialogue: (dialogue: DialogueData) => void;
  endDialogue: () => void;
  advanceDialogue: () => void;
  selectChoice: (choice: DialogueChoice) => void;
  skipTyping: () => void;
  
  // Internal
  setCurrentNode: (node: DialogueNode) => void;
  setTypingComplete: (isComplete: boolean) => void;
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  // Initial state
  activeDialogue: null,
  currentNode: null,
  isDialogueActive: false,
  isTyping: false,
  
  typewriterSpeed: 30, // 30ms per character
  autoAdvanceDelay: 5000, // 5 seconds auto-advance
  
  // Start dialogue
  startDialogue: (dialogue) => {
    const startNode = dialogue.nodes[dialogue.startNodeId];
    set({
      activeDialogue: dialogue,
      currentNode: startNode,
      isDialogueActive: true,
      isTyping: true,
    });
    
    // Execute onEnter actions
    if (startNode.onEnter) {
      executeActions(startNode.onEnter);
    }
  },
  
  // End dialogue
  endDialogue: () => {
    const { currentNode } = get();
    
    // Execute onExit actions
    if (currentNode?.onExit) {
      executeActions(currentNode.onExit);
    }
    
    set({
      activeDialogue: null,
      currentNode: null,
      isDialogueActive: false,
      isTyping: false,
    });
  },
  
  // Advance to next node or end
  advanceDialogue: () => {
    const { currentNode, activeDialogue, isTyping } = get();
    
    // Can't advance while typing (unless skipped)
    if (isTyping) {
      get().skipTyping();
      return;
    }
    
    if (!currentNode || !activeDialogue) return;
    
    // If has choices, wait for selection
    if (currentNode.choices && currentNode.choices.length > 0) {
      return; // Wait for user to select choice
    }
    
    // Go to next node or end
    if (currentNode.nextNodeId) {
      const nextNode = activeDialogue.nodes[currentNode.nextNodeId];
      if (nextNode) {
        get().setCurrentNode(nextNode);
        
        // Execute onEnter actions for next node
        if (nextNode.onEnter) {
          executeActions(nextNode.onEnter);
        }
      } else {
        get().endDialogue();
      }
    } else {
      get().endDialogue();
    }
  },
  
  // Select a choice
  selectChoice: (choice) => {
    const { activeDialogue } = get();
    if (!activeDialogue) return;
    
    // Execute onChoose actions
    if (choice.onChoose) {
      executeActions(choice.onChoose);
    }
    
    // Go to chosen node
    const nextNode = activeDialogue.nodes[choice.nextNodeId];
    if (nextNode) {
      get().setCurrentNode(nextNode);
      
      // Execute onEnter actions
      if (nextNode.onEnter) {
        executeActions(nextNode.onEnter);
      }
    } else {
      get().endDialogue();
    }
  },
  
  // Skip typing animation
  skipTyping: () => {
    set({ isTyping: false });
  },
  
  // Set current node
  setCurrentNode: (node) => {
    set({
      currentNode: node,
      isTyping: true,
    });
  },
  
  // Set typing complete
  setTypingComplete: (isComplete) => {
    set({ isTyping: !isComplete });
  },
}));

// Helper function to execute actions
const executeActions = (actions: any[]) => {
  // Implementation depends on game state stores
  // This is a placeholder for integration with quest, inventory, affinity stores
  console.log('Executing dialogue actions:', actions);
};
```

---

## 🎨 Visual Design Specifications

### 1. Dialogue Box

**Размеры:**
- Desktop: width: 800px, min-height: 180px
- Mobile: width: 90% viewport, min-height: 200px
- Position: bottom third of screen (bottom: 10%)

**Стиль:**
- Фон: Parchment texture (#F5F5DC с текстурой бумаги)
- Граница: Hand-drawn brown border (#6F4E37, 3px)
- Тени: Soft shadow для глубины
- Border-radius: 8px (немного неровный для hand-drawn эффекта)

**Анимации:**
- **Enter:** Unfurl effect (раскручивание свитка сверху вниз, 0.5s)
- **Exit:** Roll up effect (закручивание снизу вверх, 0.4s)

### 2. Speaker Name

**Позиция:** Над диалоговым окном, слева
**Стиль:** Handwritten font, #5C4033 (dark brown), 18px
**Анимация:** Fade in с задержкой 0.2s после появления бокса

### 3. Portrait

**Позиция:** Левая сторона диалогового окна
**Размеры:** 100x100px (desktop), 80x80px (mobile)
**Стиль:** Small sketch in circular frame
**Frame:** Hand-drawn circle with subtle watercolor wash

### 4. Text Display

**Шрифт:** Handwritten style (например, 'Caveat', 'Dancing Script')
**Размер:** 18px (desktop), 16px (mobile)
**Цвет:** #2C2C2C (dark gray, не чисто черный)
**Line-height:** 1.6
**Typewriter Effect:** 30ms per character

### 5. Choice Buttons

**Позиция:** Под основным текстом диалога
**Стиль:** Parchment buttons с hover эффектом
**Размеры:** Full width, min-height 50px
**Hover:** Highlight background (#FFF8DC), slight scale up (1.02)
**Transition:** 0.2s ease

---

## ⚙️ Implementation Details

### 1. DialogueBox Component

```typescript
// src/client/components/ui/Dialogue/DialogueBox.tsx

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialogueStore } from '../../stores/dialogueStore';
import { DialoguePortrait } from './DialoguePortrait';
import { TypewriterText } from './TypewriterText';
import { DialogueChoices } from './DialogueChoices';
import * as S from './DialogueBox.styles';

export const DialogueBox: React.FC = () => {
  const {
    isDialogueActive,
    currentNode,
    isTyping,
    typewriterSpeed,
    autoAdvanceDelay,
    advanceDialogue,
    endDialogue,
    setTypingComplete,
  } = useDialogueStore();
  
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing completion
  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);
    
    // Auto-advance if no choices
    if (!currentNode?.choices || currentNode.choices.length === 0) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceDialogue();
      }, autoAdvanceDelay);
    }
  }, [setTypingComplete, currentNode, autoAdvanceDelay, advanceDialogue]);

  // Handle click to advance or skip typing
  const handleClick = useCallback(() => {
    if (isTyping) {
      // Skip typing
      setTypingComplete(true);
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      handleTypingComplete();
    } else if (!currentNode?.choices || currentNode.choices.length === 0) {
      // Advance to next
      advanceDialogue();
    }
  }, [isTyping, currentNode, setTypingComplete, handleTypingComplete, advanceDialogue]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Reset auto-advance timer when node changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [currentNode]);

  return (
    <AnimatePresence>
      {isDialogueActive && currentNode && (
        <S.Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClick}
        >
          <S.DialogueContainer
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking dialogue
          >
            {/* Speaker Name */}
            <S.SpeakerName
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentNode.speaker}
            </S.SpeakerName>
            
            {/* Portrait */}
            {currentNode.portraitUrl && (
              <DialoguePortrait 
                url={currentNode.portraitUrl} 
                speaker={currentNode.speaker}
              />
            )}
            
            {/* Dialogue Text */}
            <S.TextContainer>
              <TypewriterText
                text={currentNode.text}
                speed={typewriterSpeed}
                onComplete={handleTypingComplete}
                isSkipping={!isTyping}
              />
            </S.TextContainer>
            
            {/* Choices */}
            {currentNode.choices && currentNode.choices.length > 0 && !isTyping && (
              <DialogueChoices choices={currentNode.choices} />
            )}
            
            {/* Continue Indicator (when typing complete and no choices) */}
            {!isTyping && (!currentNode.choices || currentNode.choices.length === 0) && (
              <S.ContinueIndicator
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ▼ Click to continue
              </S.ContinueIndicator>
            )}
          </S.DialogueContainer>
        </S.Overlay>
      )}
    </AnimatePresence>
  );
};
```

### 2. TypewriterText Component

```typescript
// src/client/components/ui/Dialogue/TypewriterText.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed: number; // ms per character
  onComplete: () => void;
  isSkipping: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed,
  onComplete,
  isSkipping,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Show full text immediately if skipping
  useEffect(() => {
    if (isSkipping) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      onComplete();
      return;
    }

    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text, isSkipping]);

  // Typewriter effect
  useEffect(() => {
    if (isSkipping || currentIndex >= text.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isSkipping, onComplete]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayedText}
      {!isSkipping && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </motion.p>
  );
};
```

### 3. DialogueChoices Component

```typescript
// src/client/components/ui/Dialogue/DialogueChoices.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useDialogueStore } from '../../stores/dialogueStore';
import { DialogueChoice } from '../../types/dialogue';
import * as S from './DialogueBox.styles';

interface DialogueChoicesProps {
  choices: DialogueChoice[];
}

export const DialogueChoices: React.FC<DialogueChoicesProps> = ({ choices }) => {
  const { selectChoice } = useDialogueStore();

  const handleChoiceClick = (
    event: React.MouseEvent,
    choice: DialogueChoice
  ) => {
    event.stopPropagation(); // Prevent advancing dialogue
    selectChoice(choice);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <S.ChoicesContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {choices.map((choice, index) => (
        <S.ChoiceButton
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.02, backgroundColor: '#FFF8DC' }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => handleChoiceClick(e, choice)}
        >
          {choice.text}
        </S.ChoiceButton>
      ))}
    </S.ChoicesContainer>
  );
};
```

### 4. Styled Components

```typescript
// src/client/components/ui/Dialogue/DialogueBox.styles.ts

import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10%;
  z-index: 9999;
  cursor: pointer;
  
  @media (max-width: 768px) {
    padding-bottom: 5%;
  }
`;

export const DialogueContainer = styled(motion.div)`
  position: relative;
  width: 800px;
  min-height: 180px;
  background: #F5F5DC;
  background-image: url('/assets/textures/parchment.png');
  border: 3px solid #6F4E37;
  border-radius: 8px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(139, 115, 85, 0.3);
  padding: 30px 40px 40px;
  transform-origin: top center;
  overflow: visible;
  
  @media (max-width: 768px) {
    width: 90vw;
    min-height: 200px;
    padding: 20px 25px 30px;
  }
  
  /* Hand-drawn border effect */
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 2px solid #5C4033;
    border-radius: 10px;
    opacity: 0.5;
    pointer-events: none;
  }
`;

export const SpeakerName = styled(motion.h3)`
  position: absolute;
  top: -40px;
  left: 120px;
  font-family: 'Caveat', cursive;
  font-size: 24px;
  color: #5C4033;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    left: 100px;
    top: -35px;
    font-size: 20px;
  }
`;

export const TextContainer = styled.div`
  margin-left: 120px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    margin-left: 100px;
  }
  
  p {
    font-family: 'Caveat', cursive;
    font-size: 18px;
    line-height: 1.6;
    color: #2C2C2C;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
`;

export const ChoicesContainer = styled(motion.div)`
  margin-left: 120px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (max-width: 768px) {
    margin-left: 100px;
    margin-top: 20px;
  }
`;

export const ChoiceButton = styled(motion.button)`
  width: 100%;
  min-height: 50px;
  padding: 12px 20px;
  background: linear-gradient(145deg, #F5F5DC, #EFE6D0);
  border: 2px solid #8B7355;
  border-radius: 6px;
  font-family: 'Caveat', cursive;
  font-size: 18px;
  color: #2C2C2C;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: #FFF8DC;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    min-height: 45px;
  }
`;

export const ContinueIndicator = styled(motion.div)`
  position: absolute;
  bottom: 15px;
  right: 20px;
  font-size: 14px;
  color: #8B7355;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 12px;
    bottom: 10px;
    right: 15px;
  }
`;
```

### 5. DialoguePortrait Component

```typescript
// src/client/components/ui/Dialogue/DialoguePortrait.tsx

import React from 'react';
import { motion } from 'framer-motion';
import * as S from './DialogueBox.styles';

interface DialoguePortraitProps {
  url: string;
  speaker: string;
}

export const DialoguePortrait: React.FC<DialoguePortraitProps> = ({ url, speaker }) => {
  return (
    <S.PortraitContainer
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
    >
      <S.PortraitFrame>
        <S.PortraitImage 
          src={url} 
          alt={`Portrait of ${speaker}`}
        />
      </S.PortraitFrame>
    </S.PortraitContainer>
  );
};

// In DialogueBox.styles.ts:
export const PortraitContainer = styled(motion.div)`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 100px;
  height: 100px;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    left: 15px;
  }
`;

export const PortraitFrame = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #6F4E37;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(139, 115, 85, 0.4);
  overflow: hidden;
  background: radial-gradient(circle, #F5F5DC 60%, #D2B48C 100%);
  position: relative;
  
  /* Watercolor wash effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at 30% 70%,
      rgba(173, 216, 230, 0.2),
      transparent 70%
    );
    pointer-events: none;
  }
`;

export const PortraitImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
```

### 6. DialogueOverlay (Main Container)

```typescript
// src/client/components/ui/HUD/DialogueOverlay.tsx

import React from 'react';
import { DialogueBox } from '../Dialogue/DialogueBox';
import { useDialogueStore } from '../../stores/dialogueStore';

export const DialogueOverlay: React.FC = () => {
  const { isDialogueActive } = useDialogueStore();

  if (!isDialogueActive) return null;

  return (
    <>
      <DialogueBox />
    </>
  );
};
```

---

## 🔗 Integration with Other Systems

### 1. Loading Dialogue Data

```typescript
// Example: Loading dialogue from JSON file

import dialogueData from '../data/dialogues/npc-market-vendor.json';

// In game logic when approaching NPC:
const startConversation = () => {
  useDialogueStore.getState().startDialogue(dialogueData);
  
  // Pause game time (optional)
  useGameStore.getState().pauseGame();
};
```

### 2. Sample Dialogue JSON

```json
{
  "meta": {
    "id": "npc-market-vendor-greeting",
    "title": "Market Vendor Greeting",
    "version": "1.0"
  },
  "startNodeId": "greeting",
  "nodes": {
    "greeting": {
      "id": "greeting",
      "speaker": "Marco the Vendor",
      "text": "Buongiorno! Welcome to my little shop. I have the finest olives in all of Castelvento!",
      "portraitUrl": "/assets/portraits/marco-vendor.svg",
      "choices": [
        {
          "text": "Tell me about your olives",
          "nextNodeId": "talk-olives"
        },
        {
          "text": "Do you have any news from the harbor?",
          "nextNodeId": "ask-harbor",
          "condition": {
            "type": "questStatus",
            "payload": {
              "questId": "mystery-arrives",
              "status": "active"
            }
          }
        },
        {
          "text": "Just browsing, thanks",
          "nextNodeId": "farewell"
        }
      ]
    },
    "talk-olives": {
      "id": "talk-olives",
      "speaker": "Marco the Vendor",
      "text": "Ah, you have excellent taste! These are from my family's grove, picked just last week. Would you like to try some?",
      "nextNodeId": "offer-sample"
    },
    "offer-sample": {
      "id": "offer-sample",
      "speaker": "Marco the Vendor",
      "text": "Here, take this jar as a gift. Everyone should taste the true flavor of Castelvento!",
      "onEnter": [
        {
          "type": "addItem",
          "payload": {
            "itemId": "olives-jar",
            "amount": 1
          }
        },
        {
          "type": "updateAffinity",
          "payload": {
            "characterId": "marco-vendor",
            "value": 5
          }
        }
      ],
      "choices": [
        {
          "text": "Thank you so much!",
          "nextNodeId": "thank-you"
        },
        {
          "text": "I couldn't accept this...",
          "nextNodeId": "insist-gift"
        }
      ]
    },
    "thank-you": {
      "id": "thank-you",
      "speaker": "Marco the Vendor",
      "text": "It's my pleasure! Come back anytime, amico mio!",
      "onExit": [
        {
          "type": "setFlag",
          "payload": {
            "key": "met-marco",
            "value": true
          }
        }
      ]
    },
    "insist-gift": {
      "id": "insist-gift",
      "speaker": "Marco the Vendor",
      "text": "Nonsense! I insist. Consider it a welcome to our beautiful town.",
      "nextNodeId": "thank-you"
    },
    "ask-harbor": {
      "id": "ask-harbor",
      "speaker": "Marco the Vendor",
      "text": "The harbor? Hmm... I did see a strange ship arrive last night. Very quiet, no flags. You might want to ask around.",
      "onEnter": [
        {
          "type": "updateAffinity",
          "payload": {
            "characterId": "marco-vendor",
            "value": 3
          }
        }
      ],
      "nextNodeId": "farewell"
    },
    "farewell": {
      "id": "farewell",
      "speaker": "Marco the Vendor",
      "text": "Arrivederci! Come back soon!",
      "onExit": [
        {
          "type": "setFlag",
          "payload": {
            "key": "met-marco",
            "value": true
          }
        }
      ]
    }
  }
}
```

### 3. Integration with Affinity System

```typescript
// src/client/stores/affinityStore.ts (excerpt)

import { create } from 'zustand';
import { DialogueAction } from '../types/dialogue';

interface AffinityState {
  affinities: Record<string, number>; // characterId -> score
  updateAffinity: (characterId: string, delta: number) => void;
  getAffinity: (characterId: string) => number;
}

export const useAffinityStore = create<AffinityState>((set, get) => ({
  affinities: {},
  
  updateAffinity: (characterId, delta) => {
    set((state) => ({
      affinities: {
        ...state.affinities,
        [characterId]: (state.affinities[characterId] || 0) + delta,
      },
    }));
  },
  
  getAffinity: (characterId) => {
    return get().affinities[characterId] || 0;
  },
}));

// Update executeActions in dialogueStore:
const executeActions = (actions: DialogueAction[]) => {
  actions.forEach((action) => {
    switch (action.type) {
      case 'updateAffinity':
        useAffinityStore.getState().updateAffinity(
          action.payload.characterId!,
          action.payload.value
        );
        break;
      
      case 'addItem':
        useInventoryStore.getState().addItem({
          id: action.payload.itemId!,
          quantity: action.payload.amount || 1,
        });
        break;
      
      case 'setFlag':
        useGameStateStore.getState().setFlag(
          action.payload.key!,
          action.payload.value
        );
        break;
      
      // ... other action types
    }
  });
};
```

---

## 📱 Mobile Adaptation

### Responsive Layout Adjustments

```css
/* Already included in styled components above, but key points: */

/* Smaller portrait on mobile */
@media (max-width: 768px) {
  .portrait {
    width: 80px;
    height: 80px;
  }
  
  .speaker-name {
    font-size: 20px;
    left: 100px;
  }
  
  .text {
    font-size: 16px;
    margin-left: 100px;
  }
  
  .dialogue-box {
    width: 90vw;
    padding: 20px 25px 30px;
  }
}
```

### Touch Interaction

- Клик в любом месте overlay пропускает набор текста или продвигает диалог
- Кнопки выборов имеют увеличенные тач-зоны (min 48px height)
- Поддержка свайпа вверх для закрытия диалога (опционально)

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] Диалоговое окно появляется при вызове `startDialogue()`
- [ ] Текст отображается с эффектом печатной машинки (30ms/символ)
- [ ] Клик пропускает анимацию набора текста
- [ ] Авто-продвижение через 5 секунд после завершения набора (если нет выборов)
- [ ] Варианты ответов появляются после завершения набора текста
- [ ] Выбор ответа переходит к соответствующему узлу
- [ ] Диалог завершается при отсутствии следующих узлов
- [ ] Портрет отображается слева от текста
- [ ] Имя говорящего отображается над окном

### Visual Requirements

- [ ] Анимация появления (unfurl effect) работает плавно
- [ ] Анимация исчезновения (roll up) работает плавно
- [ ] Стиль соответствует vintage aesthetic (parchment, handwritten fonts)
- [ ] Курсор мигает во время набора текста
- [ ] Индикатор "Click to continue" пульсирует
- [ ] Кнопки выборов имеют hover эффект

### Technical Requirements

- [ ] Данные диалога загружаются из JSON
- [ ] Zustand store управляет состоянием диалога
- [ ] Компоненты оптимизированы (memo, useCallback)
- [ ] Таймеры очищаются при размонтировании
- [ ] Код покрыт unit-тестами
- [ ] Accessibility: клавиатурная навигация, aria-labels

### Performance Requirements

- [ ] Время появления диалога < 200ms
- [ ] Typewriter effect работает при 60 FPS
- [ ] Отсутствие memory leaks
- [ ] Bundle size contribution < 20KB (gzipped)

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/client/components/ui/Dialogue/DialogueBox.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DialogueBox } from './DialogueBox';
import { useDialogueStore } from '../../stores/dialogueStore';
import sampleDialogue from '../../data/dialogues/sample-dialogue.json';

describe('DialogueBox', () => {
  beforeEach(() => {
    // Reset store
    useDialogueStore.setState({
      activeDialogue: null,
      currentNode: null,
      isDialogueActive: false,
    });
  });

  it('does not render when dialogue is not active', () => {
    render(<DialogueBox />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when dialogue is active', () => {
    useDialogueStore.getState().startDialogue(sampleDialogue);
    render(<DialogueBox />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Speaker')).toBeInTheDocument();
  });

  it('displays text with typewriter effect', async () => {
    useDialogueStore.getState().startDialogue(sampleDialogue);
    render(<DialogueBox />);
    
    // Initially only partial text
    await waitFor(() => {
      expect(screen.getByText(/Hello/i)).toBeInTheDocument();
    });
    
    // After typing completes, full text should be visible
    await waitFor(() => {
      expect(screen.getByText('Hello, traveler! Welcome to our village.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('skips typing on click', async () => {
    useDialogueStore.getState().startDialogue(sampleDialogue);
    render(<DialogueBox />);
    
    // Click to skip
    fireEvent.click(screen.getByRole('dialog'));
    
    // Full text should appear immediately
    await waitFor(() => {
      expect(screen.getByText('Hello, traveler! Welcome to our village.')).toBeInTheDocument();
    });
  });

  it('shows choices after typing completes', async () => {
    useDialogueStore.getState().startDialogue(sampleDialogue);
    render(<DialogueBox />);
    
    // Wait for typing to complete
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(2);
    }, { timeout: 5000 });
    
    expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
    expect(screen.getByText('Goodbye')).toBeInTheDocument();
  });

  it('selects choice and advances dialogue', async () => {
    useDialogueStore.getState().startDialogue(sampleDialogue);
    render(<DialogueBox />);
    
    // Wait for choices
    await waitFor(() => {
      expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Click choice
    fireEvent.click(screen.getByText('Tell me about yourself'));
    
    // Should advance to next node
    await waitFor(() => {
      expect(screen.getByText('I am the village elder...')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
// Test dialogue actions (addItem, updateAffinity)

it('executes onEnter actions when entering node', async () => {
  const addItemSpy = jest.spyOn(useInventoryStore.getState(), 'addItem');
  
  useDialogueStore.getState().startDialogue(sampleDialogueWithActions);
  render(<DialogueBox />);
  
  // Wait for node with actions
  await waitFor(() => {
    expect(addItemSpy).toHaveBeenCalledWith({
      id: 'gift-item',
      quantity: 1,
    });
  });
});
```

---

## 🔧 Edge Cases & Error Handling

### 1. Missing Portrait URL

**Problem:** Узел диалога может не иметь портрета.

**Solution:**
```typescript
// Conditional rendering
{currentNode.portraitUrl && (
  <DialoguePortrait url={currentNode.portraitUrl} />
)}
```

### 2. Empty Choices Array

**Problem:** Choices массив может быть пустым.

**Solution:**
```typescript
{currentNode.choices && currentNode.choices.length > 0 && !isTyping && (
  <DialogueChoices choices={currentNode.choices} />
)}
```

### 3. Invalid Next Node ID

**Problem:** nextNodeId может указывать на несуществующий узел.

**Solution:**
```typescript
const nextNode = activeDialogue.nodes[currentNode.nextNodeId];
if (nextNode) {
  setCurrentNode(nextNode);
} else {
  endDialogue(); // Gracefully end if node not found
}
```

### 4. Rapid Clicking During Typing

**Problem:** Пользователь может быстро кликать, вызывая проблемы с таймерами.

**Solution:**
```typescript
// Clear all timers on skip
if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
```

### 5. Long Text Overflow

**Problem:** Очень длинный текст может выйти за пределы бокса.

**Solution:**
```css
/* Add max-height and scroll if needed */
TextContainer {
  max-height: 150px;
  overflow-y: auto;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #8B7355;
    border-radius: 3px;
  }
}
```

---

## 📝 Developer Checklist

### Pre-Implementation

- [ ] Изучить `tasks.md` раздел 8.3
- [ ] Ознакомиться с `docs/ARCHITECTURE.md` для UI структуры
- [ ] Проверить зависимости (framer-motion, styled-components, zustand)
- [ ] Подготовить sample dialogue JSON для тестирования
- [ ] Создать placeholder портреты для NPC

### Implementation

- [ ] Создать типы данных для диалогов (`dialogue.ts`)
- [ ] Реализовать `dialogueStore` с Zustand
- [ ] Создать базовый компонент `DialogueBox`
- [ ] Реализовать `TypewriterText` компонент
- [ ] Создать `DialogueChoices` компонент
- [ ] Добавить `DialoguePortrait` компонент
- [ ] Интегрировать с системой действий (addItem, updateAffinity)
- [ ] Настроить загрузку JSON диалогов

### Post-Implementation

- [ ] Написать unit-тесты (покрытие > 80%)
- [ ] Протестировать различные сценарии диалогов
- [ ] Проверить accessibility (keyboard navigation)
- [ ] Оптимизировать производительность
- [ ] Обновить документацию

---

## 🎨 Asset Requirements

### Portraits

| Asset | Format | Size | Notes |
|-------|--------|------|-------|
| NPC Portrait (default) | SVG | 200x200px | Circular frame, hand-drawn style |
| Watercolor wash overlay | PNG | 200x200px | Semi-transparent blue wash |

### Textures

| Asset | Format | Size | Notes |
|-------|--------|------|-------|
| Parchment background | PNG (seamless) | 512x512px | Beige paper texture |
| Hand-drawn border | SVG | N/A | Reusable border element |

### Fonts

- **Primary:** 'Caveat' (Google Fonts) - для рукописного стиля
- **Fallback:** 'Dancing Script', cursive

---

## 🔗 Related Documentation

- [Task 4.1: Dialogue System & Branching](./task4_1.md)
- [Task 7.2: Relationship Tracking](./task7_2.md)
- [Task 5.4: Inventory System](./task5_4.md)
- [docs/ARCHITECTURE.md - State Management](./docs/ARCHITECTURE.md)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 📌 Notes

- **Placeholder Status:** Эта система является упрощенной версией. Полная система ветвления будет реализована в Задаче 4.1
- **Extensibility:** Архитектура должна позволять легкое расширение до полной системы ветвления
- **Localization:** Тексты диалогов должны быть готовы к локализации (использовать i18n keys в JSON)
- **Performance:** Избегать лишних ре-рендеров во время typewriter effect

---

**Status:** Ready for Implementation  
**Last Updated:** 2024  
**Author:** AI Development Assistant
