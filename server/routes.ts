import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertTicketSchema,
  insertProposalSchema,
  insertSponsorshipSchema,
  insertSessionSchema,
  insertAttendanceSchema,
  insertRatingSchema,
  insertCertificateSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.params.uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.patch("/api/users/:id/role", async (req, res) => {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    const user = await storage.updateUserRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Ticket routes
  app.post("/api/tickets", async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tickets/user/:userId", async (req, res) => {
    const tickets = await storage.getTicketsByUser(req.params.userId);
    res.json(tickets);
  });

  app.get("/api/tickets", async (req, res) => {
    const tickets = await storage.getAllTickets();
    res.json(tickets);
  });

  app.patch("/api/tickets/:id/payment-status", async (req, res) => {
    const { status, reference } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const ticket = await storage.updateTicketPaymentStatus(req.params.id, status, reference);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  });

  // Proposal routes
  app.post("/api/proposals", async (req, res) => {
    try {
      const validatedData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(validatedData);
      res.json(proposal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/proposals", async (req, res) => {
    const proposals = await storage.getAllProposals();
    res.json(proposals);
  });

  app.get("/api/proposals/user/:userId", async (req, res) => {
    const proposals = await storage.getProposalsByUser(req.params.userId);
    res.json(proposals);
  });

  app.patch("/api/proposals/:id/status", async (req, res) => {
    const { status, reviewNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const proposal = await storage.updateProposalStatus(req.params.id, status, reviewNotes);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // If accepted, create a session
    if (status === "accepted" && proposal) {
      await storage.createSession({
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
    }

    res.json(proposal);
  });

  // Sponsorship routes
  app.post("/api/sponsorships", async (req, res) => {
    try {
      const validatedData = insertSponsorshipSchema.parse(req.body);
      const sponsorship = await storage.createSponsorship(validatedData);
      res.json(sponsorship);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/sponsorships", async (req, res) => {
    const sponsorships = await storage.getAllSponsorships();
    res.json(sponsorships);
  });

  app.get("/api/sponsorships/user/:userId", async (req, res) => {
    const sponsorships = await storage.getSponsorshipsByUser(req.params.userId);
    res.json(sponsorships);
  });

  app.patch("/api/sponsorships/:id/payment-status", async (req, res) => {
    const { status, reference } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const sponsorship = await storage.updateSponsorshipPaymentStatus(req.params.id, status, reference);
    if (!sponsorship) {
      return res.status(404).json({ error: "Sponsorship not found" });
    }
    res.json(sponsorship);
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    const { date } = req.query;
    if (date && typeof date === "string") {
      const sessions = await storage.getSessionsByDate(date);
      res.json(sessions);
    } else {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    const session = await storage.updateSession(req.params.id, req.body);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(validatedData);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/attendance", async (req, res) => {
    const { userId, sessionId } = req.body;
    if (!userId || !sessionId) {
      return res.status(400).json({ error: "userId and sessionId are required" });
    }
    const success = await storage.unmarkAttendance(userId, sessionId);
    if (!success) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json({ success: true });
  });

  app.get("/api/attendance/user/:userId", async (req, res) => {
    const attendance = await storage.getUserAttendance(req.params.userId);
    res.json(attendance);
  });

  app.get("/api/attendance/session/:sessionId", async (req, res) => {
    const attendance = await storage.getSessionAttendance(req.params.sessionId);
    res.json(attendance);
  });

  // Rating routes
  app.post("/api/ratings", async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      
      // Check if user already rated this session
      const existingRating = await storage.getUserRating(validatedData.userId, validatedData.sessionId);
      if (existingRating) {
        return res.status(400).json({ error: "You have already rated this session" });
      }

      const rating = await storage.createRating(validatedData);
      
      // Update session average rating
      await storage.updateSessionAverageRating(validatedData.sessionId);
      
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/ratings/session/:sessionId", async (req, res) => {
    const ratings = await storage.getSessionRatings(req.params.sessionId);
    res.json(ratings);
  });

  // Certificate routes
  app.post("/api/certificates", async (req, res) => {
    try {
      const validatedData = insertCertificateSchema.parse(req.body);
      
      // Check if user already has a certificate
      const existingCert = await storage.getUserCertificate(validatedData.userId);
      if (existingCert) {
        return res.status(400).json({ error: "Certificate already exists for this user" });
      }

      const certificate = await storage.createCertificate(validatedData);
      res.json(certificate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/certificates/user/:userId", async (req, res) => {
    const certificate = await storage.getUserCertificate(req.params.userId);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    res.json(certificate);
  });

  // Payment routes for Paystack integration
  app.post("/api/payment/initialize", async (req, res) => {
    try {
      const { email, amount, type, itemId, metadata } = req.body;
      
      if (!email || !amount || !type || !itemId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate unique reference
      const reference = `${type}_${itemId}_${Date.now()}`;
      
      // Initialize Paystack transaction
      const { paystackService } = await import("./paystack");
      const response = await paystackService.initializeTransaction(
        email,
        amount,
        reference,
        { ...metadata, type, itemId }
      );

      if (!response.status) {
        return res.status(400).json({ error: response.message });
      }

      res.json({
        authorizationUrl: response.data?.authorization_url,
        reference: response.data?.reference
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/payment/verify/:reference", async (req, res) => {
    try {
      const { paystackService } = await import("./paystack");
      const response = await paystackService.verifyTransaction(req.params.reference);

      if (!response.status || !response.data) {
        return res.status(400).json({ error: response.message });
      }

      const { status, metadata } = response.data;
      
      // Update payment status based on transaction type
      if (status === "success" && metadata) {
        const { type, itemId } = metadata;
        
        if (type === "ticket") {
          await storage.updateTicketPaymentStatus(itemId, "completed", req.params.reference);
        } else if (type === "sponsorship") {
          await storage.updateSponsorshipPaymentStatus(itemId, "completed", req.params.reference);
        }
      }

      res.json({
        status: response.data.status,
        amount: response.data.amount,
        reference: response.data.reference
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Paystack webhook for payment notifications
  app.post("/api/payment/webhook", async (req, res) => {
    try {
      const signature = req.headers["x-paystack-signature"] as string;
      const { paystackService } = await import("./paystack");
      
      if (!paystackService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const { event, data } = req.body;

      if (event === "charge.success" && data.metadata) {
        const { type, itemId } = data.metadata;
        
        if (type === "ticket") {
          await storage.updateTicketPaymentStatus(itemId, "completed", data.reference);
        } else if (type === "sponsorship") {
          await storage.updateSponsorshipPaymentStatus(itemId, "completed", data.reference);
        }
      }

      res.sendStatus(200);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats endpoint for admin dashboard
  app.get("/api/stats", async (req, res) => {
    const tickets = await storage.getAllTickets();
    const sponsorships = await storage.getAllSponsorships();
    const proposals = await storage.getAllProposals();
    const sessions = await storage.getAllSessions();

    const ticketRevenue = tickets
      .filter(t => t.paymentStatus === "completed")
      .reduce((sum, t) => sum + t.price, 0);
    
    const sponsorshipRevenue = sponsorships
      .filter(s => s.paymentStatus === "completed")
      .reduce((sum, s) => sum + s.amount, 0);

    const totalRevenue = ticketRevenue + sponsorshipRevenue;
    
    const sessionRatings = await Promise.all(
      sessions.map(s => storage.getSessionRatings(s.id))
    );
    const allRatings = sessionRatings.flat();
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    res.json({
      totalRevenue,
      ticketsSold: tickets.filter(t => t.paymentStatus === "completed").length,
      totalProposals: proposals.length,
      pendingProposals: proposals.filter(p => p.status === "submitted" || p.status === "under-review").length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSessions: sessions.length
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
