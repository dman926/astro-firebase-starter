import type { FC } from 'react';
import { Button } from '@components/shad-components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@components/shad-components/ui/dialog';
import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmation: FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-slate-900">
        <DialogHeader>
          Are you sure you want to delete the selected row?
        </DialogHeader>
        <div className="flex justify-center space-x-4">
          <Button
            data-testid="confirm-delete"
            variant="destructive"
            className="bg-red-600 rounded"
            onClick={onConfirm}
          >
            Yes
          </Button>
          <Button
            variant={'secondary'}
            className="bg-slate-700 rounded"
            onClick={onCancel}
          >
            No
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmation;
