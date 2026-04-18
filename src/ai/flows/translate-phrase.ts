
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

/**
 * Translates a phrase using Gemini 1.5 Flash.
 * Falls back to a simulated translation if the API key is missing or invalid.
 */
export async function translatePhrase(input: { englishText: string }) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  // Detect if the key is the default placeholder or too short to be real
  const isPlaceholderKey = !apiKey || apiKey === 'your_actual_api_key_here' || apiKey.length < 10;

  if (isPlaceholderKey) {
    console.warn('Genkit: No valid API key found. Using mock translation for demo.');
    // Simulated translation that looks "magical" for the demo
    return {
      frenchText: `${input.englishText} ✨ (Traduction en cours...)`,
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
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        ]
      }
    });

    if (!output) throw new Error('Translation failed: No output from model');
    return output;
  } catch (error: any) {
    // If the API key is rejected (400) or quota hit, don't crash the app
    console.error('Genkit Translation Error:', error.message);
    
    return {
      frenchText: `${input.englishText} [Mode Démo]`,
      englishText: input.englishText
    };
  }
}
