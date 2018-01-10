const Habr = require('./backend/Controllers/HabrParser');

const ready = new Habr();
ready.parse().then(res => console.log(res)).catch(err => console.error(err));