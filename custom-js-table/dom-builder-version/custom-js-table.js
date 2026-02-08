/**
* @typedef {Object} Column
* @property {String} id - Property name from the data
* @property {String} name - Description of the data
* @property {Boolean} doNotSort - Do not sort this column
* @property {Boolean} doNotHide - Do not hide this column
* @property {Boolean} isHidden - Is column hidden ?
* @property {Number} order - Column order (index after reordering = integer)
* @property {Number} width - Column width (in %)
*/

/**
* @typedef {Object} KeyNav
* @property {Function} enterFn - Function to execute on 'Enter' key
* @property {Function} deleteFn - Function to execute on 'Delete' key
*/

/**
* @typedef {Object} Search
* @property {String} id - Search input ID
* @property {String} cancel - Cancel search button ID
* @property {Boolean} doNotResetSelection - Do not reset selection on search change (don't keep only searched lines)
*/

/**
* @typedef {Object} PagesLabels
* @property {String} page - 'Page' label
* @property {String} firstPage - 'First page' label
* @property {String} lastPage - 'Last page' label
* @property {String} previousPage - 'Previous page' label
* @property {String} nextPage - 'Next page' label
*/

/**
* @typedef {Object} Pagination
* @property {Number} page - Default actual page
* @property {Number} limitPerPage - Limit per page
* @property {String} limitId - Limit input ID
* @property {String} pagesUlId - Pages Ul element ID
* @property {Number} maxButtonsNextToCurrent - Max buttons to display on each side of current page button
* @property {PagesLabels} pagesLabels - Pages buttons aria-labels
* @property {String} firstShowingLineId - 'First line' element ID
* @property {String} lastShowingLineId - 'Last line' element ID
* @property {String} totalLinesId - 'Total lines' element ID
* @property {String} resetBtnId - Reset button ID
* @property {Boolean} doNotResetSelection - Do not reset selection on pagination change (don't keep only viewable lines)
*/

/**
* @typedef {Object} selection
* @property {String} mode - Selection mode (single or multiple)
* @property {String} clearId - 'Clear selection' button ID
* @property {String} selectAllId - 'Select all' button ID
* @property {Function} fn - Function to execute on selection (param : one object or one array)
*/

/**
* @typedef {Object} Resize
* @property {String} buttonId - Button ID
* @property {String} modalId - Modal ID
* @property {String} modalBodyId - Modal body ID
*/

/**
* @typedef {Object} Reorder
* @property {String} buttonId - Button ID
* @property {String} modalId - Modal ID
* @property {String} modalBodyId - Modal body ID
*/

/**
* @typedef {Object} ListView
* @property {String} id - Listview container ID (<div>)
* @property {String} tableId - Table container ID (<div>)
* @property {String} sortId - Sort container ID
* @property {Number} nrOfCols - Number of columns per row
* @property {String} nrOfColsId - NrOfCols input ID
* @property {String} nrOfColsContainer - NrOfCols container ID (for hiding in grid mode)
* @property {String} resetBtnId - Reset button ID
* @property {Object} buttons - IDs of buttons to switch between grid and list modes
* @property {Boolean} transition - Add transitions when switching mode
*/

/**
* @typedef {Object} GridParams
* @property {String} table - Table ID (<table>)
* @property {Object[]} data - Array of objects
* @property {String} uuidProp - Data property name containing the row Uuid
* @property {Column[]} columns - Array of column objects (id / name)
* @property {Boolean|KeyNav} keyNav - Enable key navigation or KeyNav configuration object
* @property {String} hideId - Hide dropdown Ul ID
* @property {Boolean|Search} search - Enable search or search configuration object
* @property {Boolean} sort - Enable sorting
* @property {Pagination} pagination - Pagination configuration object
* @property {selection} selection - Selection configuration object
* @property {Resize} resize - Resize configuration object
* @property {ListView} listView - ListView configuration object
*/

