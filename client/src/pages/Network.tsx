import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Check, X, MessageSquare, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Connection } from "@shared/schema";

export default function Network() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: connections = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections", userData?.id],
    enabled: !!userData?.id,
  });

  const { data: receivedRequests = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections/received", userData?.id],
    enabled: !!userData?.id,
  });

  const sendConnectionMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      return apiRequest("POST", "/api/connections", {
        requesterId: userData?.id,
        addresseeId,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection request sent",
        description: "Your request has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: string }) => {
      return apiRequest("PATCH", `/api/connections/${connectionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection updated",
        description: "Connection status has been updated.",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    if (user.id === userData?.id) return false;
    
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getConnectionStatus = (userId: string) => {
    const connection = connections.find(
      (c) => 
        (c.requesterId === userData?.id && c.addresseeId === userId) ||
        (c.addresseeId === userData?.id && c.requesterId === userId)
    );
    return connection;
  };

  const myConnections = connections.filter(
    (c) => 
      c.status === "accepted" &&
      (c.requesterId === userData?.id || c.addresseeId === userData?.id)
  );

  const connectedUserIds = new Set(
    myConnections.map((c) => 
      c.requesterId === userData?.id ? c.addresseeId : c.requesterId
    )
  );

  const connectedUsers = users.filter((u) => connectedUserIds.has(u.id));

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Networking Hub</h1>
          <p className="text-muted-foreground">
            Connect with fellow attendees, speakers, and sponsors
          </p>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="discover" data-testid="tab-discover">
              <Search className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="connections" data-testid="tab-connections">
              <Users className="h-4 w-4 mr-2" />
              Connections ({connectedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests ({receivedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-role-filter">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="speaker">Speaker</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => {
                const connection = getConnectionStatus(user.id);
                const isPending = connection?.status === "pending";
                const isConnected = connection?.status === "accepted";
                const isSentByMe = connection?.requesterId === userData?.id;

                return (
                  <Card key={user.id} data-testid={`user-card-${user.id}`}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                          <CardDescription className="truncate">{user.email}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      
                      {isConnected ? (
                        <Button 
                          className="w-full" 
                          variant="secondary"
                          data-testid={`button-message-${user.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      ) : isPending ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled
                          data-testid={`button-pending-${user.id}`}
                        >
                          {isSentByMe ? "Request Sent" : "Request Received"}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => sendConnectionMutation.mutate(user.id)}
                          disabled={sendConnectionMutation.isPending}
                          data-testid={`button-connect-${user.id}`}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedUsers.map((user) => (
                <Card key={user.id} data-testid={`connected-user-${user.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                        <CardDescription className="truncate">{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <Button 
                      className="w-full"
                      variant="default"
                      data-testid={`button-message-connected-${user.id}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {connectedUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No connections yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {receivedRequests.map((request) => {
                const sender = users.find((u) => u.id === request.requesterId);
                if (!sender) return null;

                return (
                  <Card key={request.id} data-testid={`request-card-${request.id}`}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(sender.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{sender.name}</CardTitle>
                          <CardDescription className="truncate">{sender.email}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{sender.role}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => 
                            updateConnectionMutation.mutate({
                              connectionId: request.id,
                              status: "accepted",
                            })
                          }
                          disabled={updateConnectionMutation.isPending}
                          data-testid={`button-accept-${request.id}`}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => 
                            updateConnectionMutation.mutate({
                              connectionId: request.id,
                              status: "rejected",
                            })
                          }
                          disabled={updateConnectionMutation.isPending}
                          data-testid={`button-reject-${request.id}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {receivedRequests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
