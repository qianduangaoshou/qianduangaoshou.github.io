---
title: underscore.js源码分析(四)
date: 2017-11-23 20:54:45
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(四)

`_.min` `_.sortBy` `_.groupBy` `_.indexBy` `_.countBy`

#### `_.min`

`_.min(list, [iteratee], [context])`

类似于使用 `_.max` 这个函数用于获取到 `list` 中的最小值, 其中 `iteratee` 是作为的筛选的依据。

源码如下:

```javascript
_.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          // 和使用 _.max 的没有什么不同，不同的是这里筛选的是最小值
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };
```

#### `_.sortBy`

`_.sortBy(list, iteratee, [context])`

使用 `_.sortBy` 返回的是一个经过排序之后的数组。排序的依据是根据 `iteratee` 函数进行判断的。

返回的是进行排序之后的数组的副本，原来的数组并没有进行了改变。

##### 实例

##### 源码分析

```javascript
_.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      return _.comparator(left.criteria, right.criteria) || left.index - right.index;
    }), 'value');
  };
```

在 `_.sortBy` 函数中存在着多个的函数，下面一一进行分析。

`_.pluck` 函数，这个函数用于获取到对象数组中包含有过相关属性的所有的对象。

看来是用 `_.map...` 这个方法返回的是一个对象数组。

```javascript
// _.pluck 函数用于
return _.pluck(_.map(obj, function(value, index, list) {
    // balabala
}), 'value')
```

在 `_.map...` 中执行了两步操作: 调用了使用的 `_.map` 方法以及接下来调用 `sort` 方法。

```javascript
// _.map 方法 obj 是一个对象数组
// 返回的是一个数组，数组中包含有对象
// value: 对象的值
// index: 对象的键
// criteria: 对象运行iteratee 之后返回的值
_.map(obj, function(value, index, list) {
  return {
    // 对象中返回了三个值
    // {value: '', index: '', criteria: ''}
    value: value,
    index: index,
    criteria: iteratee(value, index, list)
  }
})
```

对于使用 `_.map` 方法返回的一个新的数组对象之后， 对于这个新的对象数组执行  `sort` 方法。

关于数组的 `sort` 方法:

***

关于使用数组的 `sort` 方法

```javascript
Array.sort(sortBy);
// sortBy 是一个用来进行排序依据的函数
```

>使用 sort() 方法的时候，如果不传递 `sortBy` 的时候，使用数组的 `sort` 方法默认的是按照字符编码的顺序进行排序

例如:

```javascript
let a = [1, 2, 4, 23];
// 在原来的数组上进行的改变，并没有生成一个新的数组
a.sort() // [1, 2, 23, 4]
```

`sortBy` 是用来进行排序的函数:

`sortBy` 接收两个参数，用来对于这两个参数进行比较。

***

 接下来执行的是 `sort` 函数

```javascript
.sort(function(left, right) {
  // 在使用 comparator 之后进行比较 left.index - right.index
  // 为什么呢？
  return _.comparator(left.criteria, right.criteria) || left.index - right.index;
})
```

这个函数的作用是对于上面返回的数组对象进行 `sort` 排序。 返回的是 `_.comparator(left.criteria, right.criteria)` 或者 `left.index - right.index`。

看来是用进行比较。

其中 `_.comparator` 的方法。

```javascript
// 传入要进行比较的函数参数 a, b
_.comparator = function(a, b) {
  // 如果 a === b 返回 0
    if (a === b) return 0;
  // 判断 a >= a  b >= b
  // 为什么呢？
    var isAComparable = a >= a, isBComparable = b >= b;
  // 如果其中一个为 true
    if (isAComparable || isBComparable) {
      if (isAComparable && !isBComparable) return -1;
      if (isBComparable && !isAComparable) return 1;
    }
    return a > b ? 1 : (b > a) ? -1 : 0;
  };

```

#### `_.groupBy`

##### 实例

`_.groupBy(list, iteratee, [context])`

将一个集合分为多个的集合，通过使用 `iteratee` 函数进行分组，如果 `iteratee` 是一个字符串而不是一个函数的时候，将这个 `iteratee` 作为元素的属性名来进行分组。

如下:

```javascript
_.groupBy([1, 2, 4], function(num) {return num % 2;}) // { 0: [2, 4], 1: [1] }
// 返回一个对象
// 对象的属性是函数中返回的值
// 相应属性的值是 list 数组中运行函数得到的相应属性的集合
```

##### 源码解析

```javascript
_.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });
```

在上面的函数中，存在两个函数: `group` 以及 `_.has`

关于使用 <span id="group"> `group` <span>函数:

```javascript
// 接收一个 behavior 作为参数
var group = function(behavior) {
  // 返回一个函数，这个函数就是返回的 _.groupBy
    return function(obj, iteratee, context) {
      // 定义 result 是一个对象
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        // 对于使用 obj 进行遍历, 获取到 key
        // 将 list 中的 value, index 传入
        var key = iteratee(value, index, obj);
        // 执行 behavior 函数
        behavior(result, value, key);
      });
      return result;
    };
  };
```

