const db = require('../config/db');

// Pobierz wszystkich pojazdów
exports.getAllVehicles = (req, res) => {
  db.query('SELECT * FROM pojazdy', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Dodaj nowy pojazd
exports.addVehicle = (req, res) => {
  const { vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg } = req.body;

  db.query('INSERT INTO pojazdy (vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg) VALUES (?, ?, ?, ?, ?, ?, ?)', 
  [vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg], 
  (err, results) => {
      if (err) {
          console.error('Błąd podczas dodawania pojazdu:', err); // Logowanie błędu
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId }); // Zakładając, że id pojazdu jest generowane przez bazę danych
  });
};


// Aktualizuj dane pojazdu
exports.updateVehicle = (req, res) => {
  const { id } = req.params;
  const { vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg } = req.body;
  db.query('UPDATE pojazdy SET vin = ?, nr_rejestracyjny = ?, producent = ?, model = ?, generacja = ?, rok = ?, przebieg = ? WHERE id = ?', 
  [vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg, id], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Dane pojazdu zaktualizowane' });
  });
};

// Usuń pojazd
exports.deleteVehicle = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pojazdy WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Pojazd usunięty' });
  });
};
