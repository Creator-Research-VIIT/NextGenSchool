const Database = require('better-sqlite3');
const db = new Database('./app.db');

const khushboo = db.prepare('SELECT id, name, email, role, class FROM users WHERE name LIKE \'%khushboo%\' COLLATE NOCASE').all();
console.log('Khushboo:', khushboo);

const digitalCourse = db.prepare('SELECT id, title, class_group, class, status FROM courses WHERE title LIKE \'%digital%\' COLLATE NOCASE').all();
console.log('Digital Course:', digitalCourse);
