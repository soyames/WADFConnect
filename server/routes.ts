import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongoStorage as storage } from "./mongodb-storage";
import { 
  insertUserSchema,
  insertTicketSchema,
  insertProposalSchema,
  insertSponsorshipSchema,
  insertSessionSchema,
  insertAttendanceSchema,
  insertRatingSchema,
  insertCertificateSchema,
  insertConnectionSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertPostSchema,
  insertPostLikeSchema,
  insertPostCommentSchema,
  insertTeamMemberSchema,
  insertCfpSettingSchema,
  insertTicketOptionSchema,
  insertSponsorshipPackageSchema,
  insertPageSettingSchema,
  insertTaskSchema,
  insertProposalEvaluatorSchema,
  insertProposalEvaluationSchema
} from "@shared/schema";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { 
  applySecurityMiddleware, 
  apiRateLimiter, 
  authRateLimiter,
  requireValidReferrer 
} from "./security";

// Admin authorization middleware
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await storage.getUser(userId);
  if (!user || (user.role !== "admin" && user.role !== "organizer")) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply comprehensive security middleware
  applySecurityMiddleware(app);

  // Serve robots.txt to discourage scrapers
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Disallow: /api/
Disallow: /admin
Disallow: /login
Disallow: /payment/
Crawl-delay: 10

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: cohere-ai
Disallow: /`);
  });

  // Serve manifest.json for PWA
  app.get("/manifest.json", (req, res) => {
    const manifestPath = path.resolve(import.meta.dirname, "..", "public", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json");
      res.sendFile(manifestPath);
    } else {
      res.status(404).json({ error: "Manifest not found" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Get user by email
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const bcrypt = await import("bcryptjs");
      const isValidPassword = user.password 
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;
      }

      // Return user data (without password)
      const { password: _, ...userData } = user;
      res.json({
        success: true,
        user: userData
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    if (req.session?.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const { password: _, ...userData } = user;
          return res.json({ user: userData });
        }
      } catch (error) {
        console.error("Session error:", error);
      }
    }
    res.json({ user: null });
  });

  // User routes with API rate limiting
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
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

  app.delete("/api/sessions/:id", async (req, res) => {
    const success = await storage.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ success: true });
  });

  app.post("/api/sessions/bulk-update", async (req, res) => {
    try {
      const { updates } = req.body;
      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ error: "Updates array is required" });
      }
      const sessions = await storage.bulkUpdateSessions(updates);
      res.json(sessions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
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

  // Networking routes - Connections
  app.post("/api/connections", async (req, res) => {
    try {
      const validatedData = insertConnectionSchema.parse(req.body);
      
      // Check if connection already exists
      const existing = await storage.getConnection(validatedData.requesterId, validatedData.addresseeId);
      if (existing) {
        return res.status(400).json({ error: "Connection request already exists" });
      }

      const connection = await storage.createConnection(validatedData);
      res.json(connection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/connections/user/:userId", async (req, res) => {
    const connections = await storage.getUserConnections(req.params.userId);
    res.json(connections);
  });

  app.patch("/api/connections/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const connection = await storage.updateConnectionStatus(req.params.id, status);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.json(connection);
  });

  // Networking routes - Conversations
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      
      // Check if conversation already exists
      const existing = await storage.getConversation(
        validatedData.participant1Id,
        validatedData.participant2Id
      );
      if (existing) {
        return res.json(existing);
      }

      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/conversations/user/:userId", async (req, res) => {
    const conversations = await storage.getUserConversations(req.params.userId);
    res.json(conversations);
  });

  app.get("/api/conversations/:participant1Id/:participant2Id", async (req, res) => {
    const conversation = await storage.getConversation(
      req.params.participant1Id,
      req.params.participant2Id
    );
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  });

  // Networking routes - Messages
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.sendMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/messages/conversation/:conversationId", async (req, res) => {
    const messages = await storage.getConversationMessages(req.params.conversationId);
    res.json(messages);
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    await storage.markMessageAsRead(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/messages/unread/:userId", async (req, res) => {
    const count = await storage.getUnreadMessageCount(req.params.userId);
    res.json({ count });
  });

  // Social Media routes - Posts
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getAllPosts();
    res.json(posts);
  });

  app.get("/api/posts/user/:userId", async (req, res) => {
    const posts = await storage.getPostsByUser(req.params.userId);
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const post = await storage.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deletePost(req.params.id);
    res.sendStatus(200);
  });

  // Social Media routes - Post Likes
  app.get("/api/posts/:postId/likes", async (req, res) => {
    const likes = await storage.getPostLikes(req.params.postId);
    res.json(likes);
  });

  app.get("/api/posts/:postId/likes/:userId", async (req, res) => {
    const like = await storage.getUserLike(req.params.postId, req.params.userId);
    res.json(like || null);
  });

  app.post("/api/posts/:postId/like", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const existingLike = await storage.getUserLike(req.params.postId, userId);
      if (existingLike) {
        await storage.deletePostLike(existingLike.id);
        return res.json({ liked: false });
      }

      await storage.createPostLike({
        postId: req.params.postId,
        userId
      });
      res.json({ liked: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Social Media routes - Post Comments
  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getPostComments(req.params.postId);
    res.json(comments);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const validatedData = insertPostCommentSchema.parse({
        ...req.body,
        postId: req.params.postId
      });
      const comment = await storage.createPostComment(validatedData);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await storage.deletePostComment(req.params.id);
    res.sendStatus(200);
  });

  // Analytics routes
  app.get("/api/analytics/revenue", async (req, res) => {
    const { startDate, endDate } = req.query;
    const snapshots = await storage.getRevenueSnapshots(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(snapshots);
  });

  app.get("/api/analytics/revenue/latest", async (req, res) => {
    const snapshot = await storage.getLatestRevenueSnapshot();
    res.json(snapshot || null);
  });

  app.get("/api/analytics/engagement", async (req, res) => {
    const { startDate, endDate } = req.query;
    const metrics = await storage.getEngagementMetrics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(metrics);
  });

  app.get("/api/analytics/engagement/latest", async (req, res) => {
    const metric = await storage.getLatestEngagementMetric();
    res.json(metric || null);
  });

  app.get("/api/analytics/sponsors", async (req, res) => {
    const { startDate, endDate } = req.query;
    const metrics = await storage.getAllSponsorMetrics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(metrics);
  });

  app.get("/api/analytics/sponsors/:sponsorshipId", async (req, res) => {
    const metrics = await storage.getSponsorMetrics(req.params.sponsorshipId);
    res.json(metrics);
  });

  app.get("/api/analytics/sessions", async (req, res) => {
    const metrics = await storage.getAllSessionMetrics();
    res.json(metrics);
  });

  app.get("/api/analytics/sessions/:sessionId", async (req, res) => {
    const metric = await storage.getSessionMetrics(req.params.sessionId);
    res.json(metric || null);
  });

  app.post("/api/analytics/sessions/:sessionId/update", async (req, res) => {
    await storage.updateSessionMetrics(req.params.sessionId);
    res.sendStatus(200);
  });

  // Admin routes - Team Members
  app.get("/api/admin/team-members", requireAdmin, async (req, res) => {
    const teamMembers = await storage.getAllTeamMembers();
    res.json(teamMembers);
  });

  app.post("/api/admin/team-members", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const teamMember = await storage.createTeamMember(validatedData);
      res.json(teamMember);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/team-members/invite", requireAdmin, async (req, res) => {
    try {
      const { email, name, role, invitationMessage } = req.body;
      const userId = req.headers['x-user-id'] as string;
      
      if (!email || !name || !role) {
        return res.status(400).json({ error: "Email, name, and role are required" });
      }

      const teamMember = await storage.createTeamMember({
        email,
        name,
        role,
        invitedBy: userId,
        status: "invited"
      });

      // In a real application, you would send an email here with the invitationMessage
      // For now, we just log it to simulate the invitation being sent
      console.log(`Invitation sent to ${email}:`, invitationMessage || "You've been invited to join the team!");

      res.json(teamMember);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/team-members/:id", requireAdmin, async (req, res) => {
    const teamMember = await storage.updateTeamMember(req.params.id, req.body);
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  });

  app.patch("/api/admin/team-members/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const teamMember = await storage.updateTeamMember(req.params.id, { status });
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  });

  app.delete("/api/admin/team-members/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteTeamMember(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json({ success: true });
  });

  // Admin routes - CFP Settings
  app.get("/api/admin/cfp-settings", requireAdmin, async (req, res) => {
    const settings = await storage.getCfpSettings();
    res.json(settings || null);
  });

  app.post("/api/admin/cfp-settings", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCfpSettingSchema.parse(req.body);
      const settings = await storage.updateCfpSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/cfp-settings", requireAdmin, async (req, res) => {
    const settings = await storage.updateCfpSettings(req.body);
    res.json(settings);
  });

  // Public CFP Settings (no auth required)
  app.get("/api/cfp-settings", async (req, res) => {
    const settings = await storage.getCfpSettings();
    res.json(settings || null);
  });

  // Public Ticket Options (no auth required) - for ticket purchase page
  app.get("/api/ticket-options", async (req, res) => {
    const options = await storage.getAllTicketOptions();
    // Only return available tickets
    const availableOptions = options.filter(opt => opt.available);
    res.json(availableOptions);
  });

  // Admin routes - Ticket Options
  app.get("/api/admin/ticket-options", requireAdmin, async (req, res) => {
    const options = await storage.getAllTicketOptions();
    res.json(options);
  });

  app.post("/api/admin/ticket-options", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTicketOptionSchema.parse(req.body);
      const option = await storage.createTicketOption(validatedData);
      res.json(option);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/ticket-options/:id", requireAdmin, async (req, res) => {
    const option = await storage.updateTicketOption(req.params.id, req.body);
    if (!option) {
      return res.status(404).json({ error: "Ticket option not found" });
    }
    res.json(option);
  });

  app.delete("/api/admin/ticket-options/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteTicketOption(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Ticket option not found" });
    }
    res.json({ success: true });
  });

  // Admin routes - Sponsorship Packages
  app.get("/api/admin/sponsorship-packages", requireAdmin, async (req, res) => {
    const packages = await storage.getAllSponsorshipPackages();
    res.json(packages);
  });

  app.post("/api/admin/sponsorship-packages", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSponsorshipPackageSchema.parse(req.body);
      const pkg = await storage.createSponsorshipPackage(validatedData);
      res.json(pkg);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/sponsorship-packages/:id", requireAdmin, async (req, res) => {
    const pkg = await storage.updateSponsorshipPackage(req.params.id, req.body);
    if (!pkg) {
      return res.status(404).json({ error: "Sponsorship package not found" });
    }
    res.json(pkg);
  });

  app.delete("/api/admin/sponsorship-packages/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteSponsorshipPackage(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Sponsorship package not found" });
    }
    res.json({ success: true });
  });

  // Admin routes - Page Settings
  app.get("/api/admin/page-settings", requireAdmin, async (req, res) => {
    const settings = await storage.getAllPageSettings();
    res.json(settings);
  });

  app.get("/api/admin/page-settings/:pageName", requireAdmin, async (req, res) => {
    const setting = await storage.getPageSetting(req.params.pageName);
    res.json(setting || null);
  });

  app.post("/api/admin/page-settings", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPageSettingSchema.parse(req.body);
      const setting = await storage.updatePageSetting(validatedData.pageName, validatedData);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/page-settings/:pageName", requireAdmin, async (req, res) => {
    const setting = await storage.updatePageSetting(req.params.pageName, req.body);
    res.json(setting);
  });

  // Admin routes - Tasks
  app.get("/api/admin/tasks", requireAdmin, async (req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.post("/api/admin/tasks", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/tasks/:id", requireAdmin, async (req, res) => {
    const task = await storage.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  });

  app.delete("/api/admin/tasks/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
  });

  // Admin routes - Proposal Evaluators
  app.get("/api/admin/evaluators", requireAdmin, async (req, res) => {
    const evaluators = await storage.getAllProposalEvaluators();
    res.json(evaluators);
  });

  app.post("/api/admin/evaluators", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProposalEvaluatorSchema.parse(req.body);
      const evaluator = await storage.createProposalEvaluator(validatedData);
      res.json(evaluator);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin routes - Assign Evaluator to Proposal
  app.post("/api/admin/assign-evaluator", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProposalEvaluationSchema.parse(req.body);
      const evaluation = await storage.createProposalEvaluation(validatedData);
      res.json(evaluation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Proposal Evaluation routes
  app.get("/api/evaluations/proposal/:proposalId", async (req, res) => {
    const evaluations = await storage.getProposalEvaluations(req.params.proposalId);
    res.json(evaluations);
  });

  app.get("/api/evaluations/evaluator/:evaluatorId", async (req, res) => {
    const evaluations = await storage.getEvaluatorEvaluations(req.params.evaluatorId);
    res.json(evaluations);
  });

  app.patch("/api/evaluations/:id", async (req, res) => {
    const evaluation = await storage.updateProposalEvaluation(req.params.id, req.body);
    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }
    res.json(evaluation);
  });

  app.get("/api/proposals/:id/evaluations", async (req, res) => {
    const evaluations = await storage.getProposalEvaluations(req.params.id);
    res.json(evaluations);
  });

  const httpServer = createServer(app);
  return httpServer;
}
