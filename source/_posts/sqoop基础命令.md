---
title: sqoop研究——基础命令
date: 2016-12-04 16:33:25
tags: sqoop
---
## 1、sqoop导入

**基本命令**：
```
sqoop  import  --connect jdbc:mysql://localhost:3306/bvs --username root --password anywhere --table bvs_users  --fields-terminated-by "\0001"  --lines-terminated-by '\n'    --null-string '\\N'  --null-non-string  '\\N'  -m 1 --hive-table s_bvs_users --hive-import --hive-overwrite --delete-target-dir --hive-drop-import-delims
```
参数解释:
import:指明该模式为导入模式；
--connect:jdbc连接数据库的参数
--table:数据库中要导入的的表名
--fields-terminated-by "\0001":文件之间分隔符为\0001,hive默认即为\0001
--lines-terminated-by '\n':行之间的分隔符为'\n'，hive默认为'\n'且sqoop只支持'\n'导入
--null-string:将数据库中string类型的字段中的null字段替换为接下来指定的参数
--null-non-string:将数据库中非string类型的字段中的null字段替换为接下来指定的参数
-m:指定几个mapper任务来跑，若该表有主键，则可以不需要指定--split-by参数，否则必须制定--split-by参数
--hive-table:导入到hive中的哪个表，即hive中该表的表名
--hive-import:指明需要导入到hive中
--hive-overwrite:覆盖之前表中存在的全部数据
--delete-target-dir:删除目标目录如果导入的目标目录的存在的话
--hive-drop-import-delims:将导入的数据中的 \n, \r, 和 \01 分隔符删掉

**高级功能**：
（1）、字符删除或替换
--hive-delims-replacement:将导入的数据中的 \n, \r, 和 \01 分隔符替换为自己指定的符号

（2）、指定分区键
--hive-partition-key:指定分区键
--hive-partition-value:与分区键对应的该分区键的值

（3）、增量导入

sqoop支持用--incremental lastmodified设置进行增量导入，比如：
`--incremental lastmodified --check-column created --last-value '2016-11-01 11:00:00'`
就是导入created比'2016-11-01 11:00:00'更大的数据


--check-column:根据此列进行判断；
--last-value:判断大于此值的进行导入；


## 2、sqoop导出

**基本命令**
```
sqoop  export  --connect jdbc:mysql://localhost:3306/bvs --username root --password anywhere --table bvs_users --export-dir hdfs://127.0.0.1:9000/user/hive/warehouse/s_bvs_users --input-fields-terminated-by "\0001"  --input-lines-terminated-by '\n'   --input-null-string '\\N'  --input-null-non-string '\\N' 
```


参数解释：
--export-dir:需要指定导出的表所在的在hdfs中的目录；
--input-fields-terminated-by "\0001":指定以\0001为分隔符
--input-lines-terminated-by '\n':指定以\n为列分隔符
--input-null-string: 字符类型等于该参数指定的值的，则转换为NULL
--input-null-non-string '\\N':非字符类型等于该参数指定的值的，则转换为NULL

**高级功能**

（1）、增量导出

增加参数：`--update-mode allowinsert --update-key id `
--update-mode allowinsert： 设置模式为allowinsert模式
--update-key id： 设置更新列为id，意味着以id这列的值进行匹配，匹配到的更新，匹配不到的插入（在allowinsert模式下）




>PS:1.若删除以前数据，则不支持增量导出的删除。它以指定列进行匹配时，会翻译为以下语句：
>匹配到的：update ** set where id = xxx；匹配不到的：insert into values()
>2.增量导出时若分区表需要用户指定分区目录
>3.导入时Oracle和mysql数据源两者的--table参数不一样
>




>参考文档： [官方的使用者手册](https://sqoop.apache.org/docs/1.4.6/SqoopUserGuide.html#_create_oracle_tables)  

