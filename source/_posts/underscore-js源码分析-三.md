---
title: underscore.js源码分析(三)
date: 2017-11-22 20:55:17
tags: underscore.js源码
categories: underscore.js 源码分析
---

###　 underscore.js 源码分析(三)

`_.some` `_.contains`  `_.invoke`  `_.pluck`  `_.max`

#### `_.some`

##### 实例

`_.some(list, [predicate], [context])`

遍历 `list` 中的元素, 只要其中有一个元素通过 `predicate` , 那么就返回为 `true`

##### 源码分析

```javascript
_.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = cb(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      // 如果 obj 中其中的一个元素进行 predicate 检验的结果为 true 返回为true
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
};
```

#### `_.contains`

##### 实例

`_.contains(list, value, [fromIndex])`

如果在 `list` 中包含有 `value` 值，那么返回为 `true` `fromIndex` 表示开始进行检索的位置。

如果 `list` 是数组, 检查数组中是否包含有对应的 `value` 值

如果 `list` 是对象, 检查对象中的值是否有存在的 `value` 值

自己写的代码:

```javascript
function contain(obj, value, fromIndex) {
  if (obj == null) return false;
  let list = obj;
  if (obj.length !== +obj.length) {
    list = obj.values();
  }
  // 为了保证代码的健壮性，添加 typeof fromIndex === 'number' && fromIndex 的判断
  return list.indexOf(value, typeof fromIndex === 'number' && fromIndex) >= 0;
}
```

##### 源码分析

```javascript
_.contains = _.includes = _.include = function(obj, target, fromIndex) {
    if (obj == null) return false;
    // 使用 _.values 获得到对象的值
    if (obj.length !== +obj.length) obj = _.values(obj);
    // 使用 `_.indexOf` 获取到索引
    return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
};
```

#### `_.invoke` 

>计算机术语中: invoke : [ɪnˈvoʊk] 乞求，借助于   调用【计算机】

##### 实例

`_.invoke(list, methodName, *arguments)` 

在 `list` 的每一个元素上执行 `methodName` 方法。 `argument` 用于将使用 `_.invoke` 调用 `methodName` 方法的时候传递的函数。

```javascript
let list = [[1, 4, 3]];
_.invoke(list, 'sort') // [1, 3 ,4]
// 这个函数的作用是将 执行 list 元素中的数组 [1, 4, 3] 方法 sort
// 同样 我们可以使用别的函数,这个时候 argument 会被作为 methodName 函数的参数，
// 而 函数 print 中的 this 值指向的是 list 中的元素
function print() {
    console.log(this); // [1, 4, 3]
}

```

##### 源码分析

实现这个功能的源码如下:

```javascript
_.invoke = function(obj, method) {
    // 使用 Array.slice.call 返回一个子数组
    // 第二个参数 2 表示截取从传入参数的第二个处进行截取
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
  // 对于 obj 进行遍历
    return _.map(obj, function(value) {
    // 通过使用 apply 方法， 将 value 作为 func 的 this 值， 同时传入截取的参数
    // 进行判断是否是函数 method 或者 内置的 method 方法
      return (isFunc ? method : value[method]).apply(value, args);
    });
 };
```

这是一个用于进行调用绑定的函数。

#### `_.pluck`

>pluck 拔掉，摘，拉

`_.pluck(list, propertyName)` 

##### 实例

使用 `_.pluck` 用于获取到数组对象中的对应属性的所有的值。

对于对象中不存在的属性返回 `undefined`

```javascript
var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
_.pluck(stooges, 'name');
=> ["moe", "larry", "curly"]
```

自己写的一个 `pluck` 函数如下：

```javascript
function pluck(list, name) {
  let props = [];
  list.map((obj) => {
    if (Object.keys(obj).indexOf(name) >= 0) {
        props.push(obj[name]);
      } else {
        // 这里使用 void 0 代替 undefined 
        props.push(void 0);
      }
    });
	return props;
 }
```

##### 源码分析

```javascript
_.pluck = function(obj, key) {
  // 使用 _.map， 对于 obj 中的数组对象成员执行 _.property 方法
  return _.map(obj, _.property(key));
};
```

```javascript
_.property = function(key) {
    // 返回一个函数， 参数 obj 接收到的是 _.property()(obj) 这个的值
    return function(obj) {
     // 传入的 obj 是否为 null 是 返回 undefined  否则 返回 obj[key]
      return obj == null ? void 0 : obj[key];
    };
  };
```

#### `_.max`

`_.max(list, [iteratee], [context])` 

返回 `list` 中的最大值。

```javascript
_.max = function(obj, iteratee, context) {
  // 将 result 初始化为 -infinity lastComputed 初始化为 infinity
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    // 当 interaee 为null 不传参数,采用 obj 中内置的方法名称来做
    // 并且 obj 不等于 null 的时候
    if (iteratee == null && obj != null) {
      // obj 为数组 ? 数组 : 对象的值
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        // 进行遍历值
        value = obj[i];
        // 比较大小，将最大的那个值赋给 result 参数
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      // 使用 foreach 对于 obj 进行计算
      _.each(obj, function(value, index, list) {
        // 进行计算之后返回计算结果
        computed = iteratee(value, index, list);
        // 如果计算结果大于上一次计算结果， 将最大的值赋给 result
        // 将最大的结果赋予 lastComputed
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };
```

1. 在js 中关于运算符优先级的问题:

   >逻辑 `&&` (与) 大于 逻辑 或`||`

2. 上面有一段程序如下:

   `if (computed > lastComputed || computed === -Infinity && result === -Infinity)`

   这段话翻译为中文就是

   如果满足 `computed === -Infinity && result === -Infinity` 或者 `computed > lastComputd` 的时候，进行动作。 