const express = require('express');
const cors = require('cors'); // Importowanie cors
const bodyParser = require('body-parser');

const klientRoutes = require('./routes/klienci');
const pojazdRoutes = require('./routes/pojazdy');
const uslugiRoutes = require('./routes/uslugi');
const zleceniaRoutes = require('./routes/zlecenia');

// Inicjalizacja aplikacji
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ustawienie tras
app.use('/api/klienci', klientRoutes);
app.use('/api/pojazdy', pojazdRoutes);
app.use('/api/uslugi', uslugiRoutes);
app.use('/api/zlecenia', zleceniaRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Logowanie metody HTTP i ścieżki
  next();
});


// Nasłuchiwanie na porcie
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
