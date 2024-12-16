import React, { useState } from 'react';
import LoginForm from './components/Login';
import ResetPassword from './components/ResetPassword';
import Success from './components/Success';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {

  const [activeComponent, setActiveComponent] = useState('orders');

  const handleNavigate = (component) => {
    setActiveComponent(component);
  };
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path='/home'
          element={
            <Success
              activeComponent={activeComponent}
              handleNavigate={handleNavigate}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;