import axios from 'axios';
const config = require('../../../config');

let baseUrl = config.env.host;

const loadArticles = (requestUrl, page) => {
  return axios({ url: `${baseUrl}${requestUrl}?page=${page}` });
};

const loadArticle = (articleId) => {
  return axios({ url: `${baseUrl}/api/v1/getArticle/${articleId}`});
};

export { loadArticles, loadArticle };