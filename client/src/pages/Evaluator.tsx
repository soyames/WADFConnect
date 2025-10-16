import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { ProposalEvaluation, Proposal, ProposalEvaluator } from "@shared/schema";

const evaluationSchema = z.object({
  relevanceScore: z.number().min(1).max(5),
  qualityScore: z.number().min(1).max(5),
  innovationScore: z.number().min(1).max(5),
  impactScore: z.number().min(1).max(5),
  feasibilityScore: z.number().min(1).max(5),
  comments: z.string().min(10, "Comments must be at least 10 characters"),
  recommendation: z.enum(["accept", "reject", "needs-revision"])
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

type EvaluationWithProposal = ProposalEvaluation & {
  proposal?: Proposal;
};

export default function Evaluator() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationWithProposal | null>(null);

  useEffect(() => {
    if (userData && userData.role !== "evaluator" && userData.role !== "organizer" && userData.role !== "admin") {
      setLocation("/");
    }
  }, [userData, setLocation]);

  // Fetch evaluator profile
  const { data: evaluators } = useQuery<ProposalEvaluator[]>({
    queryKey: ["/api/admin/evaluators"],
    enabled: !!userData
  });

  const currentEvaluator = evaluators?.find(e => e.teamMemberId === userData?.id);

  // Fetch assigned evaluations
  const { data: evaluations = [], isLoading } = useQuery<ProposalEvaluation[]>({
    queryKey: ["/api/evaluations/evaluator", currentEvaluator?.id],
    enabled: !!currentEvaluator?.id
  });

  // Fetch all proposals
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"]
  });

  // Enrich evaluations with proposal data
  const evaluationsWithProposals: EvaluationWithProposal[] = evaluations.map(evaluation => ({
    ...evaluation,
    proposal: proposals.find(p => p.id === evaluation.proposalId)
  }));

  const pendingEvaluations = evaluationsWithProposals.filter(e => e.status === "pending");
  const inProgressEvaluations = evaluationsWithProposals.filter(e => e.status === "in-progress");
  const completedEvaluations = evaluationsWithProposals.filter(e => e.status === "completed");

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      relevanceScore: 3,
      qualityScore: 3,
      innovationScore: 3,
      impactScore: 3,
      feasibilityScore: 3,
      comments: "",
      recommendation: "needs-revision"
    }
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (data: EvaluationFormData) => {
      if (!selectedEvaluation) return;
      
      const overallScore = Math.round(
        (data.relevanceScore + data.qualityScore + data.innovationScore + 
         data.impactScore + data.feasibilityScore) / 5
      );

      return apiRequest(`/api/evaluations/${selectedEvaluation.id}`, "PATCH", {
        ...data,
        overallScore,
        status: "completed",
        completedAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations/evaluator"] });
      toast({
        title: "Evaluation submitted",
        description: "Your evaluation has been saved successfully"
      });
      setSelectedEvaluation(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit evaluation",
        variant: "destructive"
      });
    }
  });

  const startEvaluationMutation = useMutation({
    mutationFn: async (evaluationId: string) => {
      return apiRequest(`/api/evaluations/${evaluationId}`, "PATCH", {
        status: "in-progress"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations/evaluator"] });
    }
  });

  if (!userData || (userData.role !== "evaluator" && userData.role !== "organizer" && userData.role !== "admin")) {
    return null;
  }

  const handleStartEvaluation = (evaluation: EvaluationWithProposal) => {
    if (evaluation.status === "pending") {
      startEvaluationMutation.mutate(evaluation.id);
    }
    setSelectedEvaluation(evaluation);
  };

  const ScoreSelector = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(score => (
          <Button
            key={score}
            type="button"
            variant={value === score ? "default" : "outline"}
            size="icon"
            onClick={() => onChange(score)}
            data-testid={`score-${label.toLowerCase().replace(/\s+/g, '-')}-${score}`}
          >
            {score}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-serif">Proposal Evaluations</h1>
          <p className="text-muted-foreground mt-2">Review and evaluate assigned proposals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card data-testid="stat-pending-evaluations">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEvaluations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-inprogress-evaluations">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressEvaluations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently reviewing</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-evaluations">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedEvaluations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Evaluations done</p>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : evaluationsWithProposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No proposals assigned</p>
              <p className="text-sm text-muted-foreground">You don't have any proposals to evaluate yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {[...pendingEvaluations, ...inProgressEvaluations, ...completedEvaluations].map((evaluation) => (
              <Card key={evaluation.id} data-testid={`evaluation-card-${evaluation.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{evaluation.proposal?.title || "Untitled Proposal"}</CardTitle>
                      <CardDescription className="mt-1">
                        {evaluation.proposal?.track && (
                          <Badge variant="outline" className="mr-2">{evaluation.proposal.track}</Badge>
                        )}
                        {evaluation.proposal?.sessionType && (
                          <Badge variant="outline">{evaluation.proposal.sessionType}</Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          evaluation.status === "completed" ? "default" :
                          evaluation.status === "in-progress" ? "secondary" : 
                          "outline"
                        }
                        data-testid={`status-${evaluation.id}`}
                      >
                        {evaluation.status}
                      </Badge>
                      {evaluation.status !== "completed" && (
                        <Button 
                          onClick={() => handleStartEvaluation(evaluation)}
                          data-testid={`button-evaluate-${evaluation.id}`}
                        >
                          {evaluation.status === "in-progress" ? "Continue" : "Start"} Evaluation
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {evaluation.status === "completed" && evaluation.overallScore && (
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold">{evaluation.overallScore}/5</span>
                      </div>
                      <Badge variant={
                        evaluation.recommendation === "accept" ? "default" :
                        evaluation.recommendation === "reject" ? "destructive" :
                        "secondary"
                      }>
                        {evaluation.recommendation}
                      </Badge>
                    </div>
                    {evaluation.comments && (
                      <p className="text-sm text-muted-foreground mt-2">{evaluation.comments}</p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={!!selectedEvaluation} onOpenChange={(open) => !open && setSelectedEvaluation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-evaluation">
          <DialogHeader>
            <DialogTitle>Evaluate Proposal</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.proposal?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation?.proposal && (
            <div className="space-y-4 mb-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvaluation.proposal.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Track</Label>
                  <p className="text-sm mt-1">{selectedEvaluation.proposal.track}</p>
                </div>
                <div>
                  <Label>Session Type</Label>
                  <p className="text-sm mt-1">{selectedEvaluation.proposal.sessionType}</p>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitEvaluationMutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="relevanceScore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScoreSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        label="Relevance (How relevant to WADF themes?)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScoreSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        label="Quality (Quality of proposal content)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="innovationScore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScoreSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        label="Innovation (Innovation and uniqueness)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impactScore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScoreSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        label="Impact (Potential impact on audience)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feasibilityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScoreSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        label="Feasibility (Within conference format)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Provide detailed feedback for the review committee..."
                        rows={5}
                        data-testid="input-comments"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendation</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-recommendation">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="accept">Accept</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="needs-revision">Needs Revision</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedEvaluation(null)}
                  data-testid="button-cancel-evaluation"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitEvaluationMutation.isPending}
                  data-testid="button-submit-evaluation"
                >
                  {submitEvaluationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Evaluation
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
