---
title: sqoop研究——压缩
date: 2016-12-04 17:12:08
tags: sqoop
category: sqoop
---

## 1、压缩：

sqoop命令中带上-z或者--compress，即可对拉取的数据进行压缩。
默认压缩算法为gzip，导出后在hdfs中的数据，后缀默认为.gz

```
sqoop  import  --connect jdbc:mysql://localhost:3306/horus --username root --password ****** --table data  --fields-terminated-by "\0001"  --lines-terminated-by '\n'    --null-string '\\N'  --null-non-string  '\\N'  --hive-table s_data --hive-import --hive-overwrite --delete-target-dir --hive-drop-import-delims  --compress -m 2
```


1. 默认gzip压缩算法可以直接导到hive里；
2. 默认gzip压缩算法支持-m 2分割（也可利用--compression-codec指定压缩算法，但部分压缩算法不支持-m分割任务）
3. 用默认压缩算法压缩后的.gz文件可以支持导出。
4. 压缩比为：
	50W条数据，不压缩，43M多。压缩后，3M多。
	1W条数据，不压缩，1M；压缩后，90KB左右。

## 2、--as-avrodatafile与--as-sequencefile 

目前为止测试情况：  
  
1. 这两个参数直接加在sqoop命令中使用时候，不支持和--hive-import同时使用，如果同时使用即直接导入到hive中会直接报错如下：
```
Hive import is not compatible with importing into AVRO format.
或者：
Hive import is not compatible with importing into SequenceFile format.
```
2. 官网有如下说法：
```
Delimited text is appropriate for most non-binary data types. It also readily supports further manipulation by other tools, such as Hive.
```  
	结合其他个人猜测可能含义是只有txt支持直接导入到hive  

3. 个人测试：
	（1）、先加--as-avrodatafile参数导到hdfs中，可以成功导入，后缀为.avro。
	（2）、从hvie中load数据到创建好的表中，会产生乱码。
	
4. 猜测结论：
&nbsp;&nbsp;&nbsp;据测试和官方文档，可能目前sqoop的加--as-avrodatafile与--as-sequencefile的导入只支持直接导入到hdfs中，还不支持直接导入到hive中。
&nbsp;&nbsp;&nbsp;但是官网文档没有明确指出不可以。我找的资料也没有指出，但是暂时我还没有测试成功加这两个参数直接导入到hive中。
&nbsp;&nbsp;&nbsp;load那里可能是我对hive理解不够深，表结构ROW FORMAT SERDE这块理解不到位，可能会对load产生影响，可能还需要更多的测试。
		

