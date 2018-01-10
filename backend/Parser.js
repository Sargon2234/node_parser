const
    config = require('../config'),
    Articles = require('./Models/Articles'),
    DataParser = require('./Helpers/DataParser'),
    mysql = require('mysql'),
    fetch = require('node-fetch'),
    // We'll use cheerio because it allow us parse html in jQuery style.
    cheerio = require('cheerio'),
    cluster = require('cluster'),
    // We need number of cpus to optimize our parallel requests.
    numCPUs = require('os').cpus().length;

class Parser {
  constructor(site, source) {
    this._site = site;
    this._source = source;
    this._connection = mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.pass,
      database: config.db.name
    });

    this._connection.connect();
  }

  async loadFromUrl(url, type, tags) {
    let currentUrl = url;

    if (type === 'article') {
      url = url[1];
    }

    let request;
    // Try to make request. And check for success.
    try {
      request = await fetch(url);
    } catch (e) {
      console.error(e.message);
      return;
    }

    const response = await request.text();
    const $ = cheerio.load(response, { decodeEntities: false });
    let data;

    if (type === 'categories' || type === 'articles') {
      // We use Set to prevent same links saving.
      data = new Set($(tags[type]).map(function () {
        return $(this).attr('href');
      }).get());

      if (type === 'articles') {
        //  we need only 5 latest articles. They'll be first 5 in Set.
        data = Array.from(data).splice(0, 5);
      }
    } else if (type === 'article') {
      let articleTags = tags.article;

      data = {
        author: $(articleTags.author).attr('href'),
        article_date: $(articleTags.article_date).text(),
        title: $(articleTags.title).text().trim(),
        text: $(articleTags.text).html().trim(),
        image: $(articleTags.image).attr('src'),
        section: currentUrl[0],
        link: currentUrl[1]
      };
    }

    return data;
  }

  async getCategoriesUrls(tags) {
    try {
      return this.loadFromUrl(this._site, 'categories', tags);
    } catch (e) {
      console.error(e.message);
      return;
    }
  }

  async getArticleUrls(urls, tags) {
    this._urlToParse = urls;
    this._tags = tags;

    return await this.enableWorkers('articles');
  }

  async getArticleData(urls) {
    // We need to parse JSON urls.
    let clearUrls = [];

    for (let u of urls) {
      // To achieve maximum parallel parse we'll create array with [category, articleUrl] values
      let category = Object.keys(u)[0];
      let articleUrls = JSON.parse(Object.values(u)[0]);

      for (let articleUrl of articleUrls) {
        clearUrls.push([category, articleUrl]);
      }
    }

    // Now we can use our code just like in previous cases.
    this._urlToParse = clearUrls;

    return await this.enableWorkers('article');
  }

  enableWorkers(type) {
    let parsedData = [];
    let processDoneCounter = 0;

    // We use Promise here to handle process async behavior. Send response only when all forks done.
    return new Promise((resolve) => {
      if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
          let worker = cluster.fork();
          worker.on('message', (message) => {
            // Check message type.
            if (message.type === 'ready') {
              // If worker ready to serve -> send it url for parse.
              worker.send(this.getUrlForWorker(type));
            } else if (message.type === 'parsed') {
              // Save category to list for further processing.
              parsedData.push({ [message.category_url]: message.data });
              // Send new url to worker for processing.
              worker.send(this.getUrlForWorker(type));
            } else if (message.type === 'saved') {
              worker.send(this.getUrlForWorker(type));
            } else {
              // If all processes done processing we can return data.
              processDoneCounter++;

              if (processDoneCounter === numCPUs) {
                // Kill processes to free memory.
                for (let id in cluster.workers) {
                  cluster.workers[id].kill();
                  console.log('Process killed');
                }
                // Return whole bunch of parsed data.
                resolve(parsedData);
              }
            }
          });
        }
      } else {
        // When worker initialized we inform master that it's ready to receive messages.
        process.send({
          type: 'ready'
        });

        process.on('message', async (msg) => {
          if (msg.type === 'empty') {
            return process.send({
              type: 'done'
            });
          }

          let data;

          try {
            if (msg.data.caller === 'article') {
              // If it's article we can skip return process and allow worker to save data to db.
              let articleData = await this.loadFromUrl(msg.data.url, msg.data.caller, this._tags);
              this.saveArticleToDB(await this.parseData(articleData, this._source));
              return process.send({ type: 'saved' });
            } else {
              data = JSON.stringify(Array.from(await this.loadFromUrl(msg.data.url, msg.data.caller, this._tags)));
            }

          } catch (e) {
            data = 'error';
            console.error(e.message);
          }

          return process.send({ type: 'parsed', data, sourceType: msg.data.caller, category_url: msg.data.url });
        });
      }

    });

  }

  getUrlForWorker(caller) {
    let url = this._urlToParse.pop();

    let response;

    if (!url) {
      response = { type: 'empty' };
    } else {
      response = {
        type: 'url',
        data: { url, caller }
      };
    }

    return response;
  }

  async parseData(data, source) {
    data.author = DataParser.parseLastPathInUrl(data.author);
    data.article_date = DataParser.parseDate(data.article_date);
    data.section = DataParser.parseLastPathInUrl(data.section);
    if (data.image) {
      data.image = await DataParser.parseImage(data.image);
    }
    data.source = source;

    return data;
  }

  // Caller need to know article status.
  saveArticleToDB(data) {
    try {
      return Articles.saveArticle(this._connection, data);
    } catch (e) {
      console.error('Data was not saved', e.message);
      return false;
    }
  }
}

module.exports = Parser;

