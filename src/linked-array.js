/**
 * ===================================
 *             PROPTERTY MAPPING
 * ===================================
 */
Array.l_PROP_DICT = {
  FUNC_PREFIX: 'l_',
  ORIGIN: 'l_origin',
  PARENT: 'l_parent',
  SET_PARENT: 'l_setParent',
  CHILDREN: 'l_children',
  ADD_CHILD: 'l_addChildren',
  REMOVE_CHILD: 'l_removeChild',
  HAS_CHILDREN: 'l_hasChildren',
  REMOVE: 'l_remove',
  REMOVE_FLAG: 'l_spliceSelf',
  DEALLOC: 'l_dealloc',
  DEAD_NODE: 'l_DEAD_NODE',
  SET_DEAD: 'l_setDead',
  NEXT_INDEX: 'l_nextTruthy'
};

/**
 * ===================================
 *             DEALLOC
 * ===================================
 */
Object.defineProperty(Array.prototype, Array.l_PROP_DICT.DEALLOC, {
  enumerable: false,
  value: function(child, removeElements = false) {
    if (child && child.length && removeElements) {
      this[Array.l_PROP_DICT.ORIGIN][Array.l_PROP_DICT.REMOVE](...child);
    }
    if (!child && this[Array.l_PROP_DICT.PARENT]) {
      const res = this[Array.l_PROP_DICT.PARENT][Array.l_PROP_DICT.DEALLOC](this, removeElements);
      this[Array.l_PROP_DICT.DEALLOC_CHILDREN]();
      return res;
    }
    if (child) return this[Array.l_PROP_DICT.REMOVE_CHILD](child);
  }
});
Object.defineProperty(Array.prototype, Array.l_PROP_DICT.DEALLOC_CHILDREN, {
  enumerable: false,
  value: function() {
    if (this[Array.l_PROP_DICT.HAS_CHILDREN]) {
      for (let child of this[Array.l_PROP_DICT.CHILDREN]) {
        child[Array.l_PROP_DICT.DEALLOC_CHILDREN]();
        this[Array.l_PROP_DICT.REMOVE_CHILD](child);
      }
    }
  }
});
/**
 * ===================================
 *                MAIN
 * ===================================
 */

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.ORIGIN, {
  enumerable: false,
  get: function() {
    return this[Array.l_PROP_DICT.PARENT] ? this[Array.l_PROP_DICT.PARENT][Array.l_PROP_DICT.ORIGIN] : this;
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.SET_PARENT, {
  enumerable: false,
  value: function(value) {
    Object.defineProperty(this, Array.l_PROP_DICT.PARENT, { enumerable: false, writable: true, value });
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.HAS_CHILDREN, {
  enumerable: false,
  get: function() {
    return this[Array.l_PROP_DICT.CHILDREN] && Array.isArray(this[Array.l_PROP_DICT.CHILDREN]);
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.ADD_CHILD, {
  enumerable: false,
  value: function(child) {
    if (!this[Array.l_PROP_DICT.HAS_CHILDREN]) {
      Object.defineProperty(this, Array.l_PROP_DICT.CHILDREN, { enumerable: false, value: new Array() });
    }
    child[Array.l_PROP_DICT.SET_PARENT](this);
    return this[Array.l_PROP_DICT.CHILDREN].push(child);
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.REMOVE_CHILD, {
  enumerable: false,
  value: function(child) {
    if (!child) return;
    if (this[Array.l_PROP_DICT.HAS_CHILDREN]) {
      const i = this[Array.l_PROP_DICT.CHILDREN].indexOf(child);
      if (i >= 0) {
        let rm = this[Array.l_PROP_DICT.CHILDREN].splice(i, 1);
        if (rm && rm.length) {
          rm[0][Array.l_PROP_DICT.PARENT] = null;
        }
      }
    }
  }
});

/**
 * ===================================
 *             REMOVE LOGIC
 * ===================================
 */

/**
 * Helper form removing items without splice
 */
Object.defineProperty(Array, Array.l_PROP_DICT.DEAD_NODE, {
  enumerable: false,
  value: new Object()
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.REMOVE, {
  enumerable: false,
  value: function(...items) {
    if (!items || !items.length) return;
    let removed = this[Array.l_PROP_DICT.SET_DEAD](...items);
    if (this.indexOf(Array.DEAD_NODE) >= 0) {
      for (let i = 0; i < this.length; i++) {
        if (this[i] === Array.DEAD_NODE) {
          const next = this[Array.l_PROP_DICT.NEXT_INDEX](i);
          if (next >= 0) {
            this[i] = this[next];
            this[next] = Array.DEAD_NODE;
          } else {
            var deadIdx = this.indexOf(Array.DEAD_NODE);
            this.length = deadIdx;
          }
        }
      }
    }
    if (removed.length && this[Array.l_PROP_DICT.HAS_CHILDREN]) {
      for (let child of this[Array.l_PROP_DICT.CHILDREN]) {
        child[Array.l_PROP_DICT.REMOVE](...items);
      }
    }
    return removed;
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.NEXT_INDEX, {
  enumerable: false,
  value: function(index) {
    if (index + 1 < this.length) {
      for (let j = index + 1; j < this.length; j++) {
        if (this[j] && this[j] !== Array.DEAD_NODE) return j;
      }
    }
    return -1;
  }
});

Object.defineProperty(Array.prototype, Array.l_PROP_DICT.SET_DEAD, {
  enumerable: false,
  value: function(...items) {
    var res = [];
    if (this && this.length) {
      for (let deletee of items) {
        const index = this.indexOf(deletee);
        if (index >= 0) {
          res.push(deletee);
          this[index] = Array.DEAD_NODE;
        }
      }
    }
    return res;
  }
});

/**
 * ===================================
 *             OVERRIDE
 * ===================================
 */

/**
 * Store original functions
 */
for (var oFunc of ['slice', 'splice', 'push']) {
  Array.prototype[Array.l_PROP_DICT.FUNC_PREFIX + oFunc] = Array.prototype[oFunc];
}

Array.prototype.push = function(...items) {
  this[Array.l_PROP_DICT.PARENT] && this[Array.l_PROP_DICT.PARENT].push(...items); // push to parent if present
  return this[Array.l_PROP_DICT.FUNC_PREFIX + 'push'](...items); // original push
};

Array.prototype.slice = function(...args) {
  const sliced = this[Array.l_PROP_DICT.FUNC_PREFIX + 'slice'](...args); // original slice
  this[Array.l_PROP_DICT.ADD_CHILD](sliced);
  return sliced;
};

Array.prototype.splice = function(start, deleteCount, ...items) {
  if (this[Array.l_PROP_DICT.ORIGIN] === this && !this[Array.l_PROP_DICT.HAS_CHILDREN]) return this[Array.l_PROP_DICT.FUNC_PREFIX + 'splice'](start, deleteCount, ...items); // if it has no parent nor children -> original splice

  //TODO add item @ start + deleteCount index
  items && items.length && this.push(...items); // add new Items

  // find elements to delete
  let deletees = [],
    end = Math.min(start + deleteCount, this.length);
  for (let i = start; i < end; i++) {
    deletees.push(this[i]);
  }

  return deletees && deletees.length ? this[Array.l_PROP_DICT.ORIGIN][Array.l_PROP_DICT.REMOVE](...deletees) : [];
};
