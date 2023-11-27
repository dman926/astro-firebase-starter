import type { FC, ChangeEvent } from 'react';
import React from 'react';

interface RadioButtonProps {
  name: string;
  values: (string | boolean)[];
  selectedValue: string | boolean | undefined;
  handleRadioChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButton: FC<RadioButtonProps> = ({
  name,
  values,
  selectedValue,
  handleRadioChange,
}) => {
  const title = name.includes('.') ? name.split('.')[1] : name;
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1) + ':';

  return (
    <div className="mb-4">
      <span className="text-white font-bold mr-2 text-sm">
        {formattedTitle}
      </span>
      {values.map((value, index) => (
        <label key={index} className="inline-flex items-center ml-2">
          <input
            type="radio"
            name={name}
            value={value.toString()}
            checked={
              selectedValue !== undefined &&
              selectedValue.toString() === value.toString()
            }
            onChange={handleRadioChange}
            className="form-radio"
            data-testid="radio-button"
          />
          <span className="ml-2 text-white text-xs md:text-sm">
            {value.toString().charAt(0).toUpperCase() +
              value.toString().slice(1)}
          </span>
        </label>
      ))}
    </div>
  );
};
