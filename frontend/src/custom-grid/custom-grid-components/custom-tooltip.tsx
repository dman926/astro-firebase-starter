import type { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

export function CustomTooltip(params: ICellRendererParams) {
  const tooltipValue =
    params.node && params.column
      ? params.node.data[params.column.getColId()]
      : '';

  return (
    <div>
      <span>{tooltipValue}</span>
    </div>
  );
}

export default CustomTooltip;
