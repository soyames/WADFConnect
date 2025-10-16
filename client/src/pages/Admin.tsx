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
  Award
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Admin() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (userData && userData.role !== "organizer" && userData.role !== "admin") {
      setLocation("/");
    }
  }, [userData, setLocation]);

  if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
    return null;
  }

  const stats = [
    {
      title: "Total Revenue",
      value: "€47,500",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-chart-3"
    },
    {
      title: "Tickets Sold",
      value: "247",
      change: "+23",
      icon: Ticket,
      color: "text-primary"
    },
    {
      title: "Proposals",
      value: "68",
      change: "12 pending",
      icon: FileText,
      color: "text-chart-4"
    },
    {
      title: "Avg. Rating",
      value: "4.7",
      change: "From 42 sessions",
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
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Proposal management interface will be implemented here</p>
                  <p className="text-sm mt-2">Accept, reject, and schedule proposals</p>
                </div>
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
