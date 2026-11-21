import React from 'react';
import { OpenSpec } from './spec';

export interface GameProps {
  onBack: () => void;
}

export interface StoryChapter {
  title: string;
  illustration: string;
  text: string;
}

export type DomainCategory = 'addition' | 'subtraction' | 'counting-logic' | 'coordinate-geometry' | 'all';

export interface GameCard {
  id: string;
  name: string;
  component: React.ComponentType<GameProps>;
  icon: string | React.ReactNode;
  domainId: 'addition' | 'subtraction' | 'counting-logic' | 'coordinate-geometry';
  levelsCount: number;
  tags: string[];
}

export interface GameModule {
  spec: OpenSpec;
  Component: React.ComponentType<GameProps>;
}
