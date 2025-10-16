import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import InstallPrompt from "@/components/InstallPrompt";
import "./i18n/config";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Tickets from "@/pages/Tickets";
import CFP from "@/pages/CFP";
import Sponsors from "@/pages/Sponsors";
import Agenda from "@/pages/Agenda";
import FAQ from "@/pages/FAQ";
import Admin from "@/pages/Admin";
import PaymentCallback from "@/pages/PaymentCallback";
import Certificate from "@/pages/Certificate";
import Network from "@/pages/Network";
import Messages from "@/pages/Messages";
import Analytics from "@/pages/Analytics";
import Evaluator from "@/pages/Evaluator";
import FirebaseTest from "@/pages/FirebaseTest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/firebase-test" component={FirebaseTest} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/cfp" component={CFP} />
      <Route path="/sponsors" component={Sponsors} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/faq" component={FAQ} />
      <Route path="/admin" component={Admin} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/evaluator" component={Evaluator} />
      <Route path="/payment/callback" component={PaymentCallback} />
      <Route path="/certificate" component={Certificate} />
      <Route path="/network" component={Network} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <InstallPrompt />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
