export type ThemeMode = 'light' | 'dark';

export interface CelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  stars?: number;
  totalQuestions?: number;
  onNextLevel?: () => void;
  onReplay?: () => void;
}

export interface QuizLayoutProps {
  title: string;
  subtitle?: string;
  category?: string;
  onBack?: () => void;
  onOpenStory?: () => void;
  stars?: number;
  level?: number;
  children: React.ReactNode;
}

export interface GameStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
  storyText?: string;
  chapters?: Array<{
    title: string;
    illustration?: string;
    text: string;
  }>;
  onStartActivity?: () => void;
}

export interface OpenSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: any;
}
