import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations", userData?.id],
    enabled: !!userData?.id,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/messages", {
        conversationId: selectedConversation,
        senderId: userData?.id,
        content: text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = 
      conversation.participant1Id === userData?.id 
        ? conversation.participant2Id 
        : conversation.participant1Id;
    return users.find((u) => u.id === otherUserId);
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

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );
  const selectedUser = selectedConversationData 
    ? getOtherParticipant(selectedConversationData)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your connections
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <h2 className="font-semibold">Conversations</h2>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-5rem)]">
              <div className="p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    if (!otherUser) return null;

                    const isSelected = selectedConversation === conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors hover-elevate ${
                          isSelected ? "bg-muted" : ""
                        }`}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(otherUser.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{otherUser.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {otherUser.role}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedConversation && selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{selectedUser.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="h-[calc(100%-12rem)] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMine = message.senderId === userData?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${message.id}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMine
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {message.createdAt
                                ? formatDistanceToNow(new Date(message.createdAt), {
                                    addSuffix: true,
                                  })
                                : "Just now"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <CardContent className="border-t pt-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
