---
title: prop in vue.js（prop 的初始化）
date: 2019-05-25 17:10:27
tags: vue 源码
categories: vue 源码阅读
---

### Prop

在 vue.js 中, 使用 `prop` 可以实现父组件向子组件传递值，在子组件中的 `props` 中的数据将会和父组件中传递的相应的 `prop` 保持一致，在传递 `prop` 的时候，可以传递一个数组, 例如：

```js
props: ['data1', 'data2', 'data3' ...]
```

 或者可以传递一个对象，对象的键是要传递的 prop 名称， 对象的值可以是一个对象， 这个对象中 可以定义传递值的`type` 以及 `default` 属性：

```js
props: {
  data1: {
    type: Boolean, // 传递值的类型， 可以是一个数组 [Boolean, String]
    default: true // 当父组件没有传递的时候， 子组件中使用的默认值
  }
}
```

当父组件中传递值的类型不符合子组件 props 中相应值的 type 的时候， vue 会在控制台进行报错。

在源码中， 在初始化 prop 的时候， 会对prop 进行校验。

#### 初始化 `props`

在 `initState` 中：当当前组件中存在 `props` 的时候， 对于 `props` 执行 `initProps` 进行初始化：

```js
function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }
```

在 `initProps` 中接受两个参数： `vm` 当前 vue 的实例， `propsOptions` 在当前组件中规范化后的 `props` 对象

>在执行 `initProps` 方法之前， 在 `vm.$options` 属性中的  `props` 属性中已经对于传递的 `props` 进行了规范化处理为下面的这种形式：
>
>```js
>test: {
>  type: sometype,
>  default: //  默认值， 如果没有传， 那么就没有
>}
>```
>
>

`initProps`:

```js
// 用于初始化 props 对象  
function initProps (vm, propsOptions) {
    // vm.$options.propsData: 父组件中传递的 props 对象
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) ||
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive(props, key, value, function () {
          if (!isRoot && !isUpdatingChildComponent) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }
```

在上面的函数中。我们传入了 vue 实例和 当前组件中传入的 props 中的数据， 在这个函数中， 我们定义了四个变量：

```js
var propsData = vm.$options.propsData || {}; // 获取到父组件传递到子组件中的值
var props = vm._props = {}; // 在实例上的 _props 属性上定义空对象 {}
// cache prop keys so that future props updates can iterate using Array
// instead of dynamic object key enumeration.
var keys = vm.$options._propKeys = []; // 在 实例的 $options 属性上定义 _propKeys 属性， 并初始化为数组
var isRoot = !vm.$parent; // 判断是否为根元素， 因为对于根元素， 其实例上没有 `$parent` 属性， 这个时候 `isRoot` 为true
```

上面的 `toggleObserving` 方法用来切换是否对与数据进行监听的开关函数：

```js

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;
  // 根据传递的 vue 属性来切换 `shouleObserve` 的值
  function toggleObserving (value) {
    shouldObserve = value;
  }

```

通过调用这个方法， 改变的是全局变量 `shouldObserve` 的值， 这个值的作用我们后面在说， 现在， 我们先看下在 `initProps` 中的 `for in ` 中的 `loop` 方法：

```js
for (var key in propsOptions) loop(key);
```

在上面的代码中， 对于当前组件内 prop 中的每一个 prop 值， 都执行 `loop` 方法：

`loop` 方法：

```js
// key prop 值
var loop = function ( key ) {
  // 将当前组件内所有的 prop 值存入到 keys 中
  keys.push(key);
  // 根据定义的 prop 规则判断传入的 prop 值是否有效
  var value = validateProp(key, propsOptions, propsData, vm);
  /* istanbul ignore else */
  {
    var hyphenatedKey = hyphenate(key);
    if (isReservedAttribute(hyphenatedKey) ||
        config.isReservedAttr(hyphenatedKey)) {
      warn(
        ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
        vm
      );
    }
    defineReactive(props, key, value, function () {
      if (!isRoot && !isUpdatingChildComponent) {
        warn(
          "Avoid mutating a prop directly since the value will be " +
          "overwritten whenever the parent component re-renders. " +
          "Instead, use a data or computed property based on the prop's " +
          "value. Prop being mutated: \"" + key + "\"",
          vm
        );
      }
    });
  }
  // static props are already proxied on the component's prototype
  // during Vue.extend(). We only need to proxy props defined at
  // instantiation here.
  if (!(key in vm)) {
    proxy(vm, "_props", key);
  }
};

```

