/**
* @typedef {Object} Position
* @property {HTMLElement} previous - Previous node
* @property {HTMLElement} next - Next node
* @property {HTMLElement} parent - Parent
*/

/**
* @typedef {Object} StoredObject
* @property {HTMLElement} node - Node
* @property {String} id - ID (internal)
* @property {Position} position - Position (the previous, next or parent node)
*/

/**
* @typedef {Object} Condition
* @property {Boolean} value - Condition value
* @property {Boolean} lastValue - Condition last value (for handling else)
* @property {Boolean} repeat - Condition repeats ?
*/

/////////////////////////////////////////
////
/** DOMBuilder class */
class DOMBuilder {
  /** @type {HTMLElement} Selected current node */
  node = null;

  /** @type {HTMLElement[]} Selected nodes (array) */
  nodes = [];

  /** @type {StoredObject[]} Stored objects */
  stored = [];

  /** @type {Condition} Condition object */
  #conditions = {
    value: true,
    lastValue: true,
    repeat: false,
  };

  /////////////////////////////////////////
  ////
  /**
  * DOMBuilder constructor
  * @param {String|HTMLElement} node - A node to select
  */
  constructor(node) {
		this.select(node);
  };
	
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Getters
  /**
  * Gets the current node
  * @sets Nothing
  * @returns {HTMLElement} The current node
  */
  get node() {
    return this.node;
  };

  /**
  * Gets the current nodes array
  * @sets Nothing
  * @returns {HTMLElement[]} The current nodes array
  */
  get nodes() {
    return this.nodes;
  };

  /**
  * Gets the current store
  * @sets Nothing
  * @returns {StoredObject[]} The current store
  */
  get stored() {
    return this.stored;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Node selection
  /**
  * Selects a node and stores it as the current node
  * @param {String|HTMLElement} node - An ID | or a node to select
  * @sets Current node = selected node
  * @returns {this} The current class instance
  */
  select(node) {
    if (this.#isString(node))
      this.node = document.getElementById(node);
    else
      this.node = node;
    return this;
  };

  /**
  * Selects a node with querySelector and stores it as the current node
  * @param {String} selector - Selector
  * @param {null|HTMLElement|String} scope - Null | a node to define as the scope | 'this' to scope on the current node | or another string as a stored node ID.
	* (If null, queries the whole 'document'; you can enter 'this' to query the current node;
  * if another string is provided (other than 'this'), it looks for a stored node with the string as the node ID).
  * @sets Current node = the queried node
  * @returns {this} The current class instance
  */
  query(selector, scope = null) {
		this.#queryHelper(scope, (e) => { this.node = e.querySelector(selector); });
    return this;
  };

  /**
  * Same as 'query' (selects a node with querySelector and stores it as the current node), but with the current node as the scope
  * @param {String} selector - Selector
  * @sets Current node = the queried node
  * @returns {this} The current class instance
  */
  queryOn(selector) {
    const node = this.node.querySelector(selector);
		this.node = node;
    return this;
  };
  
  ////// Helper
	#queryHelper(scope, fn) {
    if (!scope)
      fn(document);
    else if (this.#isString(scope)) {
      if (scope === 'this')
        fn(this.node);
      else
        fn(this.#getStoredNode(scope, true));
    }
    else
      fn(scope);
	};
	
  /**
  * Gets the parent and stores it as the current node
  * @param {null|HTMLElement|String} child - Null | a child node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets Current node = parent
  * @returns {this} The current class instance
  */
  parent(child = null) {
    this.node = this.#getStoredNode(child, true).parentNode;
    return this;
  };

  /**
  * Gets the first child and stores it as the current node
  * @param {null|HTMLElement|String} parent - Null | a parent node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets Current node = first child
  * @returns {this} The current class instance
  */
  getChild(parent = null) {
    this.node = this.#getStoredNode(parent, true).firstChild;
    return this;
  };

  /**
  * Gets the first child and stores it as the current node
  * @see {@link child}
  */
  firstChild(parent = null) {
    return this.child(parent);
  };
  
  /**
  * Gets the last child and stores it as the current node
  * @param {null|HTMLElement|String} parent - Null | a parent node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets Current node = last child
  * @returns {this} The current class instance
  */
  lastChild(parent = null) {
    this.node = this.#getStoredNode(parent, true).lastChild;
    return this;
  };
  
  /**
  * Gets the previous node and stores it as the current node
  * @param {null|HTMLElement|String} node - Null | a node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets Current node = previous node
  * @returns {this} The current class instance
  */
  previous(node = null) {
    this.node = this.#getStoredNode(node, true).previousElementSibling;
    return this;
  };

  /**
  * Gets the next node and stores it as the current node
  * @param {null|HTMLElement|String} node - Null | a node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets Current node = the next node
  * @returns {this} The current class instance
  */
  next(node = null) {
    this.node = this.#getStoredNode(node, true).nextElementSibling;
    return this;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Node Manipulation
  /////////////////////////////////////////
  //// With an existing node
  /////////////////////////////////////////
  //// Place an existing node below, before or after the current node
  /**
  * Appends a node to the current node
  * @param {HTMLElement|String} child - Node to append | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @param {Boolean} returnParent - Return the parent node ?
  * @sets Current node = the child / if returnParent, then the parent
  * @returns {this} The current class instance
  */
  append(child, returnParent = false) {
    if (!this.#checkCondition()) return this;
    const node = this.#getStoredNode(child);
    this.node.appendChild(node);
    if (!returnParent) this.node = node;
    return this;
  };
  
  /**
  * Appends a node to the current node
  * @see {@link append}
  */
  child(child, returnParent = false) {
    return this.append(child, returnParent);
  };
  
  /////////////////////////////////////////
  /**
  * Appends several nodes to the current node
  * @param {HTMLElement[]|String[]} children - Nodes to append | or stored node IDs.
  * (If a string is provided, looks for stored nodes).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  children(children) {
    if (!this.#checkCondition()) return this;
    children.forEach(child =>
      this.node.appendChild(this.#getStoredNode(child))
    );
    return this;
  };
  
  /////////////////////////////////////////
  /**
  * Inserts a node before the current node
  * @param {HTMLElement|String} node - Node to insert before | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  before(node) {
    if (!this.#checkCondition()) return this;
    this.node.before(this.#getStoredNode(node));
    return this;
  };

  /**
  * Inserts a node after the current node
  * @param {HTMLElement|String} node - Node to insert after | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  after(node) {
    if (!this.#checkCondition()) return this;
    this.node.after(this.#getStoredNode(node));
    return this;
  };

  /////////////////////////////////////////
  //// Place the current node below, before or after another node
  /**
  * Appends the current node to another node
  * @param {HTMLElement|String} parent - Node to which to append the current node | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  appendTo(parent) {
    if (!this.#checkCondition()) return this;
    this.#getStoredNode(parent).appendChild(this.node);
    return this;
  };

  /////////////////////////////////////////
  /**
  * Inserts the current node before another node
  * @param {HTMLElement|String} node - Node to which to insert before | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  insertBefore(node) {
    if (!this.#checkCondition()) return this;
    this.#getStoredNode(node).before(this.node);
    return this;
  };

  /**
  * Inserts the current node after another node
  * @param {HTMLElement|String} node - Node to which to insert after | or a stored node ID.
  * (If a string is provided, looks for a stored node).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  insertAfter(node) {
    if (!this.#checkCondition()) return this;
    this.#getStoredNode(node).after(this.node);
    return this;
  };

  /////////////////////////////////////////
  //// Move up, move down
  /**
  * Moves the current node up in the tree
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  moveUp() {
    if (!this.#checkCondition()) return this;
    if (this.node.previousElementSibling)
      this.node.previousElementSibling.before(this.node);
    else
      this.node.parentNode.before(this.node);
    return this;
  };
  
  /**
  * Moves the current node down in the tree
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  moveDown() {
    if (!this.#checkCondition()) return this;
    if (this.node.nextElementSibling)
      this.node.nextElementSibling.after(this.node);
    else
      this.node.parentNode.after(this.node);
    return this;
  };

	/**
  * Removes a node from the DOM
  * @param {null|HTMLElement|String} node - Null | a node to remove | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @param {Boolean} returnRemoved - If true, will return the removed node
  * @sets Nothing (current node remains the same) / if returnRemoved, then the removed node
  * @returns {this} The current class instance
  */
  remove(node = null, returnRemoved = false) {
    if (!this.#checkCondition()) return this;
    const removed = this.#getStoredNode(node, true);
    if (!returnRemoved) {
      if (removed.previousElementSibling)
        this.node = removed.previousElementSibling;
      else
        this.node = removed.parentNode;
    };
    removed.remove();
    return this;
  };
  
	/**
  * Helper - Gets a node or a stored node
  * @param {HTMLElement|String} node - A node to retrieve | or a stored node ID
  * @param {Boolean} useCurrentNodeIfEmpty - Use current node if empty ?
  * @returns {HTMLElement} The current class instance
  */
	#getStoredNode(node, useCurrentNodeIfEmpty = false) {
    if (this.#isString(node))
      return this.stored.find(v => !v.position && v.id === node).node;
    else if (useCurrentNodeIfEmpty && !node)
      return this.node;
    else
      return node;
	};

  // ==================================================================
  // ============================ Section =============================
  //#region Functions
  /**
  * Executes a function with the current node as a parameter
  * @param {function(HTMLElement) : void} fn - Function to execute with (HTMLElement : the current node)
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  perform(fn) {
    fn(this.node);
    return this;
  };

  /**
  * Executes a function with the current node, nodes array and store as parameters
  * @param {function(HTMLElement, HTMLElement[], StoredObject[]) : void} fn - Function to execute
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  performAll(fn) {
    fn(this.node, this.nodes, this.stored);
    return this;
  };

  /**
  * Executes a function with the current class instance as a parameter
  * @param {function(DOMBuilder) : void} fn - Function to execute
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  callback(fn) {
    fn(this);
    return this;
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Nodes creation
  /////////////////////////////////////////
  //// Creation
  // ==================================================================
  // ============================ Section =============================
  //#region Create, add, new
  /**
  * Creates a node and stores it in the current node
  * @param {String} tag - Tag of the node to create
  * @sets Current node = created node
  * @returns {this} The current class instance
  */
  create(tag) {
    this.node = document.createElement(tag);
    return this;
  };

  /**
  * Creates a node and stores it as the current node
  * @see {@link create}
  */
  new(tag) {
    return this.create(tag);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  // ==================================================================
  // ============================ Section =============================
  //#region CreateFn, addFn, newFn
  /**
  * Creates a node and returns a function with a new class for this element
  * @param {String} tag - Tag of the node to create
  * @param {function(DOMBuilder, HTMLElement) : void} fn - The function to execute with (DOMBuilder : a new class of the created element, HTMLElement : the current node)
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  createFn(tag, fn) {
    const node = document.createElement(tag);
    fn(new DOMBuilder(node), this.node);
    return this;
  };
  
  /**
  * Creates a node and returns a function with a new class for this element
  * @see {@link createFn}
  */
  newFn(tag, fn) {
    return this.createFn(tag, fn);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  // ==================================================================
  // ============================ Section =============================
  //#region CreateSet, addSet, newSet
  /**
  * Creates a node, stores it as the current node and sets its properties
  * @param {String} tag - Tag of the node to create
  * @param {Object|String} props - An attributes object | or an attribute property
  * @param {any} value - An attribute value (if a property is provided as the 2nd parameter)
  * @sets Current node = created node
  * @returns {this} The current class instance
  * @see {@link create}
  * @see {@link set}
  */
  createSet(tag, props, value) {
    this.node = document.createElement(tag);
    this.#setAttributes(props, value);
    return this;
  };

  /**
  * Creates a node, stores it as the current node and sets its properties
  * @see {@link createSet}
  */
  newSet(tag, props, value) {
    return this.createSet(tag, props, value);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  /////////////////////////////////////////
  //// Appending / inserting
  // ==================================================================
  // ============================ Section =============================
  //#region Append, create, add, new child (below)
  /**
  * Creates a node and append it to the current node
  * @param {String} tag - Tag of the node to create
  * @param {Boolean} returnParent - Return the parent node ?
  * @sets Current node = the created child / if returnParent, then the parent
  * @returns {this} The current class instance
  */
  appendNew(tag, returnParent = false) {
    const node = document.createElement(tag);
    this.node.appendChild(node);
    if (!returnParent) this.node = node;
    return this;
  };

  /**
  * Creates a node and append it to the current node
  * @see {@link appendNew}
  */
  appendChild(tag, returnParent = false) {
    return this.appendNew(tag, returnParent);
  };

  /**
  * Creates a node and append it to the current node
  * @see {@link appendNew}
  */
  addChild(tag, returnParent = false) {
    return this.appendNew(tag, returnParent);
  };
  
  /**
  * Creates a node and append it to the current node
  * @see {@link appendNew}
  */
  newChild(tag, returnParent = false) {
    return this.appendNew(tag, returnParent);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  // ==================================================================
  // ============================ Section =============================
  //#region Create, add, new child (below) + set
  /**
  * Creates a node and append it to the current node, then sets its properties
  * @param {String} tag - Tag of the node to create
  * @param {Object|String} props - An attributes object | or an attribute property
  * @param {any|Boolean} value - An attribute value (if a property is provided as 1st param) | or a boolean value for 'returnParent'
  * @param {Boolean} returnParent - Return the parent node ?
  * @see {@link appendNew}
  * @see {@link set}
  * @sets Current node = the created child / if returnParent, then the parent
  * @returns {this} The current class instance
  */
  appendNewSet(tag, props, value, returnParent = false) {
    // Save current (parent) node
    const backup = this.node;

    this.node = document.createElement(tag);
    this.#setAttributes(props, value);
    backup.appendChild(this.node);

    // Retrieve the first node
    let returnMode = false;

    if (this.#isString(props)) returnMode = returnParent;
    else returnMode = value;
    if (returnMode) this.node = backup;
    return this;
  };

  /**
  * Creates a node and append it to the current node, then sets its properties
  * @see {@link appendNewSet}
  */
  appendChildSet(tag, props, value, returnParent = false) {
    return this.appendNewSet(tag, props, value, returnParent);
  };

  /**
  * Creates a node and append it to the current node, then sets its properties
  * @see {@link appendNewSet}
  */
  addChildSet(tag, props, value, returnParent = false) {
    return this.appendNewSet(tag, props, value, returnParent);
  };

  /**
  * Creates a node and append it to the current node, then sets its properties
  * @see {@link appendNewSet}
  */
  newChildSet(tag, props, value, returnParent = false) {
    return this.appendNewSet(tag, props, value, returnParent);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================
  
  // ==================================================================
  // ============================ Section =============================
  //#region Create, add, new child (below)
  /**
  * Inserts a new node before the current node
  * @param {String} tag - Tag of the node to create
  * @sets Current node = the created node
  * @returns {this} The current class instance
  */
  addBefore(tag) {
    const node = document.createElement(tag);
    this.node.before(node);
    this.node = node;
    return this;
  };

  /**
  * Inserts a new node before the current node
  * @see {@link addBefore}
  */
  newBefore(tag) {
    return this.addBefore(tag);
  };

  // ==================================================================
  /**
  * Inserts a new node after the current node
  * @see {@link addAfter}
  */
  add(tag) {
    return this.addAfter(tag);
  };

  /**
  * Inserts a new node after the current node
  * @param {String} tag - Tag of the node to create
  * @sets Current node = new created node
  * @returns {this} The current class instance
  */
  addAfter(tag) {
    const node = document.createElement(tag);
    this.node.after(node);
    this.node = node;
    return this;
  };

  /**
  * Inserts a new node after the current node
  * @see {@link addAfter}
  */
  newAfter(tag) {
    return this.addAfter(tag);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  // ==================================================================
  // ============================ Section =============================
  //#region Create, add, new node after + set
  /**
  * Inserts a new node after the current node and sets its properties
  * @see {@link addAfterSet}
  */
  addSet(tag, props, value, returnSource = false) {
    return this.addAfterSet(tag, props, value, returnSource);
  };
  
  /**
  * Inserts a new node after the current node and sets its properties
  * @param {String} tag - Tag of the node to create
  * @param {Object|String} props - An attributes object | or an attribute property
  * @param {any|Boolean} value - An attribute value (if a property is provided as 1st param) | or a boolean value for 'returnSource'
  * @param {Boolean} returnSource - Return the source node (not the created) ?
  * @see {@link createAfter}
  * @see {@link set}
  * @sets Current node = the created node / if returnSource, then the source node
  * @returns {this} The current class instance
  */
  addAfterSet(tag, props, value, returnSource = false) {
    // Save current node
    const backup = this.node;

    this.node = document.createElement(tag);
    this.#setAttributes(props, value);
    backup.after(this.node);
    
    // Retrieve the first node
    let returnMode = false;

    if (this.#isString(props)) returnMode = returnSource;
    else returnMode = value;
    if (returnMode) this.node = backup;
    return this;
  };

  /**
  * Inserts a new node after the current node and sets its properties
  * @see {@link addAfterSet}
  */
  newAfterSet(tag, props, value, returnSource = false) {
    return this.addAfterSet(tag, props, value, returnSource);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  /////////////////////////////////////////
  //// Copying
  // ==================================================================
  // ============================ Section =============================
  //#region Copy  
  /**
  * Inserts a new same node before the defined node
  * @param {null|HTMLElement|String|Boolean} node - Null | a node to copy | a stored node ID | a boolean value for 'doNotCopyChildren'.
  * (If null, takes the current node; if a string is provided, looks for a stored node;
  * you can also provide a boolean value for 'doNotCopyChildren' for the current node).
  * @param {Boolean} doNotCopyChildren - Do not copy children ?
  * @sets Current node = new created node (the clone)
  * @returns {this} The current class instance
  */
  copyBefore(node = null, doNotCopyChildren) {
    const clone = this.#getClone(node, doNotCopyChildren);
    this.node.before(clone);
    this.node = clone;
    return this;
  };

  /**
  * Inserts a new same node after the defined node
  * @param {null|HTMLElement|String|Boolean} node - Null | a node to copy | a stored node ID | a boolean value for 'doNotCopyChildren'.
  * (If null, takes the current node; if a string is provided, looks for a stored node;
  * you can also provide a boolean value for 'doNotCopyChildren' for the current node).
  * @param {Boolean} doNotCopyChildren - Do not copy children ?
  * @sets Current node = new created node (the clone)
  * @returns {this} The current class instance
  */
  copy(node = null, doNotCopyChildren) {
    const clone = this.#getClone(node, doNotCopyChildren);
    this.node.after(clone);
    this.node = clone;
    return this;
  };
  
  /**
  * Inserts a new same node after the defined node
  * @see {@link copy}
  */
  copyAfter(node = null, doNotCopyChildren) {
    return this.copy(node, doNotCopyChildren);
  };

  /////////////////////////////////////////
  ////// Helpers
  #getClone(node, doNotCopyChildren) {
    if (this.#isBoolean(node)) {
      doNotCopyChildren = node;
      return this.node.cloneNode(!doNotCopyChildren);
    }
    else if (node)
      return this.#getStoredNode(node).cloneNode(!doNotCopyChildren);
    else
      return this.node.cloneNode(true);
  };
  //#endregion
  // ========================== End Section ===========================
  // ==================================================================

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Nodes arrays
  /**
  * Stores nodes in the nodes array with querySelectorAll
  * @param {String} selector - Selector
  * @param {null|HTMLElement|String} scope - Null | a node to define as the scope | or a stored node ID.
	* (If null, takes the current node; if a string is provided - unless it is 'doc' or 'document' -, looks for a stored node;
  * so you can enter 'doc' or 'document' to scope on the whole document).
  * @sets The nodes array = the queried nodes (the current node is not affected)
  * @returns {this} The current class instance
  */
  queryAll(selector, scope = null) {
		this.#queryHelper(scope, (e) => { this.nodes = e.querySelectorAll(selector); });
    return this;
  };

  /**
  * Same as 'queryAll' (stores nodes in the nodes array with querySelectorAll), but with the current node as the scope
  * @param {String} selector - Selector
  * @sets The nodes array = the queried nodes (the current node is not affected)
  * @returns {this} The current class instance
  */
  queryAllOn(selector) {
		this.nodes = this.node.querySelectorAll(selector);
    return this;
  };

  /**
  * Gets the children and stores them in the nodes array
  * @param {null|HTMLElement|String} parent - Null | a parent node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets The nodes array = the children (the current node is not affected)
  * @returns {this} The current class instance
  */
  getChildren(parent = null) {
		this.nodes = this.#getStoredNode(parent, true).children;
    return this;
  };

  /**
  * Gets the siblings and stores them in the the nodes array
  * @param {null|HTMLElement|String} node - Null | a node | or a stored node ID.
  * (If null, takes the current node; if a string is provided, looks for a stored node).
  * @sets The nodes array = the siblings (the current node is not affected)
  * @returns {this} The current class instance
  */
  siblings(node = null) {
		this.nodes = this.#getStoredNode(node, true).siblings;
    return this;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Array object
  /**
  * Gets array object
  */
  get array() {
    return {
      /**
      * Adds a node to the nodes array
      * @param {null|HTMLElement} node - Null | or a node to add
      * (optional, if null adds the current node)
      * @sets Pushes the node to the array
      * @returns {this} The current class instance
      */
      add: (node = null) => {
        if (!node) node = this.node;
        this.nodes.push(node);
        return this;
      },

      /**
      * Gets an item based on its index
      * @param {Number} index - An index
      * @sets Nothing
      * @returns {this} The current class instance
      */
      get: (index) => {
        if (isNaN(index) || index < 0) return null;
        return this.nodes[index];
      },

      /**
      * Selects a node from the current nodes array and stores it in the current node
      * @param {Number|String} idxOrAttr - An index to look for | or a node attribute
      * @param {null|String} attrValue - Null | or an attribute value, if the 1st parameter is an attribute
      * @sets Current node = the selected node
      * @returns {this} The current class instance
      */
      select(idxOrAttr, attrValue = null) {
        if (!isNaN(idxOrAttr))
          this.node = this.nodes[idxOrAttr];
        else
          this.node = this.nodes.find(v =>
            v.getAttribute(idxOrAttr) && v.getAttribute(idxOrAttr) === attrValue
          );
        return this;
      },

      /**
      * Removes a node from the nodes array
      * @param {null|HTMLElement} node - Null | or a node to remove
      * (optional, if null removes the current node)
      * @returns {this} The current class instance
      */
      remove: (node = null) => {
        if (!node) node = this.node;
        const idx = this.nodes.findIndex(v => v === node);
        if (idx > -1) this.nodes.splice(idx, 1);
        return this;
      },

      /**
      * Removes last nodes array item
      * @sets Removes the node from the array
      * @returns {this} The current class instance
      */
      removeLast: () => {
        this.nodes.splice(this.nodes.length - 1, 1);
        return this;
      },

      /**
      * Flushes the nodes array
      * @sets Nodes = empty array
      * @returns {this} The current class instance
      */
      flush: () => {
        this.nodes = [];
        return this;
      },

      /**
      * Appends a node to each node in the current nodes array
      * @param {null|HTMLElement} child - Null | or a node to append to the array
      * (optional, if null appends the current node)
      * @param {null|HTMLElement[]} nodes - Null | or nodes (array) to which the child will be appended
      * (optional, if null uses the current nodes array)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      append: (child = null, nodes = null) => {
        if (!child) child = this.node;
        if (!nodes) nodes = this.nodes;
        nodes.forEach(node => node.appendChild(child));
        return this;
      },
      
      /**
      * Appends all nodes from the current nodes array to a node
      * @param {null|HTMLElement} parent - Null | or a node to which the array will be appended
      * (optional, if null appends to the current node)
      * @param {null|HTMLElement[]} nodes - Null | or nodes (array) to append
      * (optional, if null appends the current nodes array)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      appendTo: (parent = null, nodes = null) => {
        if (!parent) parent = this.node;
        if (!nodes) nodes = this.nodes;
        nodes.forEach(node => parent.appendChild(node));
        return this;
      },

      /**
      * Executes a function with the nodes array as a parameter
      * @param {function(HTMLElement[]) : void} fn - Function to execute with (HTMLElement[] : the nodes array)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      perform: (fn) => {
        fn(this.nodes);
        return this;
      },
      
      /**
      * Executes a function with a new class instance for each array item as a parameter
      * @param {function(DOMBuilder, Number, HTMLElement) : void} fn - Function to execute with (DOMBuilder : a new class instance for the item, Number : the item index, HTMLElement : the current node)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      forEach: (fn) => {
        for (let i = 0; i < this.nodes.length; i++) {
          const node = this.nodes[i];
          const elClass = new DOMBuilder(node);
          fn(elClass, i, this.node);
        }
        return this;
      },
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Nodes storing
  /**
  * Saves a node in the store
  * @param {null|HTMLElement|String} node - Null | a node to store | or an ID to save the current node.
  * (If null, stores the current node; in that case, you can enter an ID as the 1st parameter to retrieve it later with load()).
  * @param {null|String} id - Null | or an internal ID to set for the saved node (optional, but useful to retrieve it later with load()).
  * @sets Pushes the node into the store
  * @returns {this} The current class instance
  */
  save(node = null, id = null) {
    if (!node || this.#isString(node)) {
      if (this.#isString(node)) id = node;
      node = this.node;
    };
		const obj = {
			node: node,
			id: id,
		};
    this.stored.push(obj);
    return this;
  };

  /**
  * Loads a node from the store to the current node
  * @param {null|String} id - Null | or the internal ID of the node to retrieve
  * (optional, if no ID is entered the last saved node will be loaded).
  * @sets Current node = loaded node
  * @returns {this} The current class instance
  */
  load(id = null) {
    if (id && this.#isString(id))
      this.node = this.stored.find(v => !v.position && v.id === id).node;
    else
      this.node = this.stored.findLast(v => !v.position).node;
    return this;
  };

	/**
  * Detaches a node from the DOM (it will save its position to reuse it later)
  * @param {null|HTMLElement|String} node - Null | a node to detach | or an ID to save the current node.
  * (If null, detaches the current node; in that case, you can enter an ID as the 1st parameter, to retrieve it later with reattach()).
  * @param {null|String} id - Null | or an internal ID to set for the detached node
  * (optional, but useful to retrieve it later with reattach()).
  * @sets Pushes the detached node in the store
  * @returns {this} The current class instance
  */
  detach(node = null, id = null) {
    if (!node || this.#isString(node)) {
      if (this.#isString(node)) id = node;
      node = this.node;
    };
    const pos = this.#getPosition(node);
		const obj = {
			node: node,
			id: id,
      position: pos,
		};
    this.stored.push(obj);
    node.remove();
    return this;
  };

  /**
  * Reattaches a detached node to the DOM at same position
  * @see {@link reattach}
  */
  attach(id = null) {
    return this.reattach(id);
  };

  /**
  * Reattaches a detached node to the DOM at same position
  * @param {null|String} id - Null | or the internal ID of the node to reattach
  * (optional, if no ID is entered the last detached node will be reattached).
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  reattach(id = null) {
    let storedObj = null;
    if (id && this.#isString(id))
      storedObj = this.stored.find(v => v.position && v.id === id);
    else
      storedObj = this.stored.findLast(v => v.position);
    const pos = storedObj.position;
    const node = storedObj.node;
    this.#insertAtPosition(node, pos);
    return this;
  };

  ////// Helpers
  #getPosition(node) {
    const pos = {};
    if (node.previousElementSibling)
      pos.previous = node.previousElementSibling;
    else if (node.nextElementSibling)
      pos.next = node.nextElementSibling;
    else if (node.parentNode)
      pos.parent = node.parentNode;
    else
      throw new Error('DOM.remove(' + node.outerHTML + '): The element doesn\'t appear to be on the DOM');
    return pos;
  };

  #insertAtPosition(node, pos) {
    if (pos.previous)
      pos.previous.after(node);
    else if (pos.next)
      pos.next.before(node);
    else if (pos.parent)
      pos.parent.appendChild(node);
    else
      throw new Error('DOM.reattach(): There is no element to reattach. Please use this function after having removed an element (DOM.remove())');
  };

  /**
  * Saves the current node globally in an object, to reuse it later (you must pass a variable representing { ... })
  * @param {Object} obj - A variable representing an object
  * @param {null|String} prop - Null | a property name (if null, will store the object in obj.node)
  * @sets Nothing (current node remains the same)
  * @returns {this} The current class instance
  */
  saveGlobal(obj, prop = null) {
    if (prop)
      obj[prop] = this.node;
    else
      obj.node = this.node;
    return this;
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Store object
  /**
  * Gets store object
  */
  get store() {
    return {
      /**
      * Saves a node in the store
      * @see {@link save}
      */
      add: (node = null, id = null) => {
        this.save(node, id);
      },

      /**
      * Loads a node from the store to the current node
      * @see {@link load}
      */
      get: (id = null) => {
        this.load(id);
      },

      /**
      * Removes a node from the store
      * @param {null|HTMLElement|String} node - Null | a node to remove | or an ID of a node to remove.
      * (If null, it will try with the current node).
      * @sets Removes the node from the store
      * @returns {this} The current class instance
      */
      remove: (node = null) => {
        if (!node) node = this.node;
        let idx = -1;
        if (this.#isString(node))
          idx = this.stored.findIndex(v => v.id === node);
        else
          idx = this.stored.findIndex(v => v === node);
        if (idx > -1) this.stored.splice(idx, 1);
        return this;
      },

      /**
      * Removes last node from the store
      * @sets Removes the node from the store
      * @returns {this} The current class instance
      */
      removeLast: () => {
        this.stored.splice(this.stored.length - 1, 1);
        return this;
      },

      /**
      * Flushes the store array
      * @sets Store = empty array
      * @returns {this} The current class instance
      */
      flush: () => {
        this.stored = [];
        return this;
      },

      /**
      * Executes a function with store as a parameter
      * @param {function(StoredObject[]) : void} fn - The function to execute with (StoredObject[] : the store array)
      * @sets Nothing (current node remains the same)
      * @returns {this} The current class instance
      */
      perform: (fn) => {
        fn(this.stored);
        return this;
      },
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Conditions
  /**
  * Sets a condition; next chain is skipped if condition is false (next chain is executed only if condition is true)
  * @param {Boolean|function(HTMLELement):Boolean} condition - A condition (boolean value) | A function with the current node as the parameter, returning a boolean value
  * @param {Boolean} repeat - Repeat ? (if true, you must use later cancelCondition() to stop skipping the chain in case of false return)
  * @sets Next chain is skipped if condition is false / if repeat and condition is false, then all next chains are skipped until calling cancelCondition()
  * @returns {this} The current class instance
  */
  condition(condition, repeat = false) {
    this.#conditions.repeat = repeat ? true : false;
    if (this.#isBoolean(condition)) {
      this.#conditions.value = condition;
    }
    else {
      this.#conditions.value = condition(this.node);
    };
    this.#conditions.lastValue = this.#conditions.value;
    return this;
  };
  
  /**
  * Sets a condition; next chain is skipped if condition is false (next chain is executed only if condition is true)
  * @param {Boolean|function(HTMLELement):Boolean} condition - A condition (boolean value) | A function with the current node as the parameter, returning a boolean value
  * @param {Boolean} repeat - Repeat ? (if true, you must use later cancelCondition() to stop skipping the chain in case of false return)
  * @sets Next chain is skipped if condition is false / if repeat and condition is false, then all next chains are skipped until calling cancelCondition()
  * @returns {this} The current class instance
  * @see {@link condition}
  */
  if(condition, repeat = false) {
    return this.condition(condition, repeat);
  };

  /**
  * Next chain is skipped if the last condition was true (next chain is executed only if the last condition was false)
  * and again (like condition()) next chain is skipped if condition is false (next chain is executed only if condition is true)
  * @param {Boolean|function(HTMLELement):Boolean} condition - A condition (boolean value) | A function with the current node as the parameter, returning a boolean value
  * @param {Boolean} repeat - Repeat ? (if true, you must use later cancelCondition() to stop skipping the chain in case of false return)
  * @sets Next chain is skipped if condition is false / if repeat and condition is false, then all next chains are skipped until calling cancelCondition()
  * @returns {this} The current class instance
  */
  elseIf(condition, repeat = false) {
    this.#conditions.repeat = repeat ? true : false;
    if (this.#conditions.lastValue) {
      this.#conditions.value = false;
      return this;
    };
    if (this.#isBoolean(condition)) {
      this.#conditions.value = condition;
    }
    else {
      this.#conditions.value = condition(this.node);
    };
    this.#conditions.lastValue = this.#conditions.value;
    return this;
  };
  
  /**
  * Next chain is skipped if the last condition was true (next chain is executed only if the last condition was false)
  * @param {Boolean} repeat - Repeat ? (if true, you must use later cancelCondition() to stop skipping the chain if the last condition was true)
  * @sets Next chain is skipped if the last condition was true
  * @returns {this} The current class instance
  */
  else(repeat = false) {
    this.#conditions.repeat = repeat ? true : false;
    if (this.#conditions.lastValue) {
      this.#conditions.value = false;
    };
    return this;
  };

  /**
  * Cancels the last condition
  * @sets Last condition is not applied anymore to the next chains
  * @returns {this} The current class instance
  * @see {@link cancelCondition}
  * @see {@link condition}
  */
  cancelCondition() {
    this.#conditions.value = true;
    this.#conditions.repeat = false;
    return this;
  };

  /**
  * Cancels the last condition
  * @sets Last condition is not applied anymore to the next chains
  * @returns {this} The current class instance
  * @see {@link cancelCondition}
  * @see {@link condition}
  */
  cancelIf() {
    return this.cancelCondition();
  };
  
  ////// Helper
  #checkCondition() {
    let result = this.#conditions.value;
    if (!this.#conditions.repeat) {
      this.#conditions.value = true;
      this.#conditions.repeat = false;
    };
    return result;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Attributes setters
  /**
  * Sets attribute on the current node
  * @param {Object|String} props - An attributes object | or an attribute property
  * @param {any} value - An attribute value (if a property is provided as the 1st parameter)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  set(props, value) {
    if (!this.#checkCondition()) return this;
    this.#setAttributes(props, value);
    return this;
  };

  /**
  * @param {Object|String} props - An attributes object | or an attribute property
  * @param {any} value - An attribute value (if a property is provided as the 1st parameter)
  * @see {@link set}
  */
  #setAttributes(props, value) {
    if (this.#isString(props)) {
      if (!value || value === '')
        this.node.removeAttribute(props);
      else
        this.node.setAttribute(props, value);
    }
    else {
      Object.keys(props).forEach(key => {
        value = props[key];
        if (key === 'text')
          this.node.innerText = value;
        else if (key === 'html')
          this.node.innerHTML = value;
        else if (key === 'event') {
          // For 'event' prop, you must pass an array with ['event':String, function(element, event):void]
          if (!Array.isArray(value))
            throw new Error("For 'event' prop, you must pass an array with ['event':String, function(element, event):void]");
          const el = new Object(this.node);
          this.node.addEventListener(value[0], (e) => value[1](el, e));
        }
        else {
          key = this.#camelToKebab(key);
          if (!value || value === '')
            this.node.removeAttribute(key);
          else
            this.node.setAttribute(key, value);
        };
      });
    };
  };

  /**
  * Sets ID on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  id(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('id', value);
    return this;
  };

  /**
  * Sets name on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  name(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('name', value);
    return this;
  };
  
  /**
  * Sets type on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  type(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('type', value);
    return this;
  };

  /**
  * Sets for on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  for(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('for', value);
    return this;
  };

  /**
  * Sets placeholder on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  placeholder(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('placeholder', value);
    return this;
  };

  /**
  * Sets value on the current node
  * @param {any} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  value(value) {
    if (!this.#checkCondition()) return this;
    this.node.value = value;
    return this;
  };

  /**
  * Sets href on the current node
  * @param {any} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  href(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('href', value);
    return this;
  };

  /**
  * Sets innerText on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  text(value) {
    if (!this.#checkCondition()) return this;
    this.node.innerText = value;
    return this;
  };

  /**
  * Sets innerHTML on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  html(value) {
    if (!this.#checkCondition()) return this;
    this.node.innerHTML = value;
    return this;
  };

  /**
  * Sets class on the current node
  * @param {String} value - Value
  * @sets Nothing
  * @returns {this} The current class instance
  */
  class(value) {
    if (!this.#checkCondition()) return this;
    this.node.setAttribute('class', value);
    return this;
  };

  /**
  * Toggles class(es) on the current node
  * @param {String|String[]} values - Values (one string, or can be an array of strings)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  toggle(values) {
    if (!this.#checkCondition()) return this;
    if (Array.isArray(values))
      values.forEach(className => this.node.classList.toggle(className));
    else
      this.node.classList.toggle(values);
    return this;
  };

  /**
  * Sets style on the current node
  * @param {Object|String} props - A style object | or a style property
  * @param {any} value - A style value (if a property is provided as the 1st parameter)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  style(props, value) {
    if (!this.#checkCondition()) return this;
    if (this.#isString(props))
      this.node.style[props] = value;
    else {
      Object.keys(props).forEach(key => {
        if (props[key])
          this.node.style[key] = props[key];
      });
    };
    return this;
  };
  
  /**
  * Disables the current node
  * @sets Nothing
  * @returns {this} The current class instance
  */
  disable() {
    if (!this.#checkCondition()) return this;
    this.node.disabled = true;
    return this;
  };
  
  /**
  * Disables conditionally the current node
  * @param {Boolean} condition - A condition
  * @sets Nothing
  * @returns {this} The current class instance
  */
  disableIf(condition) {
    if (!this.#checkCondition()) return this;
    if (condition) this.node.disabled = true;
    return this;
  };
  
  /**
  * Enables the current node
  * @sets Nothing
  * @returns {this} The current class instance
  */
  enable() {
    if (!this.#checkCondition()) return this;
    this.node.disabled = false;
    return this;
  };

  /**
  * Enables conditionally the current node
  * @param {Boolean} condition - A condition
  * @sets Nothing
  * @returns {this} The current class instance
  */
  enableIf(condition) {
    if (!this.#checkCondition()) return this;
    if (condition) this.node.disabled = false;
    return this;
  };

  /**
  * Sets checked on the current node
  * @param {Boolean} value - A value (if empty = true)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  checked(value = true) {
    if (!this.#checkCondition()) return this;
    this.node.checked = value;
    return this;
  };

  /**
  * Adds an event listener on the current node
  * @param {String} event - Event
  * @param {function(HTMLElement, HTMLEventListener) : void} fn - Function to execute on event with (HTMLElement : the current node, HTMLEventListener : the event)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  event(event, fn) {
    if (!this.#checkCondition()) return this;
    const el = new Object(this.node);
    this.node.addEventListener(event, (e) => fn(el, e));
    return this;
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Classes object
  /**
  * Gets classes object
  */
  get classes() {
    return {
      /**
      * Sets class on the current node
      * @see {@link DOMBuilder.class}
      */
      set: (value) => {
        return this.class(value);
      },

      /**
      * Adds class(es) on the current node
      * @param {String|String[]} values - Values (one string, or can be an array of strings)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      add: (values) => {
        if (!this.#checkCondition()) return this;
        if (Array.isArray(values))
          values.forEach(className => this.node.classList.add(className));
        else
          this.node.classList.add(values);
        return this;
      },

      /**
      * Removes class(es) on the current node
      * @param {String|String[]} values - Values (one string, or can be an array of strings)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      remove: (values) => {
        if (!this.#checkCondition()) return this;
        if (Array.isArray(values))
          values.forEach(className => this.node.classList.remove(className));
        else
          this.node.classList.remove(values);
        return this;
      },

      /**
      * Toggles class(es) on the current node
      * @see {@link toggle}
      */
      toggle: (values) => {
        return this.toggle(values);
      },

      /**
      * Check if classList contains the value
      * @param {String} value - Value
      * @sets Nothing
      * @returns {Boolean} The current class instance
      */
      contains: (value) => {
        return this.node.classList.contains(value);
      },
    };
  };
  
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Events object
  /**
  * Gets events object
  */
  get events() {
    return {
      /**
      * Adds an event listener on the current node
      * @see {@link DOMBuilder.event}
      */
      add: (event, fn) => {
        return this.event(event, fn);
      },

      /**
      * Removes an event listener on the current node
      * @param {String} event - Event
      * @param {function(HTMLElement, HTMLEventListener) : void} fn - Function to remove with (HTMLElement : the current node, HTMLEventListener : the event)
      * @sets Nothing
      * @returns {this} The current class instance
      */
      remove: (event, fn) => {
        if (!this.#checkCondition()) return this;
        const el = new Object(this.node);
        this.node.removeEventListener(event, (e) => fn(el, e));
        return this;
      },
    };
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  //// Others
  /**
  * Debug function (logs the current class state)
  * @sets Nothing
  * @returns {this} The current class instance
  */
  debug() {
    let logArray = 'EMPTY';
    if (this.nodes && this.nodes.length > 0) {
      logArray = '';
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        if (logArray === '')
          logArray += '[\n' + node.outerHTML;
        else
          logArray += ',\n'   + node.outerHTML;
      }
      logArray += '\n]';
    };

    let logStore = 'EMPTY';
    if (this.stored && this.stored.length > 0) {
      logStore = '';
      this.stored.forEach(stored => {
        const newObj = {
          ...stored,
          node: stored.node.outerHTML,
        };
        if (logStore === '')
          logStore += '[\n' + JSON.stringify(newObj);
        else
          logStore += ',\n'   + JSON.stringify(newObj);
      });
      logStore += '\n]';
    };
    
    console.log(
      '\n*************************\nDEBUG START\n*************************',
      '\nthis:',
      this,
      '\n\nthis.node:',
      '\n', this.node ? this.node.outerHTML : 'EMPTY',
      '\n\nthis.nodes:',
      '\n', logArray,
      '\n\nthis.stored:',
      '\n', logStore,
      '\n\nthis.#conditions:',
      '\n', this.#conditions ? JSON.stringify(this.#conditions) : 'EMPTY',
      '\n\n*************************\nDEBUG END\n*************************'
    );

    return this;
  };

	//////
	#isString(value) {
		if (typeof value === "string") return true;
		return false;
	};
  
	//////
	#isBoolean(value) {
		if (typeof value === "boolean") return true;
		return false;
	};

  //////
	#camelToKebab(str) { 
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  };

  /*#convertObjectKeysToKebab(obj) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        this.#camelToKebab(key),
        value,
      ])
    );
  };*/

  //////
  /*#kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  #convertObjectKeysToCamel(obj) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        this.#kebabToCamel(key),
        value,
      ])
    );
  };*/
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//// Shortcut functions
const DOM = (node) => new DOMBuilder(node);

/**
* Selects a node and stores it as the current node
* @see {@link DOMBuilder.select}
*/
DOM.select = (node) => new DOMBuilder().select(node);

/**
* Creates a node and stores it as the current node
* @see {@link DOMBuilder.create}
*/
DOM.create = (tag) => new DOMBuilder().create(tag);

/**
* Selects a node with querySelector and stores it as the current node
* @see {@link DOMBuilder.query}
*/
DOM.query = (selector, scope) => new DOMBuilder().query(selector, scope);

/**
* Stores nodes in the nodes array with querySelectorAll
* @see {@link DOMBuilder.queryAll}
*/
DOM.queryAll = (selector, scope) => new DOMBuilder().queryAll(selector, scope);