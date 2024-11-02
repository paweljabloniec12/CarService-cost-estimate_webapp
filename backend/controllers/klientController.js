const db = require('../config/db');

// Pobierz wszystkich klientów
exports.getAllClients = (req, res) => {
  db.query('SELECT * FROM klienci', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Dodaj nowego klienta
exports.addClient = (req, res) => {
  const { imie, nazwisko, telefon, email } = req.body;
  db.query('INSERT INTO klienci (imie, nazwisko, telefon, email) VALUES (?, ?, ?, ?)', 
  [imie, nazwisko, telefon, email], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, message: 'Klient dodany' });
  });
};

// Aktualizuj dane klienta
exports.updateClient = (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email } = req.body;
  db.query('UPDATE klienci SET imie = ?, nazwisko = ?, telefon = ?, email = ? WHERE id = ?', 
  [imie, nazwisko, telefon, email, id], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Dane klienta zaktualizowane' });
  });
};

// Usuń klienta
exports.deleteClient = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM klienci WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Klient usunięty' });
  });
};
