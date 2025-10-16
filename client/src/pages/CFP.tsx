import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function CFP() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    track: "",
    sessionType: "",
    duration: "45"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a proposal.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setLoading(true);

    try {
      // TODO: Submit to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast({
        title: "Proposal submitted!",
        description: "We'll review your proposal and get back to you soon.",
      });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md text-center" data-testid="card-submission-success">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-chart-3/10 w-fit">
              <CheckCircle2 className="h-12 w-12 text-chart-3" />
            </div>
            <CardTitle className="text-2xl">Proposal Submitted!</CardTitle>
            <CardDescription>
              Thank you for your submission. Our team will review your proposal and notify you of the decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-left">
                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                <Badge variant="outline" className="bg-chart-5/10">
                  Under Review
                </Badge>
              </div>
              <Button 
                onClick={() => setLocation("/agenda")} 
                className="w-full"
                data-testid="button-view-agenda"
              >
                View Conference Agenda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2" variant="outline" data-testid="badge-cfp">
            <Lightbulb className="h-3 w-3" />
            Call for Proposals
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Share Your <span className="text-primary">Expertise</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit your session proposal and join our community of speakers shaping the future of West African design.
          </p>
        </div>

        <Card data-testid="card-cfp-form">
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
            <CardDescription>
              Tell us about the session you'd like to present at WADF 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., The Future of African Design Systems"
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your session, what attendees will learn, and why it matters..."
                  rows={6}
                  required
                  data-testid="input-description"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 100 characters. Be specific about learning outcomes and target audience.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="track">Track *</Label>
                  <Select 
                    value={formData.track} 
                    onValueChange={(value) => setFormData({ ...formData, track: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-track">
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design-thinking">Design Thinking</SelectItem>
                      <SelectItem value="innovation">Innovation</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="culture">Culture & Heritage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionType">Session Type *</Label>
                  <Select 
                    value={formData.sessionType} 
                    onValueChange={(value) => setFormData({ ...formData, sessionType: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-session-type">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talk">Talk (Presentation)</SelectItem>
                      <SelectItem value="workshop">Workshop (Hands-on)</SelectItem>
                      <SelectItem value="panel">Panel Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  required
                >
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes (Workshop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">1.</span>
                    <span>Your proposal will be reviewed by our selection committee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">2.</span>
                    <span>You'll receive a decision via email within 2 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">3.</span>
                    <span>Accepted sessions will be automatically added to the conference agenda</span>
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading || !currentUser}
                data-testid="button-submit-proposal"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !currentUser ? (
                  "Sign In to Submit"
                ) : (
                  "Submit Proposal"
                )}
              </Button>

              {!currentUser && (
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => setLocation("/tickets")}
                    className="text-primary hover:underline font-medium"
                    data-testid="link-register"
                  >
                    Buy a ticket to register
                  </button>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
