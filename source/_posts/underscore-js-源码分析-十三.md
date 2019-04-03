---
title: underscore.js 源码分析(十三)
date: 2017-12-11 21:08:53
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(十三)

`keys`  `values`  `pairs`  `invert` `functions`  `mapObject` `findKey`

####  `keys(Object)`

使用 `keys(Object)` 用于获得 `Object` 的所有属性名称。 与 `es6` 中  `Object.keys()` 功能相同，不同的是做了兼容性处理。

```javascript
function keys (obj) {
  // 如果 obj 不存在?
  if (!obj || typeof obj !== 'object') return [];
  // 如果支持 Object.keys 方法, 返回 Object.keys(obj)
  if (Object.keys) return Object.keys(obj);
  // else 使用 for in 进行属性获取
  let keys = [];
  for (let key in obj) {
    keys.push(key);
  }
  // 返回属性数组
  return keys;
}
```

####  `values(Object)`

使用 `values(Object)` 用于获得对象的所有的属性名称。 类似于使用 `Object.values` 获取到对象的属性值。

```javascript
function values (obj) {
  let keys = _.keys(obj);
  let length = keys.length;
  let values = new Array(length);
  for (let i = 0; i < length; i++) {
    values[i] = obj[keys[i]];
  }
  return values;
}
```

####  `pairs()`

使用 `pairs()` 用于将一个对象转化为键值对的形式。

自己写的函数:

```javascript
function pairs (obj) {
  let keys = _.keys(obj);
  let values = _.values(obj);
  let len = keys.length;
  let pairs = [];
  for (let i = 0; i < len; i++) {
    pairs.push([keys[i], values[i]]);
  }
  return pairs;
}
```

源码分析:

```javascript
_.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };
```

#### `invert()`

`invert(object)`

使用 `invert` 实现的是返回一个 `object` 的副本，在这个副本中, `object` 中的键和值互换。

源码:

```javascript
function invert(object) {
  let result = {};
  let keys = _.keys(object);
  for (let i = 0; i < keys.length; i++) {
    result[object[keys[i]]] = keys[i];
  }
  return result;
}
```

####  `functions`

`functions(object)`

返回一个对象中所有的方法名，并且是已经经过排序的方法。

源码分析:

```javascript
_.functions = function (obj) {
  let names = [];
  for (let key in obj) {
    if (_.isFunction(obj[key])) names.push(obj[key]);
  }
  return name.sort();
}
```

#### `mapObject`

类似于使用数组的 `map` 方法，不同的是这个方法针对的是对象的 `map` 方法, 使用 `mapObject` 用来对于对象的属性值进行操作， 实现的源码如下:

```javascript
_.mapObject = function(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  let keys = _.keys(obj);
      length = keys.length;
      result = {};
      currentKey;
  for (let index = 0; index < length; index++) {
    currentKey = keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  } 
}
```

#### `findKey`

`_.findKey(obj, predicate, context)`

使用 `findKey` 返回的是 `obj` 中第一个满足 `predicate` 函数的 `key`。

```javascript
let numbers = {
  first: 5,
  second: 8
};
_.findKey(numbers, function (value) {
  return value > 2;
});
// 返回 first
```

##### 源码分析

`findKey` 源码:

```javascript
_.findKey = function (obj, predicate, context) {
  predicate = cb(predicate, context);
  let keys = _.keys(obj), key;
  for (let i = 0; length = keys.length; i < length; i++) {
    key = keys[i];
    // 如果条件满足, 返回 key
    if (predicate(obj[key], key, obj)) return key;
  }
}
```

