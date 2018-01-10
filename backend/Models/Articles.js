// Here we use DI for interactions with DB.
const saveArticle = (db, data) => {
  db.query('INSERT INTO articles SET ?', data, (error) => {
    if (error) {
      console.error(error.message);
      return false;
    }
    console.log("Saved article");
    return true;
  });
};

const getArticle = (db, id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT title, text, image FROM articles WHERE id = ?`, id, (err, result) => {
      if (err) reject(err.message);
      resolve(result);
    });
  });
};

const getAllArticles = (db, page = 1) => {
  let queryString;
  let limit = 10;

  if (page > 1) {
    queryString = `SELECT id, title, text FROM articles WHERE ${ page * 10 } > id AND id > ${ page * 10 - limit }`;
  } else {
    queryString = `SELECT id, title, text FROM articles LIMIT ${limit}`;
  }

  return new Promise((resolve, reject) => {
    db.query(queryString, (err, result) => {
      if (err) reject(err.message);

      getTotal(db)
          .then(res => resolve({ articles: result, totalArticles: res }));
    });
  });
};

const getTotal = (db) => {
  return new Promise((resolve) => {
    db.query('SELECT COUNT(*) as count FROM articles', (err, res) => {
      resolve(res[0].count);
    });
  });
};

module.exports = { saveArticle, getArticle, getAllArticles };