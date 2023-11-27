import { useState, useMemo, forwardRef, useCallback } from 'react';
import merge from 'ts-deepmerge';
import type {
  CellValueChangedEvent,
  GridApi,
  GridOptions,
} from 'ag-grid-community';
import type { ColDef } from './get-data';
import { type RowData, EndeavorGrid } from './endeavor-grid';
import type { ColDef as AgColDef } from 'ag-grid-community';
import { useSparkLines } from './hooks/use-spark-lines';
import { Modal } from './grid-modal';
import { useGridOptions } from './hooks/use-grid-options';
import { GridOptionsModal } from './grid-options/grid-options-modal';
import { getInitialGridOptions } from './grid-options/initial-grid-options';
import { DeleteConfirmation } from './delete-confirmation';
import { Button } from '@components/shad-components/ui/button';
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react';
import React from 'react';

/**
 * Filters column definitions to exclude known invalid properties.
 * @param {ColDef[]} columnDefs The array of column definitions.
 * @return {ColDef[]} A new array of column definitions without the invalid properties.
 */
function filterValidColumnProps(columnDefs: ColDef[]): AgColDef[] {
  return columnDefs.map<AgColDef>(
    ({ inputType: _inputType, type: _type, ...actualColDef }) => actualColDef,
  );
}

export type CruddyType = 'create' | 'update' | 'delete';
interface GridComponentProps extends AgGridReactProps {
  columnDefs: ColDef[];
  allowGridActions?: boolean;
  onUpdate?: (_amount: number) => void;
  onDataChange?: (
    _crudType: CruddyType,
    _payload: Partial<{ data: RowData; ids: number[] }>,
  ) => Promise<void>;
}

