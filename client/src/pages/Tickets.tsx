import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Ticket, Users, Zap, Gift } from "lucide-react";
import { useLocation } from "wouter";
import type { TicketOption } from "@shared/schema";

const getIconForTicketType = (type: string) => {
  if (type === 'test' || type === 'free') return Gift;
  if (type === 'early-bird') return Zap;
  if (type === 'vip') return Users;
  return Ticket;
};

export default function Tickets() {
  const { t } = useTranslation("tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch ticket options from database
  const { data: ticketOptions, isLoading: ticketsLoading } = useQuery<TicketOption[]>({
    queryKey: ["/api/ticket-options"]
  });
  
  const selectedTicket = ticketOptions?.find(t => t.id === selectedTicketId);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setLoading(true);

    try {
      let userEmail = email;
      let userId: string | undefined;
      const isFreeTicket = selectedTicket.price === 0;

      if (currentUser) {
        userEmail = currentUser.email || email;
        const userRes = await fetch(`/api/users/firebase/${currentUser.uid}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.id;
        }
      } else {
        // For free tickets, create user without Firebase auth
        if (isFreeTicket) {
          const createUserRes = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              name,
              role: "attendee"
            })
          });
          
          if (createUserRes.ok) {
            const userData = await createUserRes.json();
            userId = userData.id;
          } else {
            throw new Error("Failed to create user account");
          }
        } else {
          // For paid tickets, create user account
          const createRes = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, password, role: "attendee" }),
            credentials: "include",
          });
          
          if (createRes.ok) {
            const userData = await createRes.json();
            userId = userData.id;
          } else {
            throw new Error("Failed to create user account");
          }
        }
      }

      if (!userId) {
        throw new Error("Failed to create user account");
      }

      // Create ticket in DB
      const ticketRes = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ticketType: selectedTicket.type,
          price: selectedTicket.price,
          currency: selectedTicket.currency || "EUR",
          paymentStatus: isFreeTicket ? "completed" : "pending"
        })
      });

      if (!ticketRes.ok) {
        throw new Error("Failed to create ticket");
      }

      const ticket = await ticketRes.json();

      // For free tickets, show success immediately
      if (isFreeTicket) {
        toast({
          title: "Ticket Registered!",
          description: `Your free ticket has been registered successfully. ${!currentUser ? 'Check your email for login instructions.' : ''}`,
        });
        setLocation("/agenda");
        return;
      }

      // For paid tickets, initialize payment
      const paymentRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          amount: selectedTicket.price,
          type: "ticket",
          itemId: ticket.id,
          metadata: {
            name,
            ticketType: selectedTicket.name
          }
        })
      });

      const paymentData = await paymentRes.json();

      if (paymentData.authorizationUrl) {
        toast({
          title: t("redirectingToPayment"),
          description: t("redirectingDescription"),
        });
        window.location.href = paymentData.authorizationUrl;
      } else {
        throw new Error(t("errorInitializePayment"));
      }

    } catch (error: any) {
      toast({
        title: t("purchaseFailed"),
        description: error.message || t("purchaseFailedDescription"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-tickets" />
      </div>
    );
  }

  const isFreeTicket = selectedTicket?.price === 0;

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline" data-testid="badge-tickets">
            {t("badge")}
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            {t("pageTitle")} <span className="text-primary">{t("pageTitleHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {ticketOptions && ticketOptions.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {ticketOptions.filter(ticket => ticket.available).map((ticket) => {
              const Icon = getIconForTicketType(ticket.type);
              const isSelected = selectedTicketId === ticket.id;
              const features = Array.isArray(ticket.features) ? ticket.features : [];
              const priceDisplay = ticket.price === 0 ? "FREE" : `€${(ticket.price / 100).toFixed(0)}`;
              
              return (
                <Card 
                  key={ticket.id}
                  className={`relative hover-elevate transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${ticket.type === 'early-bird' ? 'border-primary/50' : ''}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  data-testid={`card-ticket-${ticket.type}`}
                >
                  {ticket.type === 'early-bird' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        {t("bestValue")}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="bg-chart-3">
                          {t("selected")}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{ticket.name}</CardTitle>
                    <CardDescription>{ticket.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{priceDisplay}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      data-testid={`button-select-${ticket.type}`}
                    >
                      {isSelected ? t("selected") : t("selectTicket")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tickets available at this time.</p>
          </div>
        )}

        {selectedTicketId && !currentUser && (
          <Card className="max-w-2xl mx-auto" data-testid="card-checkout">
            <CardHeader>
              <CardTitle>{t("completeRegistration")}</CardTitle>
              <CardDescription>
                {t("completeRegistrationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    required
                    data-testid="input-email"
                  />
                </div>
                {!isFreeTicket && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("createPassword")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("passwordPlaceholder")}
                      required={!isFreeTicket}
                      minLength={6}
                      data-testid="input-password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a password to secure your account
                    </p>
                  </div>
                )}

                {isFreeTicket && (
                  <div className="p-3 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                    <p className="text-sm text-chart-3">
                      <Check className="inline h-4 w-4 mr-1" />
                      No password needed for free tickets. Check your email for login instructions.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("selectedTicket")}</span>
                    <span className="font-semibold">
                      {selectedTicket?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      {selectedTicket?.price === 0 ? "FREE" : `€${(selectedTicket?.price! / 100).toFixed(0)}`}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                  data-testid="button-proceed-payment"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    t("proceedToPayment")
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t("securityNotice")}
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {selectedTicketId && currentUser && (
          <Card className="max-w-2xl mx-auto" data-testid="card-checkout-logged-in">
            <CardHeader>
              <CardTitle>{t("completePurchase")}</CardTitle>
              <CardDescription>
                {t("signedInAs")} {currentUser.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("selectedTicket")}</span>
                    <span className="font-semibold">
                      {selectedTicket?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      {selectedTicket?.price === 0 ? "FREE" : `€${(selectedTicket?.price! / 100).toFixed(0)}`}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                  onClick={handlePurchase}
                  data-testid="button-pay-now"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    t("proceedToPayment")
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t("securityNotice")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
