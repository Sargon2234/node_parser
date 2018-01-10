const express = require('express'),
    app = express(),
    routes = require('./backend/routes/routes'),
    mysql = require('mysql'),
    config = require('./config'),
    db = mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.pass,
      database: config.db.name
    });

routes(app, db);
app.use(express.static('./front/static'));

const server = require('http').createServer(app);

server.listen(3000, () => console.log('Server started'));