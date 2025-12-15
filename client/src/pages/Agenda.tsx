import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Star, CheckCircle2, Circle, Loader2, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Session, Attendance } from "@shared/schema";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { downloadICS, getGoogleCalendarUrl, getOutlookCalendarUrl } from "@/utils/calendar";

// Mock data for development
const mockSessions = [
  {
    id: "1",
    title: "The Future of Africa Design Systems",
    description: "Explore how design systems can empower Africa tech companies to build consistent, scalable products.",
    track: "design-thinking",
    sessionType: "talk",
    duration: 45,
    scheduledDate: "2026-06-15",
    scheduledTime: "09:00-09:45",
    room: "Main Hall",
    speaker: { name: "Amara Okonkwo", role: "Lead Designer, Andela" },
    averageRating: 4.5,
    totalRatings: 28
  },
  {
    id: "2",
    title: "Building Innovation Ecosystems in West Africa",
    description: "A panel discussion on fostering innovation and supporting startups across the region.",
    track: "innovation",
    sessionType: "panel",
    duration: 60,
    scheduledDate: "2026-06-15",
    scheduledTime: "10:00-11:00",
    room: "Conference Room A",
    speaker: { name: "Dr. Ben Adekunle", role: "Professor, University of Lagos" },
    averageRating: 4.8,
    totalRatings: 42
  },
  {
    id: "3",
    title: "Hands-on: Figma for Africa Design Teams",
    description: "Interactive workshop on leveraging Figma for collaborative design in distributed teams.",
    track: "technology",
    sessionType: "workshop",
    duration: 90,
    scheduledDate: "2026-06-15",
    scheduledTime: "14:00-15:30",
    room: "Workshop Space",
    speaker: { name: "Chidinma Nwosu", role: "Product Designer, Flutterwave" },
    averageRating: null,
    totalRatings: 0
  }
];

const trackColors: Record<string, string> = {
  "design-thinking": "bg-primary/10 text-primary border-primary/20",
  "innovation": "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "technology": "bg-chart-4/10 text-chart-4 border-chart-4/20",
  "culture": "bg-chart-5/10 text-chart-5 border-chart-5/20"
};

export default function Agenda() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("2026-06-15");
  const [attendedSessions, setAttendedSessions] = useState<Set<string>>(new Set());

  // TODO: Replace with actual API call
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/sessions", selectedDay, selectedTrack],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSessions.filter(s => 
        s.scheduledDate === selectedDay &&
        (selectedTrack === "all" || s.track === selectedTrack)
      );
    }
  });

  const toggleAttendance = (sessionId: string) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark session attendance.",
        variant: "destructive",
      });
      return;
    }

    const newAttended = new Set(attendedSessions);
    if (newAttended.has(sessionId)) {
      newAttended.delete(sessionId);
      toast({
        title: "Attendance removed",
        description: "This session has been unmarked.",
      });
    } else {
      newAttended.add(sessionId);
      toast({
        title: "Attendance marked",
        description: "This session will be included in your certificate.",
      });
    }
    setAttendedSessions(newAttended);
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Conference <span className="text-primary">Agenda</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore sessions, build your personalized schedule, and mark your attendance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger data-testid="select-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-06-15">Day 1 - June 15</SelectItem>
                <SelectItem value="2026-06-16">Day 2 - June 16</SelectItem>
                <SelectItem value="2026-06-17">Day 3 - June 17</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger data-testid="select-track">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                <SelectItem value="design-thinking">Design Thinking</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="culture">Culture & Heritage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sessions */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-6">
            {sessions.map((session) => {
              const isAttended = attendedSessions.has(session.id);
              
              return (
                <Card 
                  key={session.id} 
                  className="hover-elevate transition-all"
                  data-testid={`card-session-${session.id}`}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={trackColors[session.track]}>
                          {session.track.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                        </Badge>
                        <Badge variant="outline">
                          {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)}
                        </Badge>
                        {session.averageRating && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-chart-5 text-chart-5" />
                            <span>{session.averageRating.toFixed(1)}</span>
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant={isAttended ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAttendance(session.id)}
                        className="gap-2"
                        data-testid={`button-attend-${session.id}`}
                      >
                        {isAttended ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Attending
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4" />
                            Mark Attendance
                          </>
                        )}
                      </Button>
                    </div>
                    <CardTitle className="text-2xl">{session.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {session.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.scheduledTime} ({session.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.room}</span>
                      </div>
                      {session.totalRatings > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {session.totalRatings} ratings
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {session.speaker.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{session.speaker.name}</div>
                        <div className="text-sm text-muted-foreground">{session.speaker.role}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            data-testid={`button-add-calendar-${session.id}`}
                          >
                            <CalendarPlus className="h-4 w-4" />
                            Add to Calendar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => window.open(getGoogleCalendarUrl(session as unknown as Session), '_blank')}
                            data-testid={`menu-google-calendar-${session.id}`}
                          >
                            Google Calendar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(getOutlookCalendarUrl(session as unknown as Session), '_blank')}
                            data-testid={`menu-outlook-calendar-${session.id}`}
                          >
                            Outlook Calendar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => downloadICS(session as unknown as Session)}
                            data-testid={`menu-download-ics-${session.id}`}
                          >
                            Download .ics File
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No sessions scheduled</CardTitle>
              <CardDescription>
                Check back later or select a different day/track
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {currentUser && attendedSessions.size > 0 && (
          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle>Your Attendance</CardTitle>
              <CardDescription>
                You've marked {attendedSessions.size} session{attendedSessions.size !== 1 ? "s" : ""}. 
                These will be included in your certificate.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
