
'use server';
/**
 * @fileOverview Flow to translate English phrases to simple French for children.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslatePhraseInputSchema = z.object({
  englishText: z.string().describe('The English phrase to translate.'),
});

const TranslatePhraseOutputSchema = z.object({
  frenchText: z.string().describe('The translated French phrase.'),
  englishText: z.string().describe('The original English phrase.'),
});

export async function translatePhrase(input: { englishText: string }) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Translate the following English phrase to French for a children's language learning app. 
    The translation should be simple, grammatically correct, and suitable for a child (ages 4-10).
    
    English Phrase: "${input.englishText}"`,
    output: { schema: TranslatePhraseOutputSchema },
  });

  if (!output) throw new Error('Translation failed');
  return output;
}
