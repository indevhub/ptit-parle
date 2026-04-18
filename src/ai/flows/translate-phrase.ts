'use server';
/**
 * @fileOverview Flow to translate English phrases to simple French for children.
 * Removed fallback mode to ensure real API connectivity is verified.
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

/**
 * Translates a phrase using Gemini.
 * Throws an error if the translation fails or the API key is invalid.
 */
export async function translatePhrase(input: { englishText: string }) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a friendly, magical French tutor for children. 
    Translate the following English phrase to simple, kid-friendly French. 
    Keep it very simple so a 5-year-old can repeat it.
    
    English Phrase: "${input.englishText}"`,
    output: { schema: TranslatePhraseOutputSchema },
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      ]
    }
  });

  if (!output) {
    throw new Error('Translation failed: No output received from the model. Check your API key and quota.');
  }
  
  return output;
}
