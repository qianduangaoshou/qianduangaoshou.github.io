const fs = require('fs');
const inquirer = require('inquirer')
const path = require('path')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
let isCreateDir = false
const categoryDir = path.join(__dirname, './public/categories')
const tagDir = path.join(__dirname, './public/tags')
const blogDir = path.join(__dirname, './source/_posts')
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

function getDirInnerFiles(dirPath, isOnlyDir) {
  return fs.readdirSync(dirPath).filter(file => {
    const filePath = `${dirPath}/${file}`
    if (isOnlyDir === undefined) return true;
    return Boolean(Number(fs.statSync(filePath).isDirectory()) * Number(isOnlyDir))
  })
}


function getAllCategories() {
  return getDirInnerFiles(categoryDir, true)
}

function getAllTags() {
  return getDirInnerFiles(tagDir, true)
}

function inputCheck(value) {
  if (`${value}`.trim().length === 0) return '输入不能为空';
  return true
}

let blogTag = '';
let blogCategory = '';
let blogName = '';

async function setBlogCategory() {
  const categories = getAllCategories()
  return await inquirer.prompt([{
    type: 'autocomplete',
    name: 'name',
    suggestOnly: true,
    message: '文章的类别是：',
    validate: inputCheck,
    source: function(answersSoFar, value) {
      return categories.filter(name => name.includes(value))
    }
  }]).then(function(answers) {
    blogCategory = answers.name;
    return answers.name
  })
}

async function setBlogTag() {
  const tags = getAllTags()
  return await inquirer.prompt([{
    type: 'autocomplete',
    name: 'name',
    suggestOnly: true,
    validate: inputCheck,
    message: '文章的标签是：',
    source: function(answersSoFar, value) {
      return tags.filter(name => name.includes(value))
    }
  }]).then(function(answers) {
    blogTag = answers.name;
    return answers.name
  })
}

function isExistedBlog(value) {
  const allBlogs = getDirInnerFiles(blogDir, false)
  return allBlogs.includes(value)
}

async function setBlogName() {
  return await inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: '文章的标题是：',
    validate: (v) => {
      if (!v.trim().length) return '文章标题不能为空'
      if (isExistedBlog(v)) return '存在相同标题的文章'
      return true
    },
  }]).then((answers) => {
    blogName = answers.name
    return answers.name
  })
}

function senquence(fns) {
  return fns.reduce((res, fn) => {
    return res.then(() => fn())
  }, Promise.resolve())
}

async function isCreateSameNameDir() {
  return await inquirer.prompt([{
    type: 'confirm',
    name: 'name',
    message: '是否创建名字为文章标题的文件夹？',
    default: true,
  }]).then((answers) => {
    isCreateDir = answers.name
    return answers.name
  })
}




senquence([setBlogName, setBlogCategory, setBlogTag, isCreateSameNameDir]).then(() => {
  createBlogMd()
})



function createBlogMd() {
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
            `tags: ${blogTag}\n` +
            `categories: ${blogCategory}\n` +
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
}
