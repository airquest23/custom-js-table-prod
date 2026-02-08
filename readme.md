# Custom JS Table

## About

This is a pure JS custom table component (datagrid or datatable), with all features.

## Installation

As a simple JS class, you can just copy paste it in your projects. It doesn't need any dependency or framework.

To check out the demos / examples, just download this repo and open the '.html' files in the examples folder.

You can also check the examples online. There is a regular JS version here : [html preview](https://rawcdn.githack.com/airquest23/custom-js-table-prod/d8851ec6ae2a99c8cb4a072e1c777e3156bb6e68/examples/regular-js-version.html) / [raw file](./examples/regular-js-version.html).
And a DOMBuilder version here : [html preview](https://rawcdn.githack.com/airquest23/custom-js-table-prod/d8851ec6ae2a99c8cb4a072e1c777e3156bb6e68/examples/dom-builder-version.html) / [raw file](./examples/regular-js-version.html).
(You can learn more about DOMBuilder, one of my creation, [on this github repo](https://github.com/airquest23/dom-builder-prod)).

## Basics

First, you need to display the elements that you want (search bar, buttons, modals, the table container, the listview container, pagination, etc.):

```html
<!--------------------------------------->
<!-- TABLE HEADER (SEARCH AND BUTTONS) -->
<!--------------------------------------->
<div class="d-flex align-items-center justify-content-between mt-3">
  <!-- SEARCH -->
  <div class="flex-grow-1 d-flex align-items-center">
    <!-- SEARCH INPUT -->
    <input
      type="text"
      class="form-control"
      id="gridSearch"
      placeholder="Search..."
    />
    <!-- CANCEL SEARCH BUTTON -->
    <button
      type="button"
      class="btn btn-sm btn-close ms-2"
      id="cancelSearch"
      aria-label="Cancel"
    ></button>
  </div>
  
  <!-- BUTTONS LIST -->
  <div class="flex-shrink-1 d-flex align-items-center ms-2">
    <!-- SORT LISTVIEW -->
    <div class="dropdown">
      <button
        type="button"
        class="btn btn-sm dropdown-toggle"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
        aria-label="Sort"
      >
        <div class="rotate-180">
          <i class="bi bi-filter"></i>
        </div>
      </button>
      <ul class="dropdown-menu" id="sortListView"></ul>
    </div>

    <!-- HIDE -->
    <div class="dropdown">
      <button
        type="button"
        class="btn btn-sm dropdown-toggle ms-1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Hide"
      ><i class="bi bi-eye-slash"></i></button>
      <ul class="dropdown-menu" id="hideDD"></ul>
    </div>

    <!-- RESIZE COLUMNS -->
    <div id="resizeButton">
      <button
        type="button"
        class="btn btn-sm ms-1"
        data-bs-toggle="modal"
        data-bs-target="#resizeModal"
        aria-label="Resize columns"
      ><i class="bi bi-arrows"></i></button>
      
      <!-- Modal -->
      <div
        class="modal fade"
        id="resizeModal"
        tabindex="-1"
        aria-labelledby="resizeModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1
                class="modal-title fs-5"
                id="resizeModalLabel"
              >Resize columns</h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            
            <div class="modal-body" id="resizeModalBody"></div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                aria-label="Close"
              >Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- REORDER COLUMNS -->
    <div id="reorderButton">
      <button
        type="button"
        class="btn btn-sm ms-1"
        data-bs-toggle="modal"
        data-bs-target="#reorderModal"
        aria-label="Reorder columns"
      ><i class="bi bi-arrow-left-right"></i></button>

      <!-- Modal -->
      <div
        class="modal fade"
        id="reorderModal"
        tabindex="-1"
        aria-labelledby="reorderModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1
                class="modal-title fs-5"
                id="reorderModalLabel"
              >Reorder columns</h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            
            <div class="modal-body" id="reorderModalBody"></div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                aria-label="Close"
              >Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CLEAR SELECTION -->
    <button
      type="button"
      class="btn btn-sm ms-1"
      aria-label="Clear selection"
      id="clearSelection"
    ><i class="bi bi-eraser"></i></button>
    
    <!-- SELECT ALL -->
    <button
      type="button"
      class="btn btn-sm ms-1"
      aria-label="Select all"
      id="selectAll"
    ><i class="bi bi-list-check"></i></button>
  </div>
</div>

<!----------------------->
<!-- TABLE BODY (DATA) -->
<!----------------------->
<!-- TABLE -->
<div
  class="table-responsive small mt-3"
  id="tableContainer"
>
  <table
    class="table table-striped table-hover table-sm"
    id="table"
  ></table>
</div>

<!-- LISTVIEW -->
<div
  class="container py-4 d-flex flex-column gap-2 d-none"
  id="listView"
></div>

<!--------------------------------------------------------->
<!-- TABLE FOOTER (PAGINATION & CHANGE LISTVIEW COLUMNS) -->
<!--------------------------------------------------------->
<div class="d-flex align-items-center justify-content-between mb-3 mobilePaginationContainer">
  <!-- PAGINATION INFOS & CHANGE LIMIT -->
  <div class="d-flex flex-column mobilePaginationInfo">
    <!-- PAGINATION INFOS -->
    <div class="mobilePaginationRowsInfo">
      <div>
        <span>Objects </span>
        <i id="firstShowingLine">1</i>
        <span> to </span>
        <i id="lastShowingLine">100</i>
        <span> of </span>
        <b id="totalLines">2000</b>
      </div>
    </div>

    <!-- CHANGE PAGES LIMIT -->
    <div class="mt-2 mobilePaginationLimitInfo">
      <!-- CHANGE PAGES LIMIT INPUT -->
      <span>(max. </span>
      <input
        type="number"
        class="limitInput"
        placeholder="100"
        value="100"
        id="limitPerPage"
      >

      <!-- CLEAR PAGES LIMIT BUTTON -->
      <button
        type="button"
        class="btn btn-sm mb-1"
        aria-label="Reset pagination"
        id="resetPagination"
      ><i class="bi bi-x-octagon"></i></button>
      <span>objects / page)</span>
    </div>
  </div>
  
  <!--PAGINATION & CHANGE LISTVIEW COLS-->
  <div class="d-flex flex-column">
    <!-- PAGINATION -->
    <ul
      class="pagination m-0"
      id="pagination"
    ></ul>

    <!-- CHANGE LISTVIEW COLS -->
    <div
      class="mt-4 d-none"
      id="nrOfColsContainer"
    >
      <!-- CHANGE LISTVIEW COLS INPUT -->
      <span class="me-2">
        <i class="bi bi-grid-3x2-gap-fill"></i>
        <span class="ms-1"> -&gt; </span>
        <i class="bi bi-grid-3x3-gap-fill"></i>
        <span> : </span>
      </span>
      <input
        type="number"
        class="limitInput"
        placeholder="3"
        value="3"
        id="nrOfCols"
      >

      <!-- CLEAR LISTVIEW COLS BUTTON -->
      <button
        type="button"
        class="btn btn-sm mb-1"
        aria-label="Reset columns"
        id="resetCols"
      ><i class="bi bi-x-octagon"></i></button>
    </div>
  </div>
</div>
```

Then the 'Grid' class that you need to call (in a script tag) is quite self explanatory:

```javascript
new Grid({
  table: 'table',                   // Table ID (<table>)
  data: data,                       // Array of objects
  uuidProp: 'uuid',                 // Data property name containing the row Uuid
  columns: [                        // Array of column objects
    {
      id: 'body',                   // Property name from the data
      name: 'Body'                 // Description of the data
      //doNotSort: true,            // Do not sort this column
      //doNotHide: true,            // Do not hide this column
    },
    {
      id: 'dtcreated',
      name: 'Creation date'
    },
    { 
      id: 'dtupdated',
      name: 'Modification date'
    },
  ],
  //keyNav: true,                         // Enable key navigation or KeyNav configuration object
  keyNav: {                               // **** 'Space' key will automatically trigger a selection toggle
    enterFn: editObjectWithEnterKey,      // Function to execute on 'Enter' key
    deleteFn: deleteObjectWithDeleteKey,  // Function to execute on 'Delete' key
  },
  hideId: 'hideDD',                 // Hide dropdown Ul ID
  //search: 'gridSearch',           // Enable search or search configuration object
  search: {
    id: 'gridSearch',               // Search input ID
    cancel: 'cancelSearch',         // Cancel search button ID
    //doNotResetSelection: true,    // Do not reset selection on search change (don't keep only searched lines)
  },
  sort: true,                       // Enable sorting
  pagination: {                     // Pagination configuration object
    page: 1,                        // Default actual page
    limitPerPage: 100,              // Limit per page
    limitId: 'limitPerPage',        // Limit input ID
    pagesUlId: 'pagination',        // Pages Ul element ID
    maxButtonsNextToCurrent: 1,     // Max number of buttons to display on each side of current page button
    pagesLabels: {                  // Pages buttons aria-labels
      page: 'Page',                       // 'Page' label
      firstPage: 'First page)',           // 'First page' label
      lastPage: 'Last page)',             // 'Last page' label
      previousPage: 'Previous page)',     // 'Previous page' label
      nextPage: 'Next page)',             // 'Next page' label
    },
    firstShowingLineId: 'firstShowingLine',   // 'First line' element ID
    lastShowingLineId: 'lastShowingLine',     // 'Last line' element ID
    totalLinesId: 'totalLines',               // 'Total lines' element ID
    resetBtnId: 'resetPagination',            // Reset button ID
    //doNotResetSelection: true,              // Do not reset selection on pagination change (don't keep only viewable lines)
  },
  selection: {                      // Selection configuration object
    mode: 'multiple',               // Selection mode (single or multiple)
    //mode: 'single',
    clearId: 'clearSelection',      // 'Clear selection' button ID
    selectAllId: 'selectAll',       // 'Select all' button ID
    fn: (selection) => {            // Function to execute on selection (param : one object or one array)
      selectedObject = selection;
      console.log(selectedObject);
    },
  },
  resize: {                         // A resize configuration object
    buttonId: 'resizeButton',       // Button ID
    modalId: 'resizeModal',         // Modal ID
    modalBodyId: 'resizeModalBody'  // Modal body ID
  },
  reorder: {                        // A reorder configuration object
    buttonId: 'reorderButton',      // Button ID
    modalId: 'reorderModal',        // Modal ID
    modalBodyId: 'reorderModalBody' // Modal body ID
  },
  listView: {                       // Listview configuration object
    id: 'listView',                 // Listview container ID (<div>)
    tableId: 'tableContainer',      // Table container ID (<div>)
    sortId: 'sortListView',         // Sort container ID
    nrOfCols: 3,                    // Number of columns per row
    nrOfColsId: 'nrOfCols',         // NrOfCols input ID
    nrOfColsContainer:              // NrOfCols container ID (for hiding in grid mode)
      'nrOfColsContainer',
    resetBtnId: 'resetCols',        // Reset button ID
    buttons: {                      // IDs of buttons to switch between grid and list modes
      gridMode: 'gridMode',
      listMode: 'listMode',
    },
    transition: true,               // Add transitions when switching mode
  },
}).renderTable();
```
