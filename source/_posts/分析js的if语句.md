---
title: 分析js的if语句
date: 2018-07-09 13:45:52
tags: JavaScript
---
## ECMAScript规范分析——分析js的if语句

1. 对于字符串 

   1. if语句

      ```javascript
      let a = '';
      if(a){
          
      }
      // 对于一个字符串，基本等价于
      if(a !== '' && a !== null && a !== undefined) {
         
      }
      ```

      

      ![](https://ws3.sinaimg.cn/large/006tNc79ly1frlhv5viwbj31ei0x045v.jpg)

      1. 首先**GetValue(exprRef)**

         ![image-20180523192520170](/var/folders/17/gmjh2txs0hn6my86t0gr7p880000gn/T/abnerworks.Typora/image-20180523192520170.png)

         再参看Type(V)

         ![](https://ws2.sinaimg.cn/large/006tNc79ly1frli3cyxg6j31f60kyjze.jpg)

         所以走了第一条，并不是引用类型;所以返回字符串本身;

      2. 然后执行ToBoolean（字符串）

         ![](https://ws2.sinaimg.cn/large/006tNc79ly1frli5975ecj318e0hwadv.jpg)

         1. 如果是字符串
            1. 此时两种情况，要不然长度为0；返回false；
            2. 要不长度不为0，返回true.
         2. 如果是Null，返回false；
         3. 如果是undefined，返回false

2. 对于对象

   1. 首先**GetValue(exprRef)**

      ![image-20180523192520170](/var/folders/17/gmjh2txs0hn6my86t0gr7p880000gn/T/abnerworks.Typora/image-20180523192520170.png)

      因为是引用，继续往下走；

      ![image-20180523194623501](/var/folders/17/gmjh2txs0hn6my86t0gr7p880000gn/T/abnerworks.Typora/image-20180523194623501.png)

      此时getBase的返回值为Object，它的IsPropertyReference是true，但是HasPrimitiveBase是false，所以get方法为base自己即Object的get方法。

      

   **这块是重点**

   举个列子![](https://ws3.sinaimg.cn/large/006tNc79ly1frljgnbz4xj30z20ti422.jpg)

   所以此时base的值是一个Object，假如let data ={ name: 'zhangsan'};那么此时base的值就是EnvironmentRecord(这块的解释：[base value](https://stackoverflow.com/questions/29353177/what-is-base-value-of-reference-in-ecmascriptecma-262-5-1) the *base value* is the context in which the referenced name lives)

   令 get 为 base 的 [[Get]] 内部方法 ;即返回命名属性的值；

   将 base 作为 this 值，即EnvironmentRecord作为this值，传递 GetReferencedName(V) 为参数，即传递‘data’这个名字，调用 get 内部方法,即获得了data的值，即{ name: 'zhangsan'}，他是一个Object对象；

   ​           令 desc 为用属性名 P （‘date’）调用 O 的 [[GetProperty]] 内部方法的结果。

   2. 在进行ToBoolean（Object）

      ![](https://ws2.sinaimg.cn/large/006tNc79ly1frli5975ecj318e0hwadv.jpg)

      返回了true；所以此时无论怎么判断，都是true。