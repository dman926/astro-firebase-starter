import type { Table, TableData } from '@/types/crud-type';
import type {
  IDatasource,
  IGetRowsParams,
  ColDef as OGColDef,
} from 'ag-grid-community';
import type { RowData } from './endeavor-grid';
import type { InputHTMLAttributes } from 'react';
import { CrudFunc } from '../../../crud-func/crud-func';

export interface ColDef extends OGColDef {
  inputType: InputHTMLAttributes<HTMLInputElement>['type'];
}
/**
 * Generates column definitions for a given row data array.
 * @param rowData Array of row data objects.
 * @returns Array of column definitions.
 */
export function getColumnDefs(rowData: RowData[]): ColDef[] {
  // Ensure rowData is not empty to avoid accessing undefined index
  if (!rowData.length) {
    return [];
  }

  /**
   * Determines the input type based on the value type.
   * @param valueType The type of the value.
   * @returns The corresponding input type.
   */
  function determineInputType(valueType: string): string {
    const typeMap: { [key: string]: string } = {
      number: 'number',
      boolean: 'checkbox',
    };

    return typeMap[valueType] || 'text';
  }

  /**
   * Gets the appropriate filter type based on the field type.
   * @param fieldType The field type of the column.
   * @returns The corresponding filter type or undefined.
   */
  function getFilterType(fieldType: string): string | undefined {
    const inputType = determineInputType(fieldType);
    const filterMap: { [key: string]: string } = {
      number: 'agNumberColumnFilter',
      text: 'agTextColumnFilter',
    };

    return filterMap[inputType];
  }

  function capitalizeFirstLetter(str: string): string {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  }

  // Map each key in the first row to a column definition
  return Object.keys(rowData[0]).map((field) => {
    // Determine the type of the field only once
    const type = typeof rowData[0][field];

    return {
      field,
      type,
      headerName: capitalizeFirstLetter(field),
      inputType: determineInputType(type),
      filter: getFilterType(type),
    };
  });
}

export async function getData<T extends Table>(
  tableName: T,
): Promise<{ rowData: Array<TableData<T>>; colDefs: ColDef[] } | null> {
  const {
    data: { rowData },
    error,
  } = await CrudFunc({
    crud_type: 'read',
    table: tableName,
  });
  if (error) {
    throw error;
  }
  if (rowData) {
    const colDefs = getColumnDefs(rowData);
    return { rowData, colDefs };
  }
  return null;
}

export class RestApiDataSource implements IDatasource {
  table: Table;
  rowCount?: number;

  constructor(table: Table, initialRowCount?: number) {
    this.table = table;
    this.rowCount = initialRowCount;
  }

  getRows({
    startRow,
    endRow,
    successCallback,
    failCallback,
    sortModel,
    filterModel,
  }: IGetRowsParams) {
    const pageSize = endRow - startRow;
    const page = Math.floor(startRow / pageSize);
    CrudFunc({
      crud_type: 'read',
      table: this.table,
      page: startRow && endRow ? page : undefined,
      limit: startRow && endRow ? pageSize : undefined,
      sort: sortModel,
      filter: filterModel,
    })
      .then(({ data: { rowData, count }, error }) => {
        if (error) {
          failCallback();
          return;
        }
        this.rowCount = count;
        successCallback(rowData, this.rowCount);
      })
      .catch(() => failCallback());
  }
}
