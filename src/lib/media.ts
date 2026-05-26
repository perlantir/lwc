/**
 * Resolve a Payload upload field to its public URL.
 * Field shape: number (ID, populated:false) | { url?: string, sizes?: { feature?: { url? }, card?: { url? } } } | null
 */
export type MediaRef =
  | number
  | string
  | null
  | undefined
  | {
      url?: string | null;
      focalX?: number | null;
      focalY?: number | null;
      sizes?: { feature?: { url?: string | null }; card?: { url?: string | null }; thumbnail?: { url?: string | null } };
    };

/** "50% 30%" style focal-point string for CSS object-position / background-position. */
export const mediaFocalPoint = (ref: MediaRef): string => {
  if (!ref || typeof ref === 'number' || typeof ref === 'string') return '50% 50%';
  const x = ref.focalX ?? 50;
  const y = ref.focalY ?? 50;
  return `${x}% ${y}%`;
};

export const mediaUrl = (ref: MediaRef, fallback?: string, preferSize?: 'feature' | 'card' | 'thumbnail'): string | undefined => {
  if (!ref || typeof ref === 'number' || typeof ref === 'string') return fallback;
  if (preferSize && ref.sizes?.[preferSize]?.url) return ref.sizes[preferSize]?.url ?? fallback;
  if (ref.url) return ref.url;
  return fallback;
};
