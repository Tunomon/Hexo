---
title: AbstractStringBuilder扩容操作
date: 2020-07-05 00:07:31
tags: Java基础
---

源码：

    public void ensureCapacity(int minimumCapacity) {
            if (minimumCapacity > 0)
                ensureCapacityInternal(minimumCapacity);
        }
    
        /**
         * 如果需要的容量比当前的大，就newCapacity
         **/
        private void ensureCapacityInternal(int minimumCapacity) {
            // overflow-conscious code
            if (minimumCapacity - value.length > 0) {
                value = Arrays.copyOf(value,
                        newCapacity(minimumCapacity));
            }
        }
    
        /**
         * The maximum size of array to allocate (unless necessary).
         * Some VMs reserve some header words in an array.
         * Attempts to allocate larger arrays may result in
         * OutOfMemoryError: Requested array size exceeds VM limit
         */
        private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
    
        /**
         * Returns a capacity at least as large as the given minimum capacity.
         * Returns the current capacity increased by the same amount + 2 if
         * that suffices.
         * Will not return a capacity greater than {@code MAX_ARRAY_SIZE}
         * unless the given minimum capacity is greater than that.
         *
         * @param  minCapacity the desired minimum capacity
         * @throws OutOfMemoryError if minCapacity is less than zero or
         *         greater than Integer.MAX_VALUE
         */
        private int newCapacity(int minCapacity) {
            // overflow-conscious code
            int newCapacity = (value.length << 1) + 2;
            if (newCapacity - minCapacity < 0) {
                newCapacity = minCapacity;
            }
            return (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0)
                ? hugeCapacity(minCapacity)
                : newCapacity;
        }
    
        private int hugeCapacity(int minCapacity) {
            if (Integer.MAX_VALUE - minCapacity < 0) { // overflow
                throw new OutOfMemoryError();
            }
            return (minCapacity > MAX_ARRAY_SIZE)
                ? minCapacity : MAX_ARRAY_SIZE;
        }

1. new newCapacity，首先将大小左移一位+2，然后判断是不是够用，如果不够用，那么直接赋给需要的值的大小；
2. 此处newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0的判断可以写个小程序测试一下：
           public static void main(String[] args) {
               System.out.println("MAX_ARRAY_SIZE: " + MAX_ARRAY_SIZE);
               for(int i=0 ; i<Integer.MAX_VALUE ; i++)
                   newCapacity(i);
           }
       
           private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
       
           private static void newCapacity(int minCapacity) {
               // overflow-conscious code
               int newCapacity = minCapacity * 2 + 2;
               if (newCapacity - minCapacity < 0) {
                   newCapacity = minCapacity;
               }
               if (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0) {
                   System.out.println("minCapacity is: " + minCapacity + "! newCapacity: " + newCapacity);
               }
           }
       
   也就是说，当从1073741819开始，就会进入判断溢出，也就是变大两倍后超出最大正整数以后，或者大于MAX_ARRAY_SIZE以后就会进入判断溢出的方法。
3. 继续判断是否溢出，调用hugeCapacity方法；
4. 如果溢出了，大于Integer.MAX_VALUE，抛错；否则返回MAX_ARRAY_SIZE与所需容量的最大值。
5. 最后进行Arrays.copyOf的拷贝。



