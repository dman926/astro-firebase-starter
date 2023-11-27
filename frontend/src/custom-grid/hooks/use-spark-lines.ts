import { useMemo } from 'react';
import { deepCopy } from '../../util/deep-copy';
import type { ColDef } from 'ag-grid-community';

interface UseMasterColumnDefsProps {
  columnDefs: ColDef[];
  selectedColumns: string[] | null;
  selectedType: Record<string, string | null>;
}

export function useSparkLines({
  columnDefs,
  selectedColumns,
  selectedType,
}: UseMasterColumnDefsProps) {
  return useMemo(
    () =>
      columnDefs.map(deepCopy).map((colDef) => {
        if (colDef.field) {
          const type = selectedType[colDef.field];
          if (
            selectedColumns?.includes(colDef.field as string) &&
            type !== 'numerical'
          ) {
            colDef.cellRenderer = 'agSparklineCellRenderer';
            colDef.cellRendererParams = {
              sparklineOptions: {
                type: type,
                fill: '#1FDDDA',
              },
            };
          } else if (type === 'numerical') {
            delete colDef.cellRenderer;
            delete colDef.cellRendererParams;
          }
        }
        return colDef;
      }),
    [columnDefs, selectedColumns, selectedType],
  );
}

export default useSparkLines;
