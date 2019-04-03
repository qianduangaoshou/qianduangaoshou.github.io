---
title: underscore.js源码分析(一)
date: 2017-11-18 16:34:36
tags: underscore.js源码
categories: underscore.js 源码分析
---

#### underscore.js 源码分析（一）

`_.each`  `_.map`  `_.refuce` `_.reduceRight`  `_.find`

#### `_.each`

##### 实例

`_.each(list, iteratee, [context])`

这个方法用于循环遍历, 用于循环 `list` 对象或者数组， `iteratee` 是一个遍历函数，接收的参数为遍历之后的结果。  

当 `list` 为数组的时候，传递给 `iteratee` 函数的参数是  `(element, index, list)`, 当 `list` 为对象的时候, 传递给 `iteratee` 函数的参数是 `[value, key, list]`。

对于 `context` 上下文, 这个决定的是 `iteratee` 中的 `this` 的指向值。可选参数， 当 `context` 忽略的时候 `this` 指向的是全局变量。

`_.each` 返回值是进行遍历的 `list` 数组对象。

```
function print(value, index, list) {
  console.log(this.name);// 这里 this 指向了后面传递的 context
  console.log(value, index, list);
}
let person = {
  name: '张宁宁'
}
console.log(_.each([1, 2, 3], print, person)); // [1, 2, 3]
// 最终打印
张宁宁
1 0 (3) [1, 2, 3]
张宁宁
2 1 (3) [1, 2, 3]
张宁宁
3 2 (3) [1, 2, 3]
```

##### 源码分析

在 `underscore.js` 源码中， `_.each()` 源码为下:

```
 _.each = _.forEach = function(obj, iteratee, context) {
    // 如果 obj == null 返回 null
    if (obj == null) return obj;
    // 调用 optimiseCb 函数 稍后分析
    iteratee = optimizeCb(iteratee, context);
    var i, length = obj.length;
    // 这里提供了分别 数组和对象的一种方法
    // 如果数组
    if (length === +length) {
    // 数组情况下， 将 [value, index, list] 传入遍历函数
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
    // 获取到对象所有的 key 值
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    // 返回数组或者对象
    return obj;
  };
```

分析:

1.  分别数组和对象的方法

    我平常的时候使用 `Object.prootype.toString.call().slice(8, -1)` 这种方法来分别数组和纯对象，这里使用了一种方法。

   ```
   if (length === +length) {
   // 这是数组
   } else {
   // 这是对象
   }
   ```

   `+length` 执行的是隐式类型转换，用于将其他的值转换为数字。经过实验，使用 `+` 进行类型转换的可能性如下:

   ```javascript
   +null // 0
   +flase // 0
   +"" // 0
   +true // 1
   +对象 // NaN
   +非空字符串 // NaN
   +NaN // NaN
   +1 // 1
   +undefined // NaN
   ```

   因为上面中 对象的 length 为 undefined 因此  length ===+length  // false 这里 `+length` 会被转化为 `NaN`。

2.  ` iteratee = optimizeCb(iteratee, context);`

    `optimizaCb` 函数

   使用 `optimizaCb` 函数用于绑定上下文: 使用 `call` 以及 `apply` 的方法实现的改变函数运行的 `this` 值的改变

   接收三个参数: `func` 运行的函数  `context` 运行函数需要进行绑定的上下文  `argCount` 参数的个数

   ```
   var optimizeCb = function(func, context, argCount) {
       // 使用 void 0 类似于使用 undefined
       // 等同于使用 if(context === undefined)
       if (context === void 0) return func;
       switch (argCount == null ? 3 : argCount) {
         case 1: return function(value) {
           return func.call(context, value);
         };
         case 2: return function(value, other) {
           return func.call(context, value, other);
         };
         case 3: return function(value, index, collection) {
           return func.call(context, value, index, collection);
         };
         case 4: return function(accumulator, value, index, collection) {
           return func.call(context, accumulator, value, index, collection);
         };
       }
       return function() {
         return func.apply(context, arguments);
       };
    };
   ```

   上面的 `_.each` 源码中的使用这个函数的目的是将 `iteratee` 的上下文 `this` 绑定到 `context` 对象。

   >这里有一个 void 0 这里的 void 0 等同于使用 undefined  不同于使用 `undefined` 的原因在于： 在 `javascript` 中 `undefined` 不是一个保留字。
   >
   >代码如下:
   >
   >```
   >var undefined = 1;
   >console.log(undefined); // 1  也是可以的
   >使用 void 0 作用是这样的
   >```

#### _.map

##### 实例

`_.map(list, iteratee, [context])`

通过 使用变换函数 `iteratee` 将`list` 中的值映射到一个新的数组。

```
function filter(value) {
  return value * 2;
}
_.map([1, 2, 3], filter); // [2, 4, 6]
```