在上面的 loop 方法中， 当传入 key 之后， 执行了 `validateProp` 方法， 这个方法定义如下：

```js
  /**
   * 
   * @param {key} 在 props 中定义的 prop 值 
   * @param {propOptions} propOptions : 所有的 prop 值
   * @param {propsData} propsData 从上层组件传入的值
   * @param {vm} vue 实例
   */
  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    // 获取当前 prop 值的规则
    var prop = propOptions[key];
    // 判断这个 prop 值有没有被传入到
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }
```

在这个方法内部 定义了四个变量：

`prop`: 当前传入 prop 值的对象

`absent`:  布尔值， 当前 prop 有没有被父组件传入

`value`:  父组件传入的 prop 的值， 如果没有传入，为 `undefined`

`booleanIndex`:  是通过 `getTypeIndex` 方法返回的， 这个方法的作用是：

当 prop 中声明的 type 中包含有布尔值的时候， 如果 type 为 String， 返回 0， 如果 type 为数组， 返回这个 Boolean 值在 type 数组中的顺序 index， 如果不包含布尔值， 那么返回 -1

`getTypeIndex`:

```js
// expectedTypes： prop 中声明的 type
// type: 相应的 type 类型， 例如： Boolean, String
function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}
```

这里， 使用了 `isSameType` 方法来进行比较者两个 type 是否相等：

```js
 /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }
```

在上面的 `getType` 中， 调用 `fn.toString()` 方法， 再通过正则表达式获取到 `(\w+) ` 内的内容，例如：

> 因为， 在 js 中例如 `Boolean`, `String` 之类的类型， 都是代表着一个个的函数方法， 对于这个函数， 可以调用 toString

```json
Boolean
// ƒ Boolean() { [native code] }
Boolean.toString()
//"function Boolean() { [native code] }"
```

接来下， 对于数据进行初始化：针对需要校验的 type 中包含有 `Boolean` 字段的时候

```js
// 当 prop 的type中包含有 “Boolean” 的时候  
if (booleanIndex > -1) {
      // 当没有传入的 prop 的时候， 并且没有 default 属性的时候
      if (absent && !hasOwn(prop, 'default')) {
        // 将 prop 值置为 false
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // 当 boolean 有更高优先级的时候， 将空字符串或者和 prop 中名字相同的值转化为 布尔值
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
```

例如：

有以下子组件： child.vue

```vue
export default {
  props: {
    propData: {
      type: [Boolean, String],
			default: ''
    }
  }
}
```



在父组件中如下定义：

```vue
<child prop-data=""></child>
```

那么在子组件中， 获得到的 `propData` 值为 `true`;

或者， 当在父组件中如下定义的时候：

```vue
<child prop-data="propData"></child>
```

和上面相同， 也是为 `true`,

总之：

当定义的 prop 接受值的类型，`Boolean` 值类型优先级要高于 `String` 的时候（在 type 中  `Boolean` 在 `String` 前面 `[Boolean, String]`）:

* 当传递的值为空字符串的时候， 接受到的prop 值变为 `true`
* 当传递的值为字符串并且和驼峰后的 prop 名相同的时候， 接受的值也将转为 `true`

另外， 当在父组件中没有传入 prop 值， 并且， 没有声明 `default` 属性， 当校验 `type` 中包含有`Boolean` 的时候， 这个时候， 获取这个  `prop` 的值将为 `false`

`child.vue` 组件中：

```vue
export default {
  props: {
    propData: {
      type: [Boolean, String]
    }
  }
}
```

父组件中：

```vue
<child></child>
```

在 `child.vue` 组件中获取到 `propData` 的值为 `false`;