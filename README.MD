Alexander Harl

# Javascript Linked Array Extension

* Can be used with **javascript** and **node.js**.
* Links parent and child arrays when using `slice` or `filter`.

# Use it

TODO
Node.JS

```
$ npm install js-array-extensions

require('js-array-extensions');
```

# Support methods

* slice
* filter
* push

## **Basics**

**slice( start, end )**

```js
let original = [1, 2, 3, 4, 5];
let child = original.slice(0, 1); // as expected creates a slice of the original array
child.l_parent === original; // True
original.l_children[0] === child; // True
```

**filter( comparator )**

```js
let original = [1, 2, 3, 4, 5];
let child = original.filter(comparator); // as expected creates a filtered subset of the original array
child.l_parent === original; // True
original.l_children[0] === child; // True
```
