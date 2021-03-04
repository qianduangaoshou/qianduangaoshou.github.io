const marked = require('marked')
const htmlImgExp = /<img src=".*\/source\/_posts.*/


function replaceSrc(str) {
    str.match(/src="(.*\.png)"/)
    const rawPath = RegExp.$1
    const rightPath = rawPath.split('/').pop()
    return str.replace(rawPath, `${rightPath}`)
}

const markedRenderer = {
    html(text){
      if (!htmlImgExp.test(text)) return text;
      return replaceSrc(text)
    },
    image(href, title, text) {
      const imgName = href.split('/').pop()
      return `<img src="${imgName}" >`
    }
};

marked.use({ renderer: markedRenderer });

function renderer(text) {
    const mdText = text.text
    return marked(mdText)
}

hexo.extend.renderer.register('md', 'html', renderer, true);