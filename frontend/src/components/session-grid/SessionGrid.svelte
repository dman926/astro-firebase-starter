<script>
  import { onMount } from 'svelte';
  import { Grid, ModuleRegistry } from '@ag-grid-community/core';
  import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
  import '@ag-grid-community/styles/ag-grid.css';
  import '@ag-grid-community/styles/ag-theme-alpine.css';

  ModuleRegistry.registerModules([ClientSideRowModelModule]);

  let gridDiv;
  let gridOptions = {
    columnDefs: [
      { headerName: 'Name', field: 'name', sortable: true, filter: true },
      {
        headerName: 'Email',
        field: 'email',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Phone Number',
        field: 'phone_number',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Session Date',
        field: 'session_date',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Location',
        field: 'location',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Session Type',
        field: 'session_type',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Duration',
        field: 'duration_hours',
        cellRenderer: (params) => {
          return `${params.value} hour${params.value === 1 ? '' : 's'}`;
        },
        sortable: true,
        filter: true,
      },
      { headerName: 'Package', field: 'package', sortable: true, filter: true },
      {
        headerName: 'Total Cost',
        field: 'total_cost',
        cellRenderer: (params) => {
          return `$${params.value}`;
        },
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Notes',
        field: 'notes',
        flex: 1,
        sortable: true,
        filter: true,
      },
    ],
  };

  onMount(async () => {
    new Grid(gridDiv, gridOptions);

    const response = await fetch('http://127.0.0.1:3000/fetch-data');
    const data = await response.json();

    const combinedData = data.clients
      .map((client) => {
        const clientSessions = data.sessions.filter(
          (session) => session.client_id === client.id,
        );
        return clientSessions.map((session) => ({ ...client, ...session }));
      })
      .flat();

    gridOptions.api.setRowData(combinedData);
  });
</script>

<div
  bind:this={gridDiv}
  class="ag-theme-alpine-dark"
  style="height: 600px; width: 100%;"
></div>
