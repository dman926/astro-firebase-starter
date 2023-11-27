// import { afterEach, test } from 'vitest';
// import {
//   cleanup,
//   render,
//   screen,
//   waitForElementToBeRemoved,
// } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { CruddyType, GridComponent } from './grid-component';
// import data from '../../../mock-data/mock-test.json';
// import { getColumnDefs } from './get-data';
// import { RowData } from './endeavor-grid';
// import React from 'react';

// const columnDefs = getColumnDefs(data);

// const setup = () => {
//   const mockOnRealUpdate = vi.fn(
//     (
//       _crudType: CruddyType,
//       _payload: Partial<{ data: RowData; ids: number[] }>,
//     ) => {
//       // Mock implementation or return a resolved promise if it's asynchronous
//       return Promise.resolve();
//     },
//   );

//   render(
//     <GridComponent
//       rowData={data}
//       columnDefs={columnDefs}
//       onDataChange={mockOnRealUpdate}
//     />,
//   );
// };

// afterEach(() => {
//   cleanup();
// });

// test('GridComponent renders buttons and edit options modal correctly', async () => {
//   setup();

//   const addButton = screen.getByTestId('add-row-button');
//   const deleteButton = screen.getByTestId('delete-row-button');
//   const editOptionsButton = screen.getByTestId('edit-options-button');

//   // Confirm button presence
//   expect(addButton).toBeInTheDocument();
//   expect(deleteButton).toBeInTheDocument();
//   expect(editOptionsButton).toBeInTheDocument();

//   expect(addButton).toBeInTheDocument();

//   // Modal should not be in the document until someone gets click happy
//   const modal = screen.queryByTestId('modal');
//   expect(modal).toBeFalsy();

//   await userEvent.click(editOptionsButton);
//   const optionsModal = screen.getByTestId('grid-options-modal');
//   expect(optionsModal).toBeInTheDocument();
// });
// test('GridComponent renders header correctly', async () => {
//   setup();

//   const header = screen.getAllByTestId('grid-header');
//   const sortButton = screen.getAllByTestId('sort-button');
//   const filterButton = screen.getAllByTestId('filter-button');
//   const sparklineButton = screen.getByText('Sales');

//   await userEvent.click(sparklineButton);

//   const sparklineOption = screen.getAllByTestId('sparkline-options');

//   expect(sparklineOption.length).toBeGreaterThan(0);
//   expect(header.length).toBeGreaterThan(0);
//   expect(sortButton.length).toBeGreaterThan(0);
//   expect(filterButton.length).toBeGreaterThan(0);
// });

// test('GridComponent can add a new row', async () => {
//   setup();

//   const addButton = screen.getByTestId('add-row-button');
//   await userEvent.click(addButton);

//   const inputName = screen.getByLabelText('Name:');
//   await userEvent.type(inputName, 'Mary Sue');

//   const saveButton = screen.getByTestId('options-modal-submit');
//   await userEvent.click(saveButton);

//   const newRow = screen.getByText('Mary Sue');
//   expect(newRow).toBeInTheDocument();
// });

// test('GridComponent can delete a row', async () => {
//   setup();
//   const selectRow = screen.getByText('MockName');

//   await userEvent.click(selectRow);

//   const deleteButton = screen.getByTestId('delete-row-button');
//   await userEvent.click(deleteButton);

//   const confirmButton = screen.getByTestId('confirm-delete');
//   await userEvent.click(confirmButton);

//   await waitForElementToBeRemoved(selectRow);

//   const deletedRow = screen.queryByText('MockName');
//   expect(deletedRow).not.toBeInTheDocument();
// });
