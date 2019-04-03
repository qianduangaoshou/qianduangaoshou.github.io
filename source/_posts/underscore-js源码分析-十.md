---
title: underscore.js源码分析(十)
date: 2017-12-05 10:39:50
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码分析（十）

使用underscore.js 的 function 部分

`bind`  `bindall`  `partial`  `memorize`  `delay`

#####  `bind`

`_.bind(func, obj, *arguments)`

使用 `bind`

使用 `bind` 的目的是将函数 `func` 绑定到 `obj` 上面去，也就是说，这时候 `func` 中的 `this` 就指向了 `obj`, 其中 `arguments` 被作为传递给 `func` 的参数被传入到 `func` 之中。

#####　实例如下

```javascript
function greet(home) {
  console.log(`hi my name is ${this.name}, my home is ${home}`);
}
// 使用 _.bind 进行函数绑定
_.bind(greet, {name: '张宁宁'}, '山东');
// hi my name is 张宁宁, my home is 山东
```

***

关于使用 `bind` 的函数:

使用 `bind` 的函数

使用 `bind` 函数接收两个参数，第一个参数表示需要进行绑定的变量，第二个参数表示传递给函数的参数。

***



源码如下:

```javascript
_.bind = function(func, context) {
  // 首先检查是否支持 es5 的bind 方法, 如果支持， 使用 nativeBind 进行绑定操
  // nativeBind.appy
  // 对于 es5 支持的 bind 方法接收两个参数
  // func 以及 参数
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
  // 如果 func 不是一个函数的时候
  // throw new TypeError('bind must be called on a function');
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
  // 使用 slice.call 用于截取 arguments
  // 通过使用 slice.call 方法截取传入函数的参数
    var args = slice.call(arguments, 2);
    var bound =  function () {
      // 返回一个 executeBpund 函数
      // 使用 args 数组的 concat 方法用于连接数组
      // 分别传入的值是 func, bound, context, this, args
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };
```

其中 `executeBound` 函数如下:

```javascript
// 这里面 boundFunc 是需要进行绑定的函数 
var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
   // 如果 boundFunc 不在 callingContext 的原型链上
  // 使用 apply 方法进行绑定
  // 如果 callingContext 不在 boundFunc 的原型链上
  // 这里的 callingContext 是指的 this 值
  // 返回将 context 绑定到 sourceFunc 上面
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
   // 关于 baseCreate 函数
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };
```

关于 `baseCreate` 函数如下:

```javascript
let Ctor = function () {};
let baseCreate = function(prototype) {
  // 判断 prototype 是否是一个对象
  if (!_.isObjject(prototype)) return {};
  // 如果nativeCreate 存在的话, 返回 nativeCreate(prototype) 这个函数
  if (nativeCreate) return nativeCreate(protoytpe);
  Ctor.prototype = prototype;
  // 创建一个函数的实例，这个函数的原型指向 prototype
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
} 
```

上面的 `nativeCreate` 返回的是这个 `Object.create()` 

使用 `Object.create` 用来实现继承的关系

```javascript
// 使用 new 操作符的过程
let obj = new Constructor();
// 创建一个新的对象
let obj = {};
// 执行原型链接
obj._proto_ = Constructor.prototype;
// 将这个构造函数的 this 值指向新创建的这个新对象
Constructor.call(obj);
// 这样在 obj 中我们就能愉快的使用在 Constructor 中通过 this 值创建的新对象了
```

##### `partial`

`partial(function, *arguments)`

局部应用一个函数填充在任意个数的 `arguments`。

##### 实例

```javascript
function add(a, b) {
  return a + b;
}
let particalAdd = _.partial(add, 3);
particalAdd(5); // 8
// 这里的 5 填充了函数的第二个参数 b
```

自己写的函数:

```javascript
function partial(fn) {
  // 获取到传入到 partial 函数中的参数
  let partialArgs = Array.prototype.slice.call(arguments, 1);
  // return 返回一个函数
  return function(args) {
    let fnArgs = Array.prototype.slice.call(arguments, 0);
    // 将参数传入，执行 fn
    fn(...partialArgs, ...fnArgs);
  }
}
```



##### 源码分析

```javascript
_.partial = function(func) {
  let boundArgs = slice.call(arguments, 1);
  return function bound () {
    let position = 0;
    let args = boundArgs.slice();
    let length = args.length;
    for (let i = 0; i < length; i++) {
      // 在数组中使用 position ++
      if (args[i] === _) args[i] = arguments[position++]; 
    }
    whitle(position < arguments.length) args.push(arguments[position++]);
    // 这时候的 args 中是包含了所有的参数
    return executeBound(func, bound, this, this, args);
  }
}
```

关于 `executeBound` 函数上面有解释，这个函数的作用是:

> Determines whether to execute a function as a constructor,   or a normal function with the provided arguments
>
> 决定是否构建一个函数作为构造函数，或者运行一个给定参数的普通函数。

`memoize`

使用 `memorize` 用来缓存函数计算的结果。

`delay`

使用 `delay` 用来实现对于函数延迟执行，代码如下:

```javascript
function delay(func, wait) {
  // 通过调用 Array.prototype.slice.call 的方法进行获得传递的参数
  let args = Array.prototype.slice.call(arguments, 2);
  // 返回等待 wait 时间之后的函数
  return setTimeout(() => {
    // 自己写的
    func(args);
    // 源码写的
    // 使用 apply 的方法向函数 func 中传递 args 参数
    return func.apply(null, args);
  }, wait)
}
```

`defer`

`defer(function, *arguments)`

使用 `defer` 的目的在于延迟调用 `function` 直到当前的调用栈被清空为止，其中 `arguments` 会被作为 `function` 的参数进行传入。

类似于使用 `setTimeout(function () {}, 0)` 的延迟调用效果。

实现的源码如下:

```javascript
_.defer = _.partial(_.delay, _, 1);
```

