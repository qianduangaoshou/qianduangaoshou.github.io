const fs = require('fs');
const argvs = process.argv;
let blogName = argvs[2];
const isCreateDir = !!argvs[3];
/**
 * @param {Date} date : 传入的 date 类型的日期
 * @description 格式化 date 日期， 加 0
 * @return 返回被格式化的日期 
 */
function formatDate(date = new Date()) {
  if (!(date instanceof Date)) return date;
  const stringDate = date.toLocaleString();
  const formatDate = stringDate.replace(/-(\d+)/g, (s, $1) => {
    if ($1 < 10) {
      return `-0${$1}`;
    } else return `-${$1}`;
  });
  return formatDate;
}


if (!blogName) {
  return console.error('please input blog name!');
}
blogName = blogName.trim();
let blognames = [];
const allBlogs = fs.readdirSync('source/_posts');
blognames = allBlogs.map(name => {
  if (name.includes('.md')) {
    const pureName = name.replace(/\.md$/g, '');
    return pureName.trim();
  }
});
const blogTitleBlock = (title) => {
  return '---\n' + 
          `title: ${title}\n` + 
          `date: ${formatDate()}\n` +
          `tags: \n` +
          'categories: \n' +
          '---\n';
}
if (isCreateDir) {
  const allDirs = fs.readdirSync('source/_posts').filter(name => {
    return fs.statSync(`source/_posts/${name}`).isDirectory();
  });
  if (allDirs.includes(blogName)) {
    console.log(`dir ${blogName} has created !`);
  } else {
    console.log(`create blog dir ${blogName}`);
    fs.mkdirSync(`source/_posts/${blogName}`);
  }
}
if (blognames.includes(blogName)) {
  return console.log(`${blogName} blog has created !`);
} else {
  fs.writeFileSync(`source/_posts/${blogName}.md`, blogTitleBlock(blogName));
};
