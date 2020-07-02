---
title: Java自动拆装箱
date: 2020-07-02 23:48:56
tags: Java基础
---

1. 自动拆装箱

   int变量->Integer变量，装箱

   Interger变量->Int变量，拆箱

   原始类型：byte，short，long，int，boolean，float，double，char

   封装类：Byte，Short，Long，Integer，Boolean，Float，Double，Character

2. 操作

   自动装箱，是调用valueOf;

   自动拆箱，调用intValue

   缓存范围是-128~127

   ```java
   ArrayList<Integer> intList = new ArrayList<Integer>();
   intList.add(1); //装箱valueOf
   intList.add(2); //
   
   // 1. 赋值时进行拆装箱
   int number = intList.get(0); // 拆箱，Integer.intValue
   // 2. 方法调用时，可以互相传
   
   private Integer testABC(int a);
   Integer b = new Integer(5);
   testABC(b)
   ```

3. 弊端

   * 性能问题

     频繁拆装箱会引起性能问题：

     ```java
     Integer sum = 0;
      for(int i=1000; i<5000; i++){
        sum+=i;
     }
     
     // 实际转换为：
      for(int i=1000; i<5000; i++){
        int sum1 = sum.intValue() + i;
        sum = new Integer(sum1);
     }
     ```

   * 重载不会自动拆装

     ```java
     public void test(int num){
         System.out.println("method with primitive argument");
     
     }
     
     public void test(Integer num){
         System.out.println("method with wrapper argument");
     
     }
     
     AutoboxingTest autoTest = new AutoboxingTest();
     int value = 3;
     autoTest.test(value); //no autoboxing 
     Integer iValue = value;
     autoTest.test(iValue); //no autoboxing
     
     Output:
     method with primitive argument
     method with wrapper argument
     ```

4. 测试

   ```java
   public class AutoboxingTest {
   
       public static void main(String args[]) {
   
           // Example 1: 原始值比较
           int i1 = 1;
           int i2 = 1;
           System.out.println("i1==i2 : " + (i1 == i2)); // true
   
           // Example 2: 混合原始对象与对象比较
           // Integer是先将Integer转换为了int类型再进行int类型的比较
           Integer num1 = 1; // autoboxing
           int num2 = 1;
           System.out.println("num1 == num2 : " + (num1 == num2)); // true
   
           // Example 3: 缓存机制
           Integer obj1 = 1; // autoboxing will call Integer.valueOf()
           Integer obj2 = 1; // same call to Integer.valueOf() will return same
                               // cached Object
   
           System.out.println("obj1 == obj2 : " + (obj1 == obj2)); // true
   
           // Example 4: new了两个对象
           Integer one = new Integer(1); // no autoboxing
           Integer anotherOne = new Integer(1);
           System.out.println("one == anotherOne : " + (one == anotherOne)); // false
   
       }
   
   }
   
   Output:
   i1==i2 : true
   num1 == num2 : true
   obj1 == obj2 : true
   one == anotherOne : false
   ```

   

