---
title: js-new操作符
date: 2018-07-09 15:25:17
tags: JavaScript
---

1.  **new 运算符**创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。

2. 当代码 `new Foo (...)` 执行时，会发生以下事情：

   1. 一个继承自 `Foo.prototype` （也就是这个函数对象Foo的原型对象）的新对象被创建，也就是这个对象的`__proto__`属性指向的是`Foo.prototype`。
   2. 使用指定的参数调用构造函数 `Foo` ，并将 `this` 绑定到新创建的对象。`new *Foo*` 等同于 `new Foo()`，也就是没有指定参数列表，*Foo* 不带任何参数调用的情况。
   3. 由构造函数返回的对象就是 new 表达式的结果。如果构造函数没有显式返回一个对象，则使用步骤1创建的对象。（一般情况下，构造函数不返回值，但是用户可以选择主动返回对象，来覆盖正常的对象创建步骤）

3. 当一个函数对象被创建时，Function构造器产生的函数对象会运行类似这样的一些代码：`this.prototype = { constructor: this }`.新函数对象被赋予一个prototype属性，它的值是一个对象，这个对象包含constructor属性且constructor属性值为该新函数。每个函数都会得到一个prototype对象.

4. 所以new方法如果是一个方法的话，可能类似如下：

   ```javascript
   function new() {
       // 创建一个新对象，它继承自构造器函数的原型对象
       // Object.create的第一个参数是新创建对象的原型对象
       // 此时这里的this指向的就是Foo
       vat that = Object.create(this.prototype);
       // 调用构造器函数，绑定this到新对象上
       // 此时this是Foo这个函数，直接执行Foo这个函数，里面的this指的是新创建的这个对象
       // 执行完的对象就是other
       var other = this.apply(that, arguments);
       // 如果它的返回值不是一个对象，就返回该对象
       return (typeof other === 'object' && other) || that;
   }
   ```

   

5. 参考资料：[new运算符-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)
   《JavaScript语言精粹》

 


