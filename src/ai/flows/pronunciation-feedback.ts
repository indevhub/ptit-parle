'use server';
/**
 * @fileOverview This file implements a Genkit flow for assessing French pronunciation.
 *
 * - pronunciationFeedback - A function that handles the pronunciation assessment process.
 * - PronunciationFeedbackInput - The input type for the pronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the pronunciationFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PronunciationFeedbackInputSchema = z.object({
  recordedAudioDataUri: z
    .string()
    .describe(
      "The child's recorded French speech as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetPhrase: z
    .string()
    .describe('The correct French word or phrase that the child was supposed to say.'),
});
export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  feedback: z.string().describe('A simple feedback message about the pronunciation.'),
  isGoodPronunciation: z
    .boolean()
    .describe('True if the pronunciation was considered good, false otherwise.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('An optional confidence score (0-1) for the pronunciation quality.'),
});
export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;

export async function pronunciationFeedback(
  input: PronunciationFeedbackInput
): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}

const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: { schema: PronunciationFeedbackInputSchema },
  output: { schema: PronunciationFeedbackOutputSchema },
  prompt: `You are an expert French language tutor specializing in children's pronunciation.
  
  Your task is to listen to the provided audio of a child speaking French and compare it to the target French phrase.
  Provide a simple and encouraging feedback message.
  Determine if the pronunciation is "good" (meaning it's understandable and close to native pronunciation) or if it needs more practice.
  Optionally, provide a confidence score between 0 (very poor) and 1 (excellent) if you can estimate it.

  If the pronunciation is good, set isGoodPronunciation to true and give positive feedback like "Magnifique!" or "Très bien!".
  If it needs more practice, set isGoodPronunciation to false and offer gentle encouragement like "Almost there, try again!" or "Listen carefully and repeat!".

  Target French Phrase: "{{{targetPhrase}}}"
  Child's Recorded Speech: {{media url=recordedAudioDataUri}}`,
});

const pronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'pronunciationFeedbackFlow',
    inputSchema: PronunciationFeedbackInputSchema,
    outputSchema: PronunciationFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await pronunciationFeedbackPrompt(input);
    if (!output) {
      throw new Error('No output received from pronunciation feedback prompt.');
    }
    return output;
  }
);
