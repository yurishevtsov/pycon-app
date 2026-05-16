'use client';

import { useFavorites } from '@/lib/useFavorites';

export function FavoriteStar({ talkId, size = 'md' }: { talkId: string; size?: 'sm' | 'md' | 'lg' }) {
  const { favorites, toggle, hydrated } = useFavorites();
  const active = favorites.has(talkId);
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(talkId);
      }}
      className={`${dim} inline-flex items-center justify-center rounded-full text-amber-500 transition-opacity ${
        hydrated ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className={dim} aria-hidden="true">
        <path
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          d="M12 3.4 14.6 9l6.2.5-4.7 4 1.5 6-5.6-3.3-5.6 3.3 1.5-6-4.7-4L9.4 9z"
        />
      </svg>
    </button>
  );
}
