---
title: underscore.js源码分析(八)
date: 2017-12-01 23:22:58
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(八)

`zip` `unzip` `object` `indexOf` `lastIndexOf`

#### `zip`

`_.zip(*arrays)`

使用 `zip` 的目的是将数组中相应位置的值结合在一起。将分离的数组归并为一个数组。

##### 实例

```javascript
_.zip(['张宁宁', '张艺苇'], ['男', '女'], ['山东', '河北']);
=> [['张宁宁', '男', '山东'] , ['张艺苇', '女', '河北']]
```

##### 源码分析

自己写的:

```javascript
/** 
 * @description 用于合成数组
 * @param {Object} array 传入的多个数组
 * @return {Object} 返回的经过合成之后的数组
*/
function zip(array) {
    // 需要添加是否为 null
    if (array === null) return [];
	let args = Array.prototype.slice.call(arguments, 0);
	let result = [];
	array.map((item, index) => {
		let arr = [];
		args.map((argItem) => {
			arr.push(argItem[index]);
		})
		result.push(arr);
	});
	return result;
}
```

需要注意的几点:

1. 对于传入的 `array` 需要进行判断，是否为 `null`

   >对于传入的参数一定要进行类型判断

```javascript
 _.zip = function(array) {
    if (array == null) return [];
    // 使用 _.max 获取到 arguments 中所有的数组个数
    var length = _.max(arguments, 'length').length;
    // 使用 Array 生成 length 长度的数组
    var results = Array(length);
    while (length-- > 0) {
      // 使用 pluck 用于萃取获得 arguments 的某种属性值
      results[length] = _.pluck(arguments, length);
    }
    return results;
  };
```

#### `unzip`

使用 `unzip` 的目的是将归并后的数组分解为串联的一系列的新数组。

#####　实例

```javascript
_.unzip([['张宁宁', '张艺苇'], ['山东', '行唐']]);
=> ['张宁宁', '山东'] ['张艺苇', '行唐']
// 返回的第一个元素中包含所有输入数组的第一个元素
```

实现代码如下:

```javascript
_.unzip = function(array) {
  // 返回使用 apply 压入的一个数组
  return _.zip.apply(null, array);
};
```

#### `object`

使用 `object` 用于将数组转化为对象的形式。

`_.object(list, [values])`

传递一个单独的`[key, value]` 的列表，或者一个键的列表和一个值的列表。当传入 `list` 和 `values` 的时候， `list` 中的值会被作为返回对象的键, `values` 中的值会被作为返回对象的值。

##### 实例

```javascript
_.object(['moe', 'larry', 'curly'], [30, 40, 50]);
=> {moe: 30, larry: 40, curly: 50}
```



##### 源码解析

代码如下:

```javascript
/**
 * @description toObj 将键值数组组合为对象
 * @param {Array} list 键数组
 * @param {Array} values 值数组
 * @return {Object} 组成的对象
*/
function toObj(list, values) {
	if (list === null) return {};
	let obj = {};
	if (typeof values === 'undefined') {
	  list.map((item) => {
		obj[item[0]] = item[1];
	  });
	} else {
	  list.map((item, index) => {
		obj[item] = values[index];
	  });
	}
	return obj;
}
```

#### indexOf

`_.indexOf(array, value, [isSorted])`

使用 `indexOf` 用于返回 `value` 在 `array` 中的索引值， 当传入第三个值为数字的时候，表示从第几个数字进行索引。

##### 实例

```
_.indexOf([1, 2, 3 ,4 ,1],1, 1);
=> 5
```

##### 源码分析

```javascript
_.indexOf = function (array, item, isSorted) {
  var i = 0; length = array && array.length;
  // 使用判断数组的方法
  // length = array && array.length;
  if (typeof isSorted === 'number') {
    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
  } else if (isSorted && length) {
    // 如果传入的是一个 true, 使用更快的算法
    i = _.sortedIndex(array, item);
    return array[i] === item ? i : -1;
  }
  for (; i < length; i++) if (array[i] === item) return i;
  return -1;
}
```

1. 判断一个数组是否存在:

   `length = array && array.length` 

2.  使用 `Math.max` 的妙用

   例如:

   ```javascript
   Math.max(0, num);
   // 返回 num > 0
   //相当于
   num <= 0 ? 0 : num;
   //因此
   // 对于数字的判断比较，就不要使用三元运算符了，使用 `Math.max` 或者 `Math.min` 会更好些
   ```

例如下面的一个程序，用来获得一组数组中的最大的差值:

```javascript
function getMaxProfit(arr) {
  let minProfit = arr[0];
  let maxProfit = 0;
  for (let i = 0; i < arr.length; i ++) {
    minProfit = Math.min(minProfit, arr[i]);
    let currentProfit = arr[i] - minProfit;
    maxProfit = Math.max(maxProfit, currentProfit);
  }
  return maxProfit;
}
```



#### `lastIndexOf`

`_.lastIndexOf(array, value, [fromIndex])`

返回 `value` 在 `array` 中从最后开始的索引值，传入的 `fromIndex` 将从给定的索引值进行搜索。

##### 源码分析

```javascript
_.lastIndexOf = function(array, item, fromIndex) {
  let index = array ? array.length : 0;
  if (typeof fromIndex === 'number') {
    // 使用 Math.min 当 fromIndex + 1 > index 的时候，要取 index
    index = fromIndex < 0 ? index + fromIndex + 1 : Math.min(index, fromIndex + 1);
  }
  // 使用 --index 因为最后一个元素的索引是 array.length - 1
  while (--index >= 0) if (array[index] === item) return index;
  return -1;
}
```

#### `sortIndex`

`_.sortIndex(list, value, [iteratee], [context])`

使用 `sortIndex` 的目的在于使用二分法查找到 `value` 在 `list` 中的位置序号。

##### 实例

```javascript
_.sortedIndex([10, 20, 30, 40, 50], 35)
// 3
```

##### 源码分析

使用二分法进行比较获得到元素在数组中的位置的。

```javascript
_.sortedIndex = function (array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  let value = iteratee(obj);
  let low = 0; let high = array.length;
  while(low < high) {
    let mid = Math.floor((low + high) / 2);
    // 判断 value 在相对于 array 在左边还是在右边
    if (_.comparator(iteratee(array[mid], value)) < 0) low = mid + 1; else high = mid; 
  }
  return low;
}
```

使用二分法的原理是将数组中分为两个部分，判断 `value` 值在哪一个部分之内。