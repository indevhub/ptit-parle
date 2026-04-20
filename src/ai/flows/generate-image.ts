'use server';
/**
 * @fileOverview Flow to generate illustrations using Imagen 3 on the Google AI Free Tier.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  word: z.string().describe('The word to generate an illustration for.'),
});

export async function generateWordImage(input: { word: string }): Promise<string | undefined> {
  return generateWordImageFlow(input);
}

export const generateWordImageFlow = ai.defineFlow(
  {
    name: 'generateWordImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: z.string().optional(),
  },
  async (input) => {
    /**
     * Using the 'imagen-3' alias which is standard for the Google AI Free Tier.
     * If this 404s, run the Debug Models tool in the UI to find your region's ID.
     */
    const response = await ai.generate({
      model: 'googleai/imagen-3',
      prompt: `Generate a cute, colorful, kid-friendly cartoon illustration of "${input.word}" for a children's language learning app. High quality, vibrant colors, clean white background, no text in image.`,
    });

    const media = response.media;

    if (!media || !media.url) {
      throw new Error('The magic artist returned an empty response. This usually means the prompt was blocked by safety filters or your quota (429) was reached.');
    }

    return media.url;
  }
);
