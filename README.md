# Site parser

> Flexible system to parse sites. For example used [habrahabr](https://habrahabr.ru).

To install locally:

1. Create database and table.
```mysql
CREATE TABLE `articles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `section` varchar(50) NOT NULL DEFAULT '',
  `author` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `text` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT '',
  `link` varchar(255) NOT NULL DEFAULT '',
  `article_date` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title_source` (`title`,`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
2. `git clone https://github.com/Sargon2234/node_parser.git node-parser`
3. `cd node-parser`
4. Create config.json like config_example.json.
5. `npm i`
6. `node server.js` or with daemon `pm2 start server.js`
7. `cd front`
8. `npm i`
9. `npm run dev`
10. go to [site](http://localhost:8080)


### To download fresh data
```bash
# in root folder
node FreshArticleLoader.js
```
