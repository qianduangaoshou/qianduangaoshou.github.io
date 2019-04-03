---
title: 移动端touch事件
date: 2017-08-19 08:40:01
tags: 移动端touch事件
---

####  touch事件

当我们手指触摸屏幕的时候，touch事件有这几个事件:

touchstart : 当手指触摸手机屏幕的时候触发  

touchmove : 当手指当手机屏幕上移动的时候触发  

touchend: 当手指移开手机屏幕的时候触发  ，事件方法应该在 `touchend` 中定义调用。

touchcancel: 这个事件在 uc 浏览器上，当我们在页面上进行左右滑动的时候会被触发  ,用于防止误操作

<!--more-->

#### touch 事件对象

touch事件对象返回了下面几个属性:  

touches: 当前屏幕上所有触摸点的集合 ,当只有一个触摸点的时候，使用 touches[0] 获得触摸对象

targetTouches: 当前对象上所有触摸点的集合  

changedTouched: 自从变化之后的所有touch对象数组  

##### touch 事件返回的对象中的属性集合

返回的触摸点对象如下：

```
TouchList {
length: 1
0: Touch
clientX: 57.36600112915039
clientY: 31.8700008392334
force: 1
identifier: 0
pageX: 57.36600112915039
pageY: 31.8700008392334
radiusX: 36.65040588378906
radiusY: 36.65040588378906
rotationAngle: 0
screenX: 547
screenY: 167
target: div#demo
__proto__: Touch
__proto__: TouchList
```

各个触摸点的属性解释如下:  

clientX，clientY: 触摸点在视口中的距离  

pageX, pageY:触摸点在html文档中的距离，当html文档的宽度超过视口的宽度的时候， pageX = clientX + 超出的那一部分距离  

screenX, screenY: 触摸点距离屏幕的距离  

target: touch事件作用到的事件对象  

####  在uc浏览器下遇到的问题

使用uc浏览器的时候遇到了一个问题，我想要做导航栏随着手指移动而滑动的效果，在android 系统上chrome浏览器表现正常，但是在uc浏览器上出现bug, 手指滑动屏幕的时候导航栏不滑动，当手指离开的时候，导航栏出现滑动效果，貌似滑动效果只被触发了一次，touchend 事件消失，被touchcancel替代:

解决办法: 在touchmove的时候阻止默认行为，~~监听touchcancel 替代 touchend事件:~~

```
touch(event) {
  switch (event.type) {
    case 'touchstart':
    	....
    	break;
    case 'touchmove':
    	....
    	event.preventDefault();
    	break;
    case 'touchend':
    	....
    	break;
  } 
}
```

情况并不像我之前想的那样，`touchcancel` 的行为并不是类似于 `touchend` 

#### touchcancel 事件

`touchcancel` 从字面意思上来讲，是取消`touch` 操作的意思，在 MDN 上是这样解释的: 

>The `touchcancel` event is fired when a touch point has been disrupted in an implementation-specific manner (for example, too many touch points are created).\
>
>`touchcancel` 事件是这样被触发的：当触摸点被一种特殊的执行方法被破坏，（例如，创建了太多的触摸点）

我是这样理解的： `touchcancel` 事件被触发是因为:当我们使用手机操作的时候，例如点击按钮操作，我们在 `touchend` 事件中定义了点击按钮后调用的方法，如果我们误操作，比如手指在按钮上左右滑动的时候，`touchcancel` 事件就会被紧跟着被调用（不同于点击事件，浏览器会认为在手机屏幕上的左右滑动是误操作），取消 `touchend` 事件，从`touchend` 事件中的方法不会被执行。

当手指在按钮上下滑动的时候，`touchcancel` 事件是不会被调用的。可以把`touchcancel` 事件视为防止误操作事件。