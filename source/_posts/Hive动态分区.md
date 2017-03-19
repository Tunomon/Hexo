---
title: Hive表动态分区
date: 2017-03-18 18:38:50
tags: Hive
---

# Hive表动态分区

[TOC]

## 1.动态分区应用场景

1. 静态分区和动态分区的区别在于导入数据时，是手动输入分区名称，还是通过数据来判断数据分区。对于大数据批量导入来说，显然采用动态分区更为简单方便。  
2. 应用场景为，若需要导入一个系统的历史数据，且这些历史数据的数据量较大，需要根据其中某个字段的值进行分区时，可以使用动态分区功能。例如：一个系统需要从Oracle中导入收货表数据到Hive中进行使用，需要根据其中的创建时间，即Created_Date字段进行分区，此时可以使用动态分区功能。  

## 2. 动态分区的相关设置

设置如下参数开启动态分区（每个窗口设置一次）：  

- hive.exec.dynamic.partition=true  

  ```
  默认值：false
  描述：是否允许动态分区
  ```

- hive.exec.dynamic.partition.mode=nonstrict  

  ```
  默认值：strict
  描述：strict是避免全分区字段是动态的，必须有至少一个分区字段是指定有值的
  ```

设置如下参数配置动态分区的使用环境：

- hive.exec.max.dynamic.partitions.pernode=100

  ```
  默认值：100
  描述：each mapper or reducer可以创建的最大动态分区数
  ```

- hive.exec.max.dynamic.partitions=1000

  ```
  默认值：1000
  描述：一个DML操作可以创建的最大动态分区数
  ```

- hive.exec.max.created.files=100000

  ```
  默认值：100000
  描述：一个DML操作可以创建的文件数
  ```

## 3. 动态分区使用

1、 首先，确定要导入的表，利用创建任务，或直接使用sqoop命令的方式，将所需的表导入到hive中，此处以利用测试表为例，表名为database.test_table，分区字段为CREATED_DATE。

```
<workflow-app>
	 <start to="sqoop" />
    <action name="sqoop">
        <sqoop>
          <job-xml>/user/admin/hive-site.xml</job-xml>
          <arg>import</arg>
          <arg>--connect</arg>
          <arg>jdbc:oracle:thin:@//
          **.***.**.**:****/****</arg>
          <arg>--username</arg>
          <arg>*****</arg>
          <arg>--password</arg>
          <arg>******</arg>
      		<arg>--verbose</arg>
          <arg>--outdir</arg>
      		<arg>/usr/bin/java</arg>
          <arg>--table</arg>
          <arg>database.test_table</arg>
      		<arg>--delete-target-dir</arg>
          <arg>--hive-import</arg> 
          <arg>--hive-table</arg>                           
          <arg>database.test_table</arg> 
          <arg>--null-string</arg>
      		<arg>'\\N'</arg>
      		<arg>--null-non-string</arg>
      		<arg>'\\N'</arg>
          <arg>--escaped-by</arg>
          <arg>\\</arg>
          <arg>--fields-terminated-by</arg>
          <arg>"\0001"</arg>
          <arg>-m</arg>
          <arg>1</arg>
        </sqoop>
        <ok to="end"/>
        <error to="kill"/>
    </action>

    <end name="end"/>
    <kill name="kill">
       <message>Sqoop failed, error message[\$\{wf:errorMessage(wf:lastErrorNode())}]</message>
    </kill>
</workflow-app>
```

> 注意：一般使用“\0001”作为分割符号，常用的“|”与“，”都可能会在数据中出现，使用的话会导致脏数据的产生。

2、 当任务执行成功后，导入数据到hive表中后，此表名称为s_test_table。此时再创建一个结构与此表类似，但是带有分区列的表。以此表为例，语句如下：

```
  CREATE TABLE   
  `database.s_test_table_par`(
    row_id              	string,
    cust_code           	string,
    goods_code          	string
  )
  PARTITIONED BY (
    `pt` string
  )
  ROW FORMAT SERDE
  'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe'
  WITH SERDEPROPERTIES (
    'field.delim'='\001',
    'line.delim'='\n',
    'serialization.format'='\001'
  );
```

> 注意：此处的ROW FORMAT SERDE根据自己的实际需要进行设置，此处设置的是与sqoop导过来的表相同的设置。

3、 接着需要把原表中的数据，以CREATED_DATE这一列为分区列导入到新创建的空的分区表中。以此表为例，语句如下:

```
insert overwrite table s_test_table_par partition(`pt`)
select
  row_id, cust_code,, goods_code, receipt_cnt,     
  to_date(`created_date`) as `pt`
from test_table;
```

> 注意：  
>   1.将表中字段as为pt字段的这个需要放在select语句中查询的最后一个字段；  
>  2.to_date为hive中的函数，可以将时间类型的字段的日期部分截取出来，类似函数还有month(截取月)，day(截取天)等。  
>  3.执行这个命令需要将上面相关设置中的each mapper or reducer可以创建的最大动态分区数与一个DML操作可以创建的最大动态分区数等数量设置增大，否则若超过默认值会报错。

4、 将历史数据导入hive表，并建立分区完毕后，若hdfs空间有限，可以删去未分区的导入的数据表并将分区改名为自己想要的名字，改名语句为：

```
   ALTER TABLE table_name RENAME TO new_table_name;
```

> 注意：增量拉取同一分区中每天插入数据，则能够带--hive-overwrite，若是一些小表，可以做到每天全量拉全量删，也可以带此参数。--hive-overwrite会全部覆盖。

