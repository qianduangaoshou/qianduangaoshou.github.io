---
title: underscore.js源码分析(七)
date: 2017-11-28 23:11:29
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析（七）

`flatten` `without` `union`  `intersection`  `uniq`

#### `flatten`

##### 实例

使用 `flatten` 用来将多层嵌套的数组转化为一层，例如:

```javascript
list = [1, [3, 4]];
_.flatten(list) // [1, 3, 4]
```

##### 源码分析

```javascript
_.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };
```

其中 `flatten` 函数如下:

```javascript
/*
*@description 用于将数组脱离嵌套
*@params input 传入的数组
*@params shallow {Boolean} 是否需要减少嵌套
**/
var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0, value;
    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
      value = input[i];
      // 这里使用了运算符嵌套表达式
      // value存在并且value的length 大于等于0 并且 value 输入数组或者类数组对象
      if (value && value.length >= 0 && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        // use recursion to get the value
        // use if to decide isRecursion
        // 这里使用 if 来决定是否需要进行递归
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        // 看这种优雅的写法
        while (j < len) {
          // 将取到的值依次填入
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };
```

#### `without ` 

##### 实例

`_.without(array, values)`

使用 `_.without` 用来所有 `values` 值后的 `array` 副本。

使用:

```javascript
_.without([1, 2, 3], 1)
=> [2, 3]
```

##### 源码分析

自己写的函数:

```javascript
function without(array, values) {
  if (typeof values === 'undefined') return array;
  if (array && array.length) {
    let value = Array.prototype.slice.call(arguments, 1);
    array.filter((item) => {
      return ~values.indexOf(item);
    });
  } else {
    return [];
  }
}
```

上面的函数中存在错误: 结果或返回 `undefined`

原因: 使用 `filter`方法中的 `return ` 只会跳出 `filter` 循环，不会跳出最终的函数循环。 `低级错误`

```javascript
function without(array, values) {
  if (typeof values === 'undefined') return array;
  if (array && array.length) {
	let value = Array.prototype.slice.call(arguments, 1);
	// 使用 filter 进行的筛选效果选出的是符合效果的值
    let newArray = array.filter((item) => {
      return value.indexOf(item) === -1;
	});
	return newArray;
  } else {
    return [];
  }
}
```

使用源码分析如下:

```javascript
_.without = function(array) {
  // 向 difference 的函数中传入两个参数， array 以及 slice.call(arguments, 1);
  // array 是传入的需要进行删除的数组, slice.call() 获取到传入的第二个参数
    return _.difference(array, slice.call(arguments, 1));
  };
```

这里调用了 `_.difference` 的方法实现。

使用 `_.difference` 实现的函数代码如下:

```javascript
_.difference = function(array) {
    // 获得到的 rest 函数
    // 将 arguments 传入到 flatten 函数, 传入的参数是 startIndex: 1
    // 表示获取到传入的 arguments 的第二个参数
    var rest = flatten(arguments, true, true, 1);
    // 对于数组使用 filter 的方法
   // !_.contains 对于每一个数组进行遍历处理
  // 返回 rest 中没有包含 value 的值
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };
```

#### `union`

##### 实例

`_.union(*arrays)`

使用 `union` 用于返回传入的 `arrays` 的并集。按照顺序返回，可以传入一个或者多个的 `arrays` 数组。

##### 源码分析

```javascript
_.union = function() {
    return _.uniq(flatten(arguments, true, true));
}
```

 其中 `_.uniq` 函数如下:

```javascript
_.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    // 如果 isSorted isBoolean
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    // 如果 iteratee 不是null
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i],
      // 获取到返回的结果
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        // 如果 i !== 0 或者 seen 不等于 computed 将 value push 进入到 result 中
        if (!i || seen !== computed) result.push(value);
        // 将computed 结果赋给 seen
        seen = computed;
        // 如果 iteratee 函数存在的话并且没有被排序
      } else if (iteratee) {
        // 如果seen 中没有包含有 computed 结果
        if (!_.contains(seen, computed)) {
          // 将computed 结果推入到 seen 中
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };
```

#### `intersection`

`_.intersection(arrays)`

##### 实例

使用 `_.intersection` 用来返回传入多个数组的并集。

```javascript
_.intersection([1, 2, 3], [1, 2, 4], [10, 1, 2, 6]) // [1, 2]
```

返回传入的多个数组的并集。

##### 源码分析

```javascript
_.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      // 使用 continue 是结束本次循环
      // 用于判断传入的数组中是否有包含的相同的元素
      if (_.contains(result, item)) continue;
      // 使用 break 是结束整个循环
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      // 当上次循环结束之后 j === argsLength 成立
      if (j === argsLength) result.push(item);
    }
    return result;
  };
```

基本的思路是对于第一个传入的数组中的值进行遍历，根据第一个数组中的值, 遍历其他的数组，判断其他的数组中是否含有这个值。如果含有这个值的时候，将这个值存入一个`result`数组，最后将这个 `result` 数组返回。

要点:

1.  两次循环, 使用结束循环的方式是不一样的。

   >使用 `break` 的时候， 结束的是整个循环
   >
   >使用 `continue` 的时候, 结束的是当前的循环

2. 关于 `contain` 函数

   使用 `contain` 用来判断在一个数组中是否包含有某一个元素:

   在 `es6` 中使用 `Array.includes(item)` 来判断 `item` 是否包含在 `Array` 之中。

#### `difference`

##### 实例

`_.difference(array, *others)` 

使用 `difference` 获取到来自于 `array` 但是不存在于 `others` 中的数组元素。

##### 源码分析

自己写的代码:

```javascript
function difference(array, other) {
	let rest = Array.prototype.slice.call(arguments, 1);
	let newArr = array.filter((item) => {
		return other.indexOf(item) === -1;
	});
	return newArr;
}
```

源码如下:

```javascript
_.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };
```

