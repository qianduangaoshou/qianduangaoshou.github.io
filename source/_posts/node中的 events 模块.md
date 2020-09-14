---
title: node中的 events 模块
date: 2020-09-14 11:31:54
tags: node
categories: 源码阅读
---

了解 Node 中的 Events 模块

node 中的 events 模块是 node 中使用较多的模块，比如在 node 中的流（stream），其内部使用 `events` 模块作为父类：

{% asset_img image-20200803102619367.png %}

作为一个使用广泛的基础模块，其代码中是有些东西值得我们学习和借鉴的。

#### 发布/订阅模式

发布/订阅模式定义了一种一对多的依赖关系，观察者同时监听某一个对象相应的状态变化， 当状态变化时通知到所有观察者， 这种设计模式解决了主体对象和观察者之间的耦合问题。

图示如下：

 {% asset_img eventsPic.jpg %}

*上图中左边为观察者模式， 右边为 发布/订阅 模式， 可以看出它们之间的区别是发布/订阅模式通过事件调度中心（Event Channel）来对于事件进行统一管理*

观察上图可知，发布/订阅这种设计模式的组成特点：

* 整体结构有三部分组成， 订阅者（Subscriber）, 发布者（Publisher）以及 事件调度器（Event Channel）
* 订阅者在事件调度器中订阅（Subscribe）事件， 发布者发布事件时，订阅该事件的订阅者将会收到消息通知（事件触发的形式）

在 Node 中的 Events 模块中， 采用了这种设计模式，模块内部维护了一个事件列表（`_events`）,提供了基础的 api 来进行发布和订阅（`emit`, `on`）在 Events 中，订阅事件时需要传入两个参数： 事件名（eventName）以及 事件触发时的回调方法（listener），订阅之后按照下面的结构存储在 `_events` 中：

```js
_events = {
  eventName: listener, wrapFn { fired: false/true, listener }
	eventName: [listener1, listener2 ....]
}
```

当调用 `this.emit(eventName)` 来发布特定事件时，将会依次调用`_events` 中的事件（`listener`）

#### Events 模块代码实现

1. `on` / `addListener(eventName, listener)`

   这个方法的作用是订阅`eventName` 事件, 当事件被发布时， `listener` 方法被执行

   具体代码：

   ```js
   // 订阅事件
   // target: EventEmitter 实例
   // type: 事件类型
   // listener: 事件触发后的回调方法
   // prepend: 是否将回调方法前置（首先触发）,默认为 false, 将会被放到回调方法的最后
   function _addListener(target, type, listener, prepend) {
     var m;
     var events;
     var existing;
     // 判断是否为有效的函数    
     checkListener(listener);
   
     events = target._events;
     if (events === undefined) {
       events = target._events = Object.create(null);
       target._eventsCount = 0;
     } else {
       // To avoid recursion in the case that type === "newListener"! Before
       // adding it to the listeners, first emit "newListener".
       if (events.newListener !== undefined) {
         target.emit('newListener', type,
                     listener.listener ? listener.listener : listener);
   
         // Re-assign `events` because a newListener handler could have caused the
         // this._events to be assigned to a new object
         events = target._events;
       }
       existing = events[type];
     }
   
     if (existing === undefined) {
       // Optimize the case of one listener. Don't need the extra array object.
       // 只有一个 listener 的情况， 存储的直接是这个函数
       existing = events[type] = listener;
       ++target._eventsCount;
     } else {
       if (typeof existing === 'function') {
         // Adding the second element, need to change to array.
         existing = events[type] =
           prepend ? [listener, existing] : [existing, listener];
         // If we've already got an array, just append.
       } else if (prepend) {
         existing.unshift(listener);
       } else {
         existing.push(listener);
       }
   
       // Check for listener leak
       // 获取到一个事件最多的 listener 数量
       m = _getMaxListeners(target);
       if (m > 0 && existing.length > m && !existing.warned) {
         existing.warned = true;
         // No error code for this since it is a Warning
         // eslint-disable-next-line no-restricted-syntax
         var w = new Error('Possible EventEmitter memory leak detected. ' +
                             existing.length + ' ' + String(type) + ' listeners ' +
                             'added. Use emitter.setMaxListeners() to ' +
                             'increase limit');
         w.name = 'MaxListenersExceededWarning';
         w.emitter = target;
         w.type = type;
         w.count = existing.length;
         ProcessEmitWarning(w);
       }
     }
   
     return target;
   }
   
   EventEmitter.prototype.addListener = function addListener(type, listener) {
     return _addListener(this, type, listener, false);
   };
   
   EventEmitter.prototype.on = EventEmitter.prototype.addListener
   ```

