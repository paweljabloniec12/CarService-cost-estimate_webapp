import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient.js';
import OrdersTable from './components/OrdersTable';
import ClientsTable from './components/ClientsTable';
import VehiclesTable from './components/VehiclesTable';
import ServicesTable from './components/ServicesTable';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';

function App() {
  const [activeComponent, setActiveComponent] = useState('orders');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);


  const handleNavigate = (component) => setActiveComponent(component);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
          <Navbar onNavigate={handleNavigate} />
          <div className="content">
            {activeComponent === 'orders' && <OrdersTable />}
            {activeComponent === 'clients' && <ClientsTable />}
            {activeComponent === 'vehicles' && <VehiclesTable />}
            {activeComponent === 'services' && <ServicesTable />}
          </div>
    </div>
  );
}

export default App;