源码如下:

```javascript
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = cb(iteratee, context);
    // 使用 && 操作符， 只有当第一个为true的时候才执行下一步操作
    var keys = obj.length !== +obj.length && _.keys(obj),
        // || 操作符 第一个为true的时候不再进行下一步动作
        length = (keys || obj).length,
        // 使用 Array 创建一个 length 长度的数组
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };
```

##### 源码分析

1.  使用 `&&` 以及 `||` 进行计算

   这两个符号被称之为 选择器操作符，返回的是两边选择器结果的其中一个。在选择的过程中会被执行强制类型转换。

   > 这里对于类型转换，使用的时候要注意出现假值的情况

   使用 `&&` 以及 `||` 会首先对于 * 第一个*  操作数进行计算，根据判断结果来决定返回哪一个操作数。

   ```
   a || b
   // 如果 a 类型转换结果为 true 返回的是 a 否则 返回 b
   a && b
   // 如果 a 类型转换结果为 true 返回的是 b 否则返回 a
   ```

   上面我们可以看到，我们可以利用这两个操作符做一些事情:

   ` a || b` 好像备用条件。 如果条件 `a` 不成立, 执行条件 b, 如果成立，执行条件 `a`  `a ? a : b`

    `a && b` 好像通过条件， 如果 `a` 成立，向下执行，如果不成立，打住，返回 `a` 执行的结果 `a ? b : a`  

2. 使用 `Array(length)` 创建的是一个 `length` 长度的数组。

#### _.reduce

##### 实例

`_.reduce(list, iteratee, [memo], context)`

通过迭代将 `list` 中的元素归结为一个值。 `memo` 表示初始参数。

```
function reduceFn(memo, num) {
  return memo * num;
}
let list = [1, 2, 3];
_.reduce(list, reduceFn, 1) // 6
```

##### 源码分析

源码如下:

```javascript
function reduce(obj, iteratee, memo, context) {
	if (obj === null) obj = [];
	iteratee = optimizeCb(iteratee, context, 4);
	var keys = obj.length !== +obj.length && Object.keys(),
		length = (keys || obj).length,
		index = 0, currentIndex;
	if (arguments.length < 3) {
		memo = obj[keys ? keys[index++] : index++];
	}
	for (; index < length; index++) {
		currentIndex = keys ? keys[index] : index;
		memo = iteratee(memo, obj[currentIndex], currentIndex, obj);
	}
	return memo;
	}
```

分析:

1.  在 `obj` 可能是对象或者数组的情况下，当 `obj` 是对象的时候，需要产生了一个 使用 `keys` 来进行数组操作

2. 在迭代的时候， 当没有 `memo` 初始值的时候， 将数组或者对象的第一个值作为 `memo` 这里，使用 `index++` 来处理的

   >使用 index++ 的时候，相当于 index = index + 1; 但是直接使用的时候还是原来的 index
   >
   >```
   >let currentIndex = 0;
   >let addIndex = currentIndex++; // 相当于先返回 currentIndex 在进行加一操作
   >addIndex // 0
   >currentIndex // 1
   >```
   >
   >​

3. 迭代的过程发生在使用循环赋值的过程中

   ```javascript
   for (; index < length; index++) {
     memo = iteratee(memo, obj[currrentIndex], currentIndex, obj);
   }
   ```


#### _.reduceRight

##### 实例

`_.reduceRight(list, iteratee, [memo], context)`

类似于使用`_.reduce` 不过不同于使用 `_.reduce` 的是，这个是从右边向左进行遍历操作;

```javascript
function contact(a, b) {
  return a.contact(b);
}
let list = [[1, 2], [3, 4], [5, 6]];
_.reduceRight(list, contact) // [5, 6, 3, 4, 1, 2]
```

##### 源码分析

```javascript
_.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = optimizeCb(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      // 先对于 index 进行 减一操作
      memo = obj[keys ? keys[--index] : --index];
    }
    // 在判断完成 index 之后进行减一操作
    while (index-- > 0) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };
```

1.  使用 `while` 循环进行判断

   ```
   while (index-- > 0) {
     // do something
   }
   ```

####  _.find

##### 实例

`_.find(list, predicate, [context])`

遍历  `list` 值   返回第一个通过 `predicate` 函数返回真值的数值。

```
let list = [1, 2, 3];
function getodd(value) {
  return value % 2 === 0;
}
_find(list, getodd) // 2
```

##### 源码分析

```javascript
 _.find = _.detect = function(obj, predicate, context) {
    var key;
    // 如果是数组
    if (obj.length === +obj.length) {
      // 使用 findIndex 找到数组的值
      key = _.findIndex(obj, predicate, context);
    } else {
    // 如果是是对象
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };
```