在上面的函数中 `behavior` 函数是在 `_.groupBy` 中的函数是下面的这个:

```javascript
if (_.has(result, key)) result[key].push(value); else result[key] = [value];
```

使用 `_.has` 方法用来判断对象 `result` 中是否含有属性 `key`:

`_.has` 方法如下:

```javascript
let _.has = function (obj, key) {
  // 当obj 不是null 并且 对象 Obj 中包含有属性 key 的时候 返回 true
  return obj !== null && Object.prototype.hasOwnProperty.call(obj, key);
}
```

####　`_.indexBy`

`_.indexBy(list, iteratee, [context])`

使用 `_.indexBy` 用来返回在列表中每一个元素键的 `iteratee` 函数。 返回一个每一项索引的对象。

>使用 `_.indexBy` 和使用 `_.groupBy` 的区别在于:
>
>使用 `_.indexBy` 你需要知道键值对是唯一的，比如:
>
>```javascript
>let list = [{name: '张宁宁', age: 20}, {name: '张宁宁', age: 50}];
>_.indexBy(list, function(value) { return value.name });
>=>
>{张宁宁:{name: "张宁宁", age: 50}}
>_.groupBy(list, function(value) { return value.name });
>=>
>{张宁宁:[{name: '张宁宁', age: 20}, {name: '张宁宁', age: 50}]};
>```
>
>

#####  实例

```javascript
let list = [{name: '张三', age: 12}， {name: '李四', age: 13}];
_.indexBy(list, 'age');
=> 
{
    '12': {name: '张三', age: 12},
    '13': {name: '李四', age: 13}
}
```



##### 源码解析

类似于使用 `_.groupBy` 的源码, 使用 `_.indexBy` 的源码如下:

```javascript
_.indexBy = group(function(result, value, key) {
    result[key] = value;
});
```

#### `_.countBy`

`_.countBy(list, iteratee, [context])` 

返回各组中对象的数量的计数。返回在该组中值的数目。

##### 实例

```javascript
let list = [{name: '张宁宁', age: 20}, {name: '张宁宁', age: 50}];
_.countBy(list, function(value) { return value.age });
=>
{ 20: 1, 50: 1 }
```

##### 源码如下

```javascript
let _.countBy = group(function(result, value, key) {
  // 如果在 result 中存在 key result[key] ++ 
  // 否则 将 result[key] = 1;
  if (_.has(result, key)) result[key] ++; else result[key] = 1; 
})
```

其中 [`group`](# group) 函数；

####  `shuffle`

##### 实例

用来返回一个随机乱序的副本。并没有改变 `list` 的值。

```javascript
let list = [1, 2, 3, 4, 5, 6];
_.shuffle(list)
[2,6,3,1,5,4]
```

##### 源码分析

使用 `_.shuffle` 的源码如下:

```javascript
_.shuffle = function(obj) {
  // 获取到数组的值或者对象的值
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
  // var length = set.length
    var length = set.length;
  // shuffled 是一个数组
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      // 通过使用 _.randow获得到rand 随机数
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      // 将 index 的值赋给这个随机数组
      // 将set[index] 传入到 shuffled 中
      shuffled[rand] = set[index];
    }
  // 返回生成的随机数组
    return shuffled;
};
```

对于使用 `_.random` 的函数如下:

```javascript
// 这个函数的目的是用来生成
_.random = function (min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  // 加了一个 1 表示生成的数中可以包括 max
  return min + Math.floor(Math.random() * (max - min + 1));
}
```

`Math.floor` : 向下取整

`Math.random`  用于生成 `0 - 1` 之间的随机数;

>注意:  使用的是生成 `min` 和 `max` 之间的值得时候: `min` : inclusive 包括 `max` : exclusive 不包括

```javascript
Math.random() * (max - min) + min
// 生成 位于 max 与 min 之间的数， 包括 min 但不包括 max
```

在 `shuffle` 函数中，使用了一个分牌算法：

```javascript
for (var index = 0, rand; index < length; index++) {
      // 通过使用 _.randow获得到rand 随机数
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      // 将 index 的值赋给这个随机数组
      // 将set[index] 传入到 shuffled 中
      shuffled[rand] = set[index];
 }
```



***

使用 分牌算法的原理如下:

存在两个数组 a 和 b

现在想要将 a 中的元素随机生成到 b 中

```sequence
a-->b: index
note left of a: a 中遍历
b-->b:根据 a 中的index b[index] = b[rand],\n取到自身的 b[rand] 值
b-->a: rand(随机生成的\n位于(0, index) 之间的数值)
a--b: 将得到的 rand 随机数\n b[rand] = a[index],填补刚才 b取到的自身的 rand
```





***

如上图所示的算法:

```sequence
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks
```

