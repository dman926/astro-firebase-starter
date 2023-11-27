export const OPTIONS = [
  {
    title: 'Row Selection Options',
    options: [
      {
        name: 'rowSelection',
        values: ['single', 'multiple'],
        path: 'rowSelection',
      },
    ],
  },
  {
    title: 'Edit Options',
    options: [
      // Need to add ability to prevent certain columns from ever being editable
      // {
      //   name: "editable",
      //   values: ["true", "false"],
      //   path: "d.editable",
      // },
      {
        name: 'sortable',
        values: ['true', 'false'],
        path: 'd.sortable',
      },
      {
        name: 'filter',
        values: ['true', 'false'],
        path: 'd.filter',
      },
    ],
  },
  // Add more options as needed
];
