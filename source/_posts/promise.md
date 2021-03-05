---
title: promise 原理
date: 2017-12-05 23:04:14
tags: promise
categories: 代码集
---

使用 `promise` 构建异步请求在 `es6-promise` 中已经说过了，下面这章想要探究一下使用 `promise ` 的原理。

使用 `promise `  的实例如下:

`new Promise(function (resolve, reject) {....})`

对于 `promise` 的执行过程是这样的:

>executor 执行器:
>
>executor 是一个带有  `resolve` 和 `reject` 两个参数的函数, `executor` 函数 `promise` 构造函数执行的时候同步执行， 被传递 `resolve` 以及 `reject` 函数，`executor` 函数在 `Promise` 构造函数返回新建对象前被调用, `resolve` 和 `reject` 函数被调用的时候，分别将 `promise` 的状态改为 `fullfilled(完成)` 和 
>
>`rejected(完成)` `executor` 函数内部会执行异步操作，操作完成成功之后将 `promise` 状态改为 `fullfiled` 或者将发生错误的时候, 将  状态变为 `rejected`

对于一个 `promise ` 对象具有下面三种状态:

```javascript
pending: 初始状态，不是成功就是失败 // pending 英文: 等待，表示处于等待异步处理结果的状态
fufilled 等待结果操作成功完成
rejected 表示等待操作结果失败
```

下面是通过使用 `promise` 进行调用的状态图:

