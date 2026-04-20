
"use client"

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MagicImageProps extends Omit<ImageProps, 'src'> {
  wordId: string;
  defaultImageId?: string;
}

/**
 * A specialized Image component that checks for user-specific custom images
 * in Firestore. Shows a Skeleton while loading and falls back to a 
 * generic seed-based placeholder if no custom image exists.
 */
export function MagicImage({ wordId, defaultImageId, alt, className, ...props }: MagicImageProps) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const customImageRef = useMemoFirebase(() => {
    if (!firestore || !user || !wordId) return null;
    return doc(firestore, 'users', user.uid, 'customImages', wordId);
  }, [firestore, user, wordId]);

  const { data: customImage, isLoading: isDocLoading } = useDoc(customImageRef);

  const isLoading = isAuthLoading || isDocLoading;

  if (isLoading) {
    return (
      <div className={cn("relative w-full h-full min-h-[100px] overflow-hidden rounded-[inherit]", className)}>
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse bg-muted" />
      </div>
    );
  }

  // Use a stable seed based on the wordId for the generic fallback
  const fallbackUrl = `https://picsum.photos/seed/${wordId || 'default'}/600/600`;
  const finalSrc = customImage?.url || fallbackUrl;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      className={cn("transition-opacity duration-500", className)}
      data-ai-hint={alt}
    />
  );
}