export const GridComponent = forwardRef<AgGridReact, GridComponentProps>(
  (
    {
      rowData,
      columnDefs,
      onUpdate,
      allowGridActions = true,
      onDataChange = () => Promise.resolve(),
      ...agGridProps
    },
    ref,
  ) => {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGridOptionOpen, setIsGridOptionOpen] = useState(false);
    const [newRowData, setNewRowData] = useState<RowData>({});
    const [selectedColumns, setSelectedColumns] = useState<string[] | null>(
      null,
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
      useState(false);
    const [selectedType, setSelectedType] = useState<
      Record<string, string | null>
    >({});
    const [gridOptions, setGridOptions] = useState<GridOptions>(
      getInitialGridOptions({
        setSelectedType,
        setSelectedColumns,
        isNumericArray: (field: string) => {
          if (field) {
            return Boolean(
              rowData?.every((row) => {
                const columnData = row[field];
                return (
                  Array.isArray(columnData) &&
                  columnData.every((item) => typeof item === 'number')
                );
              }),
            );
          }
          return false;
        },
      }),
    );

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      column: string,
    ) => {
      const value = e.target.value;
      const columnDef = columnDefs.find((col) => col.field === column);
      if (columnDef && columnDef.type) {
        switch (columnDef.type) {
          case 'number':
            setNewRowData((prev) => ({ ...prev, [column]: Number(value) }));
            break;
          case 'boolean':
            setNewRowData((prev) => ({ ...prev, [column]: value === 'true' }));
            break;
          default:
            setNewRowData((prev) => ({ ...prev, [column]: value }));
        }
      }
    };

    const handleUpdateCrud = useCallback(
      (params: CellValueChangedEvent) => {
        const { data, column, newValue } = params;
        const colId = column.getColId();
        if (gridApi && !isLoading && colId) {
          setIsLoading(true);
          onDataChange('update', {
            data: { [colId]: newValue },
            ids: [data.id],
          })
            .catch((err) => {
              console.error(err);
              alert('Error updating row');
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
        if (agGridProps.onCellValueChanged) {
          agGridProps.onCellValueChanged(params);
        }
      },
      [agGridProps, gridApi, isLoading, onDataChange],
    );

    const getSelectedData = () => {
      if (gridApi) {
        const selectedData = gridApi.getSelectedRows();
        return selectedData;
      }
    };

    const toggleModal = () => setIsModalOpen((prev) => !prev);

    const toggleGridOption = () => setIsGridOptionOpen((prev) => !prev);

    const toggleDeleteConfirmation = () => {
      const selectedData = getSelectedData();
      if (selectedData && selectedData.length > 0) {
        setIsDeleteConfirmationOpen((prev) => !prev);
      }
    };

    const addRow = () => {
      if (gridApi && !isLoading) {
        setIsLoading(true);
        // optimistically add row assuming backend will succeed
        gridApi.applyTransaction({ add: [newRowData] });
        toggleModal();
        // setNewRowData({});
        onUpdate && onUpdate(1);
        onDataChange('create', { data: newRowData })
          .then(() => {
            console.log('added row', newRowData);
          })
          .catch((err) => {
            console.error(err);
            alert('Error adding row');
            gridApi.applyTransaction({ remove: [newRowData] });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    const deleteRow = () => {
      if (gridApi && !isLoading) {
        const selectedData = getSelectedData();
        if (selectedData && selectedData.length > 0) {
          setIsLoading(true);
          gridApi.applyTransaction({ remove: selectedData });
          onDataChange('delete', {
            ids: selectedData?.map((row) => row.id),
          })
            .catch((err) => {
              console.error(err);
              alert('Error deleting rows');
              gridApi.applyTransaction({ add: selectedData });
            })
            .finally(() => {
              setIsLoading(false);
            });
          onUpdate && onUpdate(-1 * selectedData.length);
        }
      }
    };

    const confirmDelete = () => {
      deleteRow();
      setIsDeleteConfirmationOpen(false);
    };

    const filteredDefs = useMemo(
      () => filterValidColumnProps(columnDefs),
      [columnDefs],
    );

    const newColumnDefs = useSparkLines({
      columnDefs: filteredDefs,
      selectedColumns,
      selectedType,
    });

    const { options, updateGridOptions } = useGridOptions({
      gridOptions: agGridProps.gridOptions
        ? merge(gridOptions, agGridProps.gridOptions)
        : gridOptions,
      columnDefs: newColumnDefs,
      setGridOptions: (newOptions) =>
        setGridOptions((currGridOptions) => merge(currGridOptions, newOptions)),
    })();

    return (
      <div className="ag-theme-custom p-4 h-screen w-full">
        {allowGridActions && (
          <>
            <Button
              onClick={toggleModal}
              variant="outline"
              className="md:py-2 md:px-4 md:text-sm text-xs m-1 hover:bg-green-400 hover:text-white"
              data-testid="add-row-button"
            >
              Add Row
            </Button>
            <Button
              onClick={toggleDeleteConfirmation}
              variant="outline"
              className="md:py-2 md:px-4 md:text-sm text-xs m-1 hover:bg-red-400 hover:text-white"
              data-testid="delete-row-button"
            >
              Delete Selected Row
            </Button>
            <Button
              onClick={toggleGridOption}
              variant="outline"
              className="md:py-2 md:px-4 md:text-sm text-xs m-1 hover:bg-blue-400 hover:text-white hidden"
              data-testid="edit-options-button"
            >
              Edit Options
            </Button>
          </>
        )}
        {isDeleteConfirmationOpen && (
          <DeleteConfirmation
            isOpen={isDeleteConfirmationOpen}
            onCancel={toggleDeleteConfirmation}
            onConfirm={confirmDelete}
          />
        )}
        {isGridOptionOpen && (
          <GridOptionsModal
            onClose={toggleGridOption}
            onSave={updateGridOptions}
          />
        )}
        {isModalOpen && (
          <Modal
            columnDefs={columnDefs}
            newRowData={newRowData}
            handleInputChange={handleInputChange}
            addRow={addRow}
            closeModal={toggleModal}
          />
        )}
        <EndeavorGrid
          {...agGridProps}
          ref={ref}
          key={`${selectedColumns}-${selectedType}-${JSON.stringify(options)}`}
          rowData={rowData}
          columnDefs={newColumnDefs}
          gridOptions={options}
          onGridReady={(params) => {
            setGridApi(params.api);
            if (agGridProps.onGridReady) {
              agGridProps.onGridReady(params);
            }
          }}
          onCellValueChanged={handleUpdateCrud}
        />
      </div>
    );
  },
);

export default GridComponent;
