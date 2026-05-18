import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

type Paths = string[];

export const revalidateFrontend = (
  paths: Paths,
): CollectionAfterChangeHook & CollectionAfterDeleteHook => {
  return async ({ req }) => {
    if (req.context?.disableRevalidate) return;
    try {
      const { revalidatePath } = await import('next/cache');
      for (const p of paths) revalidatePath(p);
    } catch {
      // not running in a Next.js context (e.g. payload migration); silently skip
    }
  };
};

export const revalidateGlobal = (
  paths: Paths,
) => async ({ req }: { req: { context?: Record<string, unknown> } }) => {
  if (req.context?.disableRevalidate) return;
  try {
    const { revalidatePath } = await import('next/cache');
    for (const p of paths) revalidatePath(p);
  } catch {
    // ignore outside Next.js
  }
};
