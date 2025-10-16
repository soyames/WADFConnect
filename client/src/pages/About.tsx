import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">WADF</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The West African Design Forum is a pioneering initiative dedicated to elevating the region's creative industry, 
            fostering collaboration, and showcasing the immense talent present within West Africa.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <h2 className="font-serif text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            WADF exists to empower and connect designers, promote cultural heritage, and foster innovation across West Africa. 
            We believe in creating a persistent digital community that transforms our annual event into a year-round platform 
            for discussion, networking, and knowledge sharing.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card data-testid="card-vision">
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="leading-relaxed">
                To be West Africa's leading platform for creative excellence, innovation, and collaboration, 
                connecting designers and innovators across borders and disciplines.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-values">
            <CardHeader>
              <div className="p-3 rounded-lg bg-chart-2/10 w-fit mb-4">
                <Heart className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-2xl">Our Values</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Excellence in design and creativity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Cultural authenticity and respect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Collaboration and community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Innovation and forward-thinking</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-none">
          <CardHeader>
            <div className="p-3 rounded-lg bg-chart-3/10 w-fit mb-4">
              <Users className="h-6 w-6 text-chart-3" />
            </div>
            <CardTitle className="text-2xl">What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Zap className="h-4 w-4" />
                <span>Inspiring Sessions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Talks, workshops, and panels led by industry leaders from across West Africa and beyond
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Zap className="h-4 w-4" />
                <span>Networking Opportunities</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with fellow designers, innovators, and potential collaborators
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Zap className="h-4 w-4" />
                <span>Cultural Celebration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience the rich diversity of West African design, art, and innovation
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Zap className="h-4 w-4" />
                <span>Professional Growth</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gain insights, skills, and inspiration to advance your creative career
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Event Information</h2>
          <div className="grid gap-8 md:grid-cols-3 mt-8">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Date</div>
              <div className="text-lg font-semibold">June 15-17, 2025</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Location</div>
              <div className="text-lg font-semibold">Lagos, Nigeria</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Venue</div>
              <div className="text-lg font-semibold">Eko Convention Centre</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