2. `emit(eventName[, ...args])`

   作用：发布 `eventName` 事件， 传入的 args 将会作为该事件下 `listener` 的参数

   代码：

   ```js
   // 这里包含了 type 为 "error" 或者其他需要 emit 的触发
   EventEmitter.prototype.emit = function emit(type) {
     var args = [];
     for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
     var doError = (type === 'error');
   
     var events = this._events;
     // 当 events 存在的时候
     if (events !== undefined)
       // 当 events 中不存在 error 事件时还 emit 了 error 事件
       doError = (doError && events.error === undefined);
     // 当 events 不存在， 并且 type 为非 error时， 直接返回 false
     else if (!doError)
       return false;
   
     // If there is no 'error' event listener then throw.
     // events 中没有 error 的时候
     if (doError) {
       var er;
       if (args.length > 0)
         er = args[0];
       if (er instanceof Error) {
         // Note: The comments on the `throw` lines are intentional, they show
         // up in Node's output if this results in an unhandled exception.
         throw er; // Unhandled 'error' event
       }
       // At least give some kind of context to the user
       var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
       err.context = er;
       throw err; // Unhandled 'error' event
     }
   
     var handler = events[type];
   
     if (handler === undefined)
       return false;
   
     if (typeof handler === 'function') {
       
       ReflectApply(handler, this, args);
     } else {
       var len = handler.length;
       var listeners = arrayClone(handler, len);
       for (var i = 0; i < len; ++i)
         ReflectApply(listeners[i], this, args);
     }
   
     return true;
   };
   
   ```

   

3. `off` / `removeListener(eventName, listener)`
   作用： 从事件名为 `eventName` 的事件下移除特定的回调方法（`listener`）
   代码：

   ```js
   // Emits a 'removeListener' event if and only if the listener was removed.
   // 移除特定事件的 listener && 
   // EventEmitter.on('removeListener'， handler) 触发
   // type: 特定事件名称
   // listener: 移除的函数
   EventEmitter.prototype.removeListener =
       function removeListener(type, listener) {
         var list, events, position, i, originalListener;
   
         checkListener(listener);
   
         events = this._events;
         if (events === undefined)
           return this;
   
         list = events[type];
         if (list === undefined)
           return this;
           // 这里判断是否 list 中只有一个 listener 或者 list 是 wrap fn 的情况
         if (list === listener || list.listener === listener) {
           if (--this._eventsCount === 0)
             this._events = Object.create(null);
           else {
             delete events[type];
             if (events.removeListener)
               this.emit('removeListener', type, list.listener || listener);
           }
           // 当 list 不是一个函数的时候，这个时候这个 list 是一个数组
         } else if (typeof list !== 'function') {
           position = -1;
   
           for (i = list.length - 1; i >= 0; i--) {
             if (list[i] === listener || list[i].listener === listener) {
               originalListener = list[i].listener;
               position = i;
               break;
             }
           }
           // 找不到listener
           if (position < 0)
             return this;
             // 第一个是要找到的 listener
           if (position === 0)
             list.shift();
           else {
             // 如果要进行删除的元素在 list 数组之中
             // splice
             spliceOne(list, position);
           }
           // 当 list 删除完成之后只有一个 listener 时， 直接将这个 listener 作为 events[type] 的值
           if (list.length === 1)
             events[type] = list[0];
   
           if (events.removeListener !== undefined)
             this.emit('removeListener', type, originalListener || listener);
         }
   
         return this;
       };
   EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
   ```

   特别：`spliceOne` 方法, 而非使用`splice` 方法

   ```
   // 这里是删除数组的方法
   // 用的方法是找到一个数组的位置， 然后往前挪
   // 这种方法性能提升比较大
   function spliceOne(list, index) {
     for (; index + 1 < list.length; index++)
       list[index] = list[index + 1];
     list.pop();
   }
   ```

