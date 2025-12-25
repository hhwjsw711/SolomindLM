

export interface Source {
  id: string;
  title: string;
  type: 'PDF' | 'TXT' | 'WEB';
  date: string;
  selected: boolean;
  content?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: number[];
  timestamp: Date;
}

export interface StudioTool {
  id: string;
  label: string;
  iconName: string; // Storing icon name as string to map in component
  color?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index of correct option
  hint?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Note {
  id: string;
  title: string;
  preview: string;
  type: 'audio' | 'text' | 'quiz' | 'flashcard' | 'report';
  // Content specific fields
  content?: string;
  questions?: QuizQuestion[];
  flashcards?: Flashcard[];
}

export interface NotebookItem {
  id: string;
  title: string;
  date: string;
  sourceCount: number;
  author?: string;
  coverColor?: string; // e.g. 'bg-amber-200'
  icon?: string;
  isFeatured?: boolean;
}