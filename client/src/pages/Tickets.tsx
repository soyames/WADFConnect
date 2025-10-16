import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Ticket, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";

const ticketTiers = [
  {
    id: "early-bird",
    name: "Early Bird",
    price: 150,
    description: "Limited time offer for early supporters",
    features: [
      "Full conference access",
      "All sessions and workshops",
      "Networking events",
      "Digital certificate",
      "Conference materials"
    ],
    icon: Zap,
    highlight: true
  },
  {
    id: "regular",
    name: "Regular Pass",
    price: 200,
    description: "Standard conference admission",
    features: [
      "Full conference access",
      "All sessions and workshops",
      "Networking events",
      "Digital certificate",
      "Conference materials"
    ],
    icon: Ticket,
    highlight: false
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 350,
    description: "Premium experience with exclusive benefits",
    features: [
      "Everything in Regular",
      "VIP lounge access",
      "Priority seating",
      "Speaker meet & greet",
      "Exclusive dinner invitation",
      "Premium swag bag"
    ],
    icon: Users,
    highlight: false
  }
];

export default function Tickets() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setLoading(true);

    try {
      // If user is not logged in, create account first
      if (!currentUser) {
        await signUp(email, password, name);
      }

      // Process payment (will integrate with Paystack/Flutterwave in backend)
      const tier = ticketTiers.find(t => t.id === selectedTier);
      
      // TODO: Integrate actual payment gateway
      toast({
        title: "Payment processing",
        description: "Redirecting to secure payment gateway...",
      });

      // Simulate payment flow
      setTimeout(() => {
        toast({
          title: "Ticket purchased!",
          description: `You're registered for WADF 2025 with a ${tier?.name}.`,
        });
        setLocation("/agenda");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again.",
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
            Conference Passes
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Get Your <span className="text-primary">Ticket</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure your spot at West Africa's premier design forum. Purchase your ticket and get instantly registered.
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
                      Best Value
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
                        Selected
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
                    {isSelected ? "Selected" : "Select This Ticket"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {selectedTier && !currentUser && (
          <Card className="max-w-2xl mx-auto" data-testid="card-checkout">
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Create your account and complete payment in one step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Selected Ticket:</span>
                    <span className="font-semibold">
                      {ticketTiers.find(t => t.id === selectedTier)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      €{ticketTiers.find(t => t.id === selectedTier)?.price}
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
                      Processing...
                    </>
                  ) : (
                    "Proceed to Secure Payment"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Payments secured by Paystack • 256-bit encryption • PCI DSS compliant
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {selectedTier && currentUser && (
          <Card className="max-w-2xl mx-auto" data-testid="card-checkout-logged-in">
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>
                You're signed in as {currentUser.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Selected Ticket:</span>
                    <span className="font-semibold">
                      {ticketTiers.find(t => t.id === selectedTier)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      €{ticketTiers.find(t => t.id === selectedTier)?.price}
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
                      Processing...
                    </>
                  ) : (
                    "Proceed to Secure Payment"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Payments secured by Paystack • 256-bit encryption • PCI DSS compliant
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
