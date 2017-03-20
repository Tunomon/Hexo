---
title: sqoop源码修改分析（一）
date: 2017-03-20 17:30:24
tags: sqoop
---

## 前言

在实习过程中，主要使用sqoop进行数据的导入导出，实际应用过程中，因为项目需要，sqoop1.4.6版本暂时不能够满足实际的应用需求，所以根据需要进行了源码修改，因为时间比较长，部分修改细节忘记了，但还是记录一下主要的修改的分析的过程。

## 背景

1. Sqoop从Oracle导入的时候，如果对面数据库的编码格式不是UTF-8，比如他们是ISO-8859-1的话，那么导入过来的数据会产生乱码，Sqoop原生不支持导入的时候选择编码格式，所以需要更改源码解决乱码问题。（本篇分析这个）
2. Sqoop原生的支持ParquetFile的导入，但是Parquet格式的导出到关系型数据库（本篇用的Mysql）却会不支持，不能正常导出，会产生乱码；

## 分析过程

- 目标：本篇主要分析第一个问题，就是Sqoop导入的时候，修改源码使得支持对面Oracle多种编码格式的导入，此篇以ISO-8859-1为例子。

  1.从GitHub下载Apache Sqoop的源码[Sqoop源码](https://github.com/apache/sqoop) ；

  2.分析源码，主要是先找到Sqoop导入时的流程。源码里面有两个sqoop，一个是cloudera的  sqoop，另一个是apache下的sqoop，修改的主要是apache下的sqoop。

![](http://7xqpl8.com1.z0.glb.clouddn.com/AwA%2BTgMA%2Br0IANJuBQAUpAUA26sFAPW4BgABAAQApnEEAGCCBADOjgQAYMEEAF78AQBAXAIAqJAJAEQ7%2Fsqoop12017319154653.jpg)

   3.基本流程：

```java
  public static int runTool(String [] args) {
    return runTool(args, new Configuration());
  }

  public static void main(String [] args) {
    if (args.length == 0) {
      System.err.println("Try 'sqoop help' for usage.");
      System.exit(1);
    }

    int ret = runTool(args);
    System.exit(ret);
  }
```

从这里调用runTool(args, new Configuration())方法，此方法如下：

```java
public static int runTool(String [] args, Configuration conf) {
    // Expand the options
    String[] expandedArgs = null;
    try {
      expandedArgs = OptionsFileUtil.expandArguments(args);
    } catch (Exception ex) {
      LOG.error("Error while expanding arguments", ex);
      System.err.println(ex.getMessage());
      System.err.println("Try 'sqoop help' for usage.");
      return 1;
    }

    String toolName = expandedArgs[0];
    Configuration pluginConf = SqoopTool.loadPlugins(conf);
    SqoopTool tool = SqoopTool.getTool(toolName);
    //生成对应的SqoopTool对象
    if (null == tool) {
      System.err.println("No such sqoop tool: " + toolName
          + ". See 'sqoop help'.");
      return 1;
    }


    Sqoop sqoop = new Sqoop(tool, pluginConf);
    //里面是生成的tool的对象，和其他的参数
    return runSqoop(sqoop,
        Arrays.copyOfRange(expandedArgs, 1, expandedArgs.length));
  }
```

这里调用了runSqoop方法，再看一下这个runSqoop方法。

```java
  public static int runSqoop(Sqoop sqoop, String [] args) {
    try {
      //这个方法主要是分析出了sqoop命令里面的参数，以--开头的参数都会分析出来
      String [] toolArgs = sqoop.stashChildPrgmArgs(args);
      //传给了这个run方法
      return ToolRunner.run(sqoop.getConf(), sqoop, toolArgs);
    } catch (Exception e) {
      LOG.error("Got exception running Sqoop: " + e.toString());
      e.printStackTrace();
      if (System.getProperty(SQOOP_RETHROW_PROPERTY) != null) {
        throw new RuntimeException(e);
      }
      return 1;
    }

  }
```

从ToolRunner.run这个方法开始，就放入了一些设置，最后调回Sqoop中的run方法。一系列调用以后，根据Sqoop命令中对应的模式，进入到对应的Tool方法中。Import时，则进入到ImportTool中，后进入到importTable方法，import方法主要进行导入。

```java
protected boolean importTable(SqoopOptions options, String tableName,
            HiveImport hiveImport) throws IOException, ImportException {
      String jarFile = null;

      // Generate the ORM code for the tables.
      jarFile = codeGenerator.generateORM(options, tableName);

      Path outputPath = getOutputPath(options, tableName);

      // Do the actual import.
      ImportJobContext context = new ImportJobContext(tableName, jarFile,
              options, outputPath);

      // If we're doing an incremental import, set up the
      // filtering conditions used to get the latest records.
      if (!initIncrementalConstraints(options, context)) {
        return false;
    }

    if (options.isDeleteMode()) {
      deleteTargetDir(context);
    }

    if (null != tableName) {
      // 执行将表从数据库导入到HDFS。
      manager.importTable(context);
    } else {
      manager.importQuery(context);
    }

    if (options.isAppendMode()) {
      AppendUtils app = new AppendUtils(context);
      app.append();
    } else if (options.getIncrementalMode() == SqoopOptions.IncrementalMode.DateLastModified) {
      lastModifiedMerge(options, context);
    }

    // If the user wants this table to be in Hive, perform that post-load.
    // 有导入到Hive中的参数--hive-import
    if (options.doHiveImport()) {
      // For Parquet file, the import action will create hive table directly via
      // kite. So there is no need to do hive import as a post step again.
      if (options.getFileLayout() != SqoopOptions.FileLayout.ParquetFile) {
        hiveImport.importTable(tableName, options.getHiveTableName(), false);
      }
    }

    saveIncrementalState(options);

    return true;
  }
```



到这里是导入的基本流程。



