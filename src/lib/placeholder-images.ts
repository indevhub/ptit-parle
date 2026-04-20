import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * Centralized source for all placeholder image data, sourced from
 * the main configuration file in src/app/lib/placeholder-images.json.
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
