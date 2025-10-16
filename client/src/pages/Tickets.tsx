import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Ticket, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";

const getTicketTiers = (t: any) => [
  {
    id: "early-bird",
    name: t("earlyBird"),
    price: 150,
    description: t("earlyBirdDescription"),
    features: [
      t("featureFullAccess"),
      t("featureAllSessions"),
      t("featureNetworking"),
      t("featureCertificate"),
      t("featureMaterials")
    ],
    icon: Zap,
    highlight: true
  },
  {
    id: "regular",
    name: t("regularPass"),
    price: 200,
    description: t("regularPassDescription"),
    features: [
      t("featureFullAccess"),
      t("featureAllSessions"),
      t("featureNetworking"),
      t("featureCertificate"),
      t("featureMaterials")
    ],
    icon: Ticket,
    highlight: false
  },
  {
    id: "vip",
    name: t("vipPass"),
    price: 350,
    description: t("vipPassDescription"),
    features: [
      t("featureEverythingRegular"),
      t("featureVipLounge"),
      t("featurePrioritySeating"),
      t("featureSpeakerMeet"),
      t("featureDinner"),
      t("featureSwagBag")
    ],
    icon: Users,
    highlight: false
  }
];

export default function Tickets() {
  const { t } = useTranslation("tickets");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const ticketTiers = getTicketTiers(t);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setLoading(true);

    try {
      // Get or create user
      let userEmail = email;
      let userId: string | undefined;

      if (currentUser) {
        userEmail = currentUser.email || email;
        // Get user from DB
        const userRes = await fetch(`/api/users/firebase/${currentUser.uid}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.id;
        }
      } else {
        // Sign up new user - it creates the user in DB internally
        await signUp(email, password, name);
        
        // Wait briefly for auth state to update, then get user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch user data from Firebase auth state
        const auth = (await import("@/lib/firebase")).auth;
        const user = auth.currentUser;
        
        if (user) {
          const userRes = await fetch(`/api/users/firebase/${user.uid}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            userId = userData.id;
          }
        }
      }

      if (!userId) {
        throw new Error(t("errorCreatingUser"));
      }

      const tier = ticketTiers.find(tier => tier.id === selectedTier);
      if (!tier) throw new Error(t("errorInvalidTier"));

      // Create ticket in DB
      const ticketRes = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ticketType: selectedTier,
          price: tier.price * 100, // Convert to cents
          currency: "EUR",
          paymentStatus: "pending"
        })
      });

      const ticket = await ticketRes.json();

      // Initialize Paystack payment
      const paymentRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          amount: tier.price * 100, // Paystack uses kobo (cents)
          type: "ticket",
          itemId: ticket.id,
          metadata: {
            name,
            ticketType: tier.name
          }
        })
      });

      const paymentData = await paymentRes.json();

      if (paymentData.authorizationUrl) {
        toast({
          title: t("redirectingToPayment"),
          description: t("redirectingDescription"),
        });
        // Redirect to Paystack payment page
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

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {ticketTiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <Card 
                key={tier.id}
                className={`relative hover-elevate transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${tier.highlight ? 'border-primary/50' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                data-testid={`card-ticket-${tier.id}`}
              >
                {tier.highlight && (
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
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{tier.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
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
                    onClick={() => setSelectedTier(tier.id)}
                    data-testid={`button-select-${tier.id}`}
                  >
                    {isSelected ? t("selected") : t("selectTicket")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {selectedTier && !currentUser && (
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
                <div className="space-y-2">
                  <Label htmlFor="password">{t("createPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("selectedTicket")}</span>
                    <span className="font-semibold">
                      {ticketTiers.find(tier => tier.id === selectedTier)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      €{ticketTiers.find(tier => tier.id === selectedTier)?.price}
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

        {selectedTier && currentUser && (
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
                      {ticketTiers.find(tier => tier.id === selectedTier)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      €{ticketTiers.find(tier => tier.id === selectedTier)?.price}
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
