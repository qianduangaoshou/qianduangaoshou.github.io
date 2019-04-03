---
title: underscore.js源码分析(十一)
date: 2017-12-07 22:09:15
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析(十一)

`throttle`  `debounce`  `once` `after` `before`

#### `throttle`

函数节流

`_.throttle(function, wait, [options])`

使用 `throttle` 函数用于节流操作, 目的是对于重复执行的函数，最多每隔 `wait` 毫秒调用一次这个函数。

##### 源码分析

```javascript
/*
* @description throttle 用于函数节流
* @param func 运行的函数
* @param wait 等待的毫秒数
* @param options
*/
// previous 这里的意思的记录下上次记录下上次的时间
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      // 这里 previous 的作用
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      // 记录下被调用的时刻
      if (!previous && options.leading === false) previous = now;
      // 当 previous 等于 now 的时候 remaining = wait
      // 记录下等待的时间和 now - previous 的差值
      // 不会执行下面的 if else 函数
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 如果 remaining <= 0
      // 第一次函数执行的时候被调用，因为这个时候 now >> wait remaining <= 0
      if (remaining <= 0 || remaining > wait) {
        // 当超出等待时间之后调用的时候
        // 返回调用的结果，清除 timeout
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        // 获取到 func 执行之后的结果
        result = func.apply(context, args);
        if (!timeout) context = args = null;
        // 如果 timeout 为 null
        // 开启一个新的队列等待
        // 如果 options.trailing === false, 表示禁用最后一次执行
      } else if (!timeout && options.trailing !== false) {
        // 如果没有超过等待时间
        // remaining 时间之后调用 later函数
        // 对于在一段时间内应用同一个函数的时候，只是改变的later 函数
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
```

首先，需要明白一点，函数式编程同样可以首先数据的共享。

```
function getIndex() {
  let index = 0;
  // return 返回的是一个函数
  return function () {
    index++;
    console.log(index);
  }
}

let getIndexFn = getIndex();
// 因为在个过程中，通过getIndex 返回的是一个函数
// 在 getIndex 中的 index 并没有发生变化， 因为 getIdnex 只是调用了一次
getIndexFn(); // 1
getIndexFn(); // 2
```

练习:

```javascript
function throttle (func, wait, options) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  if (!options) options = {};
  let later = funciton () {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
  };
  return funcion () {
    let now = now();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    // 如果第一次执行
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        cleatTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  }
}
```

#### `debounce`

`_.debounce(function, wait, [immediate])`

`debounce` 函数用于函数防抖: 函数防抖的意思是将延迟函数的执行(真正的执行)在函数最后一次调用的时刻的 `wait` 毫秒之后进行执行。

当函数重复调用的时候，函数执行只是发生在最后一次调用的 `wait` 毫秒之后进行执行。

自己写的:

```javascript
function debounce(func, wait, immediate) {
  // 定义执行上下文, 参数， 结果
  let context, args, result;
  let timeout = null;
  let previous 0;
  let remainding = 0;
  immediate = immediate || false;
  let later = function () {
    result = func.apply(context, args);
    timeout = null;
    context = args = null;
  };
  return function () {
    let now = _.now();
    remainding = now - previous;
    context = this;
    args = arguments;
    // 保证使用 immediate 的时候立即执行函数
    if (immediate && remainding > wait) {
      previous = _.now();
      result = func.apply(context, args);
      timeout = null;
      context = args = null;
    } else if (!immediate) {
      // if timeout
      // clearTimeout 进行清除 timeout
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(later, wait);
    }
  }
}
```

######  源码解析

```javascript
_.debounce = function(func, wait, immediate) {
  let timeout, args, context, timestamp, result;
  let later = function () {
    let last = _.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };
  return function () {
    context = this;
    args = arguments;
    // 这里面继续调用的时候改变的只是这个
    timestamp = _.now();
    let callNow = imemediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
}
```

如下流程图如下:

```flow
st=>start: bounce;
init=>operation: 初始化context, args, timeout, timeStamp, result, 定义later函数
rt=>operation: 记录当前调用时间 timeStamp = _.now(), 
callNow = imemediate && !timeout
isTimeout=>condition: !timeout
iscallNow=>condition: callNow 为 true
setTimeout=>operation: setTimeout(later, wait);
cond=>condition: Yes or No?
replyFn=>operation: 执行函数,
result = func.apply(context, args);
context = args = null;
e=>end: return result
st->init->rt->isTimeout->e
isTimeout(yes, right)->setTimeout->iscallNow
isTimeout(no)->iscallNow
iscallNow(yes, right)->replyFn->e
iscallNow(no)->e
cond(no)->io
cond(yes)->e
```

关于 `later` 函数如下:

```
let later = function () {
  let last = now() - timestamp;
  if (last < wait && last >= 0) {
    timeout = setTimeout(later, last - wait);
  } else {
    timeout = null;
    if (!immediate) {
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  }
}
```

这一部分实现的原理是:

假如使用 bounce 函数的程序被多次调用的时候，如果在函数被第一次调用之后的 `wait` 时间之内，函数被调用了第二次，程序会在函数调用第二次的时候记录下时间，这时候 `wait` 时间之后调用函数的时候，第一次调用的函数不会被触发，程序在 `later` 函数中继续延迟第二次调用函数距离上一次调用需要的时间，这样，最终，第二次函数也是和第一次函数调用的结果是相同点的，都是在延迟了`wait` 时间之后被调用。

#### `once`

创建一个只能调用一次的函数。即使函数被调用一次，也只是返回第一次被调用的结果。

使用 `once` 是当 `before` 方法中 `count` 等于2的情况下进行执行的函数;

```javascript
// 向 befor 函数中传递参数为 2
_.once = _.partial(_.before, 2);
```



#### `before`

`_.before(count, function)`

创建一个函数，调用不超过 `count` 次, 当`count`已经被达到的时候，最后一次调用的结果被记住并被返回。

自己写的:

```javascript
/*
* @description before 用于返回 调用不超过 count 次数的函数调用
* @param {Numbet} count 调用函数的次数
* @param {function} func 被调用的函数
*/
function before(count, func) {
  let index = 1;
  let memo;
  return function () {
    if (index < count) {
      memo = func.apply(this, arguments);
      index++;
    }
    return memo;
  }
}
```

源码分析:

```javascript
_.before = function (times, func) {
  let memo;
  return function () {
    // --times
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    // 如果 times <= 1 将 func 重置为 null
    if (times <= 1) func = null;
    return memo;
  }
}
```

#### `after`

`_.after(count, function)`

使用 `_.after` 的作用是创建一个函数，只有调用 `count` 次之后才能得到效果。

```javascript
/*
* @description after 用于表示 after 函数
* @param {Number} 需要的调用次数
* @param {function} func 规定调用次数之后的调用函数
*/
function after (times, func) {
  return function () {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  }
}
```

