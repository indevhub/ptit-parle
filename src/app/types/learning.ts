export interface VocabularyWord {
  id: string;
  french: string;
  english: string;
  imageId: string;
  category: 'animals' | 'food' | 'nature' | 'school';
}

export interface UserProgress {
  stars: number;
  completedWordIds: string[];
  badges: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}