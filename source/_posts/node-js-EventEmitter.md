---
title: node.js EventEmitter
date: 2017-12-17 21:46:19
tags: EventEmitter
categories: node.js
---

## `EventEmitter`

####  基本构建

许多的 `node.js` 核心的 `API` 是围绕事件异步模型进行构建的，特定种类的事件对象会周期性的触发命名的函数对象，从而导致函数对象被触发。 这些函数对象被称作 `listeners`;

所有的触发事件的对象属于 `EventEmitter` 类， 这些对象暴露有 `emit` 以及 `on` 方法。

```javascript
let eventEmitter = require('events');
let myEmitter = new eventEmitter();
// listeners
myEmitter.on('event', () => {
  console.log('event');
});
// emitters
myEmitter.emit('event'); // event
```

##### 向 `lisitens` 传递 `arguments` 以及 `this` 值 

```javascript
myEmitter.on('event', function (msg) {
  console.log(`my name is ${msg}`);
  console.log('被传递的值', this);
});
myEmitter.emit('event', '张宁宁');
// my name is 张宁宁
// this 值指向的值是 eventEmitter 对象
```

####  handle event only once

使用 `once` 函数的时候, 当使用 `emit` 的时候只会被触发一次

```
myEmitter.once('event', () => {
  console.log('事件被触发一次');
});
myEmitter.emit('event');
// '事件触发一次'
myEmitter.emit('event');
```

#### some API

##### `Event: newListener`  

在监听器被加入到监听器队列之前，`EventEmitter` 实例会触发自己的 `newListener` 事件。

```javascript
const myEmitter = new EventEmitter();
myEmitter.once('newListener', (event, listener) => {
  if (event === 'event') {
    myEmitter.on('event', () => {
      console.log('B');
    });
  }
});
myEmitter.on('event', () => {
  console.log('A');
});
myEmitter.emit('event');
// B
// A
// 在触发 'event' 事件的时候先要触发事件 B 在触发事件 A
```

##### `EventEmitter.listenerCount(emitter, eventName)`

用来获得在 `emitter` 上面注册的 `eventName` 的次数。

```javascript
let myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(EventEmitter.listenerCount(myEmitter, 'event')); // 2
```

##### `emitter.eventNames()`

用来获得 `emitter` 上面注册的 `listeners` 的事件列表。  

```javascript
let myEmitter = new EventEmitter();
myEmitter.on('a', () => {});
myEmitter.on('b', () => {});
console.log(myEmitter.eventNames); // ['a', 'b']
```

##### `emitter.listenerCount(eventName)`

`eventName` :  the name of the event being listened for

作用和 `EventEmitter.listenerCount(emitter, eventName)` 是相同的。  

#####  `emitter.listeners(eventName)`

用于获得 `emitter` 上 `eventName` 事件的注册函数。

```javascript
let myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
// 使用 emitter.listeners(eventName)
// 用于获得 emitter 上面的 eventName 上注册的函数
console.log(myEmitter.listeners('event'));
// [[Function], [Function]]
```

##### `emitter.on(eventName, listener)`  

向一个被称作 `eventName` 的事件`listener` 的列表之中添加事件， 添加的事件被添加到 `listener` 列表的末尾。  注意，在添加事件的时候， 添加的事件只会按照顺序添加到时间列表数组的末尾，在这个过程中，不会进行判断事件是否已经添加了。

#####  `emitter.prependListener(eventName, listener)`

将 `listener` function 添加到事件队列的开头

```javascript

myEmitter.on('otherEvent', () => {
	console.log('第一次');
});
myEmitter.prependListener('otherEvent', () => {
	console.log('第三次');
});
myEmitter.on('otherEvent', () => {
	console.log('第二次');
});
myEmitter.emit('otherEvent');
// 第三次
// 第一次
// 第二次
```

#### `emitter.prependOnceListener(eventName, listener)`  

仅仅添加一次运行的函数到事件队列开始，第二次调用的时候会被移除

##### `emitter.removeAllListeners([eventName])`

移除 `eventName` 事件上的所有函数。  

##### `emitter.removeListener(eventName, listener)`  

>removes the specified listener from the listener array for the event named eventName

使用 `removeListener` 的时候将会移除事件队列中至多一个`instance` (实例), 如果一个 单独的监听器被多次添加，那么使用 `removeListener` 需要多次调用才能被多次删除。  

从被称作 `eventName` 的事件队列中移除掉特定的事件函数。

*注意*:

>一旦时间被触发的时候, 在触发的时刻所有与之相关联的 `listeners` 将会被调用， 这表明， 在 `listeners` 被 `emit` 之后，在 `listeners` 中的最后一个函数被执行之前， 使用 `removeListenr()` 或者 `removeAllListeners` 都不会起作用   

也就是说， 使用使用移除事件的时候是不会在 `listeners` 函数执行的过程中被调用的。  

例子如下:

```javascript
const callBackA = () => {
	console.log('A');
	myEmitter.removeListener('callback', callBackB);
};

const callBackB = () => {
	console.log('B');
};

myEmitter.on('callback', callBackA);
myEmitter.on('callback', callBackB);

myEmitter.emit('callback'); // 这一次调用的时候是不会移除掉 B 的
myEmitter.emit('callback');// 这一次调用的时候移除掉了 B
// A B A
myEmitter.listeners() // [[Function: callbackA]]
```

因为对于 `listeners` 而言, 是通过使用内部的数组进行管理的,  当其中的 `listener` 被移除之后，会改变每一个注册的 `listern` 位置， 但是不会影响 `listener` 被调用的顺序，  但是通过使用 `emitter.listeners()` 返回的调用函数数组队列将会发生变化。

 