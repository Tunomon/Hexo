---
title: Hexo源文件自动备份
date: 2017-03-19 13:48:51
tags: Hexo
---

## 前言

hexo是一个生成静态网页的博客框架，利用这个框架+GitHub Page生成自己的博客十分方便。但是有一个问题，就是更换电脑的时候，Hexo源文件的备份问题，如果没有及时备份到Hexo的源文件，那么在更换电脑后进行博客的更新等操作就十分的麻烦了，我也刚好遇见了这种情况。所以借鉴一下网上各位大神的方法，做一下设置，能够自动备份Hexo的源文件。

## 步骤实现

##### 新建git仓库

1.新建一个仓库，我这里命名仓库名为Hexo。因为本地的源文件所在的文件夹之前已经设置成为了git文件夹，所以不需要git init，如果是还没设置的话需要git init；

2.git remote remove 原来的远程仓库，git remote add 新的远程仓库，名称还是origin

```
git remote remove origin
git remote add origin git@github.com:Tunomon/Hexo.git
```

3.提交当前的所有文件

```
git add .
git commit -m "init"
git push -u origin master
```

##### 安装shelljs模块

1.输入`npm install --save shelljs`安装shelljs模块

2.在Hexo根目录的scripts文件夹下新建一个js文件（若没有scripts文件夹则新建一个），脚本内容如下：

```js
require('shelljs/global');
try {
	hexo.on('deployAfter', function() {//当deploy完成后执行备份
		run();
	});
} catch (e) {
	console.log("产生了一个错误<(￣3￣)> !，错误详情为：" + e.toString());
}
function run() {
	if (!which('git')) {
		echo('Sorry, this script requires git');
		exit(1);
	} else {
		echo("======================Auto Backup Begin===========================");
		cd('H:\Work\Blog');    //此处修改为Hexo根目录路径
		if (exec('git add --all').code !== 0) {
			echo('Error: Git add failed');
			exit(1);
		}
		if (exec('git commit -am "Form auto backup script\'s commit"').code !== 0) {
			echo('Error: Git commit failed');
			exit(1);
		}
		if (exec('git push origin master').code !== 0) {
			echo('Error: Git push failed');
			exit(1);
		}
		echo("==================Auto Backup Complete============================")
	}
}
```



ps.需要更改17行为目录路径，若远程仓库名称不为origin的话，还需要更改28行的push命令。

## 结果查看

在博客目录下输入`hexo d -g`

显示结果为：

![自动备份](http://7xqpl8.com1.z0.glb.clouddn.com/AwA%2BTgMA%2Br0IANJuBQAUpAUA26sFAPW4BgABAAQApnEEAGCCBADOjgQAYMEEAF78AQBAXAIAqJAJAEQ7%2Fbackup2017319114535.jpg)



> 网上参考的有两种方案，一种是hexo deploy以后自动上传源文件到仓库里面，另一种是手动上传源文件，然后自动更新博客的页面。我参考了前者，参考文章为：[自动备份Hexo博客源文件](http://zhujiegao.com/2015/12/06/automatic-backup/)；若对后者有兴趣，参考文章为：[Hexo的版本控制与持续集成](https://formulahendry.github.io/2016/12/04/hexo-ci/) 。感谢大神的分享与帮助