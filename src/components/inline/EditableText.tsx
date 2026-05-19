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
      const body: Record<string, unknown> = {};
      let cursor = body;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i] as string;
        const nextKey = parts[i + 1] as string;
        const nextIsIndex = /^\d+$/.test(nextKey);
        cursor[key] = nextIsIndex ? [] : {};
        cursor = cursor[key] as Record<string, unknown>;
      }
      const lastKey = parts[parts.length - 1] as string;
      if (/^\d+$/.test(lastKey)) {
        (cursor as unknown as unknown[])[Number(lastKey)] = newValue;
      } else {
        cursor[lastKey] = newValue;
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
      // Nudge parent admin to refresh its form state if listening
      window.parent?.postMessage(
        { type: 'lwc-inline-saved', globalSlug, fieldPath, value: newValue },
        '*',
      );
      window.location.reload();
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
