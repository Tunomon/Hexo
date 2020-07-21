---
title: String/StringBuffer/StringBuilder区别
date: 2020-07-04 22:59:30
tags: Java基础
---

1. String
       /** The value is used for character storage. */
       private final char value[];
       
       /** Cache the hash code for the string */
       private int hash; // Default to 0
       
       /** use serialVersionUID from JDK 1.0.2 for interoperability */
       private static final long serialVersionUID = -6849794470754667710L;
       
   final类型的值，所以每次的对String的操作都会是新对象；
2. StringBuffer
   线程安全
   但是在某些特殊情况下，例如：
        String S1 = “This is only a” + “ simple” + “ test”;
        StringBuffer Sb = new StringBuilder(“This is only a”).append(“ simple”).append(“ test”);
   String 的速度快于StringBuffer，原因在于JVM会解析为“This is only a simple test”
   如果是：
       String S2 = “This is only a”;
       String S3 = “ simple”;
       String S4 = “ test”;
       String S1 = S2 +S3 + S4;
   则属于正常情况，即StringBuffer > String
   StringBuffer 和 StringBuilder 都是 AbstractStringBuilder 的子类，区别在于StringBuffer 的方法大部分都有 synchronized 修饰。
           @Override
           public synchronized StringBuffer append(Object obj) {
               toStringCache = null;
               super.append(String.valueOf(obj));
               return this;
           }
       
           @Override
           public synchronized StringBuffer append(String str) {
               toStringCache = null;
               super.append(str);
               return this;
           }
   
3. StringBuilder
   API与StringBuffer兼容，但是线程不安全，不保证同步；
   字符串缓冲区被单个线程使用的时候可以使用StringBuilder
   
