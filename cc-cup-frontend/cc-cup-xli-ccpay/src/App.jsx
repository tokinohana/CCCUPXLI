import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import PaymentInput from './pages/PaymentInput';
import ConfirmPayment from './pages/ConfirmPayment';
import MerchantSelection from './pages/MerchantSelection';
import History from './pages/History';
import MerchantDashboard from './pages/MerchantDashboard';
import './index.css';

// 🌟 Define your router using the data framework pattern
const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/scanner",
    element: <Scanner />,
  },
  {
    path: "/input",
    element: <PaymentInput />,
  },
  {
    path: "/confirm-payment",
    element: <ConfirmPayment />
  },
  {
    path: "/select-merchant",
    element: <MerchantSelection />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "/merchant/dashboard",
    element: <MerchantDashboard />,
  }
], {
  basename: "/ccpay/"
});

function App() {
  // 🌟 Render the single provider tracking point
  return <RouterProvider router={router} />;
}

export default App;