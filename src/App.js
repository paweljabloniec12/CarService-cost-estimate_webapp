import React, { useState } from 'react';
import OrdersTable from './components/OrdersTable';
import ClientsTable from './components/ClientsTable';
import VehiclesTable from './components/VehiclesTable';
import ServicesTable from './components/ServicesTable';
import Navbar from './components/Navbar';
import './App.css';



function App() {
  const [activeComponent, setActiveComponent] = useState('orders');

  const handleNavigate = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="App">
      <Navbar onNavigate={handleNavigate} />
      <div className="content">
        {activeComponent === 'orders' && <OrdersTable />}
        {activeComponent === 'clients' && <ClientsTable />}
        {activeComponent === 'vehicles' && <VehiclesTable />}
        {activeComponent === 'services' && <ServicesTable />}
        {/* Możesz dodać inne komponenty dla "clients", "vehicles", "services" */}
      </div>
    </div>
  );
}

export default App;
