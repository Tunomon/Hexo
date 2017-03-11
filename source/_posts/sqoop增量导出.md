---
title: sqoop研究——增量导出
date: 2016-12-04 17:09:22
tags: sqoop
category: sqoop
---

## 1、未分区表
1、 默认情况；
```
sqoop  export  --connect jdbc:mysql://localhost:3306/bvs --username root --password anywhere --table dwd_test --export-dir hdfs://127.0.0.1:9000/user/hive/warehouse/dwd_test --input-fields-terminated-by "\001"  --input-lines-terminated-by '\n'  --input-escaped-by \\  --input-null-string "'\\\\N'"  --input-null-non-string "'\\\N'"  -m 1
```
以上为sqoop命令，当不指定--update-mode，默认时，默认为生成insert语句然后执行，若增量导，会失败。
该模式只能是在关系数据表里不存在要导入的记录时才能使用，比如要导入的hdfs中有一条id=1的记录，如果在mysql表里已经有一条记录id=2，那么导入会失败（mysql表已指定主键的情况下，若没有指定主键，则不会失败，记录会重复导入）。这种模式必须是插入一个空表。


2、 指定--update-key时；
```
sqoop  export  --connect jdbc:mysql://localhost:3306/bvs --username root --password anywhere --table dwd_test --export-dir hdfs://127.0.0.1:9000/user/hive/warehouse/dwd_test --input-fields-terminated-by "\001"  --input-lines-terminated-by '\n'  --input-escaped-by \\  --input-null-string "'\\\\N'"  --input-null-non-string "'\\\N'"  -m 1 --update-key id
```
以上为sqoop命令，当加上参数--update-key id，以id为更新列，此时导，只会更新已经存在的。例如要导入的hdfs中有四条记录，id分别为1，2，3，4，mysql表中有id为1，2，3的三条记录。此时加上--update-key id参数，一一匹配，则mysql表中id为1，2，3的记录会被更新为hdfs中的新导入的记录。hdfs中第4条id为4的记录不会保存在mysql中。

个人认为**解决方案**：经过测试，可以使用--update-mode allowinsert --update-key id 两个参数同时使用，效果为：若以--update-key指定的列匹配到存在，则更新；若匹配不到不存在，则插入（此时mysql必须指定主键，否则会产生数据全部重复导入的情况）。可以产生增量导出的效果。但是效率未经过大数据测试，效率不确定。



## 2、分区表
```
sqoop  export  --connect jdbc:mysql://localhost:3306/bvs --username root --password anywhere --table dwd_partition --export-dir hdfs://127.0.0.1:9000/user/hive/warehouse/dwd_partition/pt=20161110 --input-fields-terminated-by "\001"  --input-lines-terminated-by '\n'  --input-escaped-by \\  --input-null-string "'\\\\N'"  --input-null-non-string "'\\\N'"  -m 1
```
以上为sqoop命令。若为分区表，则导出时不能只指定到该表所在的目录，必须要指定到分区所在的目录。否则会报错：`java.io.FileNotFoundException: Path is not a file: /user/hive/warehouse/dwd_partition/pt=20161110`
两种模式情况与未分区表相同。


个人认为增量导出**解决方案**：  
1. 若根据日期分期，则每天导出最新的分区中的数据。若根据其他信息分区，则每天递增分区信息进行导出。    
2. 每个分区同未分区表，使用--update-mode allowinsert --update-key id




>PS:1、导出时mysql中的表必须提前建立好，否则无法导出；
>2、对于--update-mode参数设置的两种模式： updateonly 和 allowinsert，理解暂时有些混乱，需要再理一下。
>
>部分官方原文：
>> `--update-key <col-name>   Anchor column to use for updates. Use a comma separated list of columns if there are more than one column.`
> `--update-mode <mode>  Specify how updates are performed when new rows are found with non-matching keys in database.Legal values for mode include updateonly (default) and allowinsert.`
> 
>>`By default, sqoop-export appends new rows to a table; each input record is transformed into an INSERT statement that adds a row to the target database table. If your table has constraints (e.g., a primary key column whose values must be unique) and already contains data, you must take care to avoid inserting records that violate these constraints. The export process will fail if an INSERT statement fails. This mode is primarily intended for exporting records to a new, empty table intended to receive these results.
If you specify the --update-key argument, Sqoop will instead modify an existing dataset in the database. Each input record is treated as an UPDATEstatement that modifies an existing row. The row a statement modifies is determined by the column name(s) specified with --update-key
`
 

>参考文档： [官方的使用者手册](https://sqoop.apache.org/docs/1.4.6/SqoopUserGuide.html#_create_oracle_tables)  