!['promise 状态'](https://mdn.mozillademos.org/files/8633/promises.png)

###  `promise` 代码

#### 构建 `Promise` 构造函数

`es6`:

```javascript
let p = new Promise((resovle, reject) => {
  // 异步操作
  if () {
  // resolve(value)    
    resolve(value);
  } else {
 // reject(value)      
    reject(value);
  }
})
```

实际源码:

```javascript
function Promise (executor) {
  let that = this;
  that.status = PENDDING;
  that.value = void 0;
  that.handlerQueue = [];
  // 执行函数， 传递进入 value
  // executor(成功函数， 失败函数);
  executor(function (value) {
    // 成功函数执行，传递进入 transition 状态: FULFILLED
    that.transition(FULFILLED, value);
  }, function (value) {
    // 失败函数执行， 传递进入 transition 状态: REJECTED
    that.transition(REJECTED, value);
  })
}
```

#####  改变状态函数

`es6`:

```javascript
resolve(value);

reject(value);
```

实际源码:

```javascript
Promise.prototpe.transition = function (status, value) {
  if (this.status === PENDING) {
    // 当处于 PENDDING 状态的时候执行函数
    this.status = status;
    this.value = value;
    // 当成功或者失败的时候都会执行 this.process() 函数
    this.process();
  }
}
```

#### `then` 

`es6`: 

```javascript
p.then(onFulFilled, onRejected);
// onFulFilled 成功之后执行的函数
// onRejected 失败之后执行的函数
```

源码分析:

```javascript
Promise.prototype.then = function (onFulfilled, onRejected) {
  // thenPromise 是一个新的 Promise 对象
  let thenPromsie = new Promise(function() {});
  // 将执行的函数存入到 handlerQueue 数组之中
  this.handlerQueue.push({
    // 成功函数
    onFulfilled,
    // 失败函数
    onRejected,
    thenPromise
  });
  // this.process() 执行函数
  this.process();
  // 返回 thenPromise 一个新的 promise 对象
  return thenPromise;
}
```

####  `process`处理函数

用来执行成功时的回调函数以及失败的回调函数。  

`es6`:  

```javascript
p.then(function () {
  // 成功函数执行
}, function () {
  // 失败函数执行
})
```

源码如下:

```javascript
// 使用 process 的主要目的是执行保存在 this.handlerQueue 中的函数
Promise.prototype.process = function () {
  let that = this;
  // 如果状态处于 PENDING 状态 返回
  if (that.status === PENDING) {
    return;
  }
  while (that.handlerQueeu.length > 0) {
    let handler = that.handlerQueue.shift();
    (function (handler) {
      let handlerFn = that.status === FULFILLED ? handler.onFulfilled : handler.onRejected;
      // 如果 handlerFn 是一个函数
      if (isFunction(handlerFn)) {
        // 使用 callLater 回调函数执行
        callLater(function () {
          try {
            // 执行 handlerFn 函数
            let x = handlerFn(that.value);
            // 将 handler.thenPromise 以及 handlerFn 计算之后的 x 传入 resolve 函数
            resolve(handler.thenPromise, x);
          } catch (e) {
            // 如果 catch error
            handler.thenPromise.transition(REJECTED, e);
          }
        });
      } else {
        handler.thenPromise.transition(that.status, that.value);
      }
    })(handler);
  }
}
```

#### `resolve`

`resovle` 函数用于函数执行完毕之后改变状态:

```javascript
function resovle(promise, x) {
  if (promise === x) {
    promise.transition(REJECTED, new TypeError());
    // 如果 x 是一个 promise
  } else if (isPromise(x)) {
    // 调用 x 的 then 方法
    x.then(function(value) {
      promise.transition(FULFILLED, value);
    }, function(reason) {
      promise.transition(REJECTED, reason);
    } );
    // 如果函数执行之后的返回值是一个对象或者一个函数
  } else if (isObject(x) || isFunction(x)) {
    try {
      let then = x.then;
      // 如果 then 是一个函数
      // 参数具有 then 方法的对象
      if (isFunction(then)) {
        let called = false;
        try {
          then.call(x, function(y) {
            if (!called) {
              resolve(promise, y);
              called = true;
            }
          }, function (r) {
            if (!called) {
              promise.transition(REJECTED, r);
              called = true;
            }
          });
        } catch (e) {
          if (!called) {
            promise.transition(REJECTED, e);
          }
        }
      } else {
        promise.transition(FULFILLED, x);
      }
    } catch (e) {
      promise.transition(REJECTED, x);
    }
  // 如果 x 只是一个数值  
  } else {
    promise.transition(FULFILLED, x);
  }
}
```

####  `promsie.resolve`

>对于 `promise.resolve` 的状态，存在下面几种情况:
>
>1. 如果参数是 Promise 实例，那么`Promise.resolve`将不做任何修改、原封不动地返回这个实例。
>2. 如果参数是一个具有 `then` 方法的对象, 使用 `promise.resolve` 会将这个对象转化为 `promise` 对象，并且立即执行 `thenable` 对象的 `then` 方法。
>3. 如果参数是一个原始值，或者是一个不具有`then`方法的对象，则`Promise.resolve`方法返回一个新的 Promise 对象，状态为`resolved`。
>4. 如果不带参数, 直接返回一个 `resolve` 状态的 Promise 对象。

实现代码如下:

```javascript
Promise.resolve = function(value) {
  // 返回一个 new Promise
  return new Promise(function(resolve, reject) {
    if (isThenable(value)) {
      // 如果 value 是一个 then 对象
      // 如果 value 具有 then 方法，执行下面的函数
      value.then(resolve, reject);
    } else {
      // else 执行 resolve 函数
      resolve(value);
    }
  });
}
```

####  `promise.reject`

```javascript
Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  }}
}
```

使用 `Promise.reject` 接收的参数 `reason `会被作为 `error` 传递 

####  other

```javascript
// 定义 promise 的三种状态
// PENDING, FULFILLED  REJECTED
let PENDING = 0;
    FULFILLED = 1;
    REJECTED = 2;
function isFunction(fn) {
  return fn instanceof Function;
}

function isObject(obj) {
  return obj instanceof Object;
}

function isPromise() {
  return p instanceof Promise;
}
// 判断是否含有 then 方法
function isThenable(obj) {
  return obj && isFunction(obj.then);
}
// 借用 callLater 实现异步
function callLater(fn) {
  setTimeout(fn, 0);
}
```

