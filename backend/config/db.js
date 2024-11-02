const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'admin', // Twoje dane
    password: 'Piec2001Piec[]',
    database: 'serwis_samochodowy',
    dateStrings: true
});

// Próba połączenia
db.connect((err) => {
    if (err) {
      console.error('Błąd połączenia z bazą danych:', err.message);
    } else {
      console.log('Połączono z bazą danych MySQL');
    }
  });

module.exports = db;
