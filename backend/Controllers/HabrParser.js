const Parser = require('../Parser');

class HabrParser extends Parser {
  constructor() {
    super('https://habrahabr.ru', 'habrahabr');
  }

  async parse() {
    const tags = {
      categories: '.n-dropdown-menu.n-dropdown-menu_flows li a',
      articles: '.content-list__item.content-list__item_post.shortcuts_item .post__title a',
      article: {
        author: '.post__user-info.user-info',
        article_date: '.post__time',
        title: '.post__title-text',
        text: '.post__body.post__body_full',
        image: '.post__text.post__text-html.js-mediator-article img',
      }
    };

    const categories = await this.getCategoriesUrls(tags);
    // We use here global error catch, because if process failed on some step, there is no need to continue it.
    try {
      // Build Array from Set for easier traverse.
      const articleUrls = await this.getArticleUrls(Array.from(categories), tags);
      await this.getArticleData(articleUrls, tags);
    } catch (e) {
      console.error(e.message);
    }
    console.log('Downloaded fresh!');
    process.exit(0);
  }
}


module.exports = HabrParser;