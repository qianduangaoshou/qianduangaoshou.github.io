---
title: underscore.js 源码分析(十五)
date: 2017-12-14 22:40:13
tags: underscore.js源码
categories: underscore.js 源码分析
---

### underscore.js 源码解析( 十五 )

`clone`  `tap`  `has`  `matcher`  `property`  `propertyOf`  `isEqual`

#### `clone`

`_.clone(object)`  

创建一个浅拷贝的 `object`  

使用  `_.clone` 的源码如下:

```javascript
_.clone = function (obj) {
  if (!.isObject(obj)) return obj;
  // 对于 obj 是对象的, 分为数组和对象两种形式
  return isArray(obj) ? obj.slice() : _.extend({}, obj);
}
```

####  `tap`

`_.tap(object, interceptor)`

>`interceptor` 拦截器

使用 `interceptor` 的作用是用于对于传入的对象 `object` 进行 `interceptor` 操作, 并且操作完成之后返回 `object` 本身。

用于链式调用: 

```javascript
_.tap = function (obj, interceptor) {
  // 对于对象应用 interceptor 函数作用
  interceptor(obj);
  // 返回这个对象
  return obj;
}
```

#### 　`has`

`_.has(object, key)`

用于判断对象是否包含有特定的属性 `key`  , 在源码中有这样一句话, 

>等同于`object.hasOwnProperty(key)`，但是使用`hasOwnProperty` 函数的一个安全引用，以防[意外覆盖](http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/)。
>
>什么是意外覆盖?

源码分析如下:

```javascript
_.has = function(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
};
```

#### `matcher`

`matcher(attrs)`

使用 `matcher` 函数是一个断言函数, 返回一个 `true` or `false` 来判断给定的对象中是否含有 `attrs` 中指定的键值对儿

示例:

```javascript
let list = {
  selected: true
}
let hasSelected = _.matcher({selected: true});
hasSelected(list); // true
```

##### 源码分析

源码如下:

```javascript
_.matcher = _.matches = function(attrs) {
  attrs = _.extendOwn({}, attrs);
  return function (obj) {
    return _.isMatch(obj, attrs);
  }
}
```

其中 `_.isMatch` 源码如下:

```javascript
_.isMatch = function (object, attrs) {
  let keys = _.keys(attrs), length = keys.length;
  if (object === null) return !length;
  let obj = Object(object);
  for (let i = 0; i < length; i++) {
    let key = keys[i];
    //如果 attrs 中的值和 obj 中的值不相等， 或者 key 不属于 obj 中
    // 返回 false
    if (attrs[key] !== obj[key] || !(key in obj)) return false; 
  }
  // 返回 true
  return true;
}
```

#### `property`

`property(key)`  

该方法返回一个函数，返回传入该函数的任何对象的 `key` 属性。  

#### 源码

```javascript
let property = function (key) {
  return function (obj) {
    return obj === null ? void 0 : obj[key];
  }
}
```

####  `propertyOf`

使用 `propertyOf` 与使用  `property` 相反。  

`propertyOf(object)`  传入一个对象， 返回一个函数，这个函数接收一个属性，返回对象对应属性的值。

使用 `propertyOf`   

```javascript
_.propertyOf = function (obj) {
    return obj == null ? function () {} : function (key) {
        return obj[key];
    }
}
```

#### `isEqual`

`isEqual(object, other)` 

使用  `isEqual` 用来判断两个对象是否相等。 

因为不同的对象被放在了不同的内存空间中, 因此， 即使是属性和值均相等的对象也是不相同的, 如果对象的属性和值都是相同的，使用 `isEqual` 返回的是 `true`

```javascript
{} == {} // false
_.isEqual({}, {}); // true
```

在源码中使用 `equal` 进行判断:

```javascript
_.equal = function (a, b) {
  return eq(a, b);
}
```

使用 `eq` 进行判断的源码如下:

```javascript
var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    // 如果 a 或者 b === undefined 返回 a === b
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
   // 如果 a 的对象的类型不同于 b 的对象的类型， 返回的是 false
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        // 当 a 是 NaN 的时候, 如果 b 也是 NaN 那么 !b !== b // false
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        // 判断 +a === 0 ? 
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    // 如果不是一个数组
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;
      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

```

#####  `eq` 函数

使用 `eq` 函数进行比较的时候，进行比较的值有下面几种情况:

1.  处理传递进比较的数值出现 `0 === -0` 的情况。这种情况用于单个数值的比较

   因为 `a === -0` 但是他们是不相同的。

   ```javascript
   // 当 a !== 0  || 1/a === 1 / b
   // 因为 1 / a === 1 / b (Infinity === -Infinity) // false
   if (a === b) return a !== 0 || 1 / a === 1 / b;
   ```

2.  处理 `null == undefined` 的情况  

   ```
   // 当 a == null 或者 b == null 的时候， 返回 a === b
   if (a == null || b == null) return a === b;
   ```

3. 使用 `Object.toString` 进行判断属于 `Object` 的哪一种类型。

   ```javascript
   let className = toString.call(a);
   // 类型不同, 返回 false
   if (className !== toString.call(b)) return false;
   switch (className) {
     case '[object RegExp]':
     case '[object String]':
       return '' + a === '' +b;
     case '[object Number]':
       // 使用  NaN 进行比较
       if (+a !== +a) return +b !== +b;
       return +a === 0 ? 1 / +a === 1 / b : +a === +b;
     case '[object Date]':
     case '[object Boolean]':
       return +a === +b;
   }
   ```

     

4. 对于数组和对象的之间进行比较，需要深度比较

   当不是数组， 对象的情况:

   ```javascript
   var areArrays = className === '[object Array]';
   if (!areArray) {
     if (typeof a !== 'object' || typeof b !== 'object') return false;
     var aCtor = a.constructor, bCtor = b.constructor;
     // 如果 aCtor !== bCtor
     if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor isntanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
       return false;
     }
   }

   let length = aStack.length;
   while(length--) {
     if (aStack[length] === a) return bStack[length] === b;
   }
   // 将 a 压入到 aStack 数组中
   // 将 b 压入到 bStack 数组中
   // aStack bStack 主要用于多重数组的情况
   aStack.push(a);
   bStack.push(b);
   ```

   进行比较对象或者数组:

   ```javascript
   // 比较数组
   if (areArrays) {
     length = a.length;
     if (length !== b.length) return false;
     while (length--) {
       if (!eq(a[length], b[length], aStack, bStack)) return false;
     }
   } else {
   // 比较对象  
     let keys = _.keys(a), key;
     length = keys.length;
     // 如果两个对象的属性数目不相同 返回 false 不用进行深度遍历
     if (_.keys(b).length !== length) return false;
     while (length--) {
       key = keys[length];
       if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
     }
   }
   // 将存入的元素进行弹出
   aStack.pop();
   bStack.pop();
   return true;
   ```

   ​

   ​