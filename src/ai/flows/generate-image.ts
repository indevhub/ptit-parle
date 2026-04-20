
'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating illustrations for vocabulary words.
 *
 * - generateWordImage - A function that handles the image generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

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
    // We use gemini-2.5-flash-image for multimodal generation
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: `A cute, colorful, kid-friendly cartoon illustration of "${input.word}" for a children's language learning app. High quality, vibrant colors, clean white background, no text in image.`,
      config: {
        // Critical: Gemini 2.5 Flash Image requires both TEXT and IMAGE modalities to be specified
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('The magic mirror returned an empty response. This usually happens if the AI artist is resting (quota) or the prompt was blocked by safety filters.');
    }

    return media.url;
  }
);
