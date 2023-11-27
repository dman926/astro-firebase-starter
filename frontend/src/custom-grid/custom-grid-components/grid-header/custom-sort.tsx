import { useMemo, useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import React from 'react';

type SortOrder = 'asc' | 'desc' | null;

interface SortOption {
  order: SortOrder;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'>
  >;
}

interface SortComponentProps {
  onSortRequested: (_order: 'asc' | 'desc' | null) => void;
}

const sortOptions: SortOption[] = [
  { order: null, icon: Bars3Icon },
  { order: 'asc', icon: ArrowUpIcon },
  { order: 'desc', icon: ArrowDownIcon },
];

export function SortComponent({ onSortRequested }: SortComponentProps) {
  const [sortOrder, setSortOrder] = useState(0);

  const handleSort = (ev: React.SyntheticEvent<unknown>) => {
    ev.preventDefault();
    setSortOrder((prevSortOrder) => {
      const nextIndex = (prevSortOrder + 1) % sortOptions.length;
      onSortRequested(sortOptions[nextIndex].order);
      return nextIndex;
    });
  };

  const Icon = useMemo(() => sortOptions[sortOrder].icon, [sortOrder]);

  return (
    <button
      onClick={handleSort}
      className="custom-grid-button-bg rounded w-5"
      title="Sort Grid"
      data-testid="sort-button"
    >
      <Icon className="custom-grid-text h-4 w-5 pointer-events-none" />
    </button>
  );
}
