import { useState } from 'react';
import type { IHeaderParams } from 'ag-grid-community';
import { FilterComponent } from './custom-filter';
import { SortComponent } from './custom-sort';
import { toTitleCase } from '../../../util/to-title-case';
import React from 'react';

interface CustomHeaderProps extends IHeaderParams {
  handleSelect: (_type: string, _field: string | undefined) => void;
  isNumericArray: (_field: string) => boolean;
}

export function CustomHeader(params: CustomHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { column, handleSelect, isNumericArray } = params;
  const { field } = column.getColDef();

  const toggleOpen = () => {
    if (field && isNumericArray(field)) {
      setIsOpen(!isOpen);
    }
  };

  const selectOption = (type: string) => {
    if (type === 'cancel') {
      setIsOpen(false);
    } else {
      handleSelect(type, field);
      setIsOpen(false);
    }
  };

  const options = ['Line', 'Column', 'Area', 'Bar', 'Numerical', 'Cancel'];

  const onSortRequested = (order: 'asc' | 'desc' | null) => {
    const currentSortModel = params.columnApi.getColumnState();
    const newSortModel = currentSortModel.map((columnState) => {
      if (columnState.colId === field) {
        return { ...columnState, sort: order };
      } else {
        return columnState;
      }
    });
    setTimeout(() => {
      params.columnApi.applyColumnState({
        state: newSortModel,
        defaultState: { sort: null },
      });
    }, 0);
  };

  return (
    <div className="flex w-full items-center">
      {!isOpen && (
        <>
          <button
            className="custom-grid-button-bg font-bold rounded lg:text-sm text-xs px-2"
            onClick={toggleOpen}
            title="Open Sparkline Options (if applicable)"
            data-testid="grid-header"
          >
            {toTitleCase(params.displayName)}
          </button>
          <span className="grow" />
          <div className="flex gap-x-1">
            {column.getColDef().filter && (
              <FilterComponent showColumnMenu={params.showColumnMenu} />
            )}
            {column.getColDef().sortable && (
              <SortComponent
                onSortRequested={(order) =>
                  onSortRequested(order as 'asc' | 'desc' | null)
                }
              />
            )}
          </div>
        </>
      )}
      {isOpen && (
        <div className="absolute shadow-lg">
          {options.map((option, index) => (
            <button
              key={index}
              className="pr-1 text-green-400 hover:text-white"
              onClick={() => selectOption(option.toLowerCase())}
              data-testid="sparkline-options"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomHeader;
