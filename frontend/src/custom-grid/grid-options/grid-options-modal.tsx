import { type ChangeEvent, useState } from 'react';
import type { GridOptions, ColDef } from 'ag-grid-community';
import { deepCopy } from '../../util/deep-copy';
import { RadioButton } from '../../util/radio-button';
import { Button } from '@components/shad-components/ui/button';
import { Card, CardContent } from '@components/shad-components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from '@components/shad-components/ui/dialog';
import { OPTIONS } from './grid-options.ts';
import React from 'react';

interface GridOptionsModalProps {
  onSave: (_newOptions: GridOptions) => void;
  onClose: () => void;
}

type ExtendedGridOptions = GridOptions & Record<string, unknown>;

const isBooleanString = (str: string | boolean) =>
  str === 'true' || str === 'false';
const booleanValue = (str: string | boolean) => str === 'true';

export function GridOptionsModal({ onSave, onClose }: GridOptionsModalProps) {
  const [newOptions, setNewOptions] = useState<GridOptions>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(
    OPTIONS[0].title,
  );

  const updateProperty = (
    obj: GridOptions,
    path: string[],
    value: string | boolean,
  ) => {
    const processedValue = isBooleanString(value) ? booleanValue(value) : value;
    const finalKey = path.pop() as keyof ColDef;
    const targetObj = path.reduce(
      (currentObj: ExtendedGridOptions, key: string) => {
        if (!currentObj[key]) {
          currentObj[key] = {};
        }
        return currentObj[key] as ExtendedGridOptions;
      },
      obj as ExtendedGridOptions,
    );
    (targetObj as Record<string, unknown>)[finalKey] = processedValue;
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const optionsCopy = deepCopy(newOptions);
    let path = name.split('.');
    if (path[0] === 'd') {
      optionsCopy.defaultColDef = optionsCopy.defaultColDef || {};
      path = ['defaultColDef', ...path.slice(1)];
    }
    updateProperty(optionsCopy, path, value);
    setNewOptions(optionsCopy);
  };

  const handleOptionClick = (optionTitle: string) => {
    setSelectedOption(optionTitle);
  };

  const handleSave = () => {
    onSave(newOptions);
    onClose();
  };

  return (
    <Dialog open={true}>
      <div data-testid="grid-options-modal" />
      <DialogContent className="bg-slate-900 max-w-4xl md:h-[calc(40vh)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-indigo-600">
            Customize Grid Options
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add in your own custom options
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/4 bg-slate-800 p-4 border-r border-gray-900 mb-4 lg:mb-0 rounded">
            {OPTIONS.map((overallOption) => (
              <div key={overallOption.title} className="mb-2">
                <Button
                  className={'w-full text-xs'}
                  variant={'ghost'}
                  onClick={() => handleOptionClick(overallOption.title)}
                >
                  {overallOption.title}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex-1 p-4">
            <Card className="h-5/6 rounded bg-slate-800">
              <CardContent>
                <h2 className="text-lg font-bold mb-6 text-indigo-600">
                  {selectedOption}
                </h2>
                {selectedOption &&
                  OPTIONS.map((overallOption) =>
                    selectedOption === overallOption.title
                      ? overallOption.options.map((option) => (
                          <div key={option.name}>
                            <RadioButton
                              name={option.path}
                              values={option.values}
                              selectedValue={
                                option.path.includes('.')
                                  ? newOptions.defaultColDef &&
                                    newOptions.defaultColDef[
                                      option.path.split('.')[1] as keyof ColDef
                                    ]
                                  : newOptions[
                                      option.path.split(
                                        '.',
                                      )[0] as keyof GridOptions
                                    ]
                              }
                              handleRadioChange={handleRadioChange}
                            />
                          </div>
                        ))
                      : null,
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter className="flex justify-end rounded-b-lg mt-4 lg:mt-0">
          <Button onClick={handleSave} className="bg-indigo-600 ml-2 rounded">
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 ml-2 rounded"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GridOptionsModal;
