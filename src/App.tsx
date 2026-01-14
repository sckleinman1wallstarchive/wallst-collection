import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessGate } from "@/components/auth/AccessGate";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import PopUps from "./pages/PopUps";
import Contacts from "./pages/Contacts";
import Accounting from "./pages/Accounting";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import Content from "./pages/Content";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AccessGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pop-ups" element={<PopUps />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/content" element={<Content />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AccessGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
