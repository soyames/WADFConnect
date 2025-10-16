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
  users,
  tickets,
  proposals,
  sponsorships,
  sessions,
  attendance,
  ratings,
  certificates,
  faqs
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
}

// Export the storage instance using Drizzle
export const storage = new DrizzleStorage();
