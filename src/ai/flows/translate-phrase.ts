
'use server';
/**
 * @fileOverview Flow to translate English phrases to simple French for children.
 * Includes a robust fallback mode for prototyping when an API key is not yet configured.
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
  // If the key is the placeholder or missing, trigger fallback
  const isPlaceholderKey = !apiKey || apiKey === 'your_actual_api_key_here' || apiKey.length < 10;

  if (isPlaceholderKey) {
    console.warn('Genkit: No valid API key found. Using mock translation.');
    // Friendly simulated translation for prototyping
    return {
      frenchText: `${input.englishText} (en français ✨)`,
      englishText: input.englishText
    };
  }

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a friendly, magical French tutor for children. 
      Translate the following English phrase to simple, kid-friendly French. 
      Keep it very simple so a 5-year-old can repeat it.
      
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
