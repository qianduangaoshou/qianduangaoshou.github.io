---
title: node 中的 events 模块学习
date: 2019-09-08 11:32:30
tags: node 
categories: node module
---

[events 模块](https://link.zhihu.com/?target=https%3A//github.com/nodejs/node/blob/master/lib/events.js)

模仿 events 模块的一些代码， 基本实现原 events 模块的一些功能：

```js

function cloneArray(list, n, fn) {
  let clonedArr = new Array(n);
  for (let index = 0; index < n; index++) {
    clonedArr[index] = fn ? fn(list[index]) : list[index];
  }
  return clonedArr;
}

function clonelisteners(list, hasWrap) {
  return cloneArray(list, list.length, (listener) => {
    return hasWrap ? listener : (listener.listener || listener);
  });
}

function getListeners(target, type, hasWrap) {
  const listenerList = target.events[type];
  if (typeof listenerList === 'function') {
    return hasWrap ? [listenerList] : [listenerList.listener || listenerList];
  } else {
    return clonelisteners(listenerList, hasWrap);
  }
}


class EventEmitter {
  constructor() {
    this.maxListeners;
    this.defaultMaxlisteners = 10;
    this.events = undefined;
    this.eventsCount = 0;
    this.init();
  }
  init() {
    this.maxListeners = this.maxListeners || this.defaultMaxlisteners;
    this.events = Object.create(null);
  }
  checkListener(listener) {
    if (typeof listener !== 'function') throw new Error('listener is not function type');
  }
  listenerCount(emitter, type) {
    if (typeof emitter.listenerCount === 'function') return emitter.listenerCount(type);
    function listenerCount(type) {
      const events = this.events;
      if (events === undefined) return 0;
      const eventList = this.events[type];
      if (typeof eventList === 'function') return 1;
      if (eventList) {
        return eventList.length;
      } else return 0; 
    };
    listenerCount.call(emitter, type);
  }
  prependListener(type, listener) {
    this.addListeners(type, listener, true);
  }
  prependOnceListener(type, listener) {
    this.once(type, listener, true);
  }
  addListeners(type, listener, prepend) {
    this.checkListener(listener);
    if (this.events) {
      if (this.events.newListener) this.emit('newListener', listener.listener || listener);
    }
    const existlistener = this.events[type];
    if (typeof existlistener === 'function') {
      this.events[type] = prepend ? [listener, existlistener] : [existlistener, listener];
    } else if (typeof existlistener === 'undefined') {
      this.events[type] = listener;
      this.eventsCount ++;
    } else if (prepend) {
      this.events[type].unshift(listener);
    } else {
      this.events[type].push(listener);        
    }
    let maxlistenerLength = this.getMaxlisteners();
    if (this.events[type].length > maxlistenerLength) {
      let w = new Error('memory leak');
      process.emitWarning(w);
    }
    return this;
  }
  on() {
    this.addListeners(...arguments);
  }
  off() {
    this.removeListener(...arguments);
  }
  once(type, listener, prepend) {
    this.checkListener(listener);
    function wrapFn () {
      if (!this.fired) {
        this.fired = true;
        this.emitter.removeListener(type, this.wraplistenerFn);
        this.listener.apply(this.emitter, arguments);
      }
    }
    const listenerWrapStates = { fired: false, listener, wraplistenerFn: undefined, emitter: this };
    const wrapedlistener = wrapFn.bind(listenerWrapStates);
    wrapedlistener.listener = listener;
    listenerWrapStates.wraplistenerFn = wrapedlistener;
    this.on(type, wrapedlistener, prepend);
  }
  emit(type, ...args) {
    const existlistener = this.events[type];
    if (existlistener === undefined) return false;
    if (typeof existlistener !== 'function') {
      const existList = cloneArray(existlistener, existlistener.length);
      existList.forEach(listener => {
        listener.apply(this, args);
      });
    } else {
      existlistener.apply(this, args);
    }
  }
  removeAlllisteners(type) {
    const listenerList = this.events[type];
    const isRemoveAllEvens = arguments.length === 0;
    if (this.events === undefined) return this;
    // 移除全部的 listernr
    if (this.events.removeListener === undefined) {
      if (isRemoveAllEvens) {
        this.events = Object.create(null);
        this.eventsCount = 0;
      } else {
        if (listenerList) {
          delete this.events[type];
          this.eventsCount --;
          if (this.eventsCount === 0) this.events = Object.create(null);
        } 
      }
      return this;
    } else {
      if (isRemoveAllEvens) {
        for (const key of this.events) {
          if (key === 'removeListener') continue;
          this.removeAlllisteners(key);
        }
        this.removeAlllisteners('removeListener');
        this.eventsCount = 0;
        this.events = Object.create(null);
        return this;
      }
    }
    if (typeof listenerList === 'function') {
      this.removeListener(type, listenerList);
    } else if (listenerList) {
      listenerList.forEach(listener => {
        this.removeListener(type, listener);
      });
    }
    return this;
  }
  setMaxlisteners(num) {
    if (typeof num !== 'number' || num < 0 || Number.isNaN(num)) throw new Error('listernrs length is a number');
    this.maxListeners = num;
    return this;
  }
  getMaxlisteners() {
    return this.maxListeners;
  }
  eventNames() {
    if (this.events === undefined || this.eventsCount === 0) return [];
    return Object.keys(this.events);
  }
  rawListeners(type) {
    const eventList = this.events[type];
    if (eventList === undefined) return [];
    return getListeners(this, type, true);
  }
  listeners(type) {
    const eventList = this.events[type];
    if (eventList === undefined) return [];
    return getListeners(this, type, false);
  }
  removeListener(type, listener) {
    this.checkListener(listener);
    const eventListeners = this.events[type];
    if (eventListeners === undefined) return this;
    if (typeof eventListeners === 'function') {
      if (eventListeners === listener || eventListeners.listener === listener) {
        this.eventsCount --;
        if (this.eventsCount === 0) {
          this.events = Object.create(null);
        } else {
          delete this.events[type];
          if (this.events.removeListener) {
            this.emit('removeListener', type, eventListeners || eventListeners.listener);
          }
        }
      }
    // 当存放的事件是一个数组的时候
    } else {
      let handlerIndex = -1;
      let originlistener;
      for (let i = 0; i < eventListeners.length; i ++) {
        if (eventListeners[i] === listener || eventListeners[i].listener === listener) {
          handlerIndex = i;
          originlistener = eventListeners[i].listener;
          break;
        }
      }
      if (handlerIndex < 0) return this;
      if (handlerIndex === 0) {
        eventListeners.shift();
      } else {
        const spliceOne = function (list, index) {
          list.splice(index, 1);
        };
        spliceOne(eventListeners, handlerIndex);
      }
      if (eventListeners.length === 1) this.events[type] = eventListeners[0];
      if (this.events.removeListener) this.emit(this.removeListener, type, originlistener || listener); 
    }
  }
}

module.exports = EventEmitter;
```

