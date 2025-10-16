import {
  type User,
  type InsertUser,
  type Ticket,
  type InsertTicket,
  type Proposal,
  type InsertProposal,
  type Sponsorship,
  type InsertSponsorship,
  type Session,
  type InsertSession,
  type Attendance,
  type InsertAttendance,
  type Rating,
  type InsertRating,
  type Certificate,
  type InsertCertificate,
  type Faq,
  type InsertFaq,
  type Connection,
  type InsertConnection,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type RevenueSnapshot,
  type InsertRevenueSnapshot,
  type EngagementMetric,
  type InsertEngagementMetric,
  type SponsorMetric,
  type InsertSponsorMetric,
  type SessionMetric,
  type InsertSessionMetric,
  type TeamMember,
  type InsertTeamMember,
  type CfpSetting,
  type InsertCfpSetting,
  type TicketOption,
  type InsertTicketOption,
  type SponsorshipPackage,
  type InsertSponsorshipPackage,
  type PageSetting,
  type InsertPageSetting,
  type Task,
  type InsertTask,
  type ProposalEvaluator,
  type InsertProposalEvaluator,
  type ProposalEvaluation,
  type InsertProposalEvaluation,
  users,
  tickets,
  proposals,
  sponsorships,
  sessions,
  attendance,
  ratings,
  certificates,
  faqs,
  connections,
  conversations,
  messages,
  revenueSnapshots,
  engagementMetrics,
  sponsorMetrics,
  sessionMetrics,
  teamMembers,
  cfpSettings,
  ticketOptions,
  sponsorshipPackages,
  pageSettings,
  tasks,
  proposalEvaluators,
  proposalEvaluations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, avg, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  // Tickets
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketsByUser(userId: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicketPaymentStatus(id: string, status: string, reference?: string): Promise<Ticket | undefined>;
  getAllTickets(): Promise<Ticket[]>;

  // Proposals
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByUser(userId: string): Promise<Proposal[]>;
  getAllProposals(): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposalStatus(id: string, status: string, reviewNotes?: string): Promise<Proposal | undefined>;

  // Sponsorships
  getSponsorship(id: string): Promise<Sponsorship | undefined>;
  getSponsorshipsByUser(userId: string): Promise<Sponsorship[]>;
  getAllSponsorships(): Promise<Sponsorship[]>;
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  updateSponsorshipPaymentStatus(id: string, status: string, reference?: string): Promise<Sponsorship | undefined>;

  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  getSessionsByDate(date: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;

  // Attendance
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  unmarkAttendance(userId: string, sessionId: string): Promise<boolean>;
  getUserAttendance(userId: string): Promise<Attendance[]>;
  getSessionAttendance(sessionId: string): Promise<Attendance[]>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  getSessionRatings(sessionId: string): Promise<Rating[]>;
  getUserRating(userId: string, sessionId: string): Promise<Rating | undefined>;
  updateSessionAverageRating(sessionId: string): Promise<void>;

  // Certificates
  getCertificate(id: string): Promise<Certificate | undefined>;
  getUserCertificate(userId: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;

  // FAQs
  getAllFaqs(): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;

  // Connections
  createConnection(connection: InsertConnection): Promise<Connection>;
  getUserConnections(userId: string): Promise<Connection[]>;
  updateConnectionStatus(id: string, status: string): Promise<Connection | undefined>;
  getConnection(requesterId: string, addresseeId: string): Promise<Connection | undefined>;

  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(participant1Id: string, participant2Id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  updateConversationLastMessage(id: string): Promise<void>;

  // Messages
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Analytics
  getRevenueSnapshots(startDate?: Date, endDate?: Date): Promise<RevenueSnapshot[]>;
  getLatestRevenueSnapshot(): Promise<RevenueSnapshot | undefined>;
  getEngagementMetrics(startDate?: Date, endDate?: Date): Promise<EngagementMetric[]>;
  getLatestEngagementMetric(): Promise<EngagementMetric | undefined>;
  getSponsorMetrics(sponsorshipId: string): Promise<SponsorMetric[]>;
  getAllSponsorMetrics(startDate?: Date, endDate?: Date): Promise<SponsorMetric[]>;
  getSessionMetrics(sessionId: string): Promise<SessionMetric | undefined>;
  getAllSessionMetrics(): Promise<SessionMetric[]>;
  updateSessionMetrics(sessionId: string): Promise<void>;

  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // CFP Settings
  getCfpSettings(): Promise<CfpSetting | undefined>;
  updateCfpSettings(updates: Partial<CfpSetting>): Promise<CfpSetting>;

  // Ticket Options
  getAllTicketOptions(): Promise<TicketOption[]>;
  getTicketOption(id: string): Promise<TicketOption | undefined>;
  createTicketOption(ticketOption: InsertTicketOption): Promise<TicketOption>;
  updateTicketOption(id: string, updates: Partial<TicketOption>): Promise<TicketOption | undefined>;
  deleteTicketOption(id: string): Promise<boolean>;

  // Sponsorship Packages
  getAllSponsorshipPackages(): Promise<SponsorshipPackage[]>;
  getSponsorshipPackage(id: string): Promise<SponsorshipPackage | undefined>;
  createSponsorshipPackage(pkg: InsertSponsorshipPackage): Promise<SponsorshipPackage>;
  updateSponsorshipPackage(id: string, updates: Partial<SponsorshipPackage>): Promise<SponsorshipPackage | undefined>;
  deleteSponsorshipPackage(id: string): Promise<boolean>;

  // Page Settings
  getAllPageSettings(): Promise<PageSetting[]>;
  getPageSetting(pageName: string): Promise<PageSetting | undefined>;
  updatePageSetting(pageName: string, updates: Partial<PageSetting>): Promise<PageSetting>;

  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Proposal Evaluators
  getAllProposalEvaluators(): Promise<ProposalEvaluator[]>;
  getProposalEvaluator(id: string): Promise<ProposalEvaluator | undefined>;
  createProposalEvaluator(evaluator: InsertProposalEvaluator): Promise<ProposalEvaluator>;
  updateProposalEvaluator(id: string, updates: Partial<ProposalEvaluator>): Promise<ProposalEvaluator | undefined>;
  deleteProposalEvaluator(id: string): Promise<boolean>;

  // Proposal Evaluations
  getProposalEvaluations(proposalId: string): Promise<ProposalEvaluation[]>;
  getEvaluatorEvaluations(evaluatorId: string): Promise<ProposalEvaluation[]>;
  createProposalEvaluation(evaluation: InsertProposalEvaluation): Promise<ProposalEvaluation>;
  updateProposalEvaluation(id: string, updates: Partial<ProposalEvaluation>): Promise<ProposalEvaluation | undefined>;
}

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const result = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Tickets
  async getTicket(id: string): Promise<Ticket | undefined> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return result[0];
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.userId, userId));
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values(insertTicket).returning();
    return result[0];
  }

  async updateTicketPaymentStatus(id: string, status: string, reference?: string): Promise<Ticket | undefined> {
    const updates: Partial<Ticket> = { paymentStatus: status };
    if (reference) updates.paymentReference = reference;
    const result = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
    return result[0];
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  // Proposals
  async getProposal(id: string): Promise<Proposal | undefined> {
    const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    return result[0];
  }

  async getProposalsByUser(userId: string): Promise<Proposal[]> {
    return await db.select().from(proposals).where(eq(proposals.userId, userId));
  }

  async getAllProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const result = await db.insert(proposals).values(insertProposal).returning();
    return result[0];
  }

  async updateProposalStatus(id: string, status: string, reviewNotes?: string): Promise<Proposal | undefined> {
    const updates: Partial<Proposal> = { 
      status, 
      reviewedAt: new Date()
    };
    if (reviewNotes) updates.reviewNotes = reviewNotes;
    const result = await db.update(proposals).set(updates).where(eq(proposals.id, id)).returning();
    return result[0];
  }

  // Sponsorships
  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    const result = await db.select().from(sponsorships).where(eq(sponsorships.id, id)).limit(1);
    return result[0];
  }

  async getSponsorshipsByUser(userId: string): Promise<Sponsorship[]> {
    return await db.select().from(sponsorships).where(eq(sponsorships.userId, userId));
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    return await db.select().from(sponsorships);
  }

  async createSponsorship(insertSponsorship: InsertSponsorship): Promise<Sponsorship> {
    const result = await db.insert(sponsorships).values(insertSponsorship).returning();
    return result[0];
  }

  async updateSponsorshipPaymentStatus(id: string, status: string, reference?: string): Promise<Sponsorship | undefined> {
    const updates: Partial<Sponsorship> = { paymentStatus: status };
    if (reference) updates.paymentReference = reference;
    const result = await db.update(sponsorships).set(updates).where(eq(sponsorships.id, id)).returning();
    return result[0];
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return result[0];
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getSessionsByDate(date: string): Promise<Session[]> {
    // Date comparison - filter sessions by scheduled date
    const result = await db.select().from(sessions);
    return result.filter(s => {
      if (!s.scheduledDate) return false;
      const sessionDate = s.scheduledDate.toISOString().split('T')[0];
      return sessionDate === date;
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(insertSession).returning();
    return result[0];
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const result = await db.update(sessions).set(updates).where(eq(sessions.id, id)).returning();
    return result[0];
  }

  // Attendance
  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(insertAttendance).returning();
    return result[0];
  }

  async unmarkAttendance(userId: string, sessionId: string): Promise<boolean> {
    const result = await db.delete(attendance)
      .where(and(eq(attendance.userId, userId), eq(attendance.sessionId, sessionId)))
      .returning();
    return result.length > 0;
  }

  async getUserAttendance(userId: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.userId, userId));
  }

  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.sessionId, sessionId));
  }

  // Ratings
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const result = await db.insert(ratings).values(insertRating).returning();
    return result[0];
  }

  async getSessionRatings(sessionId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.sessionId, sessionId));
  }

  async getUserRating(userId: string, sessionId: string): Promise<Rating | undefined> {
    const result = await db.select().from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.sessionId, sessionId)))
      .limit(1);
    return result[0];
  }

  async updateSessionAverageRating(sessionId: string): Promise<void> {
    const sessionRatings = await this.getSessionRatings(sessionId);
    if (sessionRatings.length === 0) return;

    const avgRating = Math.round(
      sessionRatings.reduce((sum, r) => sum + r.rating, 0) / sessionRatings.length
    );

    await db.update(sessions)
      .set({ 
        averageRating: avgRating,
        totalRatings: sessionRatings.length 
      })
      .where(eq(sessions.id, sessionId));
  }

  // Certificates
  async getCertificate(id: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return result[0];
  }

  async getUserCertificate(userId: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.userId, userId)).limit(1);
    return result[0];
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const result = await db.insert(certificates).values(insertCertificate).returning();
    return result[0];
  }

  // FAQs
  async getAllFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs);
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const result = await db.insert(faqs).values(insertFaq).returning();
    return result[0];
  }

  // Connections
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const result = await db.insert(connections).values(insertConnection).returning();
    return result[0];
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db.select().from(connections)
      .where(eq(connections.requesterId, userId))
      .union(
        db.select().from(connections).where(eq(connections.addresseeId, userId))
      );
  }

  async updateConnectionStatus(id: string, status: string): Promise<Connection | undefined> {
    const result = await db.update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return result[0];
  }

  async getConnection(requesterId: string, addresseeId: string): Promise<Connection | undefined> {
    const result = await db.select().from(connections)
      .where(
        and(
          eq(connections.requesterId, requesterId),
          eq(connections.addresseeId, addresseeId)
        )
      )
      .limit(1);
    return result[0];
  }

  // Conversations
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(insertConversation).returning();
    return result[0];
  }

  async getConversation(participant1Id: string, participant2Id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations)
      .where(
        and(
          eq(conversations.participant1Id, participant1Id),
          eq(conversations.participant2Id, participant2Id)
        )
      )
      .union(
        db.select().from(conversations).where(
          and(
            eq(conversations.participant1Id, participant2Id),
            eq(conversations.participant2Id, participant1Id)
          )
        )
      )
      .limit(1);
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.participant1Id, userId))
      .union(
        db.select().from(conversations).where(eq(conversations.participant2Id, userId))
      );
  }

  async updateConversationLastMessage(id: string): Promise<void> {
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id));
  }

  // Messages
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(insertMessage).returning();
    await this.updateConversationLastMessage(insertMessage.conversationId);
    return result[0];
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const userConvs = await this.getUserConversations(userId);
    const convIds = userConvs.map(c => c.id);
    
    const unreadMessages = await db.select().from(messages)
      .where(
        and(
          eq(messages.isRead, false),
          // Message is not from the user themselves
        )
      );
    
    return unreadMessages.filter(m => 
      convIds.includes(m.conversationId) && m.senderId !== userId
    ).length;
  }

  // Analytics
  async getRevenueSnapshots(startDate?: Date, endDate?: Date): Promise<RevenueSnapshot[]> {
    let query = db.select().from(revenueSnapshots);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(revenueSnapshots.date, startDate),
          eq(revenueSnapshots.date, endDate)
        )
      ) as any;
    }
    
    return await query;
  }

  async getLatestRevenueSnapshot(): Promise<RevenueSnapshot | undefined> {
    const result = await db.select()
      .from(revenueSnapshots)
      .orderBy(revenueSnapshots.date)
      .limit(1);
    return result[0];
  }

  async getEngagementMetrics(startDate?: Date, endDate?: Date): Promise<EngagementMetric[]> {
    let query = db.select().from(engagementMetrics);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(engagementMetrics.date, startDate),
          eq(engagementMetrics.date, endDate)
        )
      ) as any;
    }
    
    return await query;
  }

  async getLatestEngagementMetric(): Promise<EngagementMetric | undefined> {
    const result = await db.select()
      .from(engagementMetrics)
      .orderBy(engagementMetrics.date)
      .limit(1);
    return result[0];
  }

  async getSponsorMetrics(sponsorshipId: string): Promise<SponsorMetric[]> {
    return await db.select()
      .from(sponsorMetrics)
      .where(eq(sponsorMetrics.sponsorshipId, sponsorshipId));
  }

  async getAllSponsorMetrics(startDate?: Date, endDate?: Date): Promise<SponsorMetric[]> {
    let query = db.select().from(sponsorMetrics);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(sponsorMetrics.date, startDate),
          eq(sponsorMetrics.date, endDate)
        )
      ) as any;
    }
    
    return await query;
  }

  async getSessionMetrics(sessionId: string): Promise<SessionMetric | undefined> {
    const result = await db.select()
      .from(sessionMetrics)
      .where(eq(sessionMetrics.sessionId, sessionId))
      .limit(1);
    return result[0];
  }

  async getAllSessionMetrics(): Promise<SessionMetric[]> {
    return await db.select().from(sessionMetrics);
  }

  async updateSessionMetrics(sessionId: string): Promise<void> {
    // Get attendance count
    const attendanceRecords = await db.select()
      .from(attendance)
      .where(eq(attendance.sessionId, sessionId));
    const attendanceCount = attendanceRecords.length;

    // Get ratings
    const ratingRecords = await db.select()
      .from(ratings)
      .where(eq(ratings.sessionId, sessionId));
    const totalRatings = ratingRecords.length;
    const averageRating = totalRatings > 0
      ? Math.round(ratingRecords.reduce((sum, r) => sum + r.rating, 0) / totalRatings)
      : null;

    // Calculate completion rate (percentage of attendees who rated)
    const completionRate = attendanceCount > 0
      ? Math.round((totalRatings / attendanceCount) * 100)
      : 0;

    // Calculate engagement score (simple formula: attendance + ratings)
    const engagementScore = attendanceCount + totalRatings;

    // Check if metrics exist
    const existing = await this.getSessionMetrics(sessionId);

    if (existing) {
      await db.update(sessionMetrics)
        .set({
          attendanceCount,
          averageRating,
          totalRatings,
          engagementScore,
          completionRate,
          updatedAt: new Date()
        })
        .where(eq(sessionMetrics.sessionId, sessionId));
    } else {
      await db.insert(sessionMetrics).values({
        sessionId,
        attendanceCount,
        averageRating,
        totalRatings,
        engagementScore,
        completionRate
      });
    }
  }

  // Team Members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
    return result[0];
  }

  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const result = await db.insert(teamMembers).values(insertTeamMember).returning();
    return result[0];
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const result = await db.update(teamMembers).set(updates).where(eq(teamMembers.id, id)).returning();
    return result[0];
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return result.length > 0;
  }

  // CFP Settings
  async getCfpSettings(): Promise<CfpSetting | undefined> {
    const result = await db.select().from(cfpSettings).limit(1);
    return result[0];
  }

  async updateCfpSettings(updates: Partial<CfpSetting>): Promise<CfpSetting> {
    const existing = await this.getCfpSettings();
    if (existing) {
      const result = await db.update(cfpSettings).set({ ...updates, updatedAt: new Date() }).where(eq(cfpSettings.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(cfpSettings).values(updates as any).returning();
      return result[0];
    }
  }

  // Ticket Options
  async getAllTicketOptions(): Promise<TicketOption[]> {
    return await db.select().from(ticketOptions);
  }

  async getTicketOption(id: string): Promise<TicketOption | undefined> {
    const result = await db.select().from(ticketOptions).where(eq(ticketOptions.id, id)).limit(1);
    return result[0];
  }

  async createTicketOption(insertTicketOption: InsertTicketOption): Promise<TicketOption> {
    const result = await db.insert(ticketOptions).values(insertTicketOption).returning();
    return result[0];
  }

  async updateTicketOption(id: string, updates: Partial<TicketOption>): Promise<TicketOption | undefined> {
    const result = await db.update(ticketOptions).set({ ...updates, updatedAt: new Date() }).where(eq(ticketOptions.id, id)).returning();
    return result[0];
  }

  async deleteTicketOption(id: string): Promise<boolean> {
    const result = await db.delete(ticketOptions).where(eq(ticketOptions.id, id)).returning();
    return result.length > 0;
  }

  // Sponsorship Packages
  async getAllSponsorshipPackages(): Promise<SponsorshipPackage[]> {
    return await db.select().from(sponsorshipPackages);
  }

  async getSponsorshipPackage(id: string): Promise<SponsorshipPackage | undefined> {
    const result = await db.select().from(sponsorshipPackages).where(eq(sponsorshipPackages.id, id)).limit(1);
    return result[0];
  }

  async createSponsorshipPackage(insertPackage: InsertSponsorshipPackage): Promise<SponsorshipPackage> {
    const result = await db.insert(sponsorshipPackages).values(insertPackage).returning();
    return result[0];
  }

  async updateSponsorshipPackage(id: string, updates: Partial<SponsorshipPackage>): Promise<SponsorshipPackage | undefined> {
    const result = await db.update(sponsorshipPackages).set({ ...updates, updatedAt: new Date() }).where(eq(sponsorshipPackages.id, id)).returning();
    return result[0];
  }

  async deleteSponsorshipPackage(id: string): Promise<boolean> {
    const result = await db.delete(sponsorshipPackages).where(eq(sponsorshipPackages.id, id)).returning();
    return result.length > 0;
  }

  // Page Settings
  async getAllPageSettings(): Promise<PageSetting[]> {
    return await db.select().from(pageSettings);
  }

  async getPageSetting(pageName: string): Promise<PageSetting | undefined> {
    const result = await db.select().from(pageSettings).where(eq(pageSettings.pageName, pageName)).limit(1);
    return result[0];
  }

  async updatePageSetting(pageName: string, updates: Partial<PageSetting>): Promise<PageSetting> {
    const existing = await this.getPageSetting(pageName);
    if (existing) {
      const result = await db.update(pageSettings).set({ ...updates, updatedAt: new Date() }).where(eq(pageSettings.pageName, pageName)).returning();
      return result[0];
    } else {
      const result = await db.insert(pageSettings).values({ pageName, ...updates } as any).returning();
      return result[0];
    }
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Proposal Evaluators
  async getAllProposalEvaluators(): Promise<ProposalEvaluator[]> {
    return await db.select().from(proposalEvaluators);
  }

  async getProposalEvaluator(id: string): Promise<ProposalEvaluator | undefined> {
    const result = await db.select().from(proposalEvaluators).where(eq(proposalEvaluators.id, id)).limit(1);
    return result[0];
  }

  async createProposalEvaluator(insertEvaluator: InsertProposalEvaluator): Promise<ProposalEvaluator> {
    const result = await db.insert(proposalEvaluators).values(insertEvaluator).returning();
    return result[0];
  }

  async updateProposalEvaluator(id: string, updates: Partial<ProposalEvaluator>): Promise<ProposalEvaluator | undefined> {
    const result = await db.update(proposalEvaluators).set(updates).where(eq(proposalEvaluators.id, id)).returning();
    return result[0];
  }

  async deleteProposalEvaluator(id: string): Promise<boolean> {
    const result = await db.delete(proposalEvaluators).where(eq(proposalEvaluators.id, id)).returning();
    return result.length > 0;
  }

  // Proposal Evaluations
  async getProposalEvaluations(proposalId: string): Promise<ProposalEvaluation[]> {
    return await db.select().from(proposalEvaluations).where(eq(proposalEvaluations.proposalId, proposalId));
  }

  async getEvaluatorEvaluations(evaluatorId: string): Promise<ProposalEvaluation[]> {
    return await db.select().from(proposalEvaluations).where(eq(proposalEvaluations.evaluatorId, evaluatorId));
  }

  async createProposalEvaluation(insertEvaluation: InsertProposalEvaluation): Promise<ProposalEvaluation> {
    const result = await db.insert(proposalEvaluations).values(insertEvaluation).returning();
    return result[0];
  }

  async updateProposalEvaluation(id: string, updates: Partial<ProposalEvaluation>): Promise<ProposalEvaluation | undefined> {
    const result = await db.update(proposalEvaluations).set(updates).where(eq(proposalEvaluations.id, id)).returning();
    return result[0];
  }
}

// Export the storage instance using Drizzle
export const storage = new DrizzleStorage();
