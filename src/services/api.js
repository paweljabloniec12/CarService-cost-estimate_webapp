const API_URL = 'http://localhost:5000';

// Dodawanie nowego klienta
export const addClient = (imie, nazwisko, telefon, email) => {
    return fetch(`${API_URL}/add-client`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imie, nazwisko, telefon, email }),
    });
};

// Dodawanie nowego pojazdu
export const addVehicle = (vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg) => {
    return fetch(`${API_URL}/add-vehicle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vin, nr_rejestracyjny, producent, model, generacja, rok, przebieg }),
    });
};

// Dodawanie nowej usługi
export const addService = (nazwa, cena) => {
    return fetch(`${API_URL}/add-service`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nazwa, cena }),
    });
};

// Tworzenie nowego zlecenia
export const createOrder = (klient_id, pojazd_id, uszkodzenia, data_zlecenia, uslugi) => {
    return fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ klient_id, pojazd_id, uszkodzenia, data_zlecenia, uslugi }),
    });
};

// Pobieranie wszystkich zleceń
export const fetchOrders = () => {
    return fetch(`${API_URL}/orders`).then(res => res.json());
};

// Pobieranie wszystkich klientów
export const fetchClients = () => {
    return fetch(`${API_URL}/clients`).then(res => res.json());
};

// Pobieranie wszystkich pojazdów
export const fetchVehicles = () => {
    return fetch(`${API_URL}/vehicles`).then(res => res.json());
};

// Pobieranie wszystkich usług
export const fetchServices = () => {
    return fetch(`${API_URL}/services`).then(res => res.json());
};
