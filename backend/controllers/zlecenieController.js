const db = require('../config/db');

// Pobierz wszystkie zlecenia
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT z.id AS zlecenie_id, p.producent, p.model, p.nr_rejestracyjny, z.uszkodzenia, 
           k.imie, k.nazwisko, k.telefon, z.cena
    FROM zlecenia z
    JOIN pojazdy p ON z.pojazd_id = p.id
    JOIN klienci k ON z.klient_id = k.id
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Pobierz dane zlecenia według ID
exports.getOrderById = (req, res) => {
  const { id } = req.params; // Pobierz ID z parametru URL

  const query = `
    SELECT z.id AS zlecenie_id, 
       k.id AS klient_id, -- Dodano alias dla ID klienta
       p.id AS pojazd_id, 
       z.uszkodzenia,
       z.data_zlecenia, 
       z.cena
FROM zlecenia z
JOIN pojazdy p ON z.pojazd_id = p.id
JOIN klienci k ON z.klient_id = k.id
WHERE z.id = ?;
`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Zlecenie nie znalezione' });
    }

    res.status(200).json(results[0]); // Zwróć pierwszy wynik (powinien być tylko jeden)
  });
};


// Pobierz usługi powiązane z danym zleceniem
exports.getServicesForOrder = (req, res) => {
  const { id } = req.params; // Pobierz ID zlecenia z parametrów URL

  const query = `
  SELECT uslugi.id, uslugi.nazwa, zlecenia_uslugi.ilosc AS quantity, uslugi.cena, zlecenia_uslugi.kwota AS total
  FROM zlecenia_uslugi 
  JOIN uslugi ON zlecenia_uslugi.usluga_id = uslugi.id 
  WHERE zlecenie_id = ?;
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usługi dla tego zlecenia nie znalezione' });
    }

    res.status(200).json(results); // Zwróć wszystkie usługi powiązane z zleceniem
  });
};

// Dodaj nowe zlecenie
// Przykład w kontrolerze dodawania zlecenia
exports.addOrder = (req, res) => {
  const { klientId, pojazdId, uszkodzenia, dataZlecenia, cena } = req.body;
  
  db.query(
    'INSERT INTO zlecenia (klient_id, pojazd_id, uszkodzenia, data_zlecenia, cena) VALUES (?, ?, ?, ?, ?)', 
    [klientId, pojazdId, uszkodzenia, dataZlecenia, cena], 
    (err, results) => {
      if (err) {
        console.error('Błąd podczas dodawania zlecenia:', err); // Dodaj log błędu
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Zlecenie dodane', id: results.insertId }); // Upewnij się, że zwracasz ID zlecenia
    }
  );
};



// Aktualizuj dane zlecenia
exports.updateOrder = (req, res) => {
  const { id } = req.params;
  const { klientId, pojazdId, uszkodzenia, dataZlecenia, cena } = req.body;
  db.query('UPDATE zlecenia SET klient_id = ?, pojazd_id = ?, uszkodzenia = ?, data_zlecenia = ?, cena = ? WHERE id = ?', 
  [klientId, pojazdId, uszkodzenia, dataZlecenia, cena, id], 
  (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Dane zlecenia zaktualizowane' });
  });
};

// Usuń zlecenie
exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  // Najpierw usuń powiązane usługi z tabeli zlecenia_uslugi
  db.query('DELETE FROM zlecenia_uslugi WHERE zlecenie_id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: `Błąd podczas usuwania usług: ${err.message}` });
    }

    // Po usunięciu usług usuń samo zlecenie
    db.query('DELETE FROM zlecenia WHERE id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: `Błąd podczas usuwania zlecenia: ${err.message}` });
      }

      res.status(200).json({ message: 'Zlecenie i powiązane usługi zostały usunięte' });
    });
  });
};


// Dodaj usługi do istniejącego zlecenia
exports.addServicesToOrder = (req, res) => {
  const { uslugi } = req.body;
  const zlecenie_id = req.params.id;

  if (!uslugi || uslugi.length === 0) {
    return res.status(400).json({ message: 'Brak usług do dodania' });
  }

  uslugi.forEach(({ id, quantity, total }) => {
    db.query(
      'INSERT INTO zlecenia_uslugi (zlecenie_id, usluga_id, ilosc, kwota) VALUES (?, ?, ?, ?)',
      [zlecenie_id, id, quantity, total],
      (err) => {
        if (err) {
          console.error('Błąd przy dodawaniu usług:', err);
          return res.status(500).json({ message: 'Błąd serwera' });
        }
      }
    );
  });

  res.status(201).json({ message: 'Usługi dodane do zlecenia pomyślnie' });
};

// Usuń wszystkie usługi dla danego zlecenia
exports.deleteServicesForOrder = async (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM zlecenia_uslugi WHERE zlecenie_id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: `Błąd podczas usuwania zlecenia: ${err.message}` });
    }

    res.status(200).json({ message: 'Zlecenie i powiązane usługi zostały usunięte' });
  });
}




  