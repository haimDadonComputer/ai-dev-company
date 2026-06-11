type GridApi<RowData extends object> = {
  setGridOption: (key: string, value: unknown) => void;
  destroy: () => void;
  sizeColumnsToFit: () => void;
  refreshCells: (params?: unknown) => void;
  redrawRows: () => void;
};

type GridColumn<RowData extends object> = {
  field?: keyof RowData & string;
  headerName: string;
  valueGetter?: (params: { data?: RowData }) => string | number | null;
  cellRenderer?: (params: { data?: RowData; value: unknown }) => HTMLElement | string;
  width?: number;
  minWidth?: number;
  flex?: number;
  filter?: boolean | string;
  sortable?: boolean;
  resizable?: boolean;
  suppressMovable?: boolean;
};

type GridOptions<RowData extends object> = {
  columnDefs: Array<GridColumn<RowData>>;
  defaultColDef?: Partial<GridColumn<RowData>>;
  rowData?: RowData[];
  rowHeight?: number;
  headerHeight?: number;
  animateRows?: boolean;
  enableRtl?: boolean;
  suppressCellFocus?: boolean;
  rowClassRules?: Record<string, (params: { data?: RowData }) => boolean>;
  onRowClicked?: (event: { data?: RowData }) => void;
  overlayNoRowsTemplate?: string;
};

type AgGridGlobal = {
  createGrid: <RowData extends object>(
    element: HTMLElement,
    options: GridOptions<RowData>
  ) => GridApi<RowData>;
};

declare global {
  interface Window {
    agGrid?: AgGridGlobal;
  }
}

export type DataGridColumn<RowData extends object> = GridColumn<RowData>;

export type DataGridController<RowData extends object> = {
  setRows: (rows: RowData[]) => void;
  refresh: () => void;
  destroy: () => void;
};

const GRID_ROW_HEIGHT = 48;
const GRID_HEADER_HEIGHT = 48;
const GRID_VISIBLE_ROWS = 20;

export function mountDataGrid<RowData extends object>(
  element: HTMLElement,
  columns: Array<DataGridColumn<RowData>>,
  rows: RowData[],
  options: {
    emptyMessage: string;
    getRowClass?: (row: RowData) => string | null;
    onRowClick?: (row: RowData) => void;
  }
): DataGridController<RowData> {
  if (!window.agGrid) {
    throw new Error("ag-grid-community was not loaded.");
  }

  element.classList.add("data-grid-component", "ag-theme-quartz");
  element.style.setProperty(
    "--data-grid-height",
    `${GRID_HEADER_HEIGHT + GRID_ROW_HEIGHT * GRID_VISIBLE_ROWS}px`
  );

  const api = window.agGrid.createGrid<RowData>(element, {
    enableRtl: true,
    rowData: rows,
    columnDefs: columns,
    rowHeight: GRID_ROW_HEIGHT,
    headerHeight: GRID_HEADER_HEIGHT,
    animateRows: false,
    suppressCellFocus: true,
    overlayNoRowsTemplate: `<span class="data-grid-component__empty">${options.emptyMessage}</span>`,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
      flex: 1,
      minWidth: 120
    },
    rowClassRules: options.getRowClass
      ? {
          "data-grid-component__row--selected": ({ data }) =>
            data ? options.getRowClass?.(data) === "selected" : false
        }
      : undefined,
    onRowClicked: ({ data }) => {
      if (data) {
        options.onRowClick?.(data);
      }
    }
  });

  const sizeColumns = (): void => {
    window.requestAnimationFrame(() => api.sizeColumnsToFit());
  };
  sizeColumns();

  return {
    setRows(nextRows) {
      api.setGridOption("rowData", nextRows);
      api.redrawRows();
      sizeColumns();
    },
    refresh() {
      api.refreshCells({ force: true });
      api.redrawRows();
      sizeColumns();
    },
    destroy() {
      api.destroy();
    }
  };
}
