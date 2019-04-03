---
title: 'es6:变量的解构赋值'
date: 2017-09-09 15:53:25
tags: 变量解构赋值
categories: es6
---

### es6的数值解构赋值

#### 1.es6 允许使用一定的方式从数组或者对象中提取数值，从而对于同样模式的变量进行赋值操作，代码如下:

```
let [a,b,c] = [1,2,3]
a // 1
b // 2
c // 3
类似:
let a = 1
let b = 2
let c = 3
```

使用数组形式进行解构赋值的时候要注意到，两边其实并不是数组，而只是数组的形式

对于等号两边必须是数组的形式，如果是其他的形式，那么就会报错:

```
let [a] = {};
let [a] = null;
let [a] = undefined;
let [a] = NaN;
let [a] = 1;

```

上面的几种形式都会被报错

#### 2.使用结构变量可以初始数组

```
let [a,...b] = [1,2,3,4];
b // [2,3,4]
```

使用扩展运算符可以将多个数合并为一个数组

#### 3.可以在解构赋值的时候使用默认值操作

```
let [x = 1] = [];
x //  x 在没有被赋值的时候默认使用 1
let [x = 1] = [2];
x // 2
当 x 存在明显只的时候默认值失效
// 对于使用默认值, 还可以使用函数的返回值
function fn() {
  return 23
}
let [a = fn()] = [45];
// 这里 因为 a 能够取到值, 因此不会执行 fn 函数
console.log(a); // 45
```

默认值可以引用其他结构值的对象

```
let [x = 1, y = x] = [];
x // 1
y // 1
```

注意: 对于赋值操作两端的值, 在赋值操作两端执行的是 `===` 全等操作， 因此

```
let [a = 1] = [null]
a // null
let [a = 1] = [undefined]
a // 1
```



###  es6 中对于对象的解构赋值操作

代码如下:

```
let person = {
	name: '张宁宁',
	home: '山东'
};
let {name, home} = person;
name // '张宁宁'
home // '山东'
```

这种写法无非是下面这种写法的简写:`

```
let {name: name, home: home} = person;
```

实际上:

```
let {name: perName, home: perHome} = person;
perName //  '张宁宁'
```

等号左边中 `name` 用于进行模式匹配，在 `person` 中找到 `name` 之后，将 `name` 的值赋给 `perName`

使用对象的形式解构也可以赋予默认值：

当在等号右边的对象中找不到对应的属性的时候, 会使用括号内被默认赋予的值

```
let {x = 1, y = 5} = {x: 2}
x // 2
y // 5
```

### es6 中对于字符串的解构赋值

当对于字符串进行解构赋值操作的时候，字符串会被转换为类似数组的对象:

这意味着我们可以通过使用数组或者对象的方式进行解构：

```
let [a,b,c,d,e] = 'hello';
a // 'h'
b // 'e'
....
```

```
let {length} = 'hello';
length // 5
因为使用解构的时候， 字符串对象含有一个 length 属性
```

### 函数参数的解构

1.数组形式进行解构

```
function move([x,y]) {
  return x + y
}
move([1,2]);
// 这里虽然传入的是一个数组，实际上传入函数之后会被解构
```

2.对象形式进行解构

```
function person({name, home}) {
	console.log(home, name)
}
let per = {
  name: '张宁宁',
  home: 'china'
}
person(per)//  china 张宁宁
```

3.使用对象形式赋予默认值

```
function person ({name = '张宁宁', home = 'china'} = {}) {
	console.log(name, home)
}
person(); // 张宁宁  china
和上面结果相同， 因为传入的是一个空对象，没有找到相应的属性，因此采用默认赋予的值进行操作
```

***

### 使用参数解构中的小技巧

1. 提取函数的返回值:

   ```
   function bar () {
     return [1, 2]
   }
   let [a, b] = bar ();
   a // 1
   b // 2
   ```

2. 应用解构分离对象的键值对

   ```
   let arrObj = [{}, {}, {}];
   // 取得数组对象中值对应的键
   function getKey( arrobj, objValue) {
     for (const obj of arrobj) {
     // 使用 {} 实现对象的解构赋值
       let {key, value} = obj;
       if (value === objValue) {
         return key;
       }
     }
   }

   getKey(arrObj, 'someObjValue')

   ```

   ​