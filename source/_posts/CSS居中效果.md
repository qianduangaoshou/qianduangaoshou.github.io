---
title: CSS居中效果
date: 2017-09-02 10:53:26
tags: CSS 居中
categories: CSS
---

使用 CSS 并没有这么的简单，如果CSS 熟练了，开发网页就会快得多，自己实际上能够使用到的 CSS 样式不多，但是,太多的东西自己没有掌握， CSS 也有许多的技术点，只能不断的跳出自己的舒适区，不断的进行探索。

### 居中方法

#### 水平居中

##### 行内元素的水平居中

使用 `text-align` 的方法实现行内元素的水平居中

1. `text-align: center` : 实现块状元素内部 行元素的水平居中

```
<div id = 'content'>
	<span>我是一段文字</span>
</div>
<style>
	#content {
      text-align: center;
	}
</style>
```



##### 块状元素的水平居中方法

1.使用 `margin` 进行定位

```
<div id='content'>
	<div id = 'block'>
	</div>
</div>
<style>
	#content {
    	width: 200px;
		height: 200px;
		background-color: blue;
	}
	#block {
       width: 50px;
       height: 50px;
       margin: auto;
	}
</style>
```

* 注意， 对于块状元素使用 `margin: auto` 只能实现块状元素在父级块状元素内的水平居中

  >如果在正常流中一个块元素的 `margin-top   margin-bottom ` 设为 `auto` 的时候，这个元素的 margin  会自动计算为 0
  >
  >​

效果如下:

![](http://ov3b9jngp.bkt.clouddn.com/marginAuto%20%20Snipaste_2017-09-02_12-18-20.png)

在上面的图片中，尽管设置了 `margin-top : 20px`  但是由于 `margin: auto` 的存在，将块元素的 `margin-top` 重新计算为 0

2.借用定位元素  `position: absolute`

借用定位元素实现的居中，可以实现水平，垂直居中的效果

垂直居中：

```
父元素：
position: relative;
子元素：
position: absolute;
top: 0;
bottom: 0;
margin: auto;
```

水平居中：

```
父元素：
position: relative;
子元素：
position: absolute;
left: 0;
right: 0;
margin: auto;
```

垂直居中：

```
父元素：
position: relative;
子元素：
position: absolute;
top: 0;
bottom: 0;
margin: auot;
```

完全居中:

```
父元素：
position: relative;
子元素：
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;
margin: auto
```

3.借用 `display: inline-block`  来实现

`display: inline-block` 这个属性很有意思:

>使用了 `display: inline-block` 的元素，这个元素会表现出行内块的特征，这个元素即可以像块状元素一样具有 width  和 height, 也可以是向行内元素一样，呈行内排列

因此，我们的思路是：

对于要进行水平居中的块状元素应用 `display:inline-block` , 使它表现出类似行状元素的特性，对于该元素的父元素，应用 `text-align: center`

#### 垂直居中

##### 行内元素的垂直居中

1.对于单行元素，使用 `line-height: height` 实现

2.对于多行元素的垂直居中方法，使用 `display: table-cell`

```
<div class = 'content'>
	<p>我是一段文字</p>
	<p>我是另一段文字</p>
</div>

CSS:

.content {
  display: table-cell;
  vertical-align: middle
}
```



![](http://ov3b9jngp.bkt.clouddn.com/%E5%A4%9A%E8%A1%8C%E6%96%87%E5%AD%97%E5%B1%85%E4%B8%ADSnipaste_2017-09-02_17-38-37.png)



##### 块状元素的垂直居中

1.使用 `position: absolute` 来实现

2.子元素声明  `display: table-cell`  `display: inline-block`  `vertical-align: middle` 来实现

#### 完全居中

1. `position: absolute` 来实现

2. 使用  `display: table-cell`, 这时候 子元素必须要声明  `display: inline-block`

   ```
   <div id='good'>
   	<div class='child'></div>
   </div>
   <style>
   	#good{
   		display:table-cell;
   		vertical-align: middle;
   		text-align: center;
   		width: 200px;
   		height: 200px;
   		background-color: blue;
   	}
   	.child {
   		display: inline-block;
   		width: 50px;
   		height: 50px;
   		background-color: red;
   	}
   	
   ```

2.使用 `display: flex` 实现居中的效果

```html
<div class="parent">
  <div class="children">
  </div>
</div>
```

```css
.parent {
    display: flex;
    align-items: center;
    justify-content: center;
}
```



