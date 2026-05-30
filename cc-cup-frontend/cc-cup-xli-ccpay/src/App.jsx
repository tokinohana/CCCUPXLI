import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import PaymentInput from './pages/PaymentInput';
import MerchantSelection from './pages/MerchantSelection';
import History from './pages/History';
import MerchantDashboard from './pages/MerchantDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/input" element={<PaymentInput />} />
        <Route path="/select-merchant" element={<MerchantSelection />} />
        <Route path="/history" element={<History />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
