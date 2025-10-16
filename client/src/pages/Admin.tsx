import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutDashboard,
  FileText,
  Ticket,
  Calendar,
  Award,
  Users,
  UserCog,
  Eye,
  Settings,
  ListTodo,
  Megaphone,
  DollarSign,
  Star,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  TrendingUp,
  Clock
} from "lucide-react";
import type { 
  Proposal, 
  TeamMember, 
  TicketOption, 
  SponsorshipPackage, 
  PageSetting, 
  Task, 
  CfpSetting,
  Session,
  User,
  ProposalEvaluator,
  ProposalEvaluation
} from "@shared/schema";

type AdminSection = 
  | "overview" 
  | "proposals" 
  | "evaluations"
  | "tickets" 
  | "sessions" 
  | "sponsorships" 
  | "users" 
  | "team" 
  | "page-visibility" 
  | "cfp-settings" 
  | "tasks" 
  | "settings";

// Helper function to get admin headers
const getAdminHeaders = (userId: string | undefined) => ({
  'x-user-id': userId || ''
});

export default function Admin() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  useEffect(() => {
    if (userData && userData.role !== "organizer" && userData.role !== "admin") {
      setLocation("/");
    }
  }, [userData, setLocation]);

  // Fetch stats
  const { data: statsData } = useQuery<{
    totalRevenue: number;
    ticketsSold: number;
    totalProposals: number;
    pendingProposals: number;
    averageRating: number;
    totalSessions: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: userData?.role === "organizer" || userData?.role === "admin"
  });

  if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
    return null;
  }

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "evaluations", label: "Proposal Evaluations", icon: Star },
    { id: "tickets", label: "Ticket Options", icon: Ticket },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "sponsorships", label: "Sponsorship Packages", icon: Award },
    { id: "users", label: "Speakers & Participants", icon: Users },
    { id: "team", label: "Team Members", icon: UserCog },
    { id: "page-visibility", label: "Page Visibility", icon: Eye },
    { id: "cfp-settings", label: "CFP Settings", icon: Megaphone },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="font-serif text-2xl font-bold">Admin Dashboard</h1>
          <Badge variant="outline" className="mt-2 bg-primary/10">
            {userData.role}
          </Badge>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover-elevate active-elevate-2 text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl">
          {activeSection === "overview" && <OverviewSection statsData={statsData} />}
          {activeSection === "proposals" && <ProposalsSection />}
          {activeSection === "evaluations" && <ProposalEvaluationsSection />}
          {activeSection === "tickets" && <TicketOptionsSection userId={userData.id} />}
          {activeSection === "sessions" && <SessionsSection />}
          {activeSection === "sponsorships" && <SponsorshipPackagesSection />}
          {activeSection === "users" && <UsersSection />}
          {activeSection === "team" && <TeamMembersSection userId={userData.id} />}
          {activeSection === "page-visibility" && <PageVisibilitySection userId={userData.id} />}
          {activeSection === "cfp-settings" && <CfpSettingsSection userId={userData.id} />}
          {activeSection === "tasks" && <TasksSection userId={userData.id} />}
          {activeSection === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ statsData }: { statsData: any }) {
  const stats = [
    {
      title: "Total Revenue",
      value: statsData ? `€${(statsData.totalRevenue / 100).toLocaleString()}` : "€0",
      change: statsData ? `${statsData.ticketsSold} tickets` : "0 tickets",
      icon: DollarSign,
      color: "text-chart-3"
    },
    {
      title: "Tickets Sold",
      value: statsData?.ticketsSold?.toString() || "0",
      change: "Completed sales",
      icon: Ticket,
      color: "text-primary"
    },
    {
      title: "Proposals",
      value: statsData?.totalProposals?.toString() || "0",
      change: `${statsData?.pendingProposals || 0} pending`,
      icon: FileText,
      color: "text-chart-4"
    },
    {
      title: "Avg. Rating",
      value: statsData?.averageRating?.toString() || "0",
      change: `From ${statsData?.totalSessions || 0} sessions`,
      icon: Star,
      color: "text-chart-5"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Overview</h2>
        <p className="text-muted-foreground">Key metrics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start" data-testid="button-quick-review-proposals">
              <FileText className="h-4 w-4 mr-2" />
              Review Proposals
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-quick-manage-tickets">
              <Ticket className="h-4 w-4 mr-2" />
              Manage Tickets
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-quick-schedule-sessions">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4" data-testid="activity-item-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">New proposal submitted</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4" data-testid="activity-item-2">
              <div className="h-2 w-2 rounded-full bg-chart-3" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ticket purchased</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4" data-testid="activity-item-3">
              <div className="h-2 w-2 rounded-full bg-chart-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">New sponsor registration</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Proposals Section
function ProposalsSection() {
  const { toast } = useToast();
  const { data: proposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"]
  });

  const reviewProposal = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/proposals/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Proposal updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Proposals Management</h2>
        <p className="text-muted-foreground">Review and manage speaker submissions</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No proposals submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border rounded-lg p-4 space-y-3" data-testid={`proposal-${proposal.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                    </div>
                    <Badge variant={proposal.status === "accepted" ? "default" : proposal.status === "rejected" ? "destructive" : "outline"}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">{proposal.track}</Badge>
                    <Badge variant="secondary">{proposal.sessionType}</Badge>
                    <span className="text-muted-foreground">{proposal.duration} minutes</span>
                  </div>
                  {(proposal.status === "submitted" || proposal.status === "under-review") && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => reviewProposal.mutate({ id: proposal.id, status: "accepted" })}
                        disabled={reviewProposal.isPending}
                        data-testid={`button-accept-${proposal.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => reviewProposal.mutate({ id: proposal.id, status: "rejected" })}
                        disabled={reviewProposal.isPending}
                        data-testid={`button-reject-${proposal.id}`}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Proposal Evaluations Section
function ProposalEvaluationsSection() {
  const { toast } = useToast();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [viewEvaluationsDialog, setViewEvaluationsDialog] = useState(false);
  const [selectedEvaluators, setSelectedEvaluators] = useState<string[]>([]);

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"]
  });

  const { data: evaluators = [] } = useQuery<ProposalEvaluator[]>({
    queryKey: ["/api/admin/evaluators"]
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team-members"]
  });

  // Filter team members with role "evaluator" to show as available evaluators
  const evaluatorTeamMembers = teamMembers.filter(member => member.role === "evaluator" && member.status === "active");

  const { data: allEvaluations = [] } = useQuery<ProposalEvaluation[]>({
    queryKey: ["/api/evaluations"],
    queryFn: async () => {
      const evals = await Promise.all(
        proposals.map(p => 
          fetch(`/api/evaluations/proposal/${p.id}`).then(r => r.json())
        )
      );
      return evals.flat();
    },
    enabled: proposals.length > 0
  });

  const assignEvaluatorsMutation = useMutation({
    mutationFn: async ({ proposalId, evaluatorIds }: { proposalId: string; evaluatorIds: string[] }) => {
      return Promise.all(
        evaluatorIds.map(evaluatorId =>
          apiRequest("/api/admin/assign-evaluator", "POST", {
            proposalId,
            evaluatorId,
            status: "pending"
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      toast({ title: "Evaluators assigned successfully" });
      setAssignDialogOpen(false);
      setSelectedEvaluators([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error assigning evaluators", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const finalDecisionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/proposals/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal decision updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    }
  });

  const getProposalEvaluations = (proposalId: string) => {
    return allEvaluations.filter(e => e.proposalId === proposalId);
  };

  const getEvaluationStatus = (proposalId: string) => {
    const evals = getProposalEvaluations(proposalId);
    if (evals.length === 0) return { status: "no-evaluations", badge: "outline", text: "Not assigned" };
    const completed = evals.filter(e => e.status === "completed").length;
    const total = evals.length;
    if (completed === total) return { status: "completed", badge: "default", text: "Completed" };
    if (completed > 0) return { status: "in-progress", badge: "secondary", text: `${completed}/${total}` };
    return { status: "pending", badge: "outline", text: "Pending" };
  };

  const getAverageScore = (proposalId: string) => {
    const evals = getProposalEvaluations(proposalId).filter(e => e.overallScore);
    if (evals.length === 0) return null;
    const avg = evals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evals.length;
    return Math.round(avg * 10) / 10;
  };

  const openAssignDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setAssignDialogOpen(true);
  };

  const openViewEvaluations = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setViewEvaluationsDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Proposal Evaluations</h2>
        <p className="text-muted-foreground">Assign evaluators and review evaluation results</p>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const evalStatus = getEvaluationStatus(proposal.id);
          const avgScore = getAverageScore(proposal.id);
          const proposalEvals = getProposalEvaluations(proposal.id);

          return (
            <Card key={proposal.id} data-testid={`evaluation-proposal-${proposal.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="mr-2">{proposal.track}</Badge>
                      <Badge variant="outline">{proposal.sessionType}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={evalStatus.badge as any} data-testid={`eval-status-${proposal.id}`}>
                      {evalStatus.text}
                    </Badge>
                    {avgScore !== null && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded" data-testid={`avg-score-${proposal.id}`}>
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-sm font-bold">{avgScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAssignDialog(proposal)}
                    data-testid={`button-assign-evaluators-${proposal.id}`}
                  >
                    <UserCog className="h-4 w-4 mr-1" />
                    Assign Evaluators
                  </Button>
                  {proposalEvals.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewEvaluations(proposal)}
                      data-testid={`button-view-evaluations-${proposal.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Evaluations ({proposalEvals.length})
                    </Button>
                  )}
                  {evalStatus.status === "completed" && proposal.status !== "accepted" && proposal.status !== "rejected" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => finalDecisionMutation.mutate({ id: proposal.id, status: "accepted" })}
                        disabled={finalDecisionMutation.isPending}
                        data-testid={`button-final-accept-${proposal.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => finalDecisionMutation.mutate({ id: proposal.id, status: "rejected" })}
                        disabled={finalDecisionMutation.isPending}
                        data-testid={`button-final-reject-${proposal.id}`}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Evaluators Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent data-testid="dialog-assign-evaluators">
          <DialogHeader>
            <DialogTitle>Assign Evaluators</DialogTitle>
            <DialogDescription>
              Select evaluators to review: {selectedProposal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {evaluatorTeamMembers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No active evaluators available.</p>
                <p className="text-xs mt-2">Add team members with "evaluator" role to assign them to proposals.</p>
              </div>
            ) : (
              evaluatorTeamMembers.map((member) => {
                const evaluator = evaluators.find(e => e.teamMemberId === member.id);
                const evaluatorId = evaluator?.id || member.id;
                
                return (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={evaluatorId}
                      checked={selectedEvaluators.includes(evaluatorId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEvaluators([...selectedEvaluators, evaluatorId]);
                        } else {
                          setSelectedEvaluators(selectedEvaluators.filter(id => id !== evaluatorId));
                        }
                      }}
                      data-testid={`checkbox-evaluator-${member.id}`}
                    />
                    <Label htmlFor={evaluatorId} className="flex-1 cursor-pointer">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                      {evaluator?.expertise && (
                        <div className="text-xs text-muted-foreground mt-1">Expertise: {evaluator.expertise}</div>
                      )}
                    </Label>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              data-testid="button-cancel-assign"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProposal) {
                  assignEvaluatorsMutation.mutate({
                    proposalId: selectedProposal.id,
                    evaluatorIds: selectedEvaluators
                  });
                }
              }}
              disabled={selectedEvaluators.length === 0 || assignEvaluatorsMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignEvaluatorsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign ({selectedEvaluators.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Evaluations Dialog */}
      <Dialog open={viewEvaluationsDialog} onOpenChange={setViewEvaluationsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-view-evaluations">
          <DialogHeader>
            <DialogTitle>Evaluation Results</DialogTitle>
            <DialogDescription>
              {selectedProposal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProposal && getProposalEvaluations(selectedProposal.id).map((evaluation) => {
              const evaluator = evaluators.find(e => e.id === evaluation.evaluatorId);
              const member = teamMembers.find(m => m.id === evaluator?.teamMemberId);
              
              return (
                <Card key={evaluation.id} data-testid={`evaluation-result-${evaluation.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{member?.name || "Unknown Evaluator"}</CardTitle>
                        <CardDescription>{evaluator?.expertise}</CardDescription>
                      </div>
                      <Badge variant={evaluation.status === "completed" ? "default" : "outline"}>
                        {evaluation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  {evaluation.status === "completed" && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div>
                          <Label className="text-xs">Relevance</Label>
                          <div className="font-bold">{evaluation.relevanceScore}/5</div>
                        </div>
                        <div>
                          <Label className="text-xs">Quality</Label>
                          <div className="font-bold">{evaluation.qualityScore}/5</div>
                        </div>
                        <div>
                          <Label className="text-xs">Innovation</Label>
                          <div className="font-bold">{evaluation.innovationScore}/5</div>
                        </div>
                        <div>
                          <Label className="text-xs">Impact</Label>
                          <div className="font-bold">{evaluation.impactScore}/5</div>
                        </div>
                        <div>
                          <Label className="text-xs">Feasibility</Label>
                          <div className="font-bold">{evaluation.feasibilityScore}/5</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-bold">Overall: {evaluation.overallScore}/5</span>
                          <Badge variant={
                            evaluation.recommendation === "accept" ? "default" :
                            evaluation.recommendation === "reject" ? "destructive" :
                            "secondary"
                          }>
                            {evaluation.recommendation}
                          </Badge>
                        </div>
                        {evaluation.comments && (
                          <div className="bg-muted p-3 rounded-md">
                            <Label className="text-xs">Comments</Label>
                            <p className="text-sm mt-1">{evaluation.comments}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ticket Options Section
function TicketOptionsSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<TicketOption | null>(null);
  
  const { data: options = [], isLoading } = useQuery<TicketOption[]>({
    queryKey: ["/api/admin/ticket-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ticket-options", {
        headers: getAdminHeaders(userId)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/ticket-options", data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticket-options"] });
      setIsDialogOpen(false);
      toast({ title: "Ticket option created" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/ticket-options/${id}`, data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticket-options"] });
      setIsDialogOpen(false);
      setEditingOption(null);
      toast({ title: "Ticket option updated" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/ticket-options/${id}`, undefined, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticket-options"] });
      toast({ title: "Ticket option deleted" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Ticket Options</h2>
          <p className="text-muted-foreground">Manage ticket types and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ticket-option">
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Option
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOption ? "Edit" : "Create"} Ticket Option</DialogTitle>
              <DialogDescription>Configure ticket pricing and availability</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ticket Type</Label>
                <Input placeholder="e.g., Early Bird, VIP" data-testid="input-ticket-type" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (in cents)</Label>
                  <Input type="number" placeholder="5000" data-testid="input-ticket-price" />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" placeholder="100" data-testid="input-ticket-capacity" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Ticket description" data-testid="textarea-ticket-description" />
              </div>
              <Button className="w-full" data-testid="button-save-ticket-option">
                Save Ticket Option
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No ticket options configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {options.map((option) => (
                <div key={option.id} className="border rounded-lg p-4" data-testid={`ticket-option-${option.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{option.name}</h3>
                        <Badge variant={option.available ? "default" : "secondary"}>
                          {option.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium">€{(option.price / 100).toFixed(2)}</span>
                        {option.capacity && (
                          <span className="text-muted-foreground">
                            {option.sold || 0}/{option.capacity} sold
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingOption(option)} data-testid={`button-edit-ticket-${option.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(option.id)} data-testid={`button-delete-ticket-${option.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sessions Section
function SessionsSection() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"]
  });

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"]
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  // Get approved proposals that don't have sessions yet
  const approvedProposals = proposals.filter(p => 
    p.status === "accepted" && !sessions.some(s => s.proposalId === p.id)
  );

  const getSpeakerName = (speakerId: string) => {
    const speaker = users.find(u => u.id === speakerId);
    return speaker?.name || "Unknown Speaker";
  };

  const createSessionSchema = z.object({
    proposalId: z.string().min(1, "Proposal is required"),
  });

  const editSessionSchema = z.object({
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    room: z.string().optional(),
  });

  const bulkScheduleSchema = z.object({
    scheduledDate: z.string().min(1, "Date is required"),
    scheduledTime: z.string().min(1, "Time is required"),
    room: z.string().min(1, "Room is required"),
  });

  const createForm = useForm<z.infer<typeof createSessionSchema>>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      proposalId: "",
    }
  });

  const editForm = useForm<z.infer<typeof editSessionSchema>>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      scheduledDate: "",
      scheduledTime: "",
      room: "",
    }
  });

  const bulkForm = useForm<z.infer<typeof bulkScheduleSchema>>({
    resolver: zodResolver(bulkScheduleSchema),
    defaultValues: {
      scheduledDate: "",
      scheduledTime: "",
      room: "",
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createSessionSchema>) => {
      const proposal = proposals.find(p => p.id === data.proposalId);
      if (!proposal) throw new Error("Proposal not found");
      
      return await apiRequest("POST", "/api/sessions", {
        proposalId: proposal.id,
        speakerId: proposal.userId,
        title: proposal.title,
        description: proposal.description,
        track: proposal.track,
        sessionType: proposal.sessionType,
        duration: proposal.duration,
        scheduledDate: null,
        scheduledTime: null,
        room: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Session created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create session", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const updates: any = {};
      if (data.scheduledDate) {
        updates.scheduledDate = new Date(data.scheduledDate);
      }
      if (data.scheduledTime) {
        updates.scheduledTime = data.scheduledTime;
      }
      if (data.room) {
        updates.room = data.room;
      }
      return await apiRequest("PATCH", `/api/sessions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setIsEditDialogOpen(false);
      setEditingSession(null);
      editForm.reset();
      toast({ title: "Session updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update session", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDeleteSessionId(null);
      toast({ title: "Session deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete session", variant: "destructive" });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bulkScheduleSchema>) => {
      const updates = Array.from(selectedSessions).map(id => ({
        id,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime,
        room: data.room
      }));
      return await apiRequest("POST", "/api/sessions/bulk-update", { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setIsBulkDialogOpen(false);
      setSelectedSessions(new Set());
      bulkForm.reset();
      toast({ title: "Sessions scheduled successfully" });
    },
    onError: () => {
      toast({ title: "Failed to schedule sessions", variant: "destructive" });
    }
  });

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    editForm.reset({
      scheduledDate: session.scheduledDate ? new Date(session.scheduledDate).toISOString().split('T')[0] : "",
      scheduledTime: session.scheduledTime || "",
      room: session.room || "",
    });
    setIsEditDialogOpen(true);
  };

  const toggleSessionSelection = (sessionId: string) => {
    const newSelection = new Set(selectedSessions);
    if (newSelection.has(sessionId)) {
      newSelection.delete(sessionId);
    } else {
      newSelection.add(sessionId);
    }
    setSelectedSessions(newSelection);
  };

  const isScheduled = (session: Session) => {
    return !!(session.scheduledDate && session.scheduledTime && session.room);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Sessions Management</h2>
          <p className="text-muted-foreground">Schedule and organize conference sessions</p>
        </div>
        <div className="flex gap-2">
          {selectedSessions.size > 0 && (
            <Button onClick={() => setIsBulkDialogOpen(true)} variant="outline" data-testid="button-bulk-schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Bulk Schedule ({selectedSessions.size})
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-session">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-session">
              <DialogHeader>
                <DialogTitle>Create Session from Approved Proposal</DialogTitle>
                <DialogDescription>Select an approved proposal to create a session</DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="proposalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approved Proposal</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-proposal">
                              <SelectValue placeholder="Select a proposal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {approvedProposals.length === 0 ? (
                              <SelectItem value="none" disabled>No approved proposals available</SelectItem>
                            ) : (
                              approvedProposals.map((proposal) => (
                                <SelectItem key={proposal.id} value={proposal.id}>
                                  {proposal.title} - {getSpeakerName(proposal.userId)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || approvedProposals.length === 0} data-testid="button-submit-create-session">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Session"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 space-y-3" data-testid={`session-${session.id}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedSessions.has(session.id)}
                      onCheckedChange={() => toggleSessionSelection(session.id)}
                      data-testid={`checkbox-session-${session.id}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-session-title-${session.id}`}>{session.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                          <p className="text-sm text-muted-foreground mt-2" data-testid={`text-speaker-${session.id}`}>
                            Speaker: {getSpeakerName(session.speakerId)}
                          </p>
                        </div>
                        <Badge variant={isScheduled(session) ? "default" : "secondary"} data-testid={`badge-status-${session.id}`}>
                          {isScheduled(session) ? "Scheduled" : "Unscheduled"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                        <Badge variant="outline" data-testid={`badge-track-${session.id}`}>{session.track}</Badge>
                        <Badge variant="outline" data-testid={`badge-type-${session.id}`}>{session.sessionType}</Badge>
                        <span className="text-muted-foreground" data-testid={`text-duration-${session.id}`}>{session.duration} minutes</span>
                        {session.scheduledDate && (
                          <span className="text-muted-foreground flex items-center gap-1" data-testid={`text-date-${session.id}`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(session.scheduledDate).toLocaleDateString()}
                          </span>
                        )}
                        {session.scheduledTime && (
                          <span className="text-muted-foreground flex items-center gap-1" data-testid={`text-time-${session.id}`}>
                            <Clock className="h-3 w-3" />
                            {session.scheduledTime}
                          </span>
                        )}
                        {session.room && (
                          <span className="text-muted-foreground" data-testid={`text-room-${session.id}`}>Room: {session.room}</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(session)} data-testid={`button-edit-${session.id}`}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteSessionId(session.id)} data-testid={`button-delete-${session.id}`}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-session">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>Update session scheduling and room assignment</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => editingSession && updateMutation.mutate({ id: editingSession.id, data }))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 09:00-10:30" {...field} data-testid="input-edit-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Conference Room A" {...field} data-testid="input-edit-room" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-submit-edit-session">
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Session"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Schedule Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent data-testid="dialog-bulk-schedule">
          <DialogHeader>
            <DialogTitle>Bulk Schedule Sessions</DialogTitle>
            <DialogDescription>Schedule {selectedSessions.size} selected sessions</DialogDescription>
          </DialogHeader>
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit((data) => bulkUpdateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={bulkForm.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-bulk-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkForm.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 09:00-10:30" {...field} data-testid="input-bulk-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkForm.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Conference Room A" {...field} data-testid="input-bulk-room" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={bulkUpdateMutation.isPending} data-testid="button-submit-bulk-schedule">
                {bulkUpdateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Schedule ${selectedSessions.size} Sessions`}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent data-testid="dialog-delete-session">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSessionId && deleteMutation.mutate(deleteSessionId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Sponsorship Packages Section
function SponsorshipPackagesSection() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null);
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
  const [benefitsInput, setBenefitsInput] = useState("");

  const { data: packages = [], isLoading } = useQuery<SponsorshipPackage[]>({
    queryKey: ["/api/admin/sponsorship-packages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sponsorship-packages", {
        headers: getAdminHeaders(userData?.id)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const packageFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    tier: z.string().min(1, "Tier is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    currency: z.string().default("EUR"),
    description: z.string().optional(),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1").optional(),
    available: z.boolean().default(true),
    displayOrder: z.coerce.number().default(0),
  });

  const form = useForm<z.infer<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      tier: "",
      price: 0,
      currency: "EUR",
      description: "",
      capacity: undefined,
      available: true,
      displayOrder: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const benefits = benefitsInput.split("\n").filter(b => b.trim() !== "");
      return await apiRequest("POST", "/api/admin/sponsorship-packages", 
        { ...data, benefits }, 
        getAdminHeaders(userData?.id)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorship-packages"] });
      setIsDialogOpen(false);
      form.reset();
      setBenefitsInput("");
      toast({ title: "Sponsorship package created" });
    },
    onError: () => {
      toast({ title: "Failed to create package", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const benefits = benefitsInput.split("\n").filter(b => b.trim() !== "");
      return await apiRequest("PATCH", `/api/admin/sponsorship-packages/${id}`, 
        { ...data, benefits }, 
        getAdminHeaders(userData?.id)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorship-packages"] });
      setIsDialogOpen(false);
      setEditingPackage(null);
      form.reset();
      setBenefitsInput("");
      toast({ title: "Sponsorship package updated" });
    },
    onError: () => {
      toast({ title: "Failed to update package", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/sponsorship-packages/${id}`, undefined, getAdminHeaders(userData?.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorship-packages"] });
      setDeletePackageId(null);
      toast({ title: "Sponsorship package deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete package", variant: "destructive" });
    }
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/sponsorship-packages/${id}`, 
        { available }, 
        getAdminHeaders(userData?.id)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorship-packages"] });
      toast({ title: "Availability updated" });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
      return await apiRequest("PATCH", `/api/admin/sponsorship-packages/${id}`, 
        { displayOrder }, 
        getAdminHeaders(userData?.id)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorship-packages"] });
      toast({ title: "Order updated" });
    }
  });

  const handleEdit = (pkg: SponsorshipPackage) => {
    setEditingPackage(pkg);
    form.reset({
      name: pkg.name,
      tier: pkg.tier,
      price: pkg.price,
      currency: pkg.currency,
      description: pkg.description || "",
      capacity: pkg.capacity || undefined,
      available: pkg.available,
      displayOrder: pkg.displayOrder || 0,
    });
    setBenefitsInput(Array.isArray(pkg.benefits) ? pkg.benefits.join("\n") : "");
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: z.infer<typeof packageFormSchema>) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleMoveUp = (pkg: SponsorshipPackage, index: number) => {
    if (index > 0) {
      reorderMutation.mutate({ id: pkg.id, displayOrder: (pkg.displayOrder || 0) - 1 });
    }
  };

  const handleMoveDown = (pkg: SponsorshipPackage, index: number) => {
    if (index < packages.length - 1) {
      reorderMutation.mutate({ id: pkg.id, displayOrder: (pkg.displayOrder || 0) + 1 });
    }
  };

  const sortedPackages = [...packages].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Sponsorship Packages</h2>
          <p className="text-muted-foreground">Manage sponsor tiers and benefits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPackage(null);
            form.reset();
            setBenefitsInput("");
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-sponsorship-package">
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit" : "Create"} Sponsorship Package</DialogTitle>
              <DialogDescription>Configure sponsor tier, pricing, and benefits</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gold Sponsor" {...field} data-testid="input-package-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., gold, diamond" {...field} data-testid="input-package-tier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (in cents)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500000" {...field} data-testid="input-package-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} data-testid="input-package-capacity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Package description" {...field} data-testid="textarea-package-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Benefits (one per line)</Label>
                  <Textarea
                    placeholder="Logo on website&#10;Premium booth space&#10;Speaking opportunity"
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    rows={6}
                    data-testid="textarea-package-benefits"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-package-order" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Available</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-package-available"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-sponsorship-package"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingPackage ? "Update Package" : "Create Package"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedPackages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sponsorship packages configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPackages.map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className="border rounded-lg p-4 space-y-3" 
                  data-testid={`sponsorship-package-${pkg.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" data-testid={`text-package-name-${pkg.id}`}>
                          {pkg.name}
                        </h3>
                        <Badge variant="outline" data-testid={`text-package-tier-${pkg.id}`}>
                          {pkg.tier}
                        </Badge>
                        <Badge variant={pkg.available ? "default" : "secondary"} data-testid={`text-package-status-${pkg.id}`}>
                          {pkg.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                      )}

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium" data-testid={`text-package-price-${pkg.id}`}>
                            €{(pkg.price / 100).toLocaleString()}
                          </span>
                        </div>
                        {pkg.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground" data-testid={`text-package-capacity-${pkg.id}`}>
                              {pkg.sold || 0}/{pkg.capacity} sold
                            </span>
                          </div>
                        )}
                      </div>

                      {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Benefits:</p>
                          <ul className="text-sm text-muted-foreground space-y-1" data-testid={`list-benefits-${pkg.id}`}>
                            {pkg.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(pkg)}
                          data-testid={`button-edit-package-${pkg.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => setDeletePackageId(pkg.id)}
                          data-testid={`button-delete-package-${pkg.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAvailabilityMutation.mutate({ id: pkg.id, available: !pkg.available })}
                        disabled={toggleAvailabilityMutation.isPending}
                        data-testid={`button-toggle-availability-${pkg.id}`}
                      >
                        {pkg.available ? "Make Unavailable" : "Make Available"}
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveUp(pkg, index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          data-testid={`button-move-up-${pkg.id}`}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveDown(pkg, index)}
                          disabled={index === sortedPackages.length - 1 || reorderMutation.isPending}
                          data-testid={`button-move-down-${pkg.id}`}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePackageId} onOpenChange={() => setDeletePackageId(null)}>
        <AlertDialogContent data-testid="dialog-delete-package">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sponsorship Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sponsorship package? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-package">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePackageId && deleteMutation.mutate(deletePackageId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-package"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Users Section
function UsersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Speakers & Participants</h2>
        <p className="text-muted-foreground">Manage user accounts and roles</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>User management interface</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Team Members Section
function TeamMembersSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team-members"],
    queryFn: async () => {
      const res = await fetch("/api/admin/team-members", {
        headers: getAdminHeaders(userId)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const inviteFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    invitationMessage: z.string().optional(),
  });

  const editFormSchema = z.object({
    role: z.string().min(1, "Role is required"),
    status: z.string().min(1, "Status is required"),
  });

  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "",
      invitationMessage: "You've been invited to join the West African Design Forum team! We're excited to have you collaborate with us.",
    },
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      role: "",
      status: "",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inviteFormSchema>) => {
      return await apiRequest("POST", "/api/admin/team-members/invite", data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      toast({ title: "Team member invited successfully" });
      setInviteDialogOpen(false);
      inviteForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to invite team member", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof editFormSchema> }) => {
      return await apiRequest("PATCH", `/api/admin/team-members/${id}`, data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      toast({ title: "Team member updated successfully" });
      setEditDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update team member", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/team-members/${id}`, undefined, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      toast({ title: "Team member removed successfully" });
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove team member", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    editForm.reset({
      role: member.role,
      status: member.status,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "invited":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Team Members</h2>
          <p className="text-muted-foreground">Manage organizers and evaluators</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-team-member">
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-invite-team-member">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member
              </DialogDescription>
            </DialogHeader>
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit((data) => inviteMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="member@example.com" {...field} data-testid="input-invite-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inviteForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-invite-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inviteForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-invite-role">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="organizer">Organizer</SelectItem>
                          <SelectItem value="evaluator">Evaluator</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="content-manager">Content Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inviteForm.control}
                  name="invitationMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Custom invitation message..." 
                          {...field} 
                          rows={4}
                          data-testid="textarea-invite-message" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={inviteMutation.isPending}
                  data-testid="button-send-invitation"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4" data-testid={`team-member-${member.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid={`text-member-name-${member.id}`}>{member.name}</h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-member-email-${member.id}`}>{member.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" data-testid={`badge-member-role-${member.id}`}>{member.role}</Badge>
                        <Badge variant={getStatusBadgeVariant(member.status)} data-testid={`badge-member-status-${member.id}`}>
                          {member.status}
                        </Badge>
                      </div>
                      {member.invitedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Invited {new Date(member.invitedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                        data-testid={`button-edit-member-${member.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(member)}
                        data-testid={`button-delete-member-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-team-member">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role and status for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => selectedMember && updateMutation.mutate({ id: selectedMember.id, data }))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="evaluator">Evaluator</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="content-manager">Content Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={updateMutation.isPending}
                data-testid="button-save-member"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-team-member">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-member">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMember && deleteMutation.mutate(selectedMember.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-member"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Page Visibility Section
function PageVisibilitySection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useQuery<PageSetting[]>({
    queryKey: ["/api/admin/page-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/page-settings", {
        headers: getAdminHeaders(userId)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ pageName, isVisible }: { pageName: string; isVisible: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/page-settings/${pageName}`, { isVisible }, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-settings"] });
      toast({ title: "Page visibility updated" });
    }
  });

  const pages = [
    { name: "about", label: "About Page" },
    { name: "tickets", label: "Tickets Page" },
    { name: "cfp", label: "Call for Proposals" },
    { name: "sponsors", label: "Sponsors Page" },
    { name: "agenda", label: "Agenda Page" },
    { name: "network", label: "Networking Page" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Page Visibility</h2>
        <p className="text-muted-foreground">Control which pages are visible to users</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {pages.map((page) => {
              const setting = settings.find(s => s.pageName === page.name);
              const isVisible = setting?.isVisible ?? true;
              
              return (
                <div key={page.name} className="flex items-center justify-between border rounded-lg p-4" data-testid={`page-${page.name}`}>
                  <div>
                    <h3 className="font-semibold">{page.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isVisible ? "Visible to all users" : "Hidden from users"}
                    </p>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) => updateMutation.mutate({ pageName: page.name, isVisible: checked })}
                    data-testid={`switch-${page.name}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// CFP Settings Section
function CfpSettingsSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<CfpSetting>({
    queryKey: ["/api/admin/cfp-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cfp-settings", {
        headers: getAdminHeaders(userId)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const [formData, setFormData] = useState({
    isActive: false,
    placeholderTitle: "",
    placeholderMessage: "",
    submissionGuidelines: "",
    evaluationCriteria: [] as Array<{ name: string; description: string }>,
    allowedTracks: [] as string[],
    allowedSessionTypes: [] as string[],
    minDuration: 15,
    maxDuration: 90,
    startDate: null as Date | null,
    endDate: null as Date | null
  });

  const [criterionInput, setCriterionInput] = useState({ name: "", description: "" });
  const [trackInput, setTrackInput] = useState("");
  const [sessionTypeInput, setSessionTypeInput] = useState("");

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        isActive: settings.isActive || false,
        placeholderTitle: settings.placeholderTitle || "",
        placeholderMessage: settings.placeholderMessage || "",
        submissionGuidelines: settings.submissionGuidelines || "",
        evaluationCriteria: Array.isArray(settings.evaluationCriteria) ? settings.evaluationCriteria : [],
        allowedTracks: Array.isArray(settings.allowedTracks) ? settings.allowedTracks : [],
        allowedSessionTypes: Array.isArray(settings.allowedSessionTypes) ? settings.allowedSessionTypes : [],
        minDuration: settings.minDuration || 15,
        maxDuration: settings.maxDuration || 90,
        startDate: settings.startDate ? new Date(settings.startDate) : null,
        endDate: settings.endDate ? new Date(settings.endDate) : null
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/admin/cfp-settings", data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cfp-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cfp-settings"] });
      toast({ title: "CFP settings updated" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  });

  const addCriterion = () => {
    if (criterionInput.name && criterionInput.description) {
      setFormData({
        ...formData,
        evaluationCriteria: [...formData.evaluationCriteria, criterionInput]
      });
      setCriterionInput({ name: "", description: "" });
    }
  };

  const removeCriterion = (index: number) => {
    setFormData({
      ...formData,
      evaluationCriteria: formData.evaluationCriteria.filter((_, i) => i !== index)
    });
  };

  const addTrack = () => {
    if (trackInput && !formData.allowedTracks.includes(trackInput)) {
      setFormData({
        ...formData,
        allowedTracks: [...formData.allowedTracks, trackInput]
      });
      setTrackInput("");
    }
  };

  const removeTrack = (track: string) => {
    setFormData({
      ...formData,
      allowedTracks: formData.allowedTracks.filter(t => t !== track)
    });
  };

  const addSessionType = () => {
    if (sessionTypeInput && !formData.allowedSessionTypes.includes(sessionTypeInput)) {
      setFormData({
        ...formData,
        allowedSessionTypes: [...formData.allowedSessionTypes, sessionTypeInput]
      });
      setSessionTypeInput("");
    }
  };

  const removeSessionType = (type: string) => {
    setFormData({
      ...formData,
      allowedSessionTypes: formData.allowedSessionTypes.filter(t => t !== type)
    });
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">CFP Settings</h2>
        <p className="text-muted-foreground">Configure Call for Proposals</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* CFP Status */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">CFP Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.isActive ? "Accepting proposals" : "Closed for submissions"}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-cfp-active"
                />
              </div>

              {/* Placeholder Content */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="placeholder-title">Placeholder Title</Label>
                  <Input
                    id="placeholder-title"
                    value={formData.placeholderTitle}
                    onChange={(e) => setFormData({ ...formData, placeholderTitle: e.target.value })}
                    placeholder="Call for Proposals Opening Soon"
                    data-testid="input-cfp-title"
                  />
                </div>
                <div>
                  <Label htmlFor="placeholder-message">Placeholder Message</Label>
                  <Textarea
                    id="placeholder-message"
                    value={formData.placeholderMessage}
                    onChange={(e) => setFormData({ ...formData, placeholderMessage: e.target.value })}
                    placeholder="We'll be opening our Call for Proposals soon..."
                    rows={3}
                    data-testid="textarea-cfp-message"
                  />
                </div>
              </div>

              {/* CFP Period */}
              <div className="space-y-4">
                <h3 className="font-semibold">CFP Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
                      data-testid="input-cfp-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
                      data-testid="input-cfp-end-date"
                    />
                  </div>
                </div>
              </div>

              {/* Submission Guidelines */}
              <div>
                <Label htmlFor="guidelines">Submission Guidelines</Label>
                <Textarea
                  id="guidelines"
                  value={formData.submissionGuidelines}
                  onChange={(e) => setFormData({ ...formData, submissionGuidelines: e.target.value })}
                  placeholder="Enter guidelines for speakers submitting proposals..."
                  rows={4}
                  data-testid="textarea-cfp-guidelines"
                />
              </div>

              {/* Evaluation Criteria */}
              <div className="space-y-4">
                <h3 className="font-semibold">Evaluation Criteria</h3>
                {formData.evaluationCriteria.length > 0 && (
                  <div className="space-y-2">
                    {formData.evaluationCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 border rounded-lg" data-testid={`criterion-${index}`}>
                        <div className="flex-1">
                          <div className="font-medium">{criterion.name}</div>
                          <div className="text-sm text-muted-foreground">{criterion.description}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCriterion(index)}
                          data-testid={`button-remove-criterion-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Input
                    placeholder="Criterion name (e.g., Relevance)"
                    value={criterionInput.name}
                    onChange={(e) => setCriterionInput({ ...criterionInput, name: e.target.value })}
                    data-testid="input-criterion-name"
                  />
                  <Input
                    placeholder="Criterion description"
                    value={criterionInput.description}
                    onChange={(e) => setCriterionInput({ ...criterionInput, description: e.target.value })}
                    data-testid="input-criterion-description"
                  />
                  <Button onClick={addCriterion} variant="outline" className="w-full" data-testid="button-add-criterion">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criterion
                  </Button>
                </div>
              </div>

              {/* Allowed Tracks */}
              <div className="space-y-4">
                <h3 className="font-semibold">Allowed Tracks</h3>
                {formData.allowedTracks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.allowedTracks.map((track, index) => (
                      <Badge key={index} variant="secondary" className="gap-1" data-testid={`track-badge-${index}`}>
                        {track}
                        <button onClick={() => removeTrack(track)} className="ml-1 hover:text-destructive" data-testid={`button-remove-track-${index}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add track (e.g., Design Thinking)"
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrack())}
                    data-testid="input-track"
                  />
                  <Button onClick={addTrack} variant="outline" data-testid="button-add-track">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Allowed Session Types */}
              <div className="space-y-4">
                <h3 className="font-semibold">Allowed Session Types</h3>
                {formData.allowedSessionTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.allowedSessionTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="gap-1" data-testid={`session-type-badge-${index}`}>
                        {type}
                        <button onClick={() => removeSessionType(type)} className="ml-1 hover:text-destructive" data-testid={`button-remove-session-type-${index}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add session type (e.g., Workshop)"
                    value={sessionTypeInput}
                    onChange={(e) => setSessionTypeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSessionType())}
                    data-testid="input-session-type"
                  />
                  <Button onClick={addSessionType} variant="outline" data-testid="button-add-session-type">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Duration Limits */}
              <div className="space-y-4">
                <h3 className="font-semibold">Duration Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-duration">Min Duration (minutes)</Label>
                    <Input
                      id="min-duration"
                      type="number"
                      value={formData.minDuration}
                      onChange={(e) => setFormData({ ...formData, minDuration: parseInt(e.target.value) || 15 })}
                      data-testid="input-cfp-min-duration"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-duration">Max Duration (minutes)</Label>
                    <Input
                      id="max-duration"
                      type="number"
                      value={formData.maxDuration}
                      onChange={(e) => setFormData({ ...formData, maxDuration: parseInt(e.target.value) || 90 })}
                      data-testid="input-cfp-max-duration"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-testid="button-save-cfp-settings"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save CFP Settings"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tasks Section
function TasksSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/admin/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tasks", {
        headers: getAdminHeaders(userId)
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Tasks</h2>
          <p className="text-muted-foreground">Manage team tasks and assignments</p>
        </div>
        <Button data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4" data-testid={`task-${task.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={task.priority === "urgent" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === "completed" ? "default" : "outline"}>
                          {task.status}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Settings</h2>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>General settings interface</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
