---
title: underscore.js源码分析(十二)
date: 2017-12-10 20:14:18
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(十二)

`wrap` `negate` `compose`

#### `wrap`

##### 实例

`_.wrap(function, wrapper)`

使用 `wrap` 的目的在于将函数 `function` 作为第一个参数传递进入 `wrapper` 之中, 从而在 `wrapper` 中在不同的事件，不同的代码，根据不同的条件执行 `function` 函数。

实例:

```javascript
function hello(name) {
  console.log(`hello my name is ${name}`);
}
let sayHello = _.wrap(hello, function (func) {
  func('张宁宁');
});
sayHello(); // hello my name is 张宁宁
```

##### 源码分析

使用 `_.partial` 函数实现的参数替换:

```javascript
_.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
}
```

#### `negate`

返回 `negate` 的否定版本:

##### 源码分析

```
// predicate 迭代函数
_.negate = function (predicate) {
  return funciton () {
    return !predicate.apply(this, arguments);
  }
}
```

#### `compose`

`compose(*functions)`

`compose` 用于函数的组合, 将一个函数的返回值作为另外一个函数的参数。

##### 实例

```
function sayHello(word) {
  console.log(`hello, my name UpperWorlds is ${word}`)
}
function toUpper(word) {
  return word.toUpperCase();
}
let composeFn = _.compose(sayHello, toUpper);
composeFn('zhangningning'); // hello my name UpperWorlds is ZHANGNINGNING;
```



##### 源码分析

自己写的部分代码:

哪个好？？

```javascript
function compose() {
  let fns = Array.prototype.slice.call(arguments);
  reurn function (args) {
    fns.reduceRight((preFn, nextFn) => {
      return nextFn(preFn);
    }, args);
  }
}
```

源码如下:

```javascript
_.compose = function () {
  let args = argumemts;
  let start = args.length - 1;
  return function () {
    let i = start;
    // 使用 call 以及 apply 进行参数传递
    let result = args[start].apply(this, arguments);
    // 使用 while 进行递减
    while(i--) result = args[i].call(this, result);
    return result;
  }
}
```





