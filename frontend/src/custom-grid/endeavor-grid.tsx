import { type AgGridReactProps, AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { forwardRef, useMemo } from 'react';
import React from 'react';
export interface RowData {
  [key: string]: string | number | boolean | number[] | null;
}

export interface Options extends AgGridReactProps {}

export const EndeavorGrid = forwardRef<AgGridReact, Options>(
  ({ columnDefs, ...agGridProps }, ref) => {
    const updatedDefs = useMemo(
      () =>
        columnDefs?.map<ColDef>((col) => ({
          ...col,
          minWidth: (col.headerName ?? '').length * 14 + 8 * 2 + 18 * 2 + 45,
        })),
      [columnDefs],
    );

    return (
      <>
        <AgGridReact
          {...agGridProps}
          ref={ref}
          columnDefs={updatedDefs}
          className="ag-theme-alpine"
        />
      </>
    );
  },
);
