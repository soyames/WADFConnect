import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, CheckCircle2, Calendar, Clock, FileText, AlertCircle, User, Building, MapPin, Linkedin } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import type { CfpSetting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CFP() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    linkedinUrl: "",
    companyName: "",
    position: "",
    title: "",
    abstract: "",
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
      await apiRequest("POST", "/api/proposals", {
        ...formData,
        userId: userData?.id,
        duration: parseInt(formData.duration)
      });
      
      setSubmitted(true);
      toast({
        title: t("cfp.submitted"),
        description: t("cfp.submittedDescription"),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
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

  // Show evaluation criteria and "Submit Proposal" button when CFP is active but form not shown
  if (!showForm) {
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

          <div className="space-y-6">
            {/* CFP Period & Deadlines */}
            {(cfpSettings?.startDate || cfpSettings?.endDate) && (
              <Card data-testid="card-cfp-period">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {cfpSettings.startDate && (
                      <div data-testid="text-start-date">
                        <div className="text-sm font-medium text-muted-foreground mb-1">CFP Opens</div>
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
                        <div className="text-sm font-medium text-muted-foreground mb-1">Submission Deadline</div>
                        <div className="text-lg font-semibold text-primary">
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

            {/* Submit Proposal Button */}
            <Card className="border-primary" data-testid="card-submit-cta">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Ready to Submit Your Proposal?</h3>
                  <p className="text-muted-foreground">
                    Review the criteria above and submit your session proposal for WADF 2026
                  </p>
                  <Button 
                    size="lg" 
                    className="mt-4"
                    onClick={() => {
                      if (!currentUser) {
                        toast({
                          title: "Sign in required",
                          description: "Please purchase a ticket to submit a proposal",
                          variant: "destructive",
                        });
                        setLocation("/tickets");
                      } else {
                        setShowForm(true);
                      }
                    }}
                    data-testid="button-start-proposal"
                  >
                    Submit a Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show submission form when user clicks "Submit Proposal"
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2" variant="default" data-testid="badge-cfp-active">
            <CheckCircle2 className="h-3 w-3" />
            CFP Open
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Submit Your Proposal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in the form below to submit your session proposal for WADF 2026
          </p>
        </div>

        <Card data-testid="card-cfp-form">
          <CardHeader>
            <CardTitle>Proposal Submission Form</CardTitle>
            <CardDescription>
              All fields marked with * are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Speaker Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Speaker Information</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      required
                      data-testid="input-first-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country (e.g., Lagos, Nigeria)"
                      required
                      className="pl-10"
                      data-testid="input-location"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Where are you currently based?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="pl-10"
                      data-testid="input-linkedin"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Your company or organization"
                        className="pl-10"
                        data-testid="input-company"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Role</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., UX Designer, Product Manager"
                      data-testid="input-position"
                    />
                  </div>
                </div>
              </div>

              {/* Session Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Session Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your session a compelling title"
                    required
                    data-testid="input-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a clear, engaging title that describes your session
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Session Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    placeholder="Write a brief summary of your session (100-200 words)"
                    rows={4}
                    required
                    data-testid="input-abstract"
                  />
                  <p className="text-xs text-muted-foreground">
                    A short summary that will be used in the conference program
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a detailed description of your session, including learning outcomes and target audience"
                    rows={8}
                    required
                    data-testid="input-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 200 characters. Include key takeaways, topics covered, and who should attend
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
                        <SelectItem value="culture">Culture & Society</SelectItem>
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
              </div>

              {/* What Happens Next */}
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

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                  data-testid="button-back"
                >
                  Back to Guidelines
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  size="lg"
                  disabled={loading}
                  data-testid="button-submit-proposal"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Proposal"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