const CLASS_TABLE_ACTIVE = 'table-active';
const CLASS_TABLE_SELECTED = 'table-primary';
const CLASS_LIST_ACTIVE = 'list-active';
const CLASS_LIST_SELECTED = 'active';
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_NR_OF_COLS = 3;
const DEFAULT_RESIZE_COLS_INCREMENT = 5;
const MILLISECONDS_FOR_TRANSITIONS = '650';
const ENUM_MODE = {
  single: 'single',
  mutiple: 'multiple',
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
////
/** Grid class */
class Grid {
  /** @type {Object|Object[]} Selected objects */
  #selectedObjects = null;
  /** @type {Column[]} Displayed columns (after hiding and ordering) */
  #displayedColumns = [];

  /** @type {Number} Key navigation index */
  #currentIndex = null/*-1*/;

  /** @type {String} Search keyword */
  #searchKeyword = null;

  /** @type {String} Sorted column ID */
  #sortKey = null;
  /** @type {Boolean} Sort ascending */
  #sortAsc = true;

  /** @type {Boolean} Is mode listView ? */
  #isListView = false;

  /** @type {Number} Data length before pagination */
  #dataLengthBeforePagination = null;

  /** @type {String} Active className */
  #classTableActive = CLASS_TABLE_ACTIVE;
  /** @type {String} Selected className */
  #classTableSelected = CLASS_TABLE_SELECTED;

  /** @type {Number} Resize columns increment */
  #resizeColsIncrement = DEFAULT_RESIZE_COLS_INCREMENT;
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  ////
  /**
  * Grid constructor
  * @param {GridParams} params - Grid parameters
  */
  constructor(params) {
    if(params.table)
      /** @type {String} - Table ID (<table>) */
      this.table = params.table;

    if(params.data)
      /** @type {Object[]} - Array of objects */
      this.data = params.data;
    
    /** @type {String} - Data property name containing the row Uuid */
    this.uuidProp = params.uuidProp;
    this.#dataLengthBeforePagination = this.data.length;

    if(params.columns) {
      /** @type {Column[]} - Array of column objects */
      this.columns = params.columns;
      //this.columns.forEach(column => this.#columnsState.push(column));
      for (let i = 0, l = this.columns.length; i < l; i++) {
        this.columns[i].order = i;
      };
      this.#setDisplayedColumns();
    };
    
    if(params.keyNav) {
      /** @type {KeyNav} - KeyNav configuration object */
      this.keyNav = params.keyNav;
      this.#addKeyNav();
    };
    
    if(params.hideId) {
      /** @type {String} - Hide dropdown Ul ID */
      this.hide = params.hideId;
      this.#addHide();
    };
    
    if(params.search) {
      /** @type {Search} - Search configuration object */
      this.search = {};
      if (isObject(params.search)) {
        this.search.id = params.search.id;
        this.search.cancel = params.search.cancel;
        this.#addCancelSearch();
      } else {
        this.search.id = params.search;
      };
      this.#addSearch();
    };

    if(params.sort)
      /** @type {Boolean} - Enable sorting */
      this.sort = params.sort;

    if(params.pagination) {
      /** @type {Pagination} - Pagination configuration object */
      this.pagination = {
        ...params.pagination,
        page: params.pagination.page || 1,
        limitPerPage: params.pagination.limitPerPage || DEFAULT_PAGE_LIMIT,
      };
      this.#addPagination();
    } else {
      this.pagination = {
        page: 1,
        limitPerPage: DEFAULT_PAGE_LIMIT,
      };
    };

    if (params.selection) {
      /** @type {selection} - Selection configuration object */
      this.selection = params.selection;

      if (this.selection.mode === ENUM_MODE.mutiple)
        this.#selectedObjects = [];

      if (this.selection.clearId)
        this.#addClearSelection();
      
      if (this.selection.mode === ENUM_MODE.mutiple && this.selection.selectAllId)
        this.#addSelectAll();
    };

    if (params.resize) {
      /** @type {Resize} - Resize configuration object */
      this.resize = params.resize;
      this.#addResize();
    };

    if (params.reorder) {
      /** @type {Reorder} - Reorder configuration object */
      this.reorder = params.reorder;
      this.#addReorder();
    };

    if (params.listView) {
      /** @type {ListView} - ListView configuration object */
      this.listView = {
        ...params.listView,
        nrOfCols: params.listView.nrOfCols || DEFAULT_NR_OF_COLS,
      };
      
      if (this.listView.sortId)
        this.#addSortForListView();
      
      if (this.listView.buttons)
        this.#addListViewEvents();
    } else {
      this.listView = {
        nrOfCols: DEFAULT_NR_OF_COLS,
      };
    };
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Helpers
  #getRows() {
    if (this.#isListView) {
      const list = document.getElementById(this.listView.id);
      return list.querySelectorAll('.list-group-item');
    } else {
      const table = document.getElementById(this.table);
      const tbody = table.querySelector('tbody');
      return tbody.querySelectorAll('tr');
    };
  };

  ////////////////
  #setDisplayedColumns() {
    const ordered = [...this.columns].sort((a, b) => a.order - b.order);
    const visible = ordered.filter(col => !col.isHidden);
    this.#displayedColumns = visible;
  };

  ////////////////
  setModeGrid() {
    this.#isListView = false;
    this.#classTableActive = CLASS_TABLE_ACTIVE;
    this.#classTableSelected = CLASS_TABLE_SELECTED;

    const doTheJob = () => {
      // Reset list
      DOM(this.listView.id).toggle('d-none').html('');

      if (this.listView.nrOfColsContainer) {
        document
          .getElementById(this.listView.nrOfColsContainer)
          .classList.toggle('d-none');
      };

      // Show table
      document
        .getElementById(this.listView.tableId)
        .classList.toggle('d-none');

      if (this.resize) {
        document
          .getElementById(this.resize.buttonId)
          .classList.toggle('d-none');
      };

      // Buttons
      DOM(this.listView.buttons.gridMode).toggle('disabled').disable();
      DOM(this.listView.buttons.listMode).toggle('disabled').enable();

      // Render
      this.renderTable();
    };
    
    if (this.listView.transition) {
      const dom = DOM(this.listView.id).toggle('disappearing').toggle('opacity-0');
      setTimeout(() => {
        doTheJob();
        dom.toggle('disappearing').toggle('opacity-0');
      }, MILLISECONDS_FOR_TRANSITIONS);
    } else {
      doTheJob();
    };
  };

  ////////////////
  setModeList() {
    this.#isListView = true;
    this.#classTableActive = CLASS_LIST_ACTIVE;
    this.#classTableSelected = CLASS_LIST_SELECTED;

    const doTheJob = () => {
      // Reset table
      document
        .getElementById(this.listView.tableId)
        .classList.toggle('d-none');

      document
        .getElementById(this.table)
        .innerHTML = '';

      if (this.resize) {
        document
          .getElementById(this.resize.buttonId)
          .classList.toggle('d-none');
      };

      // Show list
      document
        .getElementById(this.listView.id)
        .classList.toggle('d-none');

      if (this.listView.nrOfColsContainer) {
        document
          .getElementById(this.listView.nrOfColsContainer)
          .classList.toggle('d-none');
      };

      // Buttons
      DOM(this.listView.buttons.gridMode).toggle('disabled').enable();
      DOM(this.listView.buttons.listMode).toggle('disabled').disable();

      // Render
      this.renderTable();
    };

    if (this.listView.transition) {
      const dom = DOM(this.listView.tableId).toggle('disappearing').toggle('opacity-0');
      setTimeout(() => {
        doTheJob();
        dom.toggle('disappearing').toggle('opacity-0');
      }, MILLISECONDS_FOR_TRANSITIONS);
    } else {
      doTheJob();
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Selection
  #addSelectionStyleAndEvents(row) {
    const uuid = row.getAttribute('data-uuid');

    if (this.selection.mode === ENUM_MODE.single) {
      if (this.#selectedObjects && this.#selectedObjects[this.uuidProp] === uuid)
        row.classList.add(this.#classTableSelected);
      row.addEventListener('click', () => {
        this.#onSingleRowSelected(row);
      });
    };
    
    if (this.selection.mode === ENUM_MODE.mutiple) {
      if (
        this.#selectedObjects && Array.isArray(this.#selectedObjects) &&
        this.#selectedObjects.findIndex(v => v[this.uuidProp] === uuid) > -1
      )
        row.classList.add(this.#classTableSelected);
      row.addEventListener('click', () => {
        this.#onMultipleRowSelected(row);
      });
    };
  };

  ////////////////
  #onSingleRowSelected(row) {
    const uuid = row.getAttribute('data-uuid');
    const obj = this.data.find(v => v[this.uuidProp] === uuid);
    
    const rows = this.#getRows();
    rows.forEach(row => row.classList.remove(this.#classTableSelected));
    
    if (this.#selectedObjects && this.#selectedObjects[this.uuidProp] === uuid) {
      row.classList.remove(this.#classTableSelected);
      this.#selectedObjects = null;
    } else {
      row.classList.toggle(this.#classTableSelected);
      this.#selectedObjects = obj;
    };

    if (this.keyNav) {
      // Add active class to selected row
      this.#resetNavAfterSelection(row, rows);
    };

    this.selection.fn(this.#selectedObjects);
  };

  ////////////////
  #onMultipleRowSelected(row) {
    const uuid = row.getAttribute('data-uuid');
    const obj = this.data.find(v => v[this.uuidProp] === uuid);

    arrayAddOrRemove(this.#selectedObjects, obj);
    row.classList.toggle(this.#classTableSelected);

    if (this.keyNav) {
      // Add active class to selected row
      const rows = this.#getRows();
      this.#resetNavAfterSelection(row, rows);
    };

    if (this.selection.selectAllId) {
      // Remove 'select all' button style
      const rows = this.#getRows();
      DOM(this.selection.selectAllId)
        .if(this.#selectedObjects.length === rows.length)
        .classes.add('btn-primary')
        .elseIf(selectAllBtn => selectAllBtn.classList.contains('btn-primary'))
        .classes.remove('btn-primary');
    };

    this.selection.fn(this.#selectedObjects);
  };

  ////////////////
  #resetNavAfterSelection(row, rows) {
    let index = -1;

    rows.forEach((v, i) => {
      v.classList.remove(this.#classTableActive);
      if (v === row) index = i;
    });

    this.#currentIndex = index;
  };

  ////////////////
  #addSelectAll() {
    // Only available for 'multiple' mode selection
    DOM(this.selection.selectAllId)
      .event('click', (selectAllBtn) => {
        const rows = this.#getRows();

        if (this.#selectedObjects.length === rows.length) {
          // All rows are selected -> deselect all
          this.#clearSelection();
        }
        
        else {
          // Not all rows are selected -> select all
          rows.forEach(row => {
            if (!row.classList.contains(this.#classTableSelected))
              this.#onMultipleRowSelected(row);
          });

          selectAllBtn.classList.add('btn-primary');
        };
      });
  };
  
  ////////////////
  #addClearSelection() {
    DOM(this.selection.clearId)
      .event('click', () => this.#clearSelection());
  };

  ////////////////
  #clearSelection() {
    if (this.selection.mode === ENUM_MODE.single)
      this.#selectedObjects = null;
    if (this.selection.mode === ENUM_MODE.mutiple)
      this.#selectedObjects = [];
    this.selection.fn(this.#selectedObjects);

    const rows = this.#getRows();
    rows.forEach(row => DOM(row).classes.remove(this.#classTableSelected));
    if (this.selection.selectAllId) {
      DOM(this.selection.selectAllId).classes.remove('btn-primary');
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Keyboard navigation
  #addKeyNav() {
    document.addEventListener('keydown', (e) => {
      if (
        e.code !== 'Space'     &&
        e.key  !== 'Enter'     &&
        e.key  !== 'Delete'    &&
        e.key  !== 'ArrowDown' &&
        e.key  !== 'ArrowUp'
      ) return;
      const rows = this.#getRows();
      let activeRow = rows[this.#currentIndex];

      if (
        e.key !== 'ArrowDown' &&
        e.key !== 'ArrowUp'
      ) {
        if (!activeRow) return;
        e.preventDefault();

        if (e.code === 'Space') {
          if (this.selection.mode === ENUM_MODE.single)
            this.#onSingleRowSelected(activeRow);
          
          if (this.selection.mode === ENUM_MODE.mutiple)
            this.#onMultipleRowSelected(activeRow);
        }
        
        else if (e.key === 'Enter') {
          const uuid = activeRow.getAttribute('data-uuid');
          const obj = this.data.find(v => v[this.uuidProp] === uuid);
          this.keyNav.enterFn(obj);
        }
        
        else if (e.key === 'Delete') {
          const uuid = activeRow.getAttribute('data-uuid');
          const obj = this.data.find(v => v[this.uuidProp] === uuid);
          this.keyNav.deleteFn(obj);
        };
      };

      if (e.key === 'ArrowDown') {
        if (this.#currentIndex < rows.length - 1)
          this.#currentIndex++;
      }
      
      else if (e.key === 'ArrowUp') {
        if (this.#currentIndex > 0)
          this.#currentIndex--;
      };

      activeRow = rows[this.#currentIndex];
      if (!activeRow) return;
      
      rows.forEach(row => row.classList.remove(this.#classTableActive));
      activeRow.classList.add(this.#classTableActive);
      activeRow.scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('mousedown', (e) => {
      if (this.#currentIndex < 0) return;
      this.#clearActiveRows();
    });
  };

  ////////////////
  #clearActiveRows() {
    const rows = this.#getRows();
    rows.forEach(row => row.classList.remove(this.#classTableActive));
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Hide columns
  #addHide() {
    const hideDD = document.getElementById(this.hide);
    
    this.columns.forEach(column => {
      if (column.doNotHide) return;

      DOM.create('li').appendTo(hideDD)
        .addChild('div').class('form-check ms-2')
          .addChild('input').type('checkbox').class('form-check-input').id(`hide_col_${column.id}`)
            .event('change', () => {
              const idx = this.columns.findIndex(col => col.id === column.id);
              this.columns[idx].isHidden = !this.columns[idx].isHidden;
              this.#clearSizes();
              this.#setDisplayedColumns();
              this.renderTable();
              if (this.listView.sortId)
                this.#addSortForListView();
            })
          .add('label').class('form-check-label').for(`hide_col_${column.id}`).text(column.name);
    });
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Search
  #addSearch() {
    DOM(this.search.id)
      .event('input', (searchInput) => {
        this.#searchKeyword = searchInput.value.toLowerCase();
        this.pagination.page = 1;
        this.renderTable();
      });
  };

  ////////////////
  #addCancelSearch() {
    DOM(this.search.cancel)
      .event('click', () => {
        const searchInput = DOM(this.search.id).node;
        if (searchInput.value === '') return;
        searchInput.value = '';
        this.#searchKeyword = '';
        this.pagination.page = 1;
        this.renderTable();
      });
  };

  ////////////////
  #search(data) {
    if (!this.search || !this.#searchKeyword || this.#searchKeyword === '') return data;
    const newSelection = [];

    const newData = data.filter(row =>
      Object.values(row).some(val => {
        if (String(val).toLowerCase().includes(this.#searchKeyword)) {
          // Filter out selected rows
          const uuid = row[this.uuidProp];
          const idx = this.#selectedObjects.findIndex(v => v[this.uuidProp] === uuid);
          if (idx >= 0) newSelection.push(row);
          return true;
        };
        return false;
      })
    );

    // Set selection to filtered rows
    if (!this.search.doNotResetSelection)
      this.#selectedObjects = newSelection;

    return newData;
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Sort
  #addSortForListView() {
    const sortListView = document.getElementById(this.listView.sortId);
    sortListView.innerHTML = '';

    this.columns.forEach(column => {
      if (column.doNotSort) return;
      if (column.isHidden) return;
      
      DOM.create('li').appendTo(sortListView)
        .addChild('div').class('form-check ms-2')
          
          .addChildSet('input', {
            type: 'radio',
            class: 'form-check-input',
            name: 'sort_list',
            id: `sort_list_${column.id}`,
            value: `${column.id}`,
          })

          .condition(this.#sortKey === column.id)
          .checked()

          .event('change', (input) => {
            const key = input.value;
            this.#sortAsc = this.#sortKey === key ? !this.#sortAsc : true;
            this.#sortKey = key;
            this.renderTable();
            const buttons = sortListView.querySelectorAll('button');
            buttons.forEach(button => {
              if (!button.classList.contains('d-none'))
                button.classList.add('d-none');
              button.innerHTML = '<i class="bi bi-sort-down-alt"></i>';
            });
            DOM(input).next().toggle('d-none');
          })
          
          .add('button').class('btn btn-sm me-2')
          .condition(this.#sortKey !== column.id)
          .classes.add('d-none')

          .condition(this.#sortKey === column.id && !this.#sortAsc)
          .html('<i class="bi bi-sort-up"></i>')
          .condition(this.#sortKey !== column.id || this.#sortAsc)
          .html('<i class="bi bi-sort-down-alt"></i>')
          
          .event('click', (button) => {
            this.#sortAsc = this.#sortKey === column.id ? !this.#sortAsc : true;
            this.renderTable();
            if (this.#sortAsc)
              button.innerHTML = '<i class="bi bi-sort-down-alt"></i>';
            else
              button.innerHTML = '<i class="bi bi-sort-up"></i>';
          })
          
          .addSet('label', {
            class: 'form-check-label',
            for: `sort_list_${column.id}`,
            text: column.name,
          });
    });

    // Reset button
    DOM.create('li').class('list-group-item').appendTo(sortListView)
      .addChild('div').class('w-100 d-flex justify-content-center')
        .addChildSet('button', {
          type: 'button',
          class: 'btn',
          ariaLabel: 'Reset',
          html: `<i class="bi bi-x-octagon"></i>`,
        })
        .event('click', () => {
          this.#sortAsc = true;
          this.#sortKey = null;
          this.renderTable();
          const inputs = sortListView.querySelectorAll('input');
          inputs.forEach(input => input.checked = false);
        });
  };
  
  ////////////////
  #sort(data) {
    if (
      (!this.#isListView && !this.sort) ||
      ( this.#isListView && !this.listView.sortId) ||
      !this.#sortKey || this.#sortKey === ''
    ) return data;

    return [...data].sort((a, b) => {
      if (a[this.#sortKey] < b[this.#sortKey]) return this.#sortAsc ? -1 :  1;
      if (a[this.#sortKey] > b[this.#sortKey]) return this.#sortAsc ?  1 : -1;
      return 0;
    });
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Resize columns
  #addResize() {
    const store = {};

    DOM(this.resize.modalBodyId)
      .appendChild('ul')
      .class('list-group')
      .saveGlobal(store, 'ul');
    
    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener('show.bs.modal', (e) => {
        if (e.target.id !== this.resize.modalId) return;
        this.#setResizeModal(store.ul);
      });
    });
  };

  ////////////////
  #setResizeModal(ul) {
    ul.innerHTML = '';

    const table = document.getElementById(this.table);
    const thead = table.querySelector('thead');
    const columns = thead.querySelectorAll('th');

    let checkNotInit = false;
    for (let i = 0, l = columns.length; i < l; i++) {
      const col = columns[i];
      if (!col.style.width || col.style.width === 'auto') {
        checkNotInit = true;
        break;
      };
    };
    
    let columnsWidths = [];

    // Cols widths were not initialized
    if (checkNotInit) {
      const tableWidth = table.offsetWidth;
      columns.forEach(col => {
        columnsWidths.push(Number(col.offsetWidth * 100 / tableWidth));
      });
      columnsWidths = roundPercentages(columnsWidths);
    }

    // Cols widths were initialized
    else {
      columns.forEach(col => {
        const width = col.style.width.replace('%', '');
        const widthNum = Number(width);
        columnsWidths.push(Number(widthNum));
      });
    };
    
    let shift = 0;

    for (let i = 0, l = this.#displayedColumns.length; i < l; i++) {
      if (i === l - 1) continue;

      const column = this.#displayedColumns[i];
      const nextCol = this.#displayedColumns[i+1];

      const store = {};

      DOM.create('li').class('list-group-item').appendTo(ul)

        .addChild('div').class('d-flex justify-content-between align-items-center')
          .addChild('label').class('form-label').for(`resize_col_${column.id}`).text(column.name)
          .add('label').class('form-label').text(nextCol.name)
        .parent()

        .add('div').class('d-flex justify-content-between align-items-center')
          .addChild('button').type('button').class('btn btn-sm').html(`<i class="bi bi-arrow-bar-left"></i>`)
          .saveGlobal(store, 'btnLeft')

          .addSet('input', {
            type: 'range',
            class: 'form-range',
            id: `resize_col_${column.id}`,
            min: '0',
            max: '100',
            value: Number(columnsWidths[i]) + Number(shift),
            dataOldValue: Number(columnsWidths[i]) + Number(shift),
            dataIndex: i,
          })
          .event('input', (input) => {
            this.#handleResize(Number(input.value), input, ul, columns);
          })
          .saveGlobal(store, 'input')

          .add('button').type('button').class('btn btn-sm').html(`<i class="bi bi-arrow-bar-right"></i>`)
          .saveGlobal(store, 'btnRight');
      
      store.btnLeft.addEventListener('click', () => {
        const newVal = Number(store.input.value) - this.#resizeColsIncrement;
        if (this.#handleResize(Number(newVal), store.input, ul, columns) !== -1)
          store.input.value = newVal;
      });

      store.btnRight.addEventListener('click', () => {
        const newVal = Number(store.input.value) + this.#resizeColsIncrement;
        if (this.#handleResize(Number(newVal), store.input, ul, columns) !== -1)
          store.input.value = newVal;
      });

      shift += Number(columnsWidths[i]);
    };
    
    // Reset button
    DOM.create('li').class('list-group-item').appendTo(ul)
      .addChild('div').class('w-100 d-flex justify-content-center')
        .addChildSet('button', {
          type: 'button',
          class: 'btn',
          ariaLabel: 'Reset',
          html: '<i class="bi bi-x-octagon"></i>'
        })
        .event('click', () => {
          this.#clearSizes();
          this.renderTable();
          this.#setResizeModal(ul);
        });
  };

  ////////////////
  #handleResize(newValue, input, ul, columns) {
    if (this.#isListView) return;

    const ranges = ul.querySelectorAll('input');
    const idx = Number(input.getAttribute('data-index'));
    
    ////////////////////////////////////
    ////////////////////////////////////
    // Check bounds
    const val = Number(newValue);
    let prevVal = -1;
    let nextVal = -1;
    
    // Don't let the range go below 1
    if (idx === 0) {
      if (val < 1) {
        input.value = 1;
        return -1;
      };
    }
    else {
      prevVal = Number(ranges[idx - 1].value);
    };

    // Don't let the range go above 99
    if (idx === ranges.length - 1) {
      if (val > 99) {
        input.value = 99;
        return -1;
      };
    }
    else {
      nextVal = Number(ranges[idx + 1].value);
    };

    // Don't let the range go <= previous range value
    if (idx > 0 && val <= Number(prevVal)) {
      const newVal = Number(prevVal) + 1;
      input.value = newVal;
      return -1;
    };

    // Don't let the range go >= next range value
    if (idx < ranges.length - 1 && val >= Number(nextVal)) {
      const newVal = Number(nextVal) - 1;
      input.value = newVal;
      return -1;
    };
    
    ////////////////////////////////////
    ////////////////////////////////////
    // Update inputs states
    const oldVal = Number(input.getAttribute('data-old-value'));
    if (oldVal === val) return;
    
    // Backup the new value
    input.setAttribute('data-old-value', val);

    const newHeaderColsWidth = [];
    let shift = 0;
    ranges.forEach(range => {
      const v = Number(range.getAttribute('data-old-value'));
      newHeaderColsWidth.push(v - shift);
      shift += v;
    });
    let sum = 0;
    newHeaderColsWidth.forEach(v => sum += v);
    // Last column (total should be 100)
    newHeaderColsWidth.push(100 - sum);
    
    ////////////////////////////////////
    ////////////////////////////////////
    // Iniatialize 'break-all' style
    const table_rows = table.querySelectorAll('tr');
    for (let i = 0; i < table_rows.length; i++) {
      const tr = table_rows[i];
      if (tr.style.wordBreak === 'break-all') break;
      tr.style.wordBreak = 'break-all';          
    };

    // Update table header columns
    for (let i = 0, l = columns.length; i < l; i++) {
      const col = columns[i];
      col.style.width = newHeaderColsWidth[i] + '%';
      const uuid = col.getAttribute('data-key');
      const colObj = this.columns.find(v => v.id === uuid);
      colObj.width = Number(newHeaderColsWidth[i]);
    };
  };

  #clearSizes() {
    for (let i = 0, l = this.columns.length; i < l; i++) {
      this.columns[i].width = undefined;
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Reorder columns
  #addReorder() {
    const modal = document.getElementById(this.reorder.modalBodyId);
    const ul = document.createElement('ul');
    modal.appendChild(ul);
    ul.setAttribute('class', 'list-group');

    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener('show.bs.modal', (e) => {
        if (e.target.id !== this.reorder.modalId) return;
        this.#setReorderModal(ul);
      });
    });
  };

  ////////////////
  #setReorderModal(ul) {
    const disabledClass = 'disabled';
    ul.innerHTML = '';

    for (let i = 0, l = this.#displayedColumns.length; i < l; i++) {
      const column = this.#displayedColumns[i];
      const li = {};

      DOM.create('li').class('list-group-item').appendTo(ul).saveGlobal(li)
        .addChild('div').class('d-flex justify-content-between align-items-center')

          .addChildSet('label', {
            class: 'form-label',
            for: `reorder_col_${column.id}`,
            text: column.name,
          })

          .add('div').class('d-flex align-items-center')

            .addChildSet('button', {
              type: 'button',
              class: 'btn btn-outline-secondary btn-sm me-2 btn-dn',
              html: `<i class="bi bi-arrow-bar-down"></i>`,
            })
            .condition(i === this.#displayedColumns.length - 1, true)
            .classes.add(disabledClass)
            .disable()
            .cancelCondition()
            .event('click', (buttonDown) => {
              const dummy = [...this.columns].sort((a, b) => a.order - b.order);
              const dummyIdx = dummy.findIndex(col => col.id === column.id);

              // Find next index that is not hidden
              let nextId = null;
              for (let i = dummyIdx + 1; i < dummy.length; i++) {
                const col = dummy[i];
                if (!col.isHidden) {
                  nextId = col.id;
                  break;
                };
              };
              const firstIdx = this.columns.findIndex(col => col.id === column.id);
              const nextIdx = this.columns.findIndex(col => col.id === nextId);

              const firstOrder = this.columns[firstIdx].order;
              const nextOrder = this.columns[nextIdx].order;

              this.columns[firstIdx].order = nextOrder;
              this.columns[nextIdx].order = firstOrder;
              
              this.#setDisplayedColumns();
              this.renderTable();
              this.#setReorderModal(ul);
            })

            .addAfterSet('button', {
              type: 'button',
              class: 'btn btn-outline-secondary btn-sm btn-up',
              html: `<i class="bi bi-arrow-bar-up"></i>`,
            })
            .condition(i === 0, true)
            .classes.add(disabledClass)
            .disable()
            .cancelCondition()
            .event('click', (buttonUp) => {
              const dummy = [...this.columns].sort((a, b) => a.order - b.order);
              const dummyIdx = dummy.findIndex(col => col.id === column.id);
              
              // Find next index that is not hidden
              let prevId = null;
              for (let i = dummyIdx - 1; i >= 0; i--) {
                const col = dummy[i];
                if (!col.isHidden) {
                  prevId = col.id;
                  break;
                };
              };
              
              const lastIdx = this.columns.findIndex(col => col.id === column.id);
              const prevIdx = this.columns.findIndex(col => col.id === prevId);

              const lastOrder = this.columns[lastIdx].order;
              const prevOrder = this.columns[prevIdx].order;

              this.columns[lastIdx].order = prevOrder;
              this.columns[prevIdx].order = lastOrder;
              
              this.#setDisplayedColumns();
              this.renderTable();
              this.#setReorderModal(ul);
            });
    };

    // Reset button
    DOM.create('li').class('list-group-item').appendTo(ul)
      .addChild('div').class('w-100 d-flex justify-content-center')
        .addChildSet('button', {
          type: 'button',
          class: 'btn',
          ariaLabel: 'Reset',
          html: `<i class="bi bi-x-octagon"></i>`,
        })
        .event('click', () => {
          for (let i = 0, l = this.columns.length; i < l; i++) {
            this.columns[i].order = i;
          };
          
          this.#setDisplayedColumns();
          this.renderTable();
          this.#setReorderModal(ul);
        });
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Listview
  #addListViewEvents() {
    if (this.listView.buttons.gridMode) {
      document
        .getElementById(this.listView.buttons.gridMode)
        .addEventListener('click', () => {
          this.setModeGrid();
        });
    };

    if (this.listView.buttons.listMode) {
      document
        .getElementById(this.listView.buttons.listMode)
        .addEventListener('click', () => {
          this.setModeList();
        });
    };

    if (this.listView.nrOfColsId) {
      DOM(this.listView.nrOfColsId)
        .event('input', (nrOfCols) => {
          let value = Number(nrOfCols.value);

          if (isNaN(value)) {
            try { value = value.parseInt(); }
            catch { throw new Error('Limit must be a number'); };
          };
          
          if (value <= 0) return;

          this.listView.nrOfCols = value;
          this.renderTable();
        });
      
      if (this.listView.resetBtnId) {
        document
          .getElementById(this.listView.resetBtnId)
          .addEventListener('click', () => {
            this.listView.nrOfCols = DEFAULT_NR_OF_COLS;
            nrOfCols.value = DEFAULT_NR_OF_COLS;
            this.renderTable();
          });
      };
    };
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Pagination
  #addPagination() {
    const limitInput = document.getElementById(this.pagination.limitId);

    limitInput.addEventListener('input', () => {
      let value = Number(limitInput.value);

      if (isNaN(value)) {
        try { value = value.parseInt(); }
        catch { throw new Error('Limit must be a number'); };
      };
      
      if (value <= 0) return;
      
      this.pagination.limitPerPage = value;
      this.pagination.page = 1;
      this.renderTable();
    });

    if (this.pagination.resetBtnId) {
      DOM(this.pagination.resetBtnId)
        .event('click', () => {
          this.pagination.limitPerPage = DEFAULT_PAGE_LIMIT;
          limitInput.value = DEFAULT_PAGE_LIMIT;
          this.pagination.page = 1;
          this.renderTable();
        });
      
      /*const resetBtn = document.getElementById(this.pagination.resetBtnId);
      resetBtn.addEventListener('click', () => {
        this.pagination.limitPerPage = DEFAULT_PAGE_LIMIT;
        limitInput.value = DEFAULT_PAGE_LIMIT;
        this.pagination.page = 1;
        this.renderTable();
      });*/
    };
  };
  
  ////////////////
  #paginate(data) {
    if (!this.pagination) return data;

    let start = Number((this.pagination.page - 1) * this.pagination.limitPerPage);
    
    if (isNaN(start)) {
      try { start = start.parseInt(); }
      catch { throw new Error('Pagination : start item index must be a number'); };
    };
    
    let end = Number(start + this.pagination.limitPerPage);
    
    if (isNaN(end)) {
      try { end = end.parseInt(); }
      catch { throw new Error('Pagination : end item index must be a number'); };
    };
    
    const newData = data.slice(start, end);

    // Set selection to filtered rows
    if (!this.pagination.doNotResetSelection) {
      const newSelection = [];
      newData.forEach(row => {
        const uuid = row[this.uuidProp];
        const idx = this.#selectedObjects.findIndex(v => v[this.uuidProp] === uuid);
        if (idx >= 0) newSelection.push(row);
      });
      this.#selectedObjects = newSelection;
    };

    return newData;
  };
  
  ////////////////
  #goToPage(page) {
    if (isNaN(page)) return;
    this.pagination.page = page;
    this.renderTable();
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Render table
  renderTable() {
    const data = this.data;
    const searched = this.#search(data);
    const sorted = this.#sort(searched);
    this.#dataLengthBeforePagination = sorted.length;
    const paginated = this.#paginate(sorted);
    this.#displayTable(paginated);
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Display table
  #displayTable(data) {
    if (this.#isListView) {
      this.#displayListView(data);
      return;
    };

    const table = document.getElementById(this.table);
    table.innerHTML = '';
    
    /////////////////////////////////////////
    // Render table header
    const thead = document.createElement('thead');
    table.appendChild(thead);
    
    const thead_tr = document.createElement('tr');
    thead.appendChild(thead_tr);

    this.#displayedColumns.forEach(column => {      
      const th = document.createElement('th');
      thead_tr.appendChild(th);
      th.setAttribute('data-key', column.id);

      if (this.resize && column.width) {
        if (thead_tr.style.wordBreak !== 'break-all')
          thead_tr.style.wordBreak = 'break-all';
        th.style.width = column.width + '%';
      };
      
      /////////////////////////////////////////
      // Add sorting style
      if (this.sort && !column.doNotSort && this.#sortKey === column.id) {
        const icon = this.#sortAsc ? 'bi-sort-down-alt' : 'bi-sort-up';
        th.innerHTML = `
          <div class="d-flex align-items-center justify-content-between">
            ${column.name}
            <i class="bi ${icon} mx-2"></i>
          </div>
        `;
      } else {
        th.textContent = column.name;
      };
      
      /////////////////////////////////////////
      // Add sorting events
      if (this.sort && !column.doNotSort) {
        th.addEventListener('click', () => {
          const key = th.dataset.key;
          this.#sortAsc = this.#sortKey === key ? !this.#sortAsc : true;
          this.#sortKey = key;
          this.renderTable();
          this.#addSortForListView();
        });
      };
    });
    
    /////////////////////////////////////////
    // Render table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    data.forEach(row => {
      const tbody_tr = document.createElement('tr');
      tbody.appendChild(tbody_tr);
      tbody_tr.setAttribute('data-uuid', row[this.uuidProp]);

      this.#displayedColumns.forEach(column => {
        const key = Object.keys(row).find(v => v === column.id);
        const value = row[key];

        if (!key || key === this.uuidProp) return;
        
        if (this.resize && column.width && tbody_tr.style.wordBreak !== 'break-all') {
          tbody_tr.style.wordBreak = 'break-all';
        };

        // Here you can style the cell
        const td = document.createElement('td');
        tbody_tr.appendChild(td);
        td.textContent = value;
      });

      if (this.selection) {
        this.#addSelectionStyleAndEvents(tbody_tr);
      };
    });
    
    /////////////////////////////////////////
    // Render pagination
    this.#renderPagination();
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Display list view
  #displayListView(data) {
    const list = document.getElementById(this.listView.id);
    list.innerHTML = '';

    const nrOfRows = Number(Math.ceil(data.length / this.listView.nrOfCols));
    let arrayIdx = 0;

    /////////////////////////////////////////
    // Render
    for (let i = 0, l = nrOfRows; i < l; i++) {
      const row = document.createElement('div');
      list.appendChild(row);
      row.setAttribute('class', 'row list-group flex-row gap-2');

      for (let j = 0, k = this.listView.nrOfCols; j < k; j++) {
        if (arrayIdx >= data.length) break;

        const colData = data[arrayIdx];

        const col = document.createElement('div');
        row.appendChild(col);

        col.setAttribute('data-uuid', colData[this.uuidProp]);
        col.setAttribute('class', 'col list-group-item list-group-item-action list-item-grid');
        
        this.#displayedColumns.forEach(column => {
          const key = Object.keys(colData).find(v => v === column.id);
          const value = colData[key];
          
          if (!key || key === this.uuidProp) return;
          
          // Here you can style the paragraph
          const p = document.createElement('p');
          col.appendChild(p);
          p.textContent = value;
        });
        
        if (this.selection) {
          this.#addSelectionStyleAndEvents(col);
        };

        arrayIdx++;
      };
    };
    
    /////////////////////////////////////////
    // Render pagination
    this.#renderPagination();
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  // Render pagination
  #renderPagination() {
    if (!this.pagination) return;
    if (this.pagination.pagesUlId) {
      const pagesUl = document.getElementById(this.pagination.pagesUlId);
      pagesUl.innerHTML = '';

      /////////////////////////////////////////
      // Go to first page
      DOM.create('li')
        .class('page-item')
          .addChildSet('button', {
            type: 'button',
            class: 'page-link' + (this.pagination.page === 1 ? ' disabled' : ''),
            ariaLabel: this.pagination.pagesLabels.firstPage,
            html: '&laquo;',
          })
          .condition(this.pagination.page === 1)
          .disable()
          .condition(this.pagination.page !== 1)
          .event('click', () => this.#goToPage(1))
          .parent()
        .appendTo(pagesUl)
      
      /////////////////////////////////////////
      // Go to previous page
        .copy()
          .getChild()
          .html('‹')
          .event('click', () => this.#goToPage(Number(this.pagination.page) - 1));
      
      /////////////////////////////////////////
      // Pagination body
      const lastPage = Number(Math.ceil(this.#dataLengthBeforePagination / this.pagination.limitPerPage));
      
      const isMaxButtons = (this.pagination.maxButtonsNextToCurrent
        && !isNaN(this.pagination.maxButtonsNextToCurrent)
        && this.pagination.maxButtonsNextToCurrent > 0);
      
      let separatorBeforeWasPlaced = false;
      let separatorAfterWasPlaced = false;
      
      for (let i = 1; i <= lastPage; i++) {
        // If limit number of buttons displayed (insert disabled and ... for others)
        if (
          isMaxButtons &&
          // Ignore first and last page
          i !== 1 && i !== lastPage &&
          (
            i < this.pagination.page - this.pagination.maxButtonsNextToCurrent ||
            i > this.pagination.page + this.pagination.maxButtonsNextToCurrent
          )
        ) {
          // Flag only second separator if current page < 3 + maxButtonsNextToCurrent
          if (!separatorBeforeWasPlaced &&
            this.pagination.page < 3 + this.pagination.maxButtonsNextToCurrent
          ) {
            separatorBeforeWasPlaced = true;
          };

          // Ignore if first separator was placed
          if (
            i < this.pagination.page - this.pagination.maxButtonsNextToCurrent
            && separatorBeforeWasPlaced
          ) continue;
          
          // Ignore if second separator was placed
          if (
            i > this.pagination.page + this.pagination.maxButtonsNextToCurrent
            && separatorAfterWasPlaced
          ) continue;
          
          const li = document.createElement('li');
          li.setAttribute('class', 'page-item disabled');
          li.innerHTML = `
            <button
              type="button"
              class="page-link"
              aria-label=""
            >...</button>
          `;
          pagesUl.appendChild(li);

          if (separatorBeforeWasPlaced)
            separatorAfterWasPlaced = true;

          separatorBeforeWasPlaced = true;
        }
        
        // If no limitation of the number of buttons
        else {
          const li = document.createElement('li');
          if (i === this.pagination.page) {
            li.setAttribute('class', 'page-item active');
          } else {
            li.setAttribute('class', 'page-item');
          };
          li.innerHTML = `
            <button
              type="button"
              class="page-link"
              aria-label="${this.pagination.pagesLabels.page} ${i}"
            >${i}</button>
          `;
          li.addEventListener("click", () => {
            this.#goToPage(i);
          });
          pagesUl.appendChild(li);
        };
      };

      /////////////////////////////////////////
      // Go to next page
      DOM.create('li')
        .class('page-item')
          .addChildSet('button', {
            type: 'button',
            class: 'page-link' + (this.pagination.page === lastPage ? ' disabled' : ''),
            ariaLabel: this.pagination.pagesLabels.nextPage,
            html: '›',
          })
          .condition(this.pagination.page === lastPage)
          .disable()
          .condition(this.pagination.page !== lastPage)
          .event('click', () => this.#goToPage(Number(this.pagination.page) + 1))
          .parent()
        .appendTo(pagesUl)

      /////////////////////////////////////////
      // Go to last page
        .copy()
          .getChild()
          .html('&raquo;')
          .event('click', () => this.#goToPage(lastPage));
    };
    
    /////////////////////////////////////////
    // Pagination infos
    const start = (Number(this.pagination.page) - 1) * Number(this.pagination.limitPerPage);
    
    if (this.pagination.firstShowingLineId) {
      let firstShowingLine = start + 1;
      document
        .getElementById(this.pagination.firstShowingLineId)
        .innerText = firstShowingLine;
    };
    
    if (this.pagination.lastShowingLineId) {
      let lastShowingLine = Number(start) + Number(this.pagination.limitPerPage);
      if (this.#dataLengthBeforePagination < lastShowingLine)
        lastShowingLine = this.#dataLengthBeforePagination;
      document
        .getElementById(this.pagination.lastShowingLineId)
        .innerText = lastShowingLine;
    };

    if (this.pagination.totalLinesId) {
      document
        .getElementById(this.pagination.totalLinesId)
        .innerText = this.#dataLengthBeforePagination;
    };
  };
};