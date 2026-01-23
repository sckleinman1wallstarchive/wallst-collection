import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessGate } from "@/components/auth/AccessGate";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import ImageTools from "./pages/ImageTools";
import PopUps from "./pages/PopUps";
import Contacts from "./pages/Contacts";
import Accounting from "./pages/Accounting";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import Content from "./pages/Content";
import Storefront from "./pages/Storefront";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected routes that require authentication
function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/image-tools" element={<ImageTools />} />
      <Route path="/pop-ups" element={<PopUps />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/accounting" element={<Accounting />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/content" element={<Content />} />
      <Route path="/storefront" element={<Storefront />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes - no auth required */}
          <Route path="/shop" element={<Storefront />} />
          <Route path="/shop/success" element={<CheckoutSuccess />} />
          
          {/* All other routes require authentication */}
          <Route path="/*" element={
            <AccessGate>
              <ProtectedRoutes />
            </AccessGate>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
