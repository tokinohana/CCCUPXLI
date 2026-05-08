import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import LandingPage from "@/pages/LandingPage";
import TicketSelectionPage from "@/pages/TicketSelectionPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import ManualQRISPage from "@/pages/ManualQRISPage";
import OfflinePaymentPage from "@/pages/OfflinePaymentPage";
import OnlinePaymentPage from "@/pages/OnlinePaymentPage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PaymentVerificationPage from "@/pages/admin/PaymentVerificationPage";
import TicketScannerPage from "@/pages/admin/TicketScannerPage";
import OrdersManagementPage from "@/pages/admin/OrdersManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/tickets" element={<TicketSelectionPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/:id" element={<OrderConfirmationPage />} />
              <Route path="/payment/manual/:id" element={<ManualQRISPage />} />
              <Route path="/payment/offline/:id" element={<OfflinePaymentPage />} />
              <Route path="/payment/online/:id" element={<OnlinePaymentPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/payments" element={<PaymentVerificationPage />} />
              <Route path="/admin/scan" element={<TicketScannerPage />} />
              <Route path="/admin/orders" element={<OrdersManagementPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
