const ArticleModel = require('../Models/Articles');
const Habr = require('../Controllers/HabrParser');

module.exports = (router, db) => {
  router.get('/api/v1/getArticles', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    let result;

    try {
      let data = await ArticleModel.getAllArticles(db, req.query.page);

      result = {
        status: 'ok',
        data
      };
    } catch (e) {
      console.error(e.message);
      result = {
        status: 'error',
      }
    }

    res.json(result);
  });

  router.get('/api/v1/getArticle/:id', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    let result;

    try {
      let data = await ArticleModel.getArticle(db, req.params.id);

      result = {
        status: 'ok',
        data
      };
    } catch (e) {
      console.error(e.message);
      result = {
        status: 'error',
      }
    }

    res.json(result);
  });
};