import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// This initializes Genkit with the Google AI plugin.
// It automatically looks for the GOOGLE_GENAI_API_KEY environment variable.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
