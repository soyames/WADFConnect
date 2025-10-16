import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Ticket,
  DollarSign,
  Star,
  TrendingUp,
  MessageSquare,
  FileText,
  Award,
  Check,
  X,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Proposal } from "@shared/schema";

export default function Admin() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (userData && userData.role !== "organizer" && userData.role !== "admin") {
      setLocation("/");
    }
  }, [userData, setLocation]);

  // Fetch real stats
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

  // Fetch proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    enabled: userData?.role === "organizer" || userData?.role === "admin"
  });

  // Review proposal mutation
  const reviewProposal = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string }) => {
      const response = await fetch(`/api/proposals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes })
      });
      if (!response.ok) throw new Error("Failed to update proposal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Proposal updated",
        description: "The proposal status has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update proposal status.",
        variant: "destructive"
      });
    }
  });

  if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
    return null;
  }

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
    <div className="min-h-screen py-8 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-4xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-primary/10">
              {userData.role}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage all aspects of WADF 2025
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="proposals" data-testid="tab-proposals">Proposals</TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-tickets">Tickets</TabsTrigger>
            <TabsTrigger value="sponsors" data-testid="tab-sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">Sessions</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            <Card>
              <CardHeader>
                <CardTitle>Session Proposals</CardTitle>
                <CardDescription>
                  Review and manage speaker submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {proposalsLoading ? (
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
                          <Badge 
                            variant={
                              proposal.status === "accepted" ? "default" : 
                              proposal.status === "rejected" ? "destructive" : 
                              "outline"
                            }
                            data-testid={`badge-status-${proposal.id}`}
                          >
                            {proposal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">{proposal.track}</Badge>
                          <Badge variant="secondary">{proposal.sessionType}</Badge>
                          <span className="text-muted-foreground">{proposal.duration} minutes</span>
                        </div>
                        {proposal.status === "submitted" || proposal.status === "under-review" ? (
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
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales</CardTitle>
                <CardDescription>
                  Monitor and manage attendee registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ticket management interface will be implemented here</p>
                  <p className="text-sm mt-2">View sales, issue refunds, manage tiers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <Card>
              <CardHeader>
                <CardTitle>Sponsorships</CardTitle>
                <CardDescription>
                  Manage sponsor relationships and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sponsor management interface will be implemented here</p>
                  <p className="text-sm mt-2">Track payments, deliver benefits, manage logos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Conference Sessions</CardTitle>
                <CardDescription>
                  Schedule and organize the conference agenda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Session scheduling interface will be implemented here</p>
                  <p className="text-sm mt-2">Assign times, rooms, and manage agenda</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User management interface will be implemented here</p>
                  <p className="text-sm mt-2">View users, assign roles, manage permissions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
