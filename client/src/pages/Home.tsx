import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Award, 
  Globe,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-chart-2/5 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        
        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 gap-2" variant="outline" data-testid="badge-2025">
              <Sparkles className="h-3 w-3" />
              <span className="font-serif">West Africa's Premier Design Event 2025</span>
            </Badge>
            
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl mb-6">
              West African
              <span className="block bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent">
                Design Forum
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the digital movement connecting designers, innovators, and industry experts across West Africa. 
              Experience world-class sessions, networking, and inspiration.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/tickets">
                <Button size="lg" className="gap-2 group" data-testid="button-buy-tickets">
                  <span>Buy Tickets</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/agenda">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-view-agenda">
                  <Calendar className="h-4 w-4" />
                  <span>View Agenda</span>
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>500+ Attendees</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-chart-5" />
                <span>50+ Speakers</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-chart-2" />
                <span>15+ Countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">Experience WADF</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your complete conference experience in one seamless platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-tickets">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Seamless Ticketing</CardTitle>
                <CardDescription>
                  Purchase your ticket and get instantly registered. No separate sign-up needed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-agenda">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-chart-4/10">
                    <Calendar className="h-6 w-6 text-chart-4" />
                  </div>
                </div>
                <CardTitle className="text-xl">Live Agenda</CardTitle>
                <CardDescription>
                  Build your personalized schedule. Get real-time updates and offline access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-speakers">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-chart-2/10">
                    <Users className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
                <CardTitle className="text-xl">World-Class Speakers</CardTitle>
                <CardDescription>
                  Learn from industry leaders and innovators shaping Africa's creative future.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-cfp">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-chart-3/10">
                    <Sparkles className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
                <CardTitle className="text-xl">Call for Proposals</CardTitle>
                <CardDescription>
                  Share your expertise. Submit session proposals and join our speaker community.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-rating">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-chart-5/10">
                    <Star className="h-6 w-6 text-chart-5" />
                  </div>
                </div>
                <CardTitle className="text-xl">Session Ratings</CardTitle>
                <CardDescription>
                  Rate sessions and provide feedback to help us improve and celebrate excellence.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate transition-all duration-200" data-testid="card-feature-certificate">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Digital Certificates</CardTitle>
                <CardDescription>
                  Receive personalized certificates listing all sessions you attended.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Ready to Join the Movement?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Secure your spot at West Africa's most inspiring design conference
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/tickets">
              <Button size="lg" className="gap-2" data-testid="button-cta-tickets">
                Get Your Ticket
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/cfp">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-cfp">
                Submit a Proposal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
