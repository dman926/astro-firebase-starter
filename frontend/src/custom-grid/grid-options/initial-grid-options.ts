import type { GridOptions } from 'ag-grid-community';
import { CustomHeader } from '../custom-grid-components/grid-header/custom-header';
import { CustomTooltip } from '../custom-grid-components/custom-tooltip';

interface InitialGridOptionsProps {
  setSelectedType: (
    _callback: (
      _prevType: Record<string, string | null>,
    ) => Record<string, string | null>,
  ) => void;
  setSelectedColumns: (
    _callback: (_prevColumns: string[] | null) => string[],
  ) => void;
  isNumericArray: (_field: string) => boolean;
}

const excludedColumns = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'created_by',
  'modified_by',
  'deleted_by',
];

export function getInitialGridOptions({
  setSelectedType,
  setSelectedColumns,
  isNumericArray,
}: InitialGridOptionsProps): GridOptions {
  return {
    enableRangeSelection: true,
    animateRows: true,
    rowSelection: 'multiple',
    defaultColDef: {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
      editable: (params) =>
        params.colDef.field
          ? !excludedColumns.includes(params.colDef.field)
          : false,
      headerComponent: CustomHeader,
      headerComponentParams: {
        handleSelect: (type: string, column: string) => {
          setSelectedType((prevType) => ({ ...prevType, [column]: type }));
          setSelectedColumns((prevColumns) => [
            ...(Array.isArray(prevColumns) ? prevColumns : []),
            column,
          ]);
        },
        isNumericArray,
      },
      tooltipComponent: CustomTooltip,
      tooltipValueGetter: function (params) {
        return `${params.colDef?.headerName}: ${params.value}`;
      },
    },
    rowGroupPanelShow: 'always',
    enableBrowserTooltips: true,
  };
}
