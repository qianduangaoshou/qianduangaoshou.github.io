---
title: 'CSS: 未知高度内文本居中'
date: 2017-12-11 23:01:45
tags: 垂直居中
categories: CSS
---

在项目中遇到过单行文本出现垂直居中的问题， 对于已知高度使用 `line-height = height` 可以解决问题，对于未知高度，下面有几种方法。

例如下面的 `HTML` 以及 `CSS` 如下:

```
<div class="wrapper">
  <span class="first">我是第一个需要居中的文字</span>
  <span class="second">我是第二个需要居中的文字</span>
</div>
```

```css
.wrapper {
  width: 200px;
  height: 100px;
}
.wrapper span {
  width: 100%;
  display: inline-block;
}
.first {
  height: 30%;
}
.second {
  height: 70%;
}
```

我们期望得到下面的效果:

![](http://ov3b9jngp.bkt.clouddn.com/span%20%E5%B1%85%E4%B8%AD.png)

但是, 因为我们无法使用 `line-height = height` (你总不能计算高度 * 30% 吧， 愚蠢的做法), 我们得到这样的效果:

![](http://ov3b9jngp.bkt.clouddn.com/span%20not%20middle.png)

为了实现居中效果，我们可以采用下面的方式:

1. 暴力 `flex`

```css
.wrapper span {
  display: flex;
  align-items: center;
}
```

[table](http://www.jianshu.com/p/8aa3f1030908)

