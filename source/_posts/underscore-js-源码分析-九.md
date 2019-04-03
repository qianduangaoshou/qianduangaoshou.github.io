---
title: underscore.js 源码分析(九)
date: 2017-12-04 22:39:00
tags: underscore.js源码
categories: underscore.js 源码分析
---

###  underscore.js 源码分析

`sortedIndex`  `findIndex`  `findLastIndex` `range`

##### `sortedIndex`

`sortedIndex(list, value, [iteratee], context)`

其中 `list` 是已经被排好序的数组，通过使用 `soetedIndex` 可以查找到 `value` 在已经排好序的 `list` 数组中的顺序。使用 二分法进行查找的。

使用二分法进行查找的 `value` 位置如下:

```javascript
function sortIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  // 获取到传入的 obj 的值
  let value = iteratee(obj);
  let low = 0;
  // 定义 high 是数组的长度 array.length
  let high = array.length;
  while(low < high) {
    let mid = Math.floor((low + high) / 2);
    // 如果 array[mid] > value value 在 low 和 mid 之间
    if (itetatee(array[mid]) > value) > 0) mid = high; else low = mid + 1;
  }
}
```

##### `findIndex`

`findIndex(array, predicate, [context])`

返回在`array` 中满足 `predicate` 函数为真的第一个元素的索引, 如果没有找到，返回 `-1`;

##### `findLastIndex`

类似于使用 `findIndex` 不同的是从数组的从后向前开始检索，返回的是第一个判断为真的值

使用 `findIndex` 以及 `findLastIndex` 的代码如下:

```javascript
function getIndexFunc(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    let length = array.length;
    let index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index; 
    }
    return - 1;
  }
}
let findIndex = getIndexFunc(1);
let findLastIndex = getIndexFunc(-1);
```

##### `range`

`range([start], stop, [step])`

使用 `range` 创建一个整数灵活编号的列表函数，返回一个从 `start` 到 `stop` 的整数的一个列表, 通过使用 `step` 来减少独占。

如果省略 `start`, `start` 默认从 0 开始，步进为 1;

自己写的代码:

```javascript
function range(start, stop, step) {
	let args = arguments;
	let resultArray = [];
	let theStep = 1;
	let theStart = 0;
	if (args.length === 1) {
		stop = args[0];
	}
	if (args.length === 2) {
		theStart = args[0];
		stop = args[1];
	}
	if (args.length === 3) {
		theStart = args[0];
		stop = args[1];
		theStep = args[2];
	}
    // 太繁琐
	if (theStart < stop) {
		for (let index = theStart; index < stop; index = index + theStep) {
		  resultArray.push(index);
	  }
	 } else {
		for (let index = theStart; index > stop; index = index + theStep) {
		resultArray.push(index);
	 }
	}
	return resultArray;
}
```

源码:

```javascript
/*
* @description range 返回特定范围的数组
* @param start {Number} 数组中开始的数字
* @param stop {Number} 数组中结束的数字
* @param step {Nunber} 步进
*/

function range(start, stop, step) {
  if (arguments.length <= 1) {
    start = stop || 0;
    stop = 0;
  }
  step = step || 1;
  let length = Math.max(Math.ceil((start - stop) / step), 0);
  let result = new Array(length);
  for (let index = 0; index < length; index++, start += step) {
    result[index] = start;
  }
  return result;
}
```







