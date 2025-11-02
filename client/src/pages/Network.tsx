import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  UserPlus, 
  Check, 
  X, 
  MoreHorizontal,
  Image as ImageIcon,
  Users,
  Trash2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { User, Connection, Post, PostLike, PostComment, Conversation, Message } from "@shared/schema";

interface PostWithUser extends Post {
  user?: User;
  isLiked?: boolean;
  comments?: CommentWithUser[];
}

interface CommentWithUser extends PostComment {
  user?: User;
}

interface ConversationWithUser extends Conversation {
  otherUser?: User;
  lastMessage?: Message;
  unreadCount?: number;
}

export default function Network() {
  const { t } = useTranslation("network");
  const { userData } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: connections = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections", userData?.id],
    enabled: !!userData?.id,
  });

  const { data: receivedRequests = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections/received", userData?.id],
    enabled: !!userData?.id,
  });

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations/user", userData?.id],
    enabled: !!userData?.id,
  });

  const { data: currentMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedConversation?.id],
    enabled: !!selectedConversation?.id,
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/posts", {
        userId: userData?.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast({
        title: "Post created",
        description: "Your post has been shared successfully",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest("POST", `/api/posts/${postId}/like`, {}, {
        headers: { 'x-user-id': userData?.id || '' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiRequest("POST", `/api/posts/${postId}/comments`, {
        userId: userData?.id,
        content,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCommentInputs({ ...commentInputs, [variables.postId]: "" });
    },
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
        description: "Your request has been sent successfully",
      });
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: string }) => {
      return apiRequest("PATCH", `/api/connections/${connectionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return apiRequest("POST", "/api/messages", {
        conversationId,
        senderId: userData?.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/user", userData?.id] });
      setMessageInput("");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest("DELETE", `/api/posts/${postId}`, {}, {
        headers: { 'x-user-id': userData?.id || '' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
    },
  });

  const postsWithUsers: PostWithUser[] = posts.map((post) => {
    const user = users.find((u) => u.id === post.userId);
    return { ...post, user };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const conversationsWithUsers: ConversationWithUser[] = conversations.map((conv) => {
    const otherUserId = conv.participant1Id === userData?.id ? conv.participant2Id : conv.participant1Id;
    const otherUser = users.find((u) => u.id === otherUserId);
    return { ...conv, otherUser };
  });

  const getConnectionStatus = (userId: string) => {
    return connections.find(
      (c) => 
        (c.requesterId === userData?.id && c.addresseeId === userId) ||
        (c.addresseeId === userData?.id && c.requesterId === userId)
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageInput,
    });
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const existingConv = conversationsWithUsers.find(
        (c) => c.participant1Id === userId || c.participant2Id === userId
      );
      
      if (existingConv) {
        setSelectedConversation(existingConv);
        setActiveTab("messages");
      } else {
        const newConv = await apiRequest("POST", "/api/conversations", {
          participant1Id: userData?.id,
          participant2Id: userId,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/conversations/user", userData?.id] });
        setSelectedConversation(newConv as ConversationWithUser);
        setActiveTab("messages");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">WADF Network</h1>
          <p className="text-muted-foreground">
            Connect, share, and engage with the design community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-network">
                <TabsTrigger value="feed" data-testid="tab-feed">Feed</TabsTrigger>
                <TabsTrigger value="connections" data-testid="tab-connections">
                  Connections
                  {receivedRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2 rounded-full px-2 py-0.5 text-xs">
                      {receivedRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(userData?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="What's on your mind?"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="min-h-[100px] resize-none"
                          data-testid="input-new-post"
                        />
                        <div className="flex justify-between items-center mt-4">
                          <Button variant="ghost" size="sm" disabled data-testid="button-add-image">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Photo
                          </Button>
                          <Button
                            onClick={() => createPostMutation.mutate(newPostContent)}
                            disabled={!newPostContent.trim() || createPostMutation.isPending}
                            data-testid="button-create-post"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {postsLoading ? (
                  <div className="text-center py-12">Loading posts...</div>
                ) : postsWithUsers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                    </CardContent>
                  </Card>
                ) : (
                  postsWithUsers.map((post) => (
                    <Card key={post.id} data-testid={`post-${post.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(post.user?.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{post.user?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          {post.userId === userData?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePostMutation.mutate(post.id)}
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likePostMutation.mutate(post.id)}
                            className="gap-2"
                            data-testid={`button-like-${post.id}`}
                          >
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likesCount || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                            className="gap-2"
                            data-testid={`button-comments-${post.id}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentsCount || 0}</span>
                          </Button>
                        </div>

                        {showComments[post.id] && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="flex gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(userData?.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Write a comment..."
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                  data-testid={`input-comment-${post.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => createCommentMutation.mutate({
                                    postId: post.id,
                                    content: commentInputs[post.id] || "",
                                  })}
                                  disabled={!commentInputs[post.id]?.trim()}
                                  data-testid={`button-send-comment-${post.id}`}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                {receivedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Connection Requests</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {receivedRequests.map((request) => {
                        const requester = users.find((u) => u.id === request.requesterId);
                        return (
                          <div key={request.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{getInitials(requester?.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{requester?.name}</div>
                                <div className="text-sm text-muted-foreground">{requester?.email}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateConnectionMutation.mutate({
                                  connectionId: request.id,
                                  status: "accepted",
                                })}
                                data-testid={`button-accept-${request.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateConnectionMutation.mutate({
                                  connectionId: request.id,
                                  status: "rejected",
                                })}
                                data-testid={`button-reject-${request.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">All Attendees</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.filter((u) => u.id !== userData?.id).map((user) => {
                      const connection = getConnectionStatus(user.id);
                      const isConnected = connection?.status === "accepted";
                      const isPending = connection?.status === "pending";

                      return (
                        <div key={user.id} className="flex items-center justify-between" data-testid={`user-${user.id}`}>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isConnected ? (
                              <>
                                <Badge variant="secondary">Connected</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartConversation(user.id)}
                                  data-testid={`button-message-${user.id}`}
                                >
                                  Message
                                </Button>
                              </>
                            ) : isPending ? (
                              <Badge variant="outline">Pending</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => sendConnectionMutation.mutate(user.id)}
                                data-testid={`button-connect-${user.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <h3 className="font-semibold">Conversations</h3>
                    </CardHeader>
                    <ScrollArea className="h-[500px]">
                      <CardContent className="space-y-2">
                        {conversationsWithUsers.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No conversations yet
                          </p>
                        ) : (
                          conversationsWithUsers.map((conv) => (
                            <Button
                              key={conv.id}
                              variant={selectedConversation?.id === conv.id ? "secondary" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setSelectedConversation(conv)}
                              data-testid={`conversation-${conv.id}`}
                            >
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>{getInitials(conv.otherUser?.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-left flex-1">
                                <div className="font-semibold text-sm">{conv.otherUser?.name}</div>
                              </div>
                            </Button>
                          ))
                        )}
                      </CardContent>
                    </ScrollArea>
                  </Card>

                  <Card className="md:col-span-2">
                    {selectedConversation ? (
                      <>
                        <CardHeader className="border-b">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(selectedConversation.otherUser?.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{selectedConversation.otherUser?.name}</h3>
                              <p className="text-sm text-muted-foreground">{selectedConversation.otherUser?.role}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <ScrollArea className="h-[400px] p-4">
                          <div className="space-y-4">
                            {currentMessages.map((message) => {
                              const isMine = message.senderId === userData?.id;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                  data-testid={`message-${message.id}`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                      isMine
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        <CardContent className="border-t pt-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                              data-testid="input-message"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageInput.trim() || sendMessageMutation.isPending}
                              data-testid="button-send-message"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Select a conversation to start messaging</p>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Your Network
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{connectedUsers.length}</div>
                <p className="text-sm text-muted-foreground">Connected attendees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Connections</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {connectedUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                    </div>
                  </div>
                ))}
                {connectedUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No connections yet. Start connecting with attendees!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
