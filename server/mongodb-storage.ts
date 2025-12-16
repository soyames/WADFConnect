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
  type Post,
  type InsertPost,
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
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
  type ConferenceSetting,
  type InsertConferenceSetting,
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
} from "@shared/schema";
import { type IStorage } from "./storage";
import { getDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

// Helper functions to convert between ObjectId and string
function toObjectId(id: string | ObjectId): ObjectId {
  return typeof id === 'string' ? new ObjectId(id) : id;
}

function toString(id: ObjectId | string): string {
  return typeof id === 'string' ? id : id.toHexString();
}

// Helper to convert MongoDB document to app format
function convertDoc<T extends { _id: ObjectId }>(doc: T | null): any {
  if (!doc) return undefined;
  const { _id, ...rest } = doc;
  return { id: toString(_id), ...rest };
}

// Helper to convert array of MongoDB documents to app format
function convertDocs<T extends { _id: ObjectId }>(docs: T[]): any[] {
  return docs.map(doc => convertDoc(doc));
}

// Helper to convert app object to MongoDB document
function toMongoDoc(obj: any, idFields: string[] = []): any {
  const { id, ...rest } = obj;
  const mongoDoc: any = { ...rest };
  
  // Convert id to _id if it exists
  if (id) {
    mongoDoc._id = toObjectId(id);
  }
  
  // Convert specified ID fields to ObjectId
  for (const field of idFields) {
    if (mongoDoc[field]) {
      mongoDoc[field] = toObjectId(mongoDoc[field]);
    }
  }
  
  return mongoDoc;
}

export class MongoDBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('users').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('users').findOne({ email });
    return convertDoc(doc);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('users').findOne({ firebaseUid });
    return convertDoc(doc);
  }

  async getAllUsers(): Promise<User[]> {
    const db = await getDatabase();
    const docs = await db.collection('users').find().toArray();
    return convertDocs(docs);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await getDatabase();
    const doc = {
      ...insertUser,
      createdAt: new Date(),
    };
    const result = await db.collection('users').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const db = await getDatabase();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { role } },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  // Tickets
  async getTicket(id: string): Promise<Ticket | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('tickets').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    const db = await getDatabase();
    const docs = await db.collection('tickets').find({ userId: toObjectId(userId) }).toArray();
    return convertDocs(docs);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const db = await getDatabase();
    const doc = {
      ...insertTicket,
      userId: toObjectId(insertTicket.userId),
      purchasedAt: new Date(),
    };
    const result = await db.collection('tickets').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateTicketPaymentStatus(id: string, status: string, reference?: string): Promise<Ticket | undefined> {
    const db = await getDatabase();
    const updates: any = { paymentStatus: status };
    if (reference) updates.paymentReference = reference;
    const result = await db.collection('tickets').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async getAllTickets(): Promise<Ticket[]> {
    const db = await getDatabase();
    const docs = await db.collection('tickets').find().toArray();
    return convertDocs(docs);
  }

  // Proposals
  async getProposal(id: string): Promise<Proposal | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('proposals').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getProposalsByUser(userId: string): Promise<Proposal[]> {
    const db = await getDatabase();
    const docs = await db.collection('proposals').find({ userId: toObjectId(userId) }).toArray();
    return convertDocs(docs);
  }

  async getAllProposals(): Promise<Proposal[]> {
    const db = await getDatabase();
    const docs = await db.collection('proposals').find().toArray();
    return convertDocs(docs);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const db = await getDatabase();
    const doc = {
      ...insertProposal,
      userId: toObjectId(insertProposal.userId),
      submittedAt: new Date(),
    };
    const result = await db.collection('proposals').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateProposalStatus(id: string, status: string, reviewNotes?: string): Promise<Proposal | undefined> {
    const db = await getDatabase();
    const updates: any = { 
      status, 
      reviewedAt: new Date()
    };
    if (reviewNotes) updates.reviewNotes = reviewNotes;
    const result = await db.collection('proposals').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  // Sponsorships
  async getSponsorship(id: string): Promise<Sponsorship | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('sponsorships').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getSponsorshipsByUser(userId: string): Promise<Sponsorship[]> {
    const db = await getDatabase();
    const docs = await db.collection('sponsorships').find({ userId: toObjectId(userId) }).toArray();
    return convertDocs(docs);
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    const db = await getDatabase();
    const docs = await db.collection('sponsorships').find().toArray();
    return convertDocs(docs);
  }

  async createSponsorship(insertSponsorship: InsertSponsorship): Promise<Sponsorship> {
    const db = await getDatabase();
    const doc = {
      ...insertSponsorship,
      userId: toObjectId(insertSponsorship.userId),
      purchasedAt: new Date(),
    };
    const result = await db.collection('sponsorships').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateSponsorshipPaymentStatus(id: string, status: string, reference?: string): Promise<Sponsorship | undefined> {
    const db = await getDatabase();
    const updates: any = { paymentStatus: status };
    if (reference) updates.paymentReference = reference;
    const result = await db.collection('sponsorships').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('sessions').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await getDatabase();
    const docs = await db.collection('sessions').find().toArray();
    return convertDocs(docs);
  }

  async getSessionsByDate(date: string): Promise<Session[]> {
    const db = await getDatabase();
    const docs = await db.collection('sessions').find().toArray();
    const sessions = convertDocs(docs);
    
    return sessions.filter(s => {
      if (!s.scheduledDate) return false;
      const sessionDate = new Date(s.scheduledDate).toISOString().split('T')[0];
      return sessionDate === date;
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const db = await getDatabase();
    const doc = {
      ...insertSession,
      proposalId: toObjectId(insertSession.proposalId),
      speakerId: toObjectId(insertSession.speakerId),
      totalRatings: 0,
    };
    const result = await db.collection('sessions').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const db = await getDatabase();
    const mongoUpdates = { ...updates };
    delete (mongoUpdates as any).id;
    
    if ((updates as any).proposalId) {
      (mongoUpdates as any).proposalId = toObjectId((updates as any).proposalId);
    }
    if ((updates as any).speakerId) {
      (mongoUpdates as any).speakerId = toObjectId((updates as any).speakerId);
    }
    
    const result = await db.collection('sessions').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteSession(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('sessions').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  async bulkUpdateSessions(updates: Array<{ id: string; scheduledDate: Date | null; scheduledTime: string | null; room: string | null }>): Promise<Session[]> {
    const db = await getDatabase();
    const results: Session[] = [];
    
    for (const update of updates) {
      const result = await db.collection('sessions').findOneAndUpdate(
        { _id: toObjectId(update.id) },
        { $set: {
          scheduledDate: update.scheduledDate,
          scheduledTime: update.scheduledTime,
          room: update.room
        }},
        { returnDocument: 'after' }
      );
      if (result) {
        results.push(convertDoc(result));
      }
    }
    
    return results;
  }

  // Attendance
  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const db = await getDatabase();
    const doc = {
      userId: toObjectId(insertAttendance.userId),
      sessionId: toObjectId(insertAttendance.sessionId),
      markedAt: new Date(),
    };
    const result = await db.collection('attendance').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async unmarkAttendance(userId: string, sessionId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('attendance').deleteOne({
      userId: toObjectId(userId),
      sessionId: toObjectId(sessionId)
    });
    return result.deletedCount > 0;
  }

  async getUserAttendance(userId: string): Promise<Attendance[]> {
    const db = await getDatabase();
    const docs = await db.collection('attendance').find({ userId: toObjectId(userId) }).toArray();
    return convertDocs(docs);
  }

  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    const db = await getDatabase();
    const docs = await db.collection('attendance').find({ sessionId: toObjectId(sessionId) }).toArray();
    return convertDocs(docs);
  }

  // Ratings
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const db = await getDatabase();
    const doc = {
      ...insertRating,
      userId: toObjectId(insertRating.userId),
      sessionId: toObjectId(insertRating.sessionId),
      ratedAt: new Date(),
    };
    const result = await db.collection('ratings').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async getSessionRatings(sessionId: string): Promise<Rating[]> {
    const db = await getDatabase();
    const docs = await db.collection('ratings').find({ sessionId: toObjectId(sessionId) }).toArray();
    return convertDocs(docs);
  }

  async getUserRating(userId: string, sessionId: string): Promise<Rating | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('ratings').findOne({
      userId: toObjectId(userId),
      sessionId: toObjectId(sessionId)
    });
    return convertDoc(doc);
  }

  async updateSessionAverageRating(sessionId: string): Promise<void> {
    const sessionRatings = await this.getSessionRatings(sessionId);
    if (sessionRatings.length === 0) return;

    const avgRating = Math.round(
      sessionRatings.reduce((sum, r) => sum + r.rating, 0) / sessionRatings.length
    );

    const db = await getDatabase();
    await db.collection('sessions').updateOne(
      { _id: toObjectId(sessionId) },
      { $set: { 
        averageRating: avgRating,
        totalRatings: sessionRatings.length 
      }}
    );
  }

  // Certificates
  async getCertificate(id: string): Promise<Certificate | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('certificates').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async getUserCertificate(userId: string): Promise<Certificate | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('certificates').findOne({ userId: toObjectId(userId) });
    return convertDoc(doc);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const db = await getDatabase();
    const doc = {
      ...insertCertificate,
      userId: toObjectId(insertCertificate.userId),
      generatedAt: new Date(),
    };
    const result = await db.collection('certificates').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  // FAQs
  async getAllFaqs(): Promise<Faq[]> {
    const db = await getDatabase();
    const docs = await db.collection('faqs').find().toArray();
    return convertDocs(docs);
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const db = await getDatabase();
    const doc = { ...insertFaq };
    const result = await db.collection('faqs').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  // Connections
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const db = await getDatabase();
    const doc = {
      ...insertConnection,
      requesterId: toObjectId(insertConnection.requesterId),
      addresseeId: toObjectId(insertConnection.addresseeId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('connections').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    const db = await getDatabase();
    const userOid = toObjectId(userId);
    const docs = await db.collection('connections').find({
      $or: [
        { requesterId: userOid },
        { addresseeId: userOid }
      ]
    }).toArray();
    return convertDocs(docs);
  }

  async updateConnectionStatus(id: string, status: string): Promise<Connection | undefined> {
    const db = await getDatabase();
    const result = await db.collection('connections').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async getConnection(requesterId: string, addresseeId: string): Promise<Connection | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('connections').findOne({
      requesterId: toObjectId(requesterId),
      addresseeId: toObjectId(addresseeId)
    });
    return convertDoc(doc);
  }

  // Conversations
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const db = await getDatabase();
    const doc = {
      participant1Id: toObjectId(insertConversation.participant1Id),
      participant2Id: toObjectId(insertConversation.participant2Id),
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };
    const result = await db.collection('conversations').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async getConversation(participant1Id: string, participant2Id: string): Promise<Conversation | undefined> {
    const db = await getDatabase();
    const p1 = toObjectId(participant1Id);
    const p2 = toObjectId(participant2Id);
    
    const doc = await db.collection('conversations').findOne({
      $or: [
        { participant1Id: p1, participant2Id: p2 },
        { participant1Id: p2, participant2Id: p1 }
      ]
    });
    return convertDoc(doc);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const db = await getDatabase();
    const userOid = toObjectId(userId);
    const docs = await db.collection('conversations').find({
      $or: [
        { participant1Id: userOid },
        { participant2Id: userOid }
      ]
    }).toArray();
    return convertDocs(docs);
  }

  async updateConversationLastMessage(id: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('conversations').updateOne(
      { _id: toObjectId(id) },
      { $set: { lastMessageAt: new Date() } }
    );
  }

  // Messages
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const db = await getDatabase();
    const doc = {
      conversationId: toObjectId(insertMessage.conversationId),
      senderId: toObjectId(insertMessage.senderId),
      content: insertMessage.content,
      isRead: false,
      createdAt: new Date(),
    };
    const result = await db.collection('messages').insertOne(doc);
    await this.updateConversationLastMessage(insertMessage.conversationId);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const db = await getDatabase();
    const docs = await db.collection('messages').find({ conversationId: toObjectId(conversationId) }).toArray();
    return convertDocs(docs);
  }

  async markMessageAsRead(id: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('messages').updateOne(
      { _id: toObjectId(id) },
      { $set: { isRead: true } }
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const userConvs = await this.getUserConversations(userId);
    const convIds = userConvs.map(c => c.id);
    
    const db = await getDatabase();
    const unreadMessages = await db.collection('messages').find({
      conversationId: { $in: convIds.map(id => toObjectId(id)) },
      isRead: false
    }).toArray();
    
    return unreadMessages.filter((m: any) => 
      toString(m.senderId) !== userId
    ).length;
  }

  // Analytics
  async getRevenueSnapshots(startDate?: Date, endDate?: Date): Promise<RevenueSnapshot[]> {
    const db = await getDatabase();
    let query: any = {};
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const docs = await db.collection('revenue_snapshots').find(query).toArray();
    return convertDocs(docs);
  }

  async getLatestRevenueSnapshot(): Promise<RevenueSnapshot | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('revenue_snapshots')
      .find()
      .sort({ date: -1 })
      .limit(1)
      .toArray();
    return doc[0] ? convertDoc(doc[0]) : undefined;
  }

  async getEngagementMetrics(startDate?: Date, endDate?: Date): Promise<EngagementMetric[]> {
    const db = await getDatabase();
    let query: any = {};
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const docs = await db.collection('engagement_metrics').find(query).toArray();
    return convertDocs(docs);
  }

  async getLatestEngagementMetric(): Promise<EngagementMetric | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('engagement_metrics')
      .find()
      .sort({ date: -1 })
      .limit(1)
      .toArray();
    return doc[0] ? convertDoc(doc[0]) : undefined;
  }

  async getSponsorMetrics(sponsorshipId: string): Promise<SponsorMetric[]> {
    const db = await getDatabase();
    const docs = await db.collection('sponsor_metrics')
      .find({ sponsorshipId: toObjectId(sponsorshipId) })
      .toArray();
    return convertDocs(docs);
  }

  async getAllSponsorMetrics(startDate?: Date, endDate?: Date): Promise<SponsorMetric[]> {
    const db = await getDatabase();
    let query: any = {};
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const docs = await db.collection('sponsor_metrics').find(query).toArray();
    return convertDocs(docs);
  }

  async getSessionMetrics(sessionId: string): Promise<SessionMetric | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('session_metrics')
      .findOne({ sessionId: toObjectId(sessionId) });
    return convertDoc(doc);
  }

  async getAllSessionMetrics(): Promise<SessionMetric[]> {
    const db = await getDatabase();
    const docs = await db.collection('session_metrics').find().toArray();
    return convertDocs(docs);
  }

  async updateSessionMetrics(sessionId: string): Promise<void> {
    const attendanceRecords = await this.getSessionAttendance(sessionId);
    const attendanceCount = attendanceRecords.length;

    const ratingRecords = await this.getSessionRatings(sessionId);
    const totalRatings = ratingRecords.length;
    const averageRating = totalRatings > 0
      ? Math.round(ratingRecords.reduce((sum, r) => sum + r.rating, 0) / totalRatings)
      : null;

    const completionRate = attendanceCount > 0
      ? Math.round((totalRatings / attendanceCount) * 100)
      : 0;

    const engagementScore = attendanceCount + totalRatings;

    const existing = await this.getSessionMetrics(sessionId);
    const db = await getDatabase();

    if (existing) {
      await db.collection('session_metrics').updateOne(
        { sessionId: toObjectId(sessionId) },
        { $set: {
          attendanceCount,
          averageRating,
          totalRatings,
          engagementScore,
          completionRate,
          updatedAt: new Date()
        }}
      );
    } else {
      await db.collection('session_metrics').insertOne({
        sessionId: toObjectId(sessionId),
        attendanceCount,
        averageRating,
        totalRatings,
        engagementScore,
        completionRate,
        updatedAt: new Date()
      });
    }
  }

  // Team Members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    const db = await getDatabase();
    const docs = await db.collection('team_members').find().toArray();
    return convertDocs(docs);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('team_members').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const db = await getDatabase();
    const doc: any = {
      ...insertTeamMember,
      invitedBy: toObjectId(insertTeamMember.invitedBy),
      invitedAt: new Date(),
    };
    
    if (insertTeamMember.userId) {
      doc.userId = toObjectId(insertTeamMember.userId);
    }
    
    const result = await db.collection('team_members').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const db = await getDatabase();
    const mongoUpdates: any = { ...updates };
    delete mongoUpdates.id;
    
    if (updates.invitedBy) {
      mongoUpdates.invitedBy = toObjectId(updates.invitedBy);
    }
    if ((updates as any).userId) {
      mongoUpdates.userId = toObjectId((updates as any).userId);
    }
    
    const result = await db.collection('team_members').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('team_members').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // CFP Settings
  async getCfpSettings(): Promise<CfpSetting | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('cfp_settings').findOne();
    return convertDoc(doc);
  }

  async updateCfpSettings(updates: Partial<CfpSetting>): Promise<CfpSetting> {
    const db = await getDatabase();
    const existing = await this.getCfpSettings();
    const mongoUpdates: any = { ...updates, updatedAt: new Date() };
    delete mongoUpdates.id;
    
    if (updates.updatedBy) {
      mongoUpdates.updatedBy = toObjectId(updates.updatedBy);
    }
    
    if (existing) {
      const result = await db.collection('cfp_settings').findOneAndUpdate(
        { _id: toObjectId(existing.id) },
        { $set: mongoUpdates },
        { returnDocument: 'after' }
      );
      return convertDoc(result);
    } else {
      const result = await db.collection('cfp_settings').insertOne(mongoUpdates);
      return convertDoc({ _id: result.insertedId, ...mongoUpdates });
    }
  }

  // Conference Settings
  async getConferenceSettings(): Promise<ConferenceSetting | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('conference_settings').findOne();
    return convertDoc(doc);
  }

  async updateConferenceSettings(updates: Partial<ConferenceSetting>): Promise<ConferenceSetting> {
    const db = await getDatabase();
    const existing = await this.getConferenceSettings();
    const mongoUpdates: any = { ...updates, updatedAt: new Date() };
    delete mongoUpdates.id;
    
    if (updates.updatedBy) {
      mongoUpdates.updatedBy = toObjectId(updates.updatedBy);
    }
    
    if (existing) {
      const result = await db.collection('conference_settings').findOneAndUpdate(
        { _id: toObjectId(existing.id) },
        { $set: mongoUpdates },
        { returnDocument: 'after' }
      );
      return convertDoc(result);
    } else {
      const result = await db.collection('conference_settings').insertOne({
        ...mongoUpdates,
        eventName: mongoUpdates.eventName || "West Africa Design Forum 2026",
        isDateConfirmed: mongoUpdates.isDateConfirmed ?? false,
        isLocationConfirmed: mongoUpdates.isLocationConfirmed ?? false,
      });
      return convertDoc({ _id: result.insertedId, ...mongoUpdates });
    }
  }

  // Ticket Options
  async getAllTicketOptions(): Promise<TicketOption[]> {
    const db = await getDatabase();
    const docs = await db.collection('ticket_options').find().toArray();
    return convertDocs(docs);
  }

  async getTicketOption(id: string): Promise<TicketOption | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('ticket_options').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createTicketOption(insertTicketOption: InsertTicketOption): Promise<TicketOption> {
    const db = await getDatabase();
    const doc = {
      ...insertTicketOption,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('ticket_options').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateTicketOption(id: string, updates: Partial<TicketOption>): Promise<TicketOption | undefined> {
    const db = await getDatabase();
    const mongoUpdates = { ...updates, updatedAt: new Date() };
    delete (mongoUpdates as any).id;
    
    const result = await db.collection('ticket_options').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteTicketOption(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('ticket_options').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // Sponsorship Packages
  async getAllSponsorshipPackages(): Promise<SponsorshipPackage[]> {
    const db = await getDatabase();
    const docs = await db.collection('sponsorship_packages').find().toArray();
    return convertDocs(docs);
  }

  async getSponsorshipPackage(id: string): Promise<SponsorshipPackage | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('sponsorship_packages').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createSponsorshipPackage(insertPackage: InsertSponsorshipPackage): Promise<SponsorshipPackage> {
    const db = await getDatabase();
    const doc = {
      ...insertPackage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('sponsorship_packages').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateSponsorshipPackage(id: string, updates: Partial<SponsorshipPackage>): Promise<SponsorshipPackage | undefined> {
    const db = await getDatabase();
    const mongoUpdates = { ...updates, updatedAt: new Date() };
    delete (mongoUpdates as any).id;
    
    const result = await db.collection('sponsorship_packages').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteSponsorshipPackage(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('sponsorship_packages').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // Page Settings
  async getAllPageSettings(): Promise<PageSetting[]> {
    const db = await getDatabase();
    const docs = await db.collection('page_settings').find().toArray();
    return convertDocs(docs);
  }

  async getPageSetting(pageName: string): Promise<PageSetting | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('page_settings').findOne({ pageName });
    return convertDoc(doc);
  }

  async updatePageSetting(pageName: string, updates: Partial<PageSetting>): Promise<PageSetting> {
    const db = await getDatabase();
    const existing = await this.getPageSetting(pageName);
    const mongoUpdates: any = { ...updates, updatedAt: new Date() };
    delete mongoUpdates.id;
    
    if (updates.updatedBy) {
      mongoUpdates.updatedBy = toObjectId(updates.updatedBy);
    }
    
    if (existing) {
      const result = await db.collection('page_settings').findOneAndUpdate(
        { pageName },
        { $set: mongoUpdates },
        { returnDocument: 'after' }
      );
      return convertDoc(result);
    } else {
      const doc = { pageName, ...mongoUpdates };
      const result = await db.collection('page_settings').insertOne(doc);
      return convertDoc({ _id: result.insertedId, ...doc });
    }
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    const db = await getDatabase();
    const docs = await db.collection('tasks').find().toArray();
    return convertDocs(docs);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('tasks').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const db = await getDatabase();
    const doc: any = {
      ...insertTask,
      assignedBy: toObjectId(insertTask.assignedBy),
      createdAt: new Date(),
    };
    
    if (insertTask.assignedTo) {
      doc.assignedTo = toObjectId(insertTask.assignedTo);
    }
    if (insertTask.relatedEntityId) {
      doc.relatedEntityId = toObjectId(insertTask.relatedEntityId);
    }
    
    const result = await db.collection('tasks').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const db = await getDatabase();
    const mongoUpdates: any = { ...updates };
    delete mongoUpdates.id;
    
    if (updates.assignedTo) {
      mongoUpdates.assignedTo = toObjectId(updates.assignedTo);
    }
    if (updates.assignedBy) {
      mongoUpdates.assignedBy = toObjectId(updates.assignedBy);
    }
    if ((updates as any).relatedEntityId) {
      mongoUpdates.relatedEntityId = toObjectId((updates as any).relatedEntityId);
    }
    
    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('tasks').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // Proposal Evaluators
  async getAllProposalEvaluators(): Promise<ProposalEvaluator[]> {
    const db = await getDatabase();
    const docs = await db.collection('proposal_evaluators').find().toArray();
    return convertDocs(docs);
  }

  async getProposalEvaluator(id: string): Promise<ProposalEvaluator | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('proposal_evaluators').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createProposalEvaluator(insertEvaluator: InsertProposalEvaluator): Promise<ProposalEvaluator> {
    const db = await getDatabase();
    const doc = {
      ...insertEvaluator,
      teamMemberId: toObjectId(insertEvaluator.teamMemberId),
      createdAt: new Date(),
    };
    const result = await db.collection('proposal_evaluators').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateProposalEvaluator(id: string, updates: Partial<ProposalEvaluator>): Promise<ProposalEvaluator | undefined> {
    const db = await getDatabase();
    const mongoUpdates: any = { ...updates };
    delete mongoUpdates.id;
    
    if (updates.teamMemberId) {
      mongoUpdates.teamMemberId = toObjectId(updates.teamMemberId);
    }
    
    const result = await db.collection('proposal_evaluators').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deleteProposalEvaluator(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('proposal_evaluators').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // Proposal Evaluations
  async getProposalEvaluations(proposalId: string): Promise<ProposalEvaluation[]> {
    const db = await getDatabase();
    const docs = await db.collection('proposal_evaluations')
      .find({ proposalId: toObjectId(proposalId) })
      .toArray();
    return convertDocs(docs);
  }

  async getEvaluatorEvaluations(evaluatorId: string): Promise<ProposalEvaluation[]> {
    const db = await getDatabase();
    const docs = await db.collection('proposal_evaluations')
      .find({ evaluatorId: toObjectId(evaluatorId) })
      .toArray();
    return convertDocs(docs);
  }

  async createProposalEvaluation(insertEvaluation: InsertProposalEvaluation): Promise<ProposalEvaluation> {
    const db = await getDatabase();
    const doc = {
      ...insertEvaluation,
      proposalId: toObjectId(insertEvaluation.proposalId),
      evaluatorId: toObjectId(insertEvaluation.evaluatorId),
      assignedAt: new Date(),
    };
    const result = await db.collection('proposal_evaluations').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updateProposalEvaluation(id: string, updates: Partial<ProposalEvaluation>): Promise<ProposalEvaluation | undefined> {
    const db = await getDatabase();
    const mongoUpdates: any = { ...updates };
    delete mongoUpdates.id;
    
    if (updates.proposalId) {
      mongoUpdates.proposalId = toObjectId(updates.proposalId);
    }
    if (updates.evaluatorId) {
      mongoUpdates.evaluatorId = toObjectId(updates.evaluatorId);
    }
    
    const result = await db.collection('proposal_evaluations').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  // Posts methods
  async getAllPosts(): Promise<Post[]> {
    const db = await getDatabase();
    const docs = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return convertDocs(docs);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    const db = await getDatabase();
    const docs = await db.collection('posts')
      .find({ userId: toObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    return convertDocs(docs);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('posts').findOne({ _id: toObjectId(id) });
    return convertDoc(doc);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const db = await getDatabase();
    const doc = {
      ...insertPost,
      userId: toObjectId(insertPost.userId),
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
    };
    const result = await db.collection('posts').insertOne(doc);
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const db = await getDatabase();
    const mongoUpdates: any = { ...updates };
    delete mongoUpdates.id;
    
    if (updates.userId) {
      mongoUpdates.userId = toObjectId(updates.userId);
    }
    
    const result = await db.collection('posts').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: mongoUpdates },
      { returnDocument: 'after' }
    );
    return convertDoc(result);
  }

  async deletePost(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('posts').deleteOne({ _id: toObjectId(id) });
    return result.deletedCount > 0;
  }

  // Post Likes methods
  async getPostLikes(postId: string): Promise<PostLike[]> {
    const db = await getDatabase();
    const docs = await db.collection('post_likes')
      .find({ postId: toObjectId(postId) })
      .toArray();
    return convertDocs(docs);
  }

  async getUserLike(postId: string, userId: string): Promise<PostLike | undefined> {
    const db = await getDatabase();
    const doc = await db.collection('post_likes').findOne({
      postId: toObjectId(postId),
      userId: toObjectId(userId),
    });
    return convertDoc(doc);
  }

  async createPostLike(insertLike: InsertPostLike): Promise<PostLike> {
    const db = await getDatabase();
    const doc = {
      ...insertLike,
      postId: toObjectId(insertLike.postId),
      userId: toObjectId(insertLike.userId),
      createdAt: new Date(),
    };
    const result = await db.collection('post_likes').insertOne(doc);
    
    // Update likes count
    await db.collection('posts').updateOne(
      { _id: toObjectId(insertLike.postId) },
      { $inc: { likesCount: 1 } }
    );
    
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async deletePostLike(id: string): Promise<boolean> {
    const db = await getDatabase();
    const like = await db.collection('post_likes').findOne({ _id: toObjectId(id) });
    if (!like) return false;
    
    const result = await db.collection('post_likes').deleteOne({ _id: toObjectId(id) });
    
    if (result.deletedCount > 0) {
      // Update likes count
      await db.collection('posts').updateOne(
        { _id: like.postId },
        { $inc: { likesCount: -1 } }
      );
    }
    
    return result.deletedCount > 0;
  }

  // Post Comments methods
  async getPostComments(postId: string): Promise<PostComment[]> {
    const db = await getDatabase();
    const docs = await db.collection('post_comments')
      .find({ postId: toObjectId(postId) })
      .sort({ createdAt: 1 })
      .toArray();
    return convertDocs(docs);
  }

  async createPostComment(insertComment: InsertPostComment): Promise<PostComment> {
    const db = await getDatabase();
    const doc = {
      ...insertComment,
      postId: toObjectId(insertComment.postId),
      userId: toObjectId(insertComment.userId),
      createdAt: new Date(),
    };
    const result = await db.collection('post_comments').insertOne(doc);
    
    // Update comments count
    await db.collection('posts').updateOne(
      { _id: toObjectId(insertComment.postId) },
      { $inc: { commentsCount: 1 } }
    );
    
    return convertDoc({ _id: result.insertedId, ...doc });
  }

  async deletePostComment(id: string): Promise<boolean> {
    const db = await getDatabase();
    const comment = await db.collection('post_comments').findOne({ _id: toObjectId(id) });
    if (!comment) return false;
    
    const result = await db.collection('post_comments').deleteOne({ _id: toObjectId(id) });
    
    if (result.deletedCount > 0) {
      // Update comments count
      await db.collection('posts').updateOne(
        { _id: comment.postId },
        { $inc: { commentsCount: -1 } }
      );
    }
    
    return result.deletedCount > 0;
  }
}

// Export the storage instance using MongoDB
export const mongoStorage = new MongoDBStorage();
