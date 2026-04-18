
'use server';
/**
 * @fileOverview Flow to translate English phrases to simple French for children.
 * Includes a fallback mode for prototyping when an API key is not yet configured.
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
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  const isPlaceholderKey = !apiKey || apiKey.includes('your_actual_api_key');

  if (isPlaceholderKey) {
    console.warn('Genkit: Using mock translation because GOOGLE_GENAI_API_KEY is not set.');
    // Simple mock translation for prototyping
    return {
      frenchText: `${input.englishText} (en français)`,
      englishText: input.englishText
    };
  }

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a friendly French tutor for children. Translate the following English phrase to simple, kid-friendly French. 
      The translation should be grammatically correct but easy for a 5-year-old to say.
      
      English Phrase: "${input.englishText}"`,
      output: { schema: TranslatePhraseOutputSchema },
    });

    if (!output) throw new Error('Translation failed: No output from model');
    return output;
  } catch (error: any) {
    console.error('Genkit Translation Error:', error);
    
    // Fallback if the API call fails (e.g. invalid key or quota)
    return {
      frenchText: `${input.englishText} [Traduction]`,
      englishText: input.englishText
    };
  }
}
