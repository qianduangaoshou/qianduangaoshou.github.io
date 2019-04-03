---
title: underscore.js 源码解析(六)
date: 2017-11-27 22:59:20
tags: underscore.js源码
categories: underscore.js 源码分析
---

###  underscore.js 源码解析(六)

`first` `initial`  `last` `rest` `compact`

#### `first`

#####  实例

`_.first(array, [n])`

`n` 是可选的, 表示选择数组中的前 `n` 个元素， 当我们没有传递 `n` 的时候，我们获得的是数组的第一个元素 `array[0]`。

使用 `first` 用来获取到数组中的第一个元素。

```javascript
let list = [1, 2, 3, 4];
_.first(list) // 1
```

##### 源码分析

使用 `_.first` 实现的源码如下:

```
_.first = _.head = _.take = function(array, n, guard) {
    // 如果 array 为null 返回 undefined
    if (array == null) return void 0;
    // 如果没有明确传入的 参数 n 返回数组的第一项 array[0]
    if (n == null || guard) return array[0];
    // 使用 _.initial 用于返回数组的前 n 个元素
    return _.initial(array, array.length - n);
 };
```

注意:

1.  如何判断 `null`? 

   如果使用 `typeof` 判断 `null` 会返回 `object` , 实现判断是否为 `null` 的简单方法是进行判断:

   ```
   if (obj == null) {
     // isnull
   }
   ```

这里使用了一个 `_.initial` 用于获取到数组的相关值:

#### `_.initial`

使用 `_.initial` 的目的在于返回数组中前 `n` 个元素，不包括第 `n` 个元素

##### 源码如下:

```javascript
_.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
};
```

#### `_.last`

使用 `_.last` 用于返回数组中的最后一个元素。

##### 源码分析

```javascript
_.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    // 调用 rest函数， 当 n !== null 的时候
    return _.rest(array, Math.max(0, array.length - n));
  };
```

#### `_.rest`

使用 `_.rest` 函数用于返回数组中剩下的元素。

##### 源码分析

```javascript
_.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n); 
};
```

>使用 `slice.call` 其实是 `Array.prototype.slice.call()` 的方法
>
>`Array.slice(start, end)` // 用于裁剪数组，裁剪的数组包括 `start` 不包括 `end`  

#### `compact` 

使用 `compact` 用于去除所有为 `假值` 的数组成员

> 关于假值:  `false`, `undefined` `null`  `0` 以及 `""` 被称为假值, 因为强制类型转换会被转换为 `false`。

源码如下:

```javascript
 _.compact = function(array) {
   // 在 filter 的函数中
    return _.filter(array, _.identity);
 };
```

因为在上面的代码中，函数 `_.filter` 中存在一个判断:

```javascript
if (someFn) {
  // doSomething
}
```

这里会对位于 `if` 框内的元素`someFn`进行强制类型转换。