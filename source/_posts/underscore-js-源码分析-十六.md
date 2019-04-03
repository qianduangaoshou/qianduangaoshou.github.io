---
title: underscore.js 源码分析(十六)
date: 2017-12-16 12:14:24
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(十六)

####  `isEmpty`

`isEmpty(object)`   `isElement`  ``

如果 `object` 是一个空对象， 或者 `object` 是一个字符串或者数组, 并且字符串或者数组的 `length`  为 `0`; 返回 `true`,

否则, 返回 `false`.

##### 示例

```javascript
_.isEmpty({}); // true
_.isEmpty({ name: '张宁宁' }); // false
```



##### 源码分析

```javascript
/*
* @description isEmpty 用来判断 Obj 是否为空
*/
function isEmpty (obj) {
  if (obj == null) return true;
  if (isArray(obj) || isString(obj) || isArguments(obj)) return obj.length === 0;
  for (let key in obj) if (has(obj, key)) return false;
  return true;
}
```

####  `isElement`

`isElement(obj)`

如果 `obj` 是一个 `dom` 元素, 返回为 `true;`

对于 dom 元素  `nodeType ===  1`

```javascript
function isElement(obj) {
  // 如果 obj 以及 obj.nodeType === 1
  // 表示 obj 是一个节点对象
  return !!(obj && obj.nodeType === 1);
};
```

#### 判断函数

使用判断函数用于判断函数的类型, 例如:   

`isArray`  `isObject`  `isArguments`  `isFunction`  `isString`  `isNumber` ....

实现上面这几种方法的判断是使用 `Array.prototype.toString.call` 的方法进行判断的:

##### 源码分析  

```javascript
_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
  _.['is' + name] = function (obj) {
    // 通过使用 toString.call 来决定判断是属于哪一种类型
    return toString.call(obj) === `[object ${name}]`;
  }
})
```

对于其他几个的判断:

#####  `isObject` 

```javascript
_.isObject = function (obj) {
  let type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};
```

##### `isFinite`  

用来判断给定的对象是否属于一个无限的数。 

```javascript
_.isFinite = function () {
  return isFinite(obj) && !isNaN(parseFloat(obj));
}
```

##### `isNaN`

用来判断给定的值是否是 `NaN` 值,

>NaN is the only number which does not equal itself (NaN 是唯一一个和他自身不等的值)  

```javascript
_.isNaN = function(obj) {
  // NaN !== NaN
  // NaN 是一个数字
  return _.isNumber(obj) && obj !== +obj;
}
```

##### `isBoolean`

用于判断是否是一个布尔值;

```javascript
_.isBoolean = function(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object, Boolean]';
}
```

##### `isNull`

```javascript
_.isNull = function (obj) {
  return obj === null;
}
```

####  `isUndefined`

```javascript
_.isUndefine = function (obj) {
  // 这里通过使用 void 0 来代替 undefined 值
  return obj === void 0;
}
```

