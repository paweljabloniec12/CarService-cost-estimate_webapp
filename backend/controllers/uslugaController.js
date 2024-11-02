const db = require('../config/db');

// Pobierz wszystkie usługi
exports.getAllServices = (req, res) => {
  db.query('SELECT * FROM uslugi', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Dodaj nową usługę
exports.addService = (req, res) => {
  const { nazwa, cena } = req.body;
  db.query('INSERT INTO uslugi (nazwa, cena) VALUES (?, ?)', 
  [nazwa, cena], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Usługa dodana' });
  });
};

// Aktualizuj dane usługi
exports.updateService = (req, res) => {
  const { id } = req.params;
  const { nazwa, cena } = req.body;
  db.query('UPDATE uslugi SET nazwa = ?, cena = ? WHERE id = ?', 
  [nazwa, cena, id], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Dane usługi zaktualizowane' });
  });
};

// Usuń usługę
exports.deleteService = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM uslugi WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Usługa usunięta' });
  });
};
