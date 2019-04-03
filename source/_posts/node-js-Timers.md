---
title: node.js Timers
date: 2017-12-19 22:41:55
tags: Timers
categories: node.js
---

###  `Timers`

####  `APIS`

#####  `setImmediate(callback, args)`  

`callback` : 在 `node.js` 事件循环之后被调用的函数。  

`args`: 当 `callback` 函数被调用的时候传递的参数。 

在 `I / O` 事件回调时间之后立即执行 `callback` 回调函数的执行。

如果 `callback` 不是一个 `function` , 会抛出一个 `TypeError` 错误。

```javascript
setImmediate(function () {
  console.log('事件稍后被执行');
});
console.log('事件立即被执行');
// 事件立即被执行
// 事件稍后被执行
```

#####  `setInterval(callback, delay, args)`  

使用 `setInterval` 类似于使用 `setInterval` 方法, 在一定的时间间隔 `delay` 之后执行 `callback` 函数。  

在官方给的例子中存在使用 `util.promisly()` 的一个变体。

```javascript
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
setTimeoutPromise(4000, 'foobar').then((value) => {
  console.log(value);
});
// after delay print 'foobar'
```

####  `canceling Timers`  

使用 `setImmediate` `setInterval`  以及 `setTimeout` 每一个方法都会返回一个代表排列事件的对象, 这些能够用来取消 `timer` 防止被触发的操作。  

`clearImmediate`,  `clearInterval`,  `clearTimeout`  用来清除通过使用 `setImmedidate`  `setInterval` 以及 `setTimeout` 创建的定时器。

```javascript
let immidate = setImmediate(function () {
    console.log('事件之后被调用');
});
clearImmediate(immidate);
// 清除事件， 事件之后不会调用

clearInterval();
// 清除间隔时间后的调用
clearTimeout();
// 清除一段时间之后的调用
```

