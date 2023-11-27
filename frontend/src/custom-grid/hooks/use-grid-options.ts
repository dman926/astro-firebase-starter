import { useCallback } from 'react';
import type { GridOptions, ColDef } from 'ag-grid-community';

interface UseGridOptionsProps {
  columnDefs: ColDef[];
  setGridOptions: (newOptions: GridOptions) => void;
  gridOptions: GridOptions;
}

/**
 * Returns the grid options for the ag-grid table such as the column definitions and the detail cell renderer params.
 * @param columnDefs The column definitions for the table.
 * @param gridOptions The initial grid options.
 * @param setGridOptions The function to update the grid options.
 * @returns The grid options for the ag-grid table.
 */
export function useGridOptions({
  columnDefs,
  gridOptions,
  setGridOptions,
}: UseGridOptionsProps) {
  // Use useCallback to memoize the returned object
  return useCallback(() => {
    const options: GridOptions = {
      ...gridOptions,
      columnDefs, // Include columnDefs in the options
    };

    // Function to update grid options
    const updateGridOptions = (newOptions: GridOptions) => {
      setGridOptions(newOptions);
    };

    return { options, updateGridOptions };
  }, [columnDefs, gridOptions, setGridOptions]);
}
