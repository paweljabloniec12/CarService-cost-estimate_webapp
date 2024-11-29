import React, { useState } from 'react';
import LoginForm from './components/Login';
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