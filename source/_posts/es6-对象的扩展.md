---
title: 'es6: 对象的扩展'
date: 2017-09-17 17:27:58
tags: 对象扩展
categories: es6
---

### es6 中对象扩展的用法

#### 1.简洁属性名

函数的属性可以是一个变量：

```
    let foo = 'good';
    let bar = {
        foo: foo
    };
    console.log(bar.foo); // 'good'
```

1. es6 中我们可以直接传入一个变量到对象中

   ```
       let foo = 'good';
       let bar = {
           foo
       };
       console.log(bar.foo); // 'good' 
       //传入的变量名会被作为对象的属性名，变量的值会被作为对象属性的值
   ```


2. 用在函数中返回一个对象

   ```
   function Person(name) {
     let age = 22;
     return {name, age};
   }
   person('张宁宁')// {name: '张宁宁', age: 22}
   ```

#### 2.  Object.is( ) 判断相等

对于比较两个值是否相等，使用 全等 `===` 运算符进行判断, 因为使用 `==` 会自动转换数据类型

使用 `===` 有缺点： NAN === NAN  flase  以及  +0 === -0 false

使用 `object.is` 可以解决这个缺点

```
object.is(1,1) // true
object.is(1,'1') // false
object.is(NaN, NaN) // true
Object.is(+0, -0) //  true
```

***

使用` ==` 或者 `===` 进行相等比较的时候，实际上，是无法进行比较对象的，因为对象是一个指针，指向存储对象数据的内存地址

```
object.is({} , {}); // false
```

***

#### 3. Object.assign () 合并对象

```
let t = {};
let s1 = { a: 1 };
let s2 = { b: 2 };
Object.assign(t, s1, s2);
// {a: 1, b: 2}
```

上面中将对象 s1, s2,  合并入 t 中；

传入值的情况:

* 如果只有一个参数，使用这种方法会返回这个参数
* 如果传入的一个参数是 Null 或者 undefined 机会报错
* 要进行合并的参数是字符串的情况下，会返回该字符串的对象,传入非对象，非字符串的其他值，无效

```
Object.assign({}, 'string');
// {0: "s", 1: "t", 2: "r", 3: "i", 4: "n", 5: "g"}
```

使用 Object.assign () 返回的是对象的形式

使用 Object.assign() 实现浅拷贝

#### 4. Object.keys()   Object.values()   Object.entires()

1. `Object.keys() `

   使用这种方法得到的是对象中所有可遍历的属性名组成的数组

2. `Object.values() `

   使用这种方法得到的是对象自身所有可以遍历到的属性的值

3. `Object.entires()`

   使用这种方法得到的数组，数组中包括对象自身所有可遍历得到的属性的键值对儿数组

### 应用

1. 判断对象内是否是空对象的方法：

   ```javascript
   const isEmpty = obj => return Object.keys(obj) === 0;
   ```

2. 使用 `Object.assign` 实现自定义配置覆盖默认配置

   ```javascript
   function toConfig(defaultConfig, config) {
     return Object.assign(defaultConfig, config);
   }
   ```

   ​