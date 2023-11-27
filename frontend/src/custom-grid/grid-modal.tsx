import type { ChangeEvent } from 'react';
import type { ColDef } from './get-data';
import { Button } from '@components/shad-components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@components/shad-components/ui/dialog';
import React from 'react';

interface ModalProps {
  columnDefs: ColDef[];
  newRowData: Record<string, string | number | boolean | number[] | null>;
  handleInputChange: (
    _e: ChangeEvent<HTMLInputElement>,
    _column: string,
  ) => void;
  addRow: () => void;
  closeModal: () => void;
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

export function Modal({
  columnDefs,
  newRowData,
  handleInputChange,
  addRow,
  closeModal,
}: ModalProps) {
  return (
    <Dialog open={true}>
      <div data-testid="modal" />
      <DialogContent className="bg-slate-700 overflow-auto max-h-screen">
        <DialogHeader>
          <DialogTitle className="text-indigo-600">Add Row</DialogTitle>
          <DialogDescription className="text-white">
            Add a new row to the grid
          </DialogDescription>
        </DialogHeader>
        {columnDefs.map((col) => {
          if (col.field && !excludedColumns.includes(col.field)) {
            return (
              <div key={col.field} className="mb-2 flex items-center">
                <label
                  htmlFor={col.field}
                  className="text-white font-bold mr-2 w-1/4"
                >
                  {col.headerName}:
                </label>
                <input
                  type={col.inputType}
                  id={col.field}
                  value={
                    newRowData[col.field] ? String(newRowData[col.field]) : ''
                  }
                  onChange={(e) => col.field && handleInputChange(e, col.field)}
                  className="border border-black rounded p-1 bg-transparent w-3/4"
                />
              </div>
            );
          }
          return null;
        })}
        <DialogFooter className="flex justify-end">
          <Button
            className="mr-2 bg-indigo-600 text-white rounded"
            data-testid="options-modal-submit"
            onClick={addRow}
          >
            Submit
          </Button>
          <Button
            onClick={closeModal}
            variant="outline"
            className="bg-gray-600 text-white rounded"
            data-testid="modal-cancel-button"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