4. `once(eventName, listener)`
   作用：添加只能调用一次的 `listener` 方法

   代码：

   ```js
   function onceWrapper() {
     // 这里的 fired 或许是为了更方便的暴露给外部使用
     if (!this.fired) {
       // 移除之后这里的闭包将会被回收了
       this.target.removeListener(this.type, this.wrapFn);
       this.fired = true;
       if (arguments.length === 0)
         return this.listener.call(this.target);
       return this.listener.apply(this.target, arguments);
     }
   }
   
   // 通过 onceWrap 维持了一个 state 状态 用来保存是否被触发过的状态
   function _onceWrap(target, type, listener) {
     var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
     // 这里是注入里一些状态字段
     // 这里保存一些状态字段， 比如： fired 用来表示这个函数有没有被触发过
     var wrapped = onceWrapper.bind(state);
     wrapped.listener = listener;
     state.wrapFn = wrapped;
     return wrapped;
   }
   
   // 这里的 _oncewrap 方法执行之后是一个方法， 方法上的 listener 属性才是传入 once 方法的
   // listener 参数
   // 这里的 _onceWrap 方法的包装解释了代码中存在的 listener.listener || listener 的判断
   EventEmitter.prototype.once = function once(type, listener) {
     checkListener(listener);
     this.on(type, _onceWrap(this, type, listener));
     return this;
   };
   ```

   

5. `prependListener(eventName, listener)`

   作用：添加 `listener` 到事件 `eventName` 回调数组中的第一个， 当事件被发布时， 添加的 `listener` 第一个执行

   代码：

   ```js
   EventEmitter.prototype.prependListener =
       function prependListener(type, listener) {
         return _addListener(this, type, listener, true);
       };
   ```

   

6. `prependOnceListener(eventName, listener)`

   作用： 添加一次性的 listener 到事件回调函数队列头部

   代码：就是 `prependListener` 和 `_onceWrap` 方法的结合

   ```js
   EventEmitter.prototype.prependOnceListener =
       function prependOnceListener(type, listener) {
         checkListener(listener);
         this.prependListener(type, _onceWrap(this, type, listener));
         return this;
       };
   ```

   

7. `removeAllListeners([eventName])`

   作用： 移除 `eventName` 事件的全部 `listener`

   代码：

   ```js
   EventEmitter.prototype.removeAllListeners =
       function removeAllListeners(type) {
         var listeners, events, i;
   
         events = this._events;
         if (events === undefined)
           return this;
   
         // not listening for removeListener, no need to emit
         // 为了保证 removeListener 方法在删除完之后最后触发，
         // 需要判断是否存在这个 removeListener 方法是否存在
         if (events.removeListener === undefined) {
           if (arguments.length === 0) {
             this._events = Object.create(null);
             this._eventsCount = 0;
           } else if (events[type] !== undefined) {
             if (--this._eventsCount === 0)
               this._events = Object.create(null);
             else
               delete events[type];
           }
           return this;
         }
   
         // emit removeListener for all listeners on all events
         // _events 中存在 removeListener 方法
         if (arguments.length === 0) {
           var keys = Object.keys(events);
           var key;
           for (i = 0; i < keys.length; ++i) {
             key = keys[i];
             if (key === 'removeListener') continue;
             this.removeAllListeners(key);
           }
           // 保证之前移除listener 时能够触发 removeListener 回调
           this.removeAllListeners('removeListener');
           this._events = Object.create(null);
           this._eventsCount = 0;
           return this;
         }
         // 删除单个事件
   
         listeners = events[type];
         // 兼容 listeners 中单个 listener 或者 多个 listener 的问题
         if (typeof listeners === 'function') {
           this.removeListener(type, listeners);
         } else if (listeners !== undefined) {
           // LIFO order
           for (i = listeners.length - 1; i >= 0; i--) {
             this.removeListener(type, listeners[i]);
           }
         }
   
         return this;
       };
   ```

   

8. `rawListeners(eventName)` 

   作用： 获取到 `eventName` 事件的全部 `listeners`, 包括是通过 `once` 方法创建的包裹 `listener`

   代码：

   ```js
   // 这个方法用来获取到所有的 listener 无论是原生的还是放在 wrapper 上面的
   function unwrapListeners(arr) {
     var ret = new Array(arr.length);
     for (var i = 0; i < ret.length; ++i) {
       ret[i] = arr[i].listener || arr[i];
     }
     return ret;
   }
   
   // 获取到全部的 _listeners 
   // type event 名称
   // unwrap 是否是获取 非once 方法创建的 wrapper listener
   function _listeners(target, type, unwrap) {
     var events = target._events;
   
     if (events === undefined)
       return [];
   
     var evlistener = events[type];
     if (evlistener === undefined)
       return [];
   
     if (typeof evlistener === 'function')
       return unwrap ? [evlistener.listener || evlistener] : [evlistener];
   
     return unwrap ?
       unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
   }
   EventEmitter.prototype.rawListeners = function rawListeners(type) {
     return _listeners(this, type, false);
   };
   ```

   