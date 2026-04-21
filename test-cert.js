const Database = require('better-sqlite3');
const db = new Database('./app.db');

try {
  const enrollment = db.prepare('SELECT progress, status FROM enrollments').all();
  console.log('Enrollments format:', enrollment[0]);
} catch (e) { console.error('ENROLL ERR:', e); }

try {
  db.prepare('INSERT INTO certificates (user_id, course_id, certificate_number, issued_at) VALUES (?, ?, ?, ?)').run(16, 22, 'TEST-1234', '2026-04-17 12:00:00');
  console.log('Inserted successfully!');
} catch (e) {
  console.error('INSERT ERR:', e);
}
