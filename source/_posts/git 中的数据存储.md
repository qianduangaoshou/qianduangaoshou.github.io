---
title: git 中的数据存储
date: 2021/1/15 上午10:55:25
tags: git
categories: git
---

### 版本控制系统

代码版本控制系统大致可以分为三代：

#### 本地版本控制系统

代码存储在本地，无法实现多人协作的需求

#### 集中化的版本控制系统

解决了多人协作的问题，但是因为代码都是统一存储在服务器上，当无法连接服务器上的时候，无法查看日志和提交比较代码

#### 分布式的版本控制系统

这种控制系统的特点是，任何人都可以复制一份和服务上相同的代码，当无法连接服务器的时候，仍然可以提交代码，创建分支

### Git 中文件夹 .git 

当我们使用 `git init ` 初始化`git` 仓库的时候，当前文件夹下出生成一个 `.git`  的隐藏文件夹，这个文件夹内存储着我们进行 git 操作的一些数据：

- 存储当前的分支（`HEAD`）
- 存储当前所有的分支信息（`config`）
- 存储提交的文件快照数据（`objects`）
- ....

### 三种基本文件

当我们输入一些git命令的时候，git 根据的输入的命令会生成一些文件，有的文件用来存储当前提交的文件内容，有的文件用来存储我们当前提交的信息，这些文件都被存储在 `objects` 这个文件夹之内，有三种基本文件在我们使用 git 进行数据存储时是息息相关的：

* `blob` 文件
* `tree` 文件
* `commit` 文件

#### `blob` 文件

blob 文件用来存储我们提交代码的文件快照，这种文件存储的是压缩后的文件内容

代码实践下 blob 文件是如何生成的：

1. git 初始化：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303164432105.png" alt="image-20210303164432105" style="zoom:50%;" />

2. 初始化的 git 仓库内创建两个文件: `1.txt` 与 `2.txt`, 内容分别是 1 和 2

3. 执行 `git add`：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303164241534.png" alt="image-20210303164241534" style="zoom:50%;" />

4. 查看出现的 `d8` 和 `56` 这两个文件夹

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303164846117.png" alt="image-20210303164846117" style="zoom:50%;" />

​     如图，发现是乱码的形式，这是因为 Git 将信息压缩成了二进制，对于这种文件，使用 `git cat-file [-t][-p]` 来查看文件类型或者	文件内容

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303165312098.png" alt="image-20210303165312098" style="zoom:50%;" />

​	

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303165323101.png" alt="image-20210303165323101" style="zoom:50%;" />

可以看到，使用 `git add` 命令生成的 `56` 和 `d8` 文件都是 `blob` 类型文件，并且存储的是文件的内容

#### `tree` 文件

继续上面的操作，这次执行 `git commit ` 命令：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303170500072.png" alt="image-20210303170500072" style="zoom:50%;" />

查看 `objects` 文件：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303170606368.png" alt="image-20210303170606368" style="zoom:50%;" />

相比之前多出了两个文件夹：`3c` 和 `96`

 查看 `3c` 文件夹



​														<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303170851619.png" alt="image-20210303170851619" style="zoom:50%;" />
​	

可以看到， 3c 文件夹下的文件存储的内容为我们这次 commit 修改的两个文件 1.txt 和 2.txt ，除了文件名之外，还保存有此次修改的blob文件的文件名以及文件类型

3c文件夹下的文件类型为 tree, 这种文件存储的信息是当前提交的文件目录

#### `commit` 文件

查看生成的 `96` 文件夹，我们可以看到如下内容：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303171533671.png" alt="image-20210303171533671" style="zoom:50%;" />



<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303171612008.png" alt="image-20210303171612008" style="zoom:50%;" />

96 文件夹下的文件类型为 commit 文件， 存储的内容是本次 commit 的信息: 提交人，提交信息（git test）等，其中还存储了 tree 文件的文件名，除了这些信息之外， 还存储有上一次提交的 commit 文件（父点），因为我们这里是初次提交，没有上一次提交，因此没有父节点



#### 三种文件之间的关系

综上所述，三种类型的文件的主要作用是：

blob：存储提交文件的快照
tree：存储提交文件的文件目录以及文件名，blob 文件地址等信息
commit： 存储提交信息，提交生成的 tree 文件

用一张图可以说明三种类型文件之间的关系：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的数据存储/image-20210303171943546.png" alt="image-20210303171943546" style="zoom:33%;" />

#### 总结

*  使用 `git add .` 命令时，将变动内容的文件保存生成 blob 文件
* 使用 `git commit` 命令时， 生成 tree 文件与 commit 文件
* 当前分支的指针指向新的 commit 节点，节点中存在 parent 字段，表明上一次提交 commit 文件，逐级向上，一直到第一次提交，这些 commit 连接成为提交记录（`git log`）