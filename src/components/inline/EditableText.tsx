'use client';

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Tag = 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'a';

/**
 * Inline-editable text wrapper.
 *
 * Renders as plain content when not in preview mode. When iframed inside the
 * Payload admin, hovering shows a thin cyan outline. Clicking turns the element
 * into a `contenteditable`. Blur sends a POST to /api/globals/[slug] with the
 * updated field path — the admin form will reflect the change on its next load.
 *
 * Field path supports dotted paths and array indices: `programCards.0.title`.
 */
export const EditableText = ({
  globalSlug,
  fieldPath,
  value,
  as = 'span',
  multiline = false,
  className,
  style,
  children,
}: {
  globalSlug: string;
  fieldPath: string;
  value: string | undefined | null;
  as?: Tag;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsPreview(typeof window !== 'undefined' && window.self !== window.top);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => {
      ref.current?.focus();
      // place cursor at end
      const range = document.createRange();
      range.selectNodeContents(ref.current as Node);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  };

  const handleBlur = async (e: React.FocusEvent<HTMLElement>) => {
    if (!isPreview) return;
    const newValue = (e.currentTarget.innerText ?? '').trim();
    setEditing(false);
    if (newValue === (value ?? '').trim()) return;
    try {
      setSaving(true);
      const parts = fieldPath.split('.');
      const hasArrayIndex = parts.some((p) => /^\d+$/.test(p));
      let body: Record<string, unknown>;
      if (hasArrayIndex) {
        // Fetch the full current global, mutate the field at the dotted path,
        // and POST the merged top-level field back. This is needed for arrays
        // because Payload replaces arrays on POST rather than merging.
        const cur = await fetch(`/api/globals/${globalSlug}?depth=0`, {
          credentials: 'include',
        }).then((r) => r.json());
        const rootKey = parts[0] as string;
        // Deep clone the slice we mutate
        const sliceClone: unknown = JSON.parse(JSON.stringify(cur[rootKey] ?? []));
        // Walk into the slice and set the leaf
        let cursorRef: any = sliceClone;
        for (let i = 1; i < parts.length - 1; i++) {
          const k = parts[i] as string;
          cursorRef = /^\d+$/.test(k) ? cursorRef[Number(k)] : cursorRef[k];
        }
        const lastKey = parts[parts.length - 1] as string;
        if (/^\d+$/.test(lastKey)) cursorRef[Number(lastKey)] = newValue;
        else cursorRef[lastKey] = newValue;
        body = { [rootKey]: sliceClone };
      } else {
        body = {};
        let cursor: Record<string, unknown> = body;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i] as string;
          cursor[key] = {};
          cursor = cursor[key] as Record<string, unknown>;
        }
        cursor[parts[parts.length - 1] as string] = newValue;
      }
      const res = await fetch(`/api/globals/${globalSlug}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        // eslint-disable-next-line no-console
        console.error('[inline-edit] save failed', res.status, txt);
        return;
      }
      // Tell parent admin to reload — its listener reloads the whole page,
      // which also reloads this iframe so both panes show the new value.
      window.parent?.postMessage(
        { type: 'lwc-inline-saved', globalSlug, fieldPath, value: newValue },
        '*',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      e.currentTarget.innerText = value ?? '';
      e.currentTarget.blur();
    }
  };

  const previewClass = isPreview
    ? `cursor-text outline-1 outline-transparent hover:outline hover:outline-cyan hover:outline-dashed transition-[outline] ${editing ? 'outline outline-cyan' : ''} ${saving ? 'opacity-60' : ''}`
    : '';

  return createElement(
    as,
    {
      ref,
      contentEditable: editing,
      suppressContentEditableWarning: true,
      onClick: handleClick,
      onBlur: handleBlur,
      onKeyDown: handleKey,
      className: [className, previewClass].filter(Boolean).join(' '),
      style,
      'data-lwc-field': fieldPath,
      'data-lwc-global': globalSlug,
    },
    children ?? value ?? '',
  );
};
