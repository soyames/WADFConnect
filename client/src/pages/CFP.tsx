import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, CheckCircle2, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import type { CfpSetting } from "@shared/schema";

export default function CFP() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    track: "",
    sessionType: "",
    duration: "45"
  });

  // Fetch CFP settings
  const { data: cfpSettings, isLoading: settingsLoading } = useQuery<CfpSetting>({
    queryKey: ["/api/cfp-settings"]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: t("cfp.signInRequired"),
        description: t("cfp.signInToSubmit"),
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
        title: t("cfp.submitted"),
        description: t("cfp.submittedDescription"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
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
            <CardTitle className="text-2xl">{t("cfp.submitted")}</CardTitle>
            <CardDescription>
              {t("cfp.submittedDescription")}
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
                {t("agenda.title")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-cfp-settings" />
      </div>
    );
  }

  // Show placeholder when CFP is inactive
  if (!cfpSettings?.isActive) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 gap-2" variant="outline" data-testid="badge-cfp-status">
              <AlertCircle className="h-3 w-3" />
              CFP Closed
            </Badge>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6" data-testid="text-placeholder-title">
              {cfpSettings?.placeholderTitle || "Call for Proposals Opening Soon"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-placeholder-message">
              {cfpSettings?.placeholderMessage || "We'll be opening our Call for Proposals soon. Check back for updates!"}
            </p>
          </div>

          <div className="space-y-6">
            {/* CFP Period */}
            {(cfpSettings?.startDate || cfpSettings?.endDate) && (
              <Card data-testid="card-cfp-period">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    CFP Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {cfpSettings.startDate && (
                      <div data-testid="text-start-date">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Opens</div>
                        <div className="text-lg font-semibold">
                          {new Date(cfpSettings.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                    {cfpSettings.endDate && (
                      <div data-testid="text-end-date">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Closes</div>
                        <div className="text-lg font-semibold">
                          {new Date(cfpSettings.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Guidelines */}
            {cfpSettings?.submissionGuidelines && (
              <Card data-testid="card-submission-guidelines">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Submission Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-submission-guidelines">
                    {cfpSettings.submissionGuidelines}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Criteria */}
            {cfpSettings?.evaluationCriteria && Array.isArray(cfpSettings.evaluationCriteria) && cfpSettings.evaluationCriteria.length > 0 && (
              <Card data-testid="card-evaluation-criteria">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Evaluation Criteria
                  </CardTitle>
                  <CardDescription>
                    Your proposal will be evaluated based on the following criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {cfpSettings.evaluationCriteria.map((criterion: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-4 border rounded-lg" 
                        data-testid={`evaluation-criterion-${index}`}
                      >
                        <h4 className="font-semibold mb-2">{criterion.name}</h4>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allowed Tracks and Session Types */}
            <div className="grid gap-6 md:grid-cols-2">
              {cfpSettings?.allowedTracks && Array.isArray(cfpSettings.allowedTracks) && cfpSettings.allowedTracks.length > 0 && (
                <Card data-testid="card-allowed-tracks">
                  <CardHeader>
                    <CardTitle>Allowed Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {cfpSettings.allowedTracks.map((track: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`track-${index}`}>
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {cfpSettings?.allowedSessionTypes && Array.isArray(cfpSettings.allowedSessionTypes) && cfpSettings.allowedSessionTypes.length > 0 && (
                <Card data-testid="card-allowed-session-types">
                  <CardHeader>
                    <CardTitle>Session Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {cfpSettings.allowedSessionTypes.map((type: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`session-type-${index}`}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Duration Limits */}
            {(cfpSettings?.minDuration || cfpSettings?.maxDuration) && (
              <Card data-testid="card-duration-limits">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Duration Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {cfpSettings.minDuration && (
                      <div data-testid="text-min-duration">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Minimum</div>
                        <div className="text-lg font-semibold">{cfpSettings.minDuration} minutes</div>
                      </div>
                    )}
                    {cfpSettings.maxDuration && (
                      <div data-testid="text-max-duration">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Maximum</div>
                        <div className="text-lg font-semibold">{cfpSettings.maxDuration} minutes</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show submission form when CFP is active
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2" variant="default" data-testid="badge-cfp-active">
            <CheckCircle2 className="h-3 w-3" />
            CFP Open
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            {t("cfp.badge")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("cfp.subtitle")}
          </p>
        </div>

        <Card data-testid="card-cfp-form">
          <CardHeader>
            <CardTitle>{t("cfp.formTitle")}</CardTitle>
            <CardDescription>
              {t("cfp.formDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t("cfp.sessionTitle")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("cfp.sessionTitlePlaceholder")}
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("cfp.description")} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("cfp.descriptionPlaceholder")}
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
                  <Label htmlFor="track">{t("cfp.track")} *</Label>
                  <Select 
                    value={formData.track} 
                    onValueChange={(value) => setFormData({ ...formData, track: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-track">
                      <SelectValue placeholder={t("cfp.trackPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design-thinking">{t("cfp.trackDesign")}</SelectItem>
                      <SelectItem value="innovation">{t("cfp.trackInnovation")}</SelectItem>
                      <SelectItem value="technology">{t("cfp.trackTechnology")}</SelectItem>
                      <SelectItem value="culture">{t("cfp.trackCulture")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionType">{t("cfp.sessionType")} *</Label>
                  <Select 
                    value={formData.sessionType} 
                    onValueChange={(value) => setFormData({ ...formData, sessionType: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-session-type">
                      <SelectValue placeholder={t("cfp.sessionTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talk">{t("cfp.typeTalk")}</SelectItem>
                      <SelectItem value="workshop">{t("cfp.typeWorkshop")}</SelectItem>
                      <SelectItem value="panel">{t("cfp.typePanel")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t("cfp.duration")} *</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  required
                >
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue placeholder={t("cfp.duration")} />
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
                    {t("cfp.submitting")}
                  </>
                ) : !currentUser ? (
                  t("cfp.signInToSubmit")
                ) : (
                  t("cfp.submit")
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
                    {t("tickets.title")}
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
