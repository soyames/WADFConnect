import { z } from "zod";
import { ObjectId } from "mongodb";

// Helper to convert ObjectId to string
export function objectIdToString(id: ObjectId | string): string {
  return typeof id === 'string' ? id : id.toHexString();
}

// Helper to create ObjectId
export function createObjectId(id?: string): ObjectId {
  return id ? new ObjectId(id) : new ObjectId();
}

// Reuse the same types from schema.ts but for MongoDB documents
export type UserRole = "attendee" | "speaker" | "sponsor" | "organizer" | "admin";

// Base MongoDB document types
export interface MongoUser {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
  firebaseUid?: string;
  createdAt: Date;
}

export interface MongoTicket {
  _id: ObjectId;
  userId: ObjectId;
  ticketType: string;
  price: number;
  currency: string;
  paymentStatus: string;
  paymentReference?: string;
  purchasedAt: Date;
}

export interface MongoProposal {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  track: string;
  sessionType: string;
  duration: number;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface MongoSponsorship {
  _id: ObjectId;
  userId: ObjectId;
  companyName: string;
  tier: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentReference?: string;
  benefits?: any;
  logoUrl?: string;
  websiteUrl?: string;
  purchasedAt: Date;
}

export interface MongoSession {
  _id: ObjectId;
  proposalId: ObjectId;
  speakerId: ObjectId;
  title: string;
  description: string;
  track: string;
  sessionType: string;
  duration: number;
  scheduledDate?: Date;
  scheduledTime?: string;
  room?: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface MongoAttendance {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: ObjectId;
  markedAt: Date;
}

export interface MongoRating {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: ObjectId;
  rating: number;
  comment?: string;
  ratedAt: Date;
}

export interface MongoCertificate {
  _id: ObjectId;
  userId: ObjectId;
  attendedSessions: any;
  generatedAt: Date;
  pdfUrl?: string;
}

export interface MongoFaq {
  _id: ObjectId;
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export interface MongoConnection {
  _id: ObjectId;
  requesterId: ObjectId;
  addresseeId: ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoConversation {
  _id: ObjectId;
  participant1Id: ObjectId;
  participant2Id: ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface MongoMessage {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MongoPost {
  _id: ObjectId;
  userId: ObjectId;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}

export interface MongoPostLike {
  _id: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface MongoPostComment {
  _id: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
}

export interface MongoRevenueSnapshot {
  _id: ObjectId;
  date: Date;
  totalRevenue: number;
  ticketRevenue: number;
  sponsorshipRevenue: number;
  ticketsSold: number;
  sponsorshipsCount: number;
  earlyBirdSold: number;
  regularSold: number;
  vipSold: number;
  createdAt: Date;
}

export interface MongoEngagementMetric {
  _id: ObjectId;
  date: Date;
  activeUsers: number;
  sessionAttendance: number;
  ratingsSubmitted: number;
  connectionsCreated: number;
  messagesSent: number;
  certificatesIssued: number;
  topSession?: string;
  topSessionAttendance?: number;
  createdAt: Date;
}

export interface MongoSponsorMetric {
  _id: ObjectId;
  sponsorshipId: ObjectId;
  date: Date;
  profileViews: number;
  websiteClicks: number;
  logoImpressions: number;
  attendeeConnections: number;
  sessionAttendance: number;
  leadsCaptured: number;
  createdAt: Date;
}

export interface MongoSessionMetric {
  _id: ObjectId;
  sessionId: ObjectId;
  attendanceCount: number;
  averageRating?: number;
  totalRatings: number;
  engagementScore: number;
  completionRate?: number;
  updatedAt: Date;
}

export interface MongoAdminSetting {
  _id: ObjectId;
  key: string;
  value: string;
  updatedBy?: ObjectId;
  updatedAt: Date;
}

export interface MongoTeamMember {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
  permissions?: any;
  invitedBy: ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  userId?: ObjectId;
  status: string;
}

export interface MongoProposalEvaluator {
  _id: ObjectId;
  teamMemberId: ObjectId;
  expertise?: string;
  assignedProposalsCount?: number;
  completedEvaluations?: number;
  createdAt: Date;
}

export interface MongoProposalEvaluation {
  _id: ObjectId;
  proposalId: ObjectId;
  evaluatorId: ObjectId;
  status: string;
  relevanceScore?: number;
  qualityScore?: number;
  innovationScore?: number;
  impactScore?: number;
  feasibilityScore?: number;
  overallScore?: number;
  comments?: string;
  recommendation?: string;
  assignedAt: Date;
  completedAt?: Date;
}

export interface MongoTask {
  _id: ObjectId;
  title: string;
  description?: string;
  assignedTo?: ObjectId;
  assignedBy: ObjectId;
  priority: string;
  status: string;
  dueDate?: Date;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: ObjectId;
  createdAt: Date;
  completedAt?: Date;
}

export interface MongoTicketOption {
  _id: ObjectId;
  name: string;
  type: string;
  price: number;
  currency: string;
  description?: string;
  features?: any;
  available: boolean;
  capacity?: number;
  sold?: number;
  salesStartDate?: Date;
  salesEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoSponsorshipPackage {
  _id: ObjectId;
  name: string;
  tier: string;
  price: number;
  currency: string;
  description?: string;
  benefits?: any;
  available: boolean;
  capacity?: number;
  sold?: number;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoPageSetting {
  _id: ObjectId;
  pageName: string;
  isVisible: boolean;
  placeholderTitle?: string;
  placeholderMessage?: string;
  updatedBy?: ObjectId;
  updatedAt: Date;
}

export interface MongoCfpSetting {
  _id: ObjectId;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  placeholderTitle?: string;
  placeholderMessage?: string;
  evaluationCriteria?: any;
  submissionGuidelines?: string;
  allowedTracks?: any;
  allowedSessionTypes?: any;
  minDuration?: number;
  maxDuration?: number;
  updatedBy?: ObjectId;
  updatedAt: Date;
}
