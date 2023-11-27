// import { RowData } from './endeavor-grid';
// import { getColumnDefs } from './get-data';

// describe('getColumnDefs Tests', () => {
//   // Test with empty row data
//   it('should return an empty array for empty row data', () => {
//     expect(getColumnDefs([])).toEqual([]);
//   });

//   // Test with mixed data types
//   it('should handle row data with mixed data types', () => {
//     const rowData = [
//       { id: 1, name: 'John', isActive: true },
//       { id: 2, name: 'Jane', isActive: false },
//     ];

//     const expected = [
//       {
//         headerName: 'Id',
//         field: 'id',
//         type: 'number',
//         inputType: 'number',
//         filter: 'agNumberColumnFilter',
//       },
//       {
//         headerName: 'Name',
//         field: 'name',
//         type: 'string',
//         inputType: 'text',
//         filter: 'agTextColumnFilter',
//       },
//       {
//         headerName: 'IsActive',
//         field: 'isActive',
//         type: 'boolean',
//         inputType: 'checkbox',
//         filter: undefined,
//       },
//     ];

//     expect(getColumnDefs(rowData)).toEqual(expected);
//   });

//   // Test with different data types
//   it('should handle different data types correctly', () => {
//     const rowData = [{ age: 30, name: 'Alice', isEmployee: true }];
//     const expected = [
//       {
//         headerName: 'Age',
//         field: 'age',
//         type: 'number',
//         inputType: 'number',
//         filter: 'agNumberColumnFilter',
//       },
//       {
//         headerName: 'Name',
//         field: 'name',
//         type: 'string',
//         inputType: 'text',
//         filter: 'agTextColumnFilter',
//       },
//       {
//         headerName: 'IsEmployee',
//         field: 'isEmployee',
//         type: 'boolean',
//         inputType: 'checkbox',
//         filter: undefined,
//       },
//     ];
//     expect(getColumnDefs(rowData)).toEqual(expected);
//   });

//   // Test with inconsistent fields
//   it('should handle inconsistent fields in row data', () => {
//     const rowData = [{ name: 'Alice', age: 30 }, { name: 'Bob' }] as RowData[];
//     const expected = [
//       {
//         headerName: 'Name',
//         field: 'name',
//         type: 'string',
//         inputType: 'text',
//         filter: 'agTextColumnFilter',
//       },
//       {
//         headerName: 'Age',
//         field: 'age',
//         type: 'number',
//         inputType: 'number',
//         filter: 'agNumberColumnFilter',
//       },
//     ];
//     expect(getColumnDefs(rowData)).toEqual(expected);
//   });

//   // Test with special characters in keys
//   it('should handle special characters in keys', () => {
//     const rowData = [{ 'first name': 'Alice', 'employee-id': 123 }];
//     const expected = [
//       {
//         headerName: 'First name',
//         field: 'first name',
//         type: 'string',
//         inputType: 'text',
//         filter: 'agTextColumnFilter',
//       },
//       {
//         headerName: 'Employee-id',
//         field: 'employee-id',
//         type: 'number',
//         inputType: 'number',
//         filter: 'agNumberColumnFilter',
//       },
//     ];
//     expect(getColumnDefs(rowData)).toEqual(expected);
//   });
// });
