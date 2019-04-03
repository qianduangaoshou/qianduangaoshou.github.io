---
title: underscore.js源码分析(二)
date: 2017-11-20 22:20:50
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(二)

`_.filter`  `_.where` `_.findWhere`  `_.reject`  `_.every`

#### `_.filter`

##### 实例

`_.filter(list, predicate, [context])`

遍历 `list` 值, 返回通过 `predicate` 函数返回为真的值数组。

代码如下:

```javascript
list = [1, 2, 5, 6];
function toFilter(num) {
	return num % 2 === 0;
}
console.log('通过过滤的数组', _.filter(list, toFilter)); // [2, 6]
```

##### 源码分析

使用 `_.filter()` 的源码如下所示:

```javascript
_.filter = _.select = function(obj, predicate, context) {
  var results = [];
  // 判断 `obj` 是否为 null 是返回空数组
  if (obj == null) return results;
  predicate = cb(predicate, context);
  // 使用 `each` 函数对于数组中的每一个列表进行遍历
  _.each(obj, function(value, index, list) {
   if (predicate(value, index, list)) results.push(value);
  });
  return results;
};
```

#### _.where

##### 实例

`_.where(list, propertries)`

`list`: 数组

`propertries` : 需要进行检索的键值对(一个对象)

遍历 `list` 中的每一个值， 返回一个数组，这个数组中包含含有 `propertries` 中属性的所有的键值对。

用法:

```javascript
list = [{name: '张宁宁', age: 18}, {name: '张宁宁', age: 70}];
console.log(_.where(list, {name: '张宁宁', age: 18})); //  [{name: '张宁宁', age: 18}]
```

#####源码分析 

自己写的代码:

```javascript
	function where(list, sObj) {
		let results = [];
		let flag = false;
		if (list == null) {
			return results;
		}
		for (let obj of list) {
			for (let key in obj) {
				if (Object.keys(sObj).includes(key)) {
					if (sObj[key] === obj[key]) {
						flag = true;
					} else {
						flag = false;
					}
				} else {
					flag = false;
				}
			}
			if (flag) {
				results.push(obj);
			}
		}
		return results;
	}
```

`_where()` 源代码如下所示:

```
_.where = function(obj, attrs) {
  return _.filter(obj, _.matches(attrs));
};
```

使用 `_filter` 筛选出 `obj` 对象中适合函数 `_.matches` 的键值对儿。

`_.match()` 方法的源码如下所示:

```javascript

_.matches = function(attrs) {
  // 获取到对象的键值对儿, 是 [key, value] 的形式
    var pairs = _.pairs(attrs), length = pairs.length;
    // 返回一个函数，接收 obj 参数
    return function(obj) {
     // 如果 obj == null 返回 !length
     // 为什么不直接返回false ?
      if (obj == null) return !length;
      // 创建一个新对象
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        // 两种情况， 不存在键或者键存在，值不相等， 两种情况发生一种情况
        // 返回 false
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      // 返回 true
      return true;
    };
};
```

***

对于返回一个函数的这种形式:

```javascript
function name() {
  return function (obj){
    // dosomething
  }
}
// 调用的时候这样调用
name()(); // to dosomething
```

***

#### `_.findWhere`

##### 实例

`_findWhere(list, properties)`

遍历整个 `list` 返回匹配整个 `properties` 参数所列出的所有键值对儿的第一个值。

##### 源码分析

```javascript
_.findWhere = function(obj, attrs) {
    // 通过使用 _.matches(attrs) 返回了一个函数
    // 通过使用 _.find 方法调用了这个函数
    return _.find(obj, _.matches(attrs));
};
```

通过调用 `_.find` 函数返回通过第一次获得匹配的对象。

#### `_.reject`

##### 实例

`_.reject(list, predicate, [context])`

返回 `list` 列表中没能通过 `predicate` 检验的数值。

```javascript
function reject() {
  return num%2 === 0;
}
let list = [1, 3, 5, 6];
console.log(_.reject(list, reject)); // [1, 3, 5];
```

作用与 `filter` 相反。

##### 源码分析

```javascript
 _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
 };
```

`_.negate` 函数

```javascript
 _.negate = function(predicate) {
  return function() {
  // 通过使用 apply 方法将 arguments 方法传入
    return !predicate.apply(this, arguments);
  };
};
```

####　`_every`

##### 实例

`_every(list, [predicate], [context])`

如果 `list` 中的元素都通过 `predicate` 的真值检验就返回为 `true`

##### 代码分析

源码如下:

```javascript
function every(obj, predicate) {
	if (obj == null) return true;
    // 通过使用 keys 获得到一个包含对象键的数组
	let keys = obj.length == +obj.length && Object.keys(obj);
	let currentKey;
    // length 为数组或者对象的长度
	let length = (keys || obj).length;
	for (let index = 0; index < length; index++) {
		currentKey = keys ? keys[index] : index;
        // 如果对于predicate 函数返回为 false, every 函数返回为false
		if (!predicate(obj[currentKey])) return false;
	}
	return true;
}
```

