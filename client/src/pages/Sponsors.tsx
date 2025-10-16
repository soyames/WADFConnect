import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Award, Crown, Diamond, Heart } from "lucide-react";
import { sponsorshipTiers } from "@shared/schema";
import { useLocation } from "wouter";

const tierIcons = {
  "supporter": Heart,
  "gala-dinner": Award,
  "gold": Crown,
  "diamond": Diamond
};

export default function Sponsors() {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: t('sponsors.signInRequired'),
        description: t('sponsors.signInToSponsor'),
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setLoading(true);

    try {
      // TODO: Integrate payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t('sponsors.purchaseSuccess'),
        description: t('sponsors.purchaseSuccessDescription'),
      });
      
      setLocation("/agenda");
    } catch (error: any) {
      toast({
        title: t('sponsors.purchaseFailed'),
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
          <Badge className="mb-4" variant="outline" data-testid="badge-sponsorships">
            {t('sponsors.badge')}
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            {t('sponsors.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('sponsors.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {sponsorshipTiers.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons];
            const isSelected = selectedTier === tier.id;
            const isPremium = tier.id === "diamond" || tier.id === "gold";
            
            return (
              <Card 
                key={tier.id}
                className={`relative hover-elevate transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${isPremium ? 'border-chart-5/50' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                data-testid={`card-sponsor-${tier.id}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-chart-5 text-white">
                      {tier.id === "diamond" ? t('sponsors.premium') : t('sponsors.popular')}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${isPremium ? 'bg-chart-5/10' : 'bg-primary/10'}`}>
                      <Icon className={`h-6 w-6 ${isPremium ? 'text-chart-5' : 'text-primary'}`} />
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="bg-chart-3">
                        {t('sponsors.selected')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">€{tier.price.toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isPremium ? 'text-chart-5' : 'text-chart-3'}`} />
                        <span>{benefit}</span>
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
                    {isSelected ? t('sponsors.selected') : t('sponsors.selectPackage')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {selectedTier && (
          <Card className="max-w-2xl mx-auto" data-testid="card-sponsor-checkout">
            <CardHeader>
              <CardTitle>{t('sponsors.confirmPurchase')}</CardTitle>
              <CardDescription>
                {t('sponsors.selectTier')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('sponsors.companyName')} *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Ltd."
                    required
                    data-testid="input-company-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">{t('sponsors.websiteUrl')}</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    data-testid="input-website"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t('sponsors.selectedPackage')}</span>
                    <span className="font-semibold">
                      {sponsorshipTiers.find(t => t.id === selectedTier)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t('sponsors.total')}</span>
                    <span className="text-primary">
                      €{sponsorshipTiers.find(t => t.id === selectedTier)?.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading || !currentUser}
                  data-testid="button-proceed-payment"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('sponsors.processing')}
                    </>
                  ) : !currentUser ? (
                    t('common.signIn')
                  ) : (
                    t('sponsors.confirmPurchase')
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t('sponsors.securityNotice')}
                </p>

                {!currentUser && (
                  <p className="text-sm text-center text-muted-foreground">
                    {t('sponsors.noAccount')}{" "}
                    <button 
                      type="button"
                      onClick={() => setLocation("/tickets")}
                      className="text-primary hover:underline font-medium"
                      data-testid="link-create-account"
                    >
                      {t('sponsors.createAccount')}
                    </button>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="mt-16 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">{t('sponsors.whySponsor')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="font-medium">{t('sponsors.qualifiedAttendees')}</div>
              <p className="text-sm text-muted-foreground">
                {t('sponsors.qualifiedAttendeesDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chart-2">15+</div>
              <div className="font-medium">{t('sponsors.countriesRepresented')}</div>
              <p className="text-sm text-muted-foreground">
                {t('sponsors.countriesRepresentedDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chart-5">3</div>
              <div className="font-medium">{t('sponsors.daysOfEngagement')}</div>
              <p className="text-sm text-muted-foreground">
                {t('sponsors.daysOfEngagementDesc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
