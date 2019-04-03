---
title: 聊聊js中的类
date: 2018-05-15 23:17:09
tags: js 类
categories: 笔记
---

对于js 中类的使用，自己平常工作的时候也有用到， 但是只是一些浅显的知识，实际上， 在 js 中如何使用类， 对于类的更深一步的理解，还是有很多的东西需要进行了解, 纸上得来终觉浅， 绝知此事要躬行，作为一名程序员更重要的还是要多写， 多练， 在练习中不断成长。

实现类的机制在 js 中有两种方法： `prototype` 以及   es6 中`class` 关键字， 下面分别就这两种探讨一下 `js` 中类的形成：

###  使用 `prototype` 实现类

#### 什么是 `prototype`

在 `js` 中创建对象的时候，对象中默认存在一个 `prototype`（在 Chrome,  Safari, Firefox 中的对象上这个属性被称作 `_proto_`） 属性，这个属性是一个 `指针`，指向一个对象， 这个对象被称作原型对象， 原型对象上的属性是可以通过对象访问到的：

```javascript
let obj = {};
obj._proto_ = { name: "张宁宁" };
obj.name // 张宁宁
```



想要了解这个过程，我们需要知道当我们在使用 `.` 或者 `[]` 查找元素属性的时候，元素属性是如何被查找到的。

**当在对象中查找某一个元素属性的时候， 会首先在对象本身上进行属性查找， 如果对象本身上没有查找到对象属性， 那么就会在对象的原型上进行查找。如果在对象本身上已经查找到了， 那么返回这个属性的值**

上面的例子中， 虽然我们没有在 `obj` 上面定义一个 `name` 属性，但是我们在 `obj` 对象的原型上定义了一个 `name` 属性，因此还是可以查找到的。同样， 对于定义在 `prototype` 上的属性，使用 `for in` 操作符也是可以访问到的。

```javascript
for (let key in obj) {
  console.log(key);
}
// name*
```

使用`hasOwnProperty` 方法可以判断定义的属性是在对象本身上面还是在原型上面。

注意： 使用 `Object.keys` 是不能获得到定义在对象原型上面的属性的。

```javascript
Object.keys(obj); // []
```



#### 了解原型链

##### 原型链的实现方式

在 `javascript` 中，原型链是被用来实现继承的主要方法， 基本的原理如下：

> 使用原型链实现在 `js` 中继承的方式是让一个构造函数的原型对象等于另外一个构造函数的实例

我们知道，对于一个构造函数而言，存在一个原型对象， 该构造函数形成的实例包含一个指向原型对象的指针， 如果我们将这个原型对象变为另外一个构造函数的实例，那个同样在这个原型对象中包含一个指向另外一个构造函数的原型对象的指针，这样层层递进，从而形成了一条原型链。

代码实现：

```javascript
function func1 () {
  this.value = true;
}
function func2 () {
}
func2.prototype.getValue = function () {
    return this.value;
}
func1.prototype = new func2()
const instance = new func1();
// 或者 const instance = Object.create(func1.prototype);
// 使用 Object.create(obj) 会创建一个新对象， 并且对象内部的 prototype 指向 obj
instance.getValue(); // true
```

上面的这个过程其实也可以说是我们重写了构造函数的原型;

##### 原型链的终点

对于一个原型链而言，是否原型链存在终点呢？实际上， 原型链的终点是存在的。

我们知道在 `javascript` 中， 存在下面几种基本类型：

`undefined`, `null` , `Boolean` , `Number`, `String` 这五种基本类型和一种复杂的数据类型： `Object`.

实际上， 例如我们创建一个新的对象的时候， 创建的这个新的对象实际上是 `Object` 的实例。

```javascript
let newObj = new Object();
```



这个时候， 这个对象的原型指向的是对象的原型； 例如我们在对象上经常使用的一些对象方法例如： `Object.keys`, `Object.values` 这些方法实际上是定义在对象的原型上面的。

```javascript
let obj = {};
obj._proto_  // Object.prototype
```

而对于 `Object.prototype` 上面，实际上也是存在一个 `prototype` 属性， 只不过这个属性指向的是 `null`;

###  `new` 操作符

我们使用 `new` 操作符用来创造一个构造函数， 或者可以说， 我们通过使用 `new` 标识符号将一个普通函数转变为一个构造函数:

使用 `new` 操作符创造构造函数的实例的时候发生的过程如下：

1. 创建一个新对象。
2. 将这个新对象的原型对象指向构造函数的原型
3. 返回这个新对象。

在 `高级程序设计` 这本书中有这样一句话：

> 这两个对象( `person` 的实例)都有一个`constructor(构造函数)`属性，这个属性指向 `person`.

上面这句话第一次读的时候不好理解，看起来感觉像是 `constructor` 属性是定义在实例上面的，实际上， 这里在实例上能够获得 `constructor` 属性，其实这里是继承来自于构造函数的原型上面的，因为构造函数的原型上面有个 `constructor` 属性，这个属性指向构造函数。 

