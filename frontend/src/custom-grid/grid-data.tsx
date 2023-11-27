import { type CruddyType, GridComponent } from './grid-component';
import type { CrudType, Table, TableData } from '@/types/crud-type';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RestApiDataSource, getColumnDefs, type ColDef } from './get-data';
import type { RowData } from './endeavor-grid';
import { CrudFunc } from '@/crud-func/crud-func';
import type { GridOptions } from 'ag-grid-community';
import React from 'react';

export interface GridDataProps {
  tableName: Table;
}

export function GridData({ tableName }: GridDataProps) {
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [_rowData, setRowData] = useState<Array<TableData<typeof tableName>>>(
    [],
  );
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const rowCount = useRef<number | undefined>(undefined);
  // useEffect(() => {
  //   getData(tableName).then((data) => {
  //     if (data) {
  //       setRowData(data.rowData);
  //       setColumnDefs(data.colDefs);
  //     }
  //   });
  // }, [tableName]);

  useEffect(() => {
    CrudFunc({
      crud_type: 'read',
      table: tableName,
      limit: 1,
    })
      .then(({ data, error }) => {
        const { rowData, count } = data;
        if (!error) {
          setColumnDefs(getColumnDefs(rowData));
          rowCount.current = count;
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tableName]);

  const handleUpdate = useCallback(
    async <T extends CruddyType>(
      crudType: T,
      { data, ids }: Partial<{ data: RowData; ids: number[] }>,
    ) => {
      if ((crudType === 'create' || crudType === 'update') && !data) {
        throw new Error('Missing data');
      }
      if ((crudType === 'update' || crudType === 'delete') && !ids) {
        throw new Error('Missing ids');
      }

      const crudFuncPayload: Partial<CrudType<typeof tableName>> = {
        crud_type: crudType,
        table: tableName,
      };

      if (
        crudFuncPayload.crud_type === 'update' ||
        crudFuncPayload.crud_type === 'delete'
      ) {
        crudFuncPayload.ids = ids!;
      }
      if (
        crudFuncPayload.crud_type === 'create' ||
        crudFuncPayload.crud_type === 'update'
      ) {
        crudFuncPayload.data = data;
      }

      const {
        data: { rowData: crudData },
        error,
      } = await CrudFunc(crudFuncPayload as CrudType<typeof tableName>);
      if (error) {
        throw error;
      }

      if (crudData) {
        setRowData((currRowData) => {
          switch (crudType) {
            case 'create':
              currRowData.push(...crudData);
              break;
            case 'update':
              currRowData
                .filter(({ id }) => ids!.includes(id))
                .forEach((row) => {
                  const updatedRow = crudData.find(({ id }) => id === row.id);
                  if (updatedRow) {
                    Object.assign(row, updatedRow);
                  }
                });
              break;
            case 'delete': {
              currRowData = currRowData.filter((row) => !ids!.includes(row.id));
              break;
            }
          }

          return currRowData;
        });
      }
    },
    [tableName],
  );

  const options = useMemo<GridOptions>(
    () => ({
      rowModelType: 'infinite',
      pagination: true,
      cacheBlockSize: 1000,
      maxBlocksInCache: 3,
      // rowCount.current isn't quite right since it won't be initalized in time
      datasource: new RestApiDataSource(tableName, rowCount.current),
    }),
    [tableName],
  );

  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <GridComponent
      // rowData={rowData}
      columnDefs={columnDefs}
      onDataChange={handleUpdate}
      gridOptions={options}
      rowModelType="infinite"
    />
  );
}

export default GridData;
