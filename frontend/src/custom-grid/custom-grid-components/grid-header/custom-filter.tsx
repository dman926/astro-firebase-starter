import { forwardRef, useRef } from 'react';
import type { IHeaderParams } from 'ag-grid-community';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface FilterComponentProps {
  showColumnMenu: IHeaderParams['showColumnMenu'];
}

export const FilterComponent = forwardRef<
  HTMLButtonElement,
  FilterComponentProps
>(({ showColumnMenu }, ref) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = () => {
    if (buttonRef.current && showColumnMenu) {
      showColumnMenu(buttonRef.current);
    }
  };

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className="custom-grid-button-bg rounded w-5"
      title="Filter Grid"
      onClick={handleClick}
      data-testid="filter-button"
    >
      <AdjustmentsHorizontalIcon className="h-4 w-5 pointer-events-none" />
    </button>
  );
});
