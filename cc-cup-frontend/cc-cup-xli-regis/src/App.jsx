// src/App.jsx
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth"; // Ensure this import path matches your project structure

import HomePage from "@/pages/Home.jsx";
import DaftarPage from "@/pages/Daftar.jsx";
import DasborPage from "@/pages/Dasbor.jsx";
import MasukPage from "@/pages/Masuk.jsx";

function RootLayout() {
  return (
    <AuthProvider>
      <div className="app-container">
        <main>
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/daftar", element: <DaftarPage /> },
      { path: "/dasbor", element: <DasborPage /> },
      { path: "/masuk", element: <MasukPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}