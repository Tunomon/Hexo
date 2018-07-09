---
title: js原型链学习
date: 2018-07-09 11:24:49
tags: javascript
---

## js原型链学习

1. 每个**函数对象**都有一个`prototype` 属性，这个属性指向这个函数（即函数对象，因为这个函数也是对象，是一个函数对象）的**原型对象**（prototype属性）；

   JS 在创建对象（不论是普通对象还是函数对象）的时候，都有一个叫做`__proto__` 的内置属性，用于指向创建它的**构造函数**的**原型对象**。

2. 函数的 prototype 属性指向了一个对象，这个对象正是调用该构造函数而创建的**实例**的原型。

   每一个JavaScript对象(除了 null )都具有的一个属性，叫`__proto__`，这个属性会指向该对象的原型。

   也就是实例的原型是创建它的构造函数的 prototype 属性，也就是构造函数的原型对象。

3. 原型对象和原型不一样，原型对象是一个普通对象，而原型是指实例的原型，实例具有的是原型（`__proto__`），原型对象其实就是指函数的prototype对象。

4. 每一个JavaScript对象(除了 null )都具有的一个属性，叫`__proto__`，这个属性会指向该对象的原型，其值就是创建它的构造函数的原型对象，也就是说指向构造函数的原型对象。

5. 原型对象就是 Person.prototype，是一个普通对象

6. 构造函数必然是函数对象，所以构造函数必然有`prototype` 属性指向它的**原型对象**

   ​

   ​

   1. `person1.__proto__` 是什么？

      `person1.__proto__` 指向person1这个实例的构造函数的原型对象，也就是Person.prototype;换种理解`person1.__proto__`指向person1的原型，它从构造函数的prototype中获得继承的方法与属性，也就是说它的原型是Person.prototype。

   2. `Person.__proto__` 是什么？

      `Person.__proto__`可以理解为Person是一个function，是通过new Function来的，所以是Function的实例，也就是指向Function的原型对象，也就是指向Function.prototype。也可以理解为指向Person这个函数对象的原型，函数对象的构造函数是Funtion，也就是指向Function.prototype。

   3. `Person.prototype.__proto__` 是什么？

      分步看，Person.prototype就是指这个构造函数的原型对象，如果new Person的话，实例的原型就是这个，但是它的本质是一个对象，对象的原型就是Object.prototype

   4. `Object.__proto__` 是什么？

      `Object.__proto__`同2，Object是一个function，通过new Function来的，是一个专门用来当构造函数创建对象的一个函数对象，所以还是我指向Function.prototype

   5. `Object.prototype__proto__` 是什么？

      那么，`Object.prototype`对象有没有它的原型呢？回答是`Object.prototype`的原型是`null`。`null`没有任何属性和方法，也没有自己的原型。因此，原型链的尽头就是`null`。

      ​

   ​

