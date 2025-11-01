import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Threads from "./pages/Threads";
import Activity from "./pages/Activity";
import Starred from "./pages/Starred";
import Directories from "./pages/Directories";
import Huddles from "./pages/Huddles";
import NewMessage from "./pages/NewMessage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/starred" element={<Starred />} />
          <Route path="/directories" element={<Directories />} />
          <Route path="/huddles" element={<Huddles />} />
          <Route path="/new-message" element={<NewMessage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
