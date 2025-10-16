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
  CfpSetting 
} from "@shared/schema";

type AdminSection = 
  | "overview" 
  | "proposals" 
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Sessions Management</h2>
        <p className="text-muted-foreground">Schedule and organize conference sessions</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Session scheduling interface</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sponsorship Packages Section
function SponsorshipPackagesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">Sponsorship Packages</h2>
        <p className="text-muted-foreground">Manage sponsor tiers and benefits</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sponsorship package management</p>
          </div>
        </CardContent>
      </Card>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2">Team Members</h2>
          <p className="text-muted-foreground">Manage organizers and evaluators</p>
        </div>
        <Button data-testid="button-add-team-member">
          <Plus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
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
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <Badge className="mt-2" variant="secondary">{member.role}</Badge>
                    </div>
                    <Badge variant={member.status === "active" ? "default" : "outline"}>
                      {member.status}
                    </Badge>
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

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/admin/cfp-settings", data, getAdminHeaders(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cfp-settings"] });
      toast({ title: "CFP settings updated" });
    }
  });

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
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">CFP Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {settings?.isActive ? "Accepting proposals" : "Closed for submissions"}
                  </p>
                </div>
                <Switch
                  checked={settings?.isActive || false}
                  onCheckedChange={(checked) => updateMutation.mutate({ isActive: checked })}
                  data-testid="switch-cfp-active"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Placeholder Title</Label>
                  <Input
                    defaultValue={settings?.placeholderTitle || ""}
                    placeholder="Call for Proposals Opening Soon"
                    data-testid="input-cfp-title"
                  />
                </div>
                <div>
                  <Label>Placeholder Message</Label>
                  <Textarea
                    defaultValue={settings?.placeholderMessage || ""}
                    placeholder="We'll be opening our Call for Proposals soon..."
                    data-testid="textarea-cfp-message"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Duration (minutes)</Label>
                    <Input
                      type="number"
                      defaultValue={settings?.minDuration || 15}
                      data-testid="input-cfp-min-duration"
                    />
                  </div>
                  <div>
                    <Label>Max Duration (minutes)</Label>
                    <Input
                      type="number"
                      defaultValue={settings?.maxDuration || 90}
                      data-testid="input-cfp-max-duration"
                    />
                  </div>
                </div>
                <Button className="w-full" data-testid="button-save-cfp-settings">
                  Save CFP Settings
                </Button>
              </div>
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
