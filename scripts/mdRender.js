const marked = require('marked')
const htmlImgExp = /<img src=".*\/source\/_posts.*/


function replaceSrc(str) {
    str.match(/src="(.*\.(png|jpg))"/)
    const rawPath = RegExp.$1
    const rightPath = rawPath.split('/').pop()
    return str.replace(`src="${rawPath}"`, `src="${rightPath}"  loading="lazy"`)
}

const markedRenderer = {
    html(text){
      if (!htmlImgExp.test(text)) return text;
      let replaceS = replaceSrc(text)
      return replaceS
    },
    image(href, title, text) {
      const imgName = href.split('/').pop()
      return `<img src="${imgName}"  loading="lazy">`
    },
    paragraph(text) {
      const markdownImage = /!\[(.*?)\]\((.*?)\)/g;
      const isMatch = text.match(markdownImage)
      if (isMatch) {
        text = '<p>' + text.replace(markdownImage, this.image(RegExp.$2, RegExp.$1)) + '</p>'
      }
      return text
    }
};

marked.use({ renderer: markedRenderer });

function renderer(text) {
    const mdText = text.text
    // const tokens = marked.lexer(mdText)
    // console.log('mdText', tokens)

    // return marked.par
    // console.log('tokens', JSON.stringify(tokens))
    return marked(mdText)
}

hexo.extend.renderer.register('md', 'html', renderer, true);