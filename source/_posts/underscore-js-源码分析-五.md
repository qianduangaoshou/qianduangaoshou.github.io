---
title: underscore.js 源码分析(五)
date: 2017-11-26 00:33:53
tags: underscore.js源码
categories: underscore.js 源码分析
---

###　underscore.js 源码解析（五）

`sample` `toArray`  `size`  `partition`

####  `_.sample`

`_.sample(list, [n])`

用于产生一个随机样本, 传递的参数 n 表示从 `list` 中返回 `n` 个随机元素。

#### 源码分析

```javascript
_.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      // 返回使用 _.random 获得的随机数
      return obj[_.random(obj.length - 1)];
    }
    // 使用 slice 用来分割数组
    // 使用 Math.max() 用来返回最大值
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };
```

1. 通过使用 `Math.max()` 用来获得一组数中的最大值。

   ```javascript
   Math.max(value1, value2, value3, value4...)
   // 获取到 value1, value2, value3, value4... 等一组数中的最大值
   Math.min(value1, value2, value3, value4...)
   // 获取到 value1, value1.. 中的最小值
   ```

2. 使用 `Array.slice` 用来进行分割数组

   `Array.slice(start, end)` 分割的数组中包括 `start` 不包括 `end` 

####  `toArray`

#####　实例

`_.toArray(list)`

如果 `list` 是一个可以迭代的对象, 可以将 `list` 转化为一个数组。

##### 源码分析

```javascript
_.toArray = function(obj) {
    // 如果 obj 不存在, 返回一个空的数组
    if (!obj) return [];
    // 如果 obj 是一个真正的数组, 返回 slice.call(obj),
    // Object.prototype.slice
    if (_.isArray(obj)) return slice.call(obj);
    // 如果 obj 是一个类数组对象
    // 类数组对象属于对象，但是有 length
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    // 返回 obj 是一个对象
    return _.values(obj);
  };
```

当我们判断一个对象是否是数组或者对象的时候我们要分为几种情况:

使用 `obj.length` 进行判断的时候:

1. 对象是数组:

   使用 `Array.isArray` 进行判断，当 这个判断不支持的时候，使用 `Object.prototype.toString` 进行判断。

   ```javascript
   function isArray(obj) {
       return Array.isArray(obj) || Object.prototype.toString.call(obj) ==== '[object Array]';
   }
   ```

2. 对象是类数组对象

   对于类数组对象也有 `length` 属性，因此当我们判断类数组对象不是数组的时候，接下来进行判断:

   ```javascript
   if (obj.length === +obj.length) {
     // 判断得到是类数组对象
   }
   ```

3.  当得到的类型是对象的时候

   ```javascript
   // 对于对象而言: obj.length: undefined
   // +obj.length: NaN
   if (obj.length !== +obj.length) {
   }
   ```

#### `size`

`_.size(list)`

用于返回 `list` 的长度

当 `list` 是数组的时候，返回的是数组的长度，当 `list` 是对象的时候，返回的是对象的长度。

##### 实例

```javascript
let person = {
  name: '张宁宁',
  age: 23,
  sex: 'female'
};
_.size(person) // 3
```

#### 源码分析

使用`_.size` 进行判断的数组数量的方法十分简单，判断传入的是对象或者是数组，对象的话返回的是键的值，对于数组返回的是数组的长度。

```javascript
function size(list) {
  if (list == null) return 0;
  // 判断 list 是否是对象或者数组
  // list 是数组，返回 list 的length
  // list 是对象, 返回的是 Object.keys(list) 的长度
  return list.length === +list.length ? list.length : Object.keys(list).length;
}
```

#### `partition`

`_.partition(array, predicate)`

##### 实例

使用 `partition` 的目的在于拆分一个数组为两个数组，拆分之后的数组中第一个数组是满足 `predicate` 函数的数组，

拆分之后的第二个数组是不满足 `predicate` 函数的数组。

>`predicate` : 断言，断定，宣布，宣讲，使基于

##### 源码分析

```javascript
_.partition = function(obj, predicate, context) {
  predicate = cb(predicate, context);
  // 定义两个数组，分别用来存放成功的数组和失败的数组
  var pass = [], fail = [];
  _.each(obj, function(value, key, object) {
    // predicate 返回 true : pass.push(obj)
    // predicate 返回 false : fail.push(obj)
    (predicate(value, key, object) ? pass : fail).push(obj);
  });
  // 返回一个二维数组
  return [[pass], [fail]];
};
```

