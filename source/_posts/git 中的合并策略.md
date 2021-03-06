---
title: git 中的合并策略
date: 2021/3/5 下午4:33:43
tags: git
categories: git
---

当我们合并两个分支的时候，Git 会帮我们自动挑选合适的合并策略，常见的 git 合并策略有 `Fast-forward、Recursive 、Ours、Theirs` 几种，不同的合并策略适用于不同的合并场景，如果想要强制指定一种合并策略，使用 `git merge -s <策略名字>` 命令

#### `Fast-forward`: 

这种合并策略是最简单的一种，适用的场景是：

合并两个没有分叉的分支，入下图所示，这个时候只是将 master 分支移动到最新的节点就好

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-e881bee3a250dd0aca96b6a11241ab78_b.jpg" style="zoom:80%;" />



#### Recursive：

使用  recursive 进行合并的场景是合并两个有分叉的分支，这是经常使用到的一种合并策略



<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-ab724ead18c6fc8ada3c10257fabf84a_b.png" style="zoom:80%;" />



如上图所示，使用 Recursive 的合并过程是：

合并中间两个节点 A， B 的时候，先找到它们两个节点的共同祖先节点，最左边的 A，然后这三个节点进行三向合并，最终得到最右边的节点 B‘

Recursive 合并策略的合并算法可以总结为：

**递归寻找路径最短的唯一共同祖先节点，然后以其为 base 节点进行递归三向合并**

so，什么是三向合并就是我们了解这个合并策略最需要知道的内容

##### 三向合并

假如我们在两个分支上，分别修改了同一个文件，如下图所示， 当对于这两个分支进行合并的时候，那么能否合并成功呢？



<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-8308f536b1986fd877fd360cbd6e9ed9_b.png" style="zoom:80%;" />



很显然是不能的，因为 git 无法判断合并之后的文件是采用哪一个文件的代码

为了判断合并之后的文件采用哪一个分支修改的代码，我们除了上面的两个文件之外，还需要一个  `base` 节点的文件，这个节点的作用是作为对比分别和两个文件进行比较：



![](/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-c8ad9474d401b2f1128980911ad3d9b0_b.jpg)



如上图所示，我们通过三个文件进行对比可以得知，在 `Yours` 分支上的代码修改了文件，因此合并之后的文件中的内容采用这个分支上修改的内容。

会不会出现三个文件上相同的文件修改的内容都不相同的情况呢 ？ 会的，这种情况的出现就是我们合并中会遇到的 **冲突**

![](/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-763962194d688dad1a479d505f1d8485_b.png)



这个时候就需要我们解决冲突才能进行合并

##### 寻找 base 节点

在了解了三向合并的合并策略之后，接下来我们需要关心的是：如何查找 base 节点

像recursive 合并算法中描述的： **递归**寻找**路径最短**的的**唯一共同**祖先节点

如下图：

> 下面的 Git 流程图中每一个圆圈表示一次提交，圆圈里面的文字表这次提交的文件内容，如果两个圆圈内文件的内容一致，则表示两次提交文件的内容没有被修改

我们想要合并中间的两个节点  A 和 B，找到它们共同的祖先节点 A， 以它为base节点进行三向合并得到最右边的 B 节点

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-ab724ead18c6fc8ada3c10257fabf84a_b.png" style="zoom:80%;" />



实际情况可能比较复杂，如下图所示情况：

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/v2-794b86a469a9acb9770b59f7551cc9dc_1440w.jpg" style="zoom:60%;" />

我们想要合并两个节点， B 和 C，查找到 B， C 的节点发现有两个共同的祖先节点： A 和 B，这种情况下我们应该以谁作为祖先节点呢 ？

在这种情况下， git 会继续递归查找，寻找 A 和 B 的共同祖先节点，将这个共同的祖先节点为base节点和 A，B进行合并， 

<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/Xnip2021-03-06_15-06-03.jpg" alt="image-20210306150442907" style="zoom:40%;" />

如上图所示，首先找到了一个合并之后的节点 `4/B`, 在根据这个节点作为 base 节点，和 节点 B C 进行三向合并



#### Ours & Theirs

使用 Ours 和 Theirs 这两种合并策略的目的是： 我们希望保留两个分支的历史记录，但是忽略掉一方的代码变更

使用 Ours 和 Theirs 应用的场景相似，假如有两个分支，在这两个分支上对于同一功能进行了不同的代码实现，如果我们想要采用其中一种，但是希望另外一种代码实现也能出现在提交记录中的时候，可以执行 `git merge -s ours/theirs` 命令来实现



<img src="/Users/zhangningning/Desktop/个人文件/个人项目/blog/source/_posts/git 中的合并策略/Xnip2021-03-06_15-35-10.jpg" style="zoom:40%;" />

如上图所示，最终只会保留 master 分支上的代码