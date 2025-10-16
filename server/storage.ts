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
  type InsertFaq
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private proposals: Map<string, Proposal>;
  private sponsorships: Map<string, Sponsorship>;
  private sessions: Map<string, Session>;
  private attendance: Map<string, Attendance>;
  private ratings: Map<string, Rating>;
  private certificates: Map<string, Certificate>;
  private faqs: Map<string, Faq>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.proposals = new Map();
    this.sponsorships = new Map();
    this.sessions = new Map();
    this.attendance = new Map();
    this.ratings = new Map();
    this.certificates = new Map();
    this.faqs = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.role = role;
      this.users.set(id, user);
    }
    return user;
  }

  // Tickets
  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(t => t.userId === userId);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      ...insertTicket,
      id,
      purchasedAt: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicketPaymentStatus(id: string, status: string, reference?: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (ticket) {
      ticket.paymentStatus = status;
      if (reference) ticket.paymentReference = reference;
      this.tickets.set(id, ticket);
    }
    return ticket;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  // Proposals
  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async getProposalsByUser(userId: string): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(p => p.userId === userId);
  }

  async getAllProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewNotes: null
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async updateProposalStatus(id: string, status: string, reviewNotes?: string): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (proposal) {
      proposal.status = status;
      proposal.reviewedAt = new Date();
      if (reviewNotes) proposal.reviewNotes = reviewNotes;
      this.proposals.set(id, proposal);
    }
    return proposal;
  }

  // Sponsorships
  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    return this.sponsorships.get(id);
  }

  async getSponsorshipsByUser(userId: string): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).filter(s => s.userId === userId);
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values());
  }

  async createSponsorship(insertSponsorship: InsertSponsorship): Promise<Sponsorship> {
    const id = randomUUID();
    const sponsorship: Sponsorship = {
      ...insertSponsorship,
      id,
      purchasedAt: new Date()
    };
    this.sponsorships.set(id, sponsorship);
    return sponsorship;
  }

  async updateSponsorshipPaymentStatus(id: string, status: string, reference?: string): Promise<Sponsorship | undefined> {
    const sponsorship = this.sponsorships.get(id);
    if (sponsorship) {
      sponsorship.paymentStatus = status;
      if (reference) sponsorship.paymentReference = reference;
      this.sponsorships.set(id, sponsorship);
    }
    return sponsorship;
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByDate(date: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => 
      s.scheduledDate && s.scheduledDate.toISOString().startsWith(date)
    );
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      averageRating: null,
      totalRatings: 0
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(id, session);
    }
    return session;
  }

  // Attendance
  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      markedAt: new Date()
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async unmarkAttendance(userId: string, sessionId: string): Promise<boolean> {
    const found = Array.from(this.attendance.values()).find(
      a => a.userId === userId && a.sessionId === sessionId
    );
    if (found) {
      this.attendance.delete(found.id);
      return true;
    }
    return false;
  }

  async getUserAttendance(userId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(a => a.userId === userId);
  }

  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(a => a.sessionId === sessionId);
  }

  // Ratings
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const rating: Rating = {
      ...insertRating,
      id,
      ratedAt: new Date()
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async getSessionRatings(sessionId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(r => r.sessionId === sessionId);
  }

  async getUserRating(userId: string, sessionId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      r => r.userId === userId && r.sessionId === sessionId
    );
  }

  async updateSessionAverageRating(sessionId: string): Promise<void> {
    const sessionRatings = await this.getSessionRatings(sessionId);
    const session = this.sessions.get(sessionId);
    
    if (session && sessionRatings.length > 0) {
      const sum = sessionRatings.reduce((acc, r) => acc + r.rating, 0);
      session.averageRating = Math.round((sum / sessionRatings.length) * 10) / 10;
      session.totalRatings = sessionRatings.length;
      this.sessions.set(sessionId, session);
    }
  }

  // Certificates
  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getUserCertificate(userId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(c => c.userId === userId);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      generatedAt: new Date(),
      pdfUrl: null
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  // FAQs
  async getAllFaqs(): Promise<Faq[]> {
    return Array.from(this.faqs.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const id = randomUUID();
    const faq: Faq = {
      ...insertFaq,
      id
    };
    this.faqs.set(id, faq);
    return faq;
  }
}

export const storage = new MemStorage();
