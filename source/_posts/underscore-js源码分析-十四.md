---
title: underscore.js源码分析(十四)
date: 2017-12-12 21:44:03
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(十四)

`extend` `extendOwn` `pick` `omit`  `default`

#### `extend`

`_.extend(destination, *sources)`

将多个对象  `souces` 覆盖到 `destination` 上面，返回被覆盖掉的 `destination` 上面。

使用 `extend` 类似于使用 `Object.assign` 用来将多个对象进行合并。

自己写的代码如下:

```javascript
function extend(destination) {
  let sources = Array.prototyep.slice.call(arguments, 1);
  let len = sources.length;
  for (let i = 0; i < len; i++) {
    let currrentSource = sources[i];
    let key = _.keys(currentSource);
    for (let index = 0; index < keys.length; index++) {
      destination[keys[index]] = currentScource[keys[index]];
    }
  }
}
```

源码分析:

```javascript
let createAssigner = function (keysFunc, undefinedOnly) {
  return function (obj) {
    let length = arguments.length;
    // 进行边界处理
    // 当传入一个参数的时候或者 obj === null 的时候, 返回 obj
    if (length < 2 || obj === null) return obj;
    for (let index = 1; index < length; index++) {
      // 需要对于额外传入的参数进行循环的时候使用 arguments[index] 进行获得
      let source = arguments[index];
           keys = keysFunc(source);
           l = keys.length;
      for (let i = 0; i < l; i++) {
        let key = keys[i];
        // 这里面使用了 undefinedOnly 如果 undefinedOnly 是 true 的时候
        // 接下来判断 obj[key] 是否为 undefined(void 0)
        if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
      }     
    }
  }
}
```

#### `extendOwn`

使用  `extendOwn` 实现的效果类似于使用  `extends`, 实现的效果是只是复制自己的属性到目标对象。

`_.extendOwn(destination, *source)`

复制 `source` 属性的值到 `destination` 只是复制自身的属性。(不包括继承的属性)

这个函数与 `_.extend` 的不同之处在于不会将 `source` 对象中继承到的属性复制到 `destination` 之中。

使用 `extendOwn` 与 `extend` 的不同在于: 源码不同

```javascript
// 使用 _.allKeys 获得到包括自身和继承得到的属性
_.extend = createAssigner(_.allKeys);
// 使用 extendOwn 获得到仅仅包括自身的属性
_.extendOwn = _.assign = createAssigner(_.keys);
```

#### `pick`

`_.pick(object, *keys)`  

使用这个属性用于返回 `object` 副本, 过滤出  `keys(有效的键组成的数组)` 参数指定的属性值，或者接受一个判断函数，指定挑选哪一个 key

使用 `pick` 的源码如下。

```javascript
_.pick = function(object, oiteratee, context) {
  let result = {}, obj = object, iteratee, keys;
  if (obj == null) return result;
  // 如果 oiteratee 是一个函数的话
  if (_.isFunction(oiteratee)) {
    // 使用 _.allKeys 获得到 obj 中的所有键
    keys = _.allKeys(obj);
    iteratee = optiomizeCb(oiteratee, context);
  } else {
    // 如果 oiteratee 不是一个函数的时候
    // 表示这时候用于筛选出对象 object 中包含 keys 的内容
    // 效果是相同于 Array.prototype.slice.call(arguments, 1); 相识
    keys = flatten(arguments, false, false, 1);
    // 返回在 obj 中的 key
    iteratee = function(value, key, obj) { return key in obj; };
    obj = Object(obj);
  }
  for (let i = 0; length = keys.length; i < length; i++) {
    let key = keys[i];
    let value = obj[key];
    // 这里通过使用不同的函数来实现对于不同情况下的处理条件
    // 通过改变 iteratee 函数的不同来实现不同的处理流程
    // if (iteratee(value, key, obj))
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
}
```

上面中有一个 `flatten` 函数, 使用 `flatten` 函数的目的是将多层嵌套的数组转化为一维数组。

`flatten`源码:

```
let flatten = function(input, shallow, strict, startIndex) {
  let output = [], idx = 0;
  for (let i = startIndex || 0, length = getLength(input); i < length; i++) {
    let value = input[i];
    if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
      if (!shallow) value = flatten(value, shallow, strict);
      let j = 0; len = value.length;
      output.length += len;
      while (j < len) {
        output[idex++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}
```

自己写的函数: `pick`

```javascript
function pick(obj, oiteratee) {
  // 边界处理 如果 obj === null 或者 typeof obj !== 'object'
  // 返回一个空对象
  if (obj === null || typeof obj !== 'object') {
    return {};
  }
  let output = {};
  let keys = Object.keys(obj);
  let len = keys.length;
  let iteratee;
  let choiceKeys = Array.prototype.slice.call(arguments, 1);
  if (typeof oiteratee === 'function') {
    iteratee = oiteratee;
  } else {
    iteratee = function (value, key) { retutn choiceKeys.includes(key); };
  }
  for (let i = 0; i < len; i++) {
    let key = keys[i];
    if (iteratee(obj[key], key)) output[key] = obj[key];
  }
  return output;
}
```

#### `omit` 

`omit(object, *keys)`

使用 `omit` 函数的目的是与使用 `pick` 函数相反，返回一个 `object` 副本，过滤出除去  `keys` 中的属性值，或者接收一个判断函数，指定忽略哪一个 `key` 值。

`omit` 源码如下:

```javascript
_.omit = function (obj, iteratee, context) {
  if (_.isFunction(iteratee))　{
    iteratee = _.negate(iteratee);
  } else {
    let keys = _.map(flatten(arguments, false, false, 1), String);
    iteratee = function() {
      return !_.contains(keys, key)
    };
  }
  return _.pick(obj, iteratee, context);
}
```

####   `default`

`_.defaults(object, *defaults)`

使用 `default` 的目的是使用 `default` 对象填充 `object` 中的 `undefined` 属性，并且返回这个 `object`。

当 `object` 中存在 `default` 中的属性被填充的时候，使用 `defaults` 方法不会起作用。

使用 `_.defaults` 方法的时候源码如下:

```javascript
// 使用 createAssigner(keysFunc, undefinedOnly);
// 传递两个参数： keysFunc 表示对于键的处理函数
// undefinedOnly 表示是否只是复制目标对象中值为 undefined 的属性
_.default = createAssigner(_.allKeys, true);
```

在 `createAssigner` 的函数中使用 `_.default` 方法主要是使用下面的这句函数:

```
// 当 undefinedOnly 为 true 的时候, 接下来进行判断 obj[key] === void 0 对象的属性是否为 undefined
if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
```

