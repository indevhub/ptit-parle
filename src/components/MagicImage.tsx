"use client"

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface MagicImageProps extends Omit<ImageProps, 'src'> {
  wordId: string;
  defaultImageId: string;
}

/**
 * A specialized Image component that checks for user-specific custom images
 * in Firestore before falling back to the default placeholder.
 */
export function MagicImage({ wordId, defaultImageId, alt, ...props }: MagicImageProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const customImageRef = useMemoFirebase(() => {
    if (!firestore || !user || !wordId) return null;
    return doc(firestore, 'users', user.uid, 'customImages', wordId);
  }, [firestore, user, wordId]);

  const { data: customImage } = useDoc(customImageRef);

  const getPlaceholderUrl = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return placeholder?.imageUrl || `https://picsum.photos/seed/${id}/600/600`;
  };

  const getPlaceholderHint = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return placeholder?.imageHint || id;
  };

  const finalSrc = customImage?.url || getPlaceholderUrl(defaultImageId);
  const finalHint = getPlaceholderHint(defaultImageId);

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      data-ai-hint={finalHint}
    />
  );
}
