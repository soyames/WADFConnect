import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Session, Attendance } from "@shared/schema";

export default function Certificate() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userData) {
      setLocation("/");
    }
  }, [userData, setLocation]);

  // Fetch user's attendance records
  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/user", userData?.id],
    enabled: !!userData?.id
  });

  // Fetch all sessions to get details
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    enabled: !!userData?.id
  });

  // Fetch existing certificate
  const { data: existingCertificate, isLoading: certLoading } = useQuery({
    queryKey: ["/api/certificates/user", userData?.id],
    enabled: !!userData?.id
  });

  // Create certificate mutation
  const createCertificate = useMutation({
    mutationFn: async (certificateData: { userId: string; certificateUrl: string; sessionsAttended: number }) => {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certificateData),
      });
      if (!response.ok) throw new Error("Failed to create certificate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates/user", userData?.id] });
      toast({
        title: "Certificate Generated",
        description: "Your certificate has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const attendedSessions = sessions.filter(session =>
    attendance.some(a => a.sessionId === session.id)
  );

  const generatePDF = async () => {
    if (!certificateRef.current || !userData) return;

    setIsGenerating(true);

    try {
      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF
      const fileName = `WADF_2025_Certificate_${userData.name.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);

      // Save certificate record to database
      if (!existingCertificate) {
        await createCertificate.mutateAsync({
          userId: userData.id,
          certificateUrl: fileName,
          sessionsAttended: attendedSessions.length,
        });
      }

      toast({
        title: "Success",
        description: "Certificate downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (attendanceLoading || certLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-certificate" />
      </div>
    );
  }

  if (attendedSessions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Certificate Available</h2>
            <p className="text-muted-foreground mb-6">
              You need to attend at least one session to receive a certificate.
            </p>
            <Button onClick={() => setLocation("/agenda")} data-testid="button-view-agenda">
              View Agenda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Certificate</h1>
          <p className="text-muted-foreground mb-6">
            Congratulations on attending {attendedSessions.length} session{attendedSessions.length !== 1 ? 's' : ''} at WADF 2025!
          </p>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            size="lg"
            data-testid="button-download-certificate"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </>
            )}
          </Button>
        </div>

        {/* Certificate Design */}
        <div
          ref={certificateRef}
          className="bg-white p-16 rounded-lg shadow-2xl"
          style={{ aspectRatio: "297/210" }}
        >
          <div className="border-8 border-double border-primary/20 h-full p-12 flex flex-col items-center justify-center text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="text-6xl font-serif text-primary mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                WADF 2025
              </div>
              <div className="text-xl text-muted-foreground tracking-widest">
                WEST AFRICAN DESIGN FORUM
              </div>
            </div>

            {/* Certificate Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-secondary mb-2">Certificate of Attendance</h2>
              <div className="h-1 w-32 bg-primary mx-auto"></div>
            </div>

            {/* Recipient */}
            <div className="mb-8">
              <p className="text-lg text-muted-foreground mb-3">This is to certify that</p>
              <p className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                {userData?.name}
              </p>
              <p className="text-lg text-muted-foreground">has successfully attended</p>
            </div>

            {/* Sessions Count */}
            <div className="mb-8">
              <div className="inline-block bg-primary/10 px-8 py-4 rounded-lg">
                <p className="text-5xl font-bold text-primary">{attendedSessions.length}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Session{attendedSessions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              <div className="flex items-center justify-center gap-16 mb-4">
                <div className="text-center">
                  <div className="h-px w-32 bg-border mb-2"></div>
                  <p className="text-sm text-muted-foreground">Conference Director</p>
                </div>
                <div className="text-center">
                  <div className="h-px w-32 bg-border mb-2"></div>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Accra, Ghana • June 15-16, 2025
              </p>
            </div>
          </div>
        </div>

        {/* Sessions Attended List */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Sessions Attended</h3>
            <ul className="space-y-2" data-testid="list-attended-sessions">
              {attendedSessions.map((session) => (
                <li key={session.id} className="flex items-center gap-2 text-sm" data-testid={`session-attended-${session.id}`}>
                  <Award className="h-4 w-4 text-primary" />
                  <span>{session.title}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
