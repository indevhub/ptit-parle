import { VocabularyWord, Achievement } from '../types/learning';

export const VOCABULARY: VocabularyWord[] = [
  { id: '1', french: 'La Pomme', english: 'Apple', imageId: 'apple', category: 'food' },
  { id: '2', french: 'Le Chien', english: 'Dog', imageId: 'dog', category: 'animals' },
  { id: '3', french: 'Le Chat', english: 'Cat', imageId: 'cat', category: 'animals' },
  { id: '4', french: 'Le Soleil', english: 'Sun', imageId: 'nature', category: 'nature' },
  { id: '5', french: "L'Eau", english: 'Water', imageId: 'water', category: 'food' },
  { id: '6', french: 'Le Pain', english: 'Bread', imageId: 'bread', category: 'food' },
  { id: '7', french: 'Le Livre', english: 'Book', imageId: 'book', category: 'school' },
  { id: '8', french: "L'École", english: 'School', imageId: 'school', category: 'school' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_word', title: 'Débutant', description: 'Your first word!', icon: '🌟' },
  { id: 'animal_lover', title: 'Ami des animaux', description: 'All animal words learned!', icon: '🐾' },
  { id: 'foodie', title: 'Gourmet', description: 'All food words learned!', icon: '🍎' },
];