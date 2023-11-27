import { renderHook } from '@testing-library/react-hooks';
import { test, expect } from 'vitest';
import { useGridOptions } from './use-grid-options';
import { useSparkLines } from './use-spark-lines';
import { GridOptions } from 'ag-grid-community';

// UseGridOptions
test('useGridOptions returns the initial grid options', () => {
  const initialGridOptions: GridOptions = { columnDefs: [] };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setGridOptions = (newOptions: GridOptions) => {
    gridOptions = newOptions;
  };

  const { result } = renderHook(() =>
    useGridOptions({
      columnDefs: [],
      gridOptions: initialGridOptions,
      setGridOptions,
    }),
  );

  expect(result.current().options).toStrictEqual(initialGridOptions);
});

test('useGridOptions updates the grid options', () => {
  const initialGridOptions: GridOptions = { columnDefs: [] };
  let gridOptions: GridOptions = initialGridOptions;
  const setGridOptions = (newOptions: GridOptions) => {
    gridOptions = newOptions;
  };

  const { result } = renderHook(() =>
    useGridOptions({
      columnDefs: [],
      gridOptions: initialGridOptions,
      setGridOptions,
    }),
  );

  const newGridOptions = {
    columnDefs: [{ headerName: 'New Column', field: 'newField' }],
  };
  result.current().updateGridOptions(newGridOptions);

  expect(gridOptions).toBe(newGridOptions);
});

//UseSparkLines
test('useSparkLines returns the expected column definitions', () => {
  const columnDefs = [{ field: 'field1' }, { field: 'field2' }];
  const selectedColumns = ['field1'];
  const selectedType = { field1: 'line', field2: 'numerical' };

  const { result } = renderHook(() =>
    useSparkLines({ columnDefs, selectedColumns, selectedType }),
  );

  expect(result).toBeDefined();

  expect(result.current[0].cellRenderer).toBe('agSparklineCellRenderer');
  expect(result.current[0].cellRendererParams.sparklineOptions.type).toBe(
    'line',
  );
  expect(result.current[0].cellRendererParams.sparklineOptions.fill).toBe(
    '#1FDDDA',
  );

  expect(result.current[1].cellRenderer).toBeUndefined();
  expect(result.current[1].cellRendererParams).toBeUndefined();
});
