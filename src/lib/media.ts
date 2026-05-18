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
      sizes?: { feature?: { url?: string | null }; card?: { url?: string | null }; thumbnail?: { url?: string | null } };
    };

export const mediaUrl = (ref: MediaRef, fallback?: string, preferSize?: 'feature' | 'card' | 'thumbnail'): string | undefined => {
  if (!ref || typeof ref === 'number' || typeof ref === 'string') return fallback;
  if (preferSize && ref.sizes?.[preferSize]?.url) return ref.sizes[preferSize]?.url ?? fallback;
  if (ref.url) return ref.url;
  return fallback;
};
