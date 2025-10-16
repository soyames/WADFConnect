import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles for RBAC
export type UserRole = "attendee" | "speaker" | "sponsor" | "organizer" | "admin";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("attendee"), // attendee, speaker, sponsor, organizer, admin
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tickets table
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ticketType: text("ticket_type").notNull(), // early-bird, regular, vip
  price: integer("price").notNull(), // in cents
  currency: text("currency").notNull().default("EUR"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  paymentReference: text("payment_reference"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  purchasedAt: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Call for Proposals (CFP)
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  track: text("track").notNull(), // design-thinking, innovation, technology, culture
  sessionType: text("session_type").notNull(), // talk, workshop, panel
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("submitted"), // submitted, under-review, accepted, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Sponsorships
export const sponsorships = pgTable("sponsorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  tier: text("tier").notNull(), // supporter, gala-dinner, gold, diamond
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("EUR"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  paymentReference: text("payment_reference"),
  benefits: json("benefits"), // array of benefits included in package
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  purchasedAt: true,
});

export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;

// Conference Sessions (from accepted proposals)
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  speakerId: varchar("speaker_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  track: text("track").notNull(),
  sessionType: text("session_type").notNull(),
  duration: integer("duration").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  scheduledTime: text("scheduled_time"), // e.g., "09:00-10:30"
  room: text("room"),
  averageRating: integer("average_rating"), // 1-5 scale, stored as int
  totalRatings: integer("total_ratings").default(0),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Session Attendance (many-to-many)
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  markedAt: timestamp("marked_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  markedAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Session Ratings
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  ratedAt: true,
});

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

// Certificates
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  attendedSessions: json("attended_sessions").notNull(), // array of session IDs
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  pdfUrl: text("pdf_url"),
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  generatedAt: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

// FAQ Items
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // general, tickets, speakers, sponsors
  order: integer("order").default(0),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
});

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Sponsorship tier definitions (for display purposes)
export const sponsorshipTiers = [
  {
    id: "supporter",
    name: "Supporter",
    price: 50,
    benefits: [
      "Logo on website",
      "Social media mention",
      "1 delegate pass"
    ]
  },
  {
    id: "gala-dinner",
    name: "Official Gala Dinner Sponsor",
    price: 3000,
    benefits: [
      "Exclusive branding at gala dinner",
      "Speaking opportunity at dinner",
      "Logo on all gala materials",
      "5 delegate passes",
      "Premium booth space"
    ]
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    price: 4000,
    benefits: [
      "Prominent logo placement",
      "Speaking slot (20 minutes)",
      "Premium booth location",
      "8 delegate passes",
      "Email list access",
      "Social media campaign inclusion"
    ]
  },
  {
    id: "diamond",
    name: "Diamond Sponsor",
    price: 5000,
    benefits: [
      "Title sponsor recognition",
      "Keynote speaking opportunity",
      "Largest booth space",
      "10 delegate passes",
      "Co-branding opportunities",
      "Exclusive networking event",
      "Full email list access",
      "Custom benefits package"
    ]
  }
] as const;

export type SponsorshipTier = typeof sponsorshipTiers[number];

// Connections table for networking
export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Conversations table for grouping messages
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table for direct messaging
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Analytics: Revenue Snapshots (aggregated daily revenue data)
export const revenueSnapshots = pgTable("revenue_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalRevenue: integer("total_revenue").notNull().default(0), // in cents
  ticketRevenue: integer("ticket_revenue").notNull().default(0), // in cents
  sponsorshipRevenue: integer("sponsorship_revenue").notNull().default(0), // in cents
  ticketsSold: integer("tickets_sold").notNull().default(0),
  sponsorshipsCount: integer("sponsorships_count").notNull().default(0),
  earlyBirdSold: integer("early_bird_sold").notNull().default(0),
  regularSold: integer("regular_sold").notNull().default(0),
  vipSold: integer("vip_sold").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRevenueSnapshotSchema = createInsertSchema(revenueSnapshots).omit({
  id: true,
  createdAt: true,
});

export type InsertRevenueSnapshot = z.infer<typeof insertRevenueSnapshotSchema>;
export type RevenueSnapshot = typeof revenueSnapshots.$inferSelect;

// Analytics: Engagement Metrics (daily user engagement data)
export const engagementMetrics = pgTable("engagement_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  activeUsers: integer("active_users").notNull().default(0),
  sessionAttendance: integer("session_attendance").notNull().default(0), // total attendance records
  ratingsSubmitted: integer("ratings_submitted").notNull().default(0),
  connectionsCreated: integer("connections_created").notNull().default(0),
  messagesSent: integer("messages_sent").notNull().default(0),
  certificatesIssued: integer("certificates_issued").notNull().default(0),
  topSession: text("top_session"), // session ID with most attendance
  topSessionAttendance: integer("top_session_attendance").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEngagementMetricSchema = createInsertSchema(engagementMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertEngagementMetric = z.infer<typeof insertEngagementMetricSchema>;
export type EngagementMetric = typeof engagementMetrics.$inferSelect;

// Analytics: Sponsor ROI Tracking
export const sponsorMetrics = pgTable("sponsor_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorshipId: varchar("sponsorship_id").notNull().references(() => sponsorships.id),
  date: timestamp("date").notNull(),
  profileViews: integer("profile_views").notNull().default(0),
  websiteClicks: integer("website_clicks").notNull().default(0),
  logoImpressions: integer("logo_impressions").notNull().default(0),
  attendeeConnections: integer("attendee_connections").notNull().default(0), // connections made with sponsor reps
  sessionAttendance: integer("session_attendance").notNull().default(0), // if sponsor has speaking session
  leadsCaptured: integer("leads_captured").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSponsorMetricSchema = createInsertSchema(sponsorMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertSponsorMetric = z.infer<typeof insertSponsorMetricSchema>;
export type SponsorMetric = typeof sponsorMetrics.$inferSelect;

// Analytics: Session Performance (detailed session analytics)
export const sessionMetrics = pgTable("session_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  attendanceCount: integer("attendance_count").notNull().default(0),
  averageRating: integer("average_rating"), // 1-5 scale
  totalRatings: integer("total_ratings").notNull().default(0),
  engagementScore: integer("engagement_score").notNull().default(0), // calculated score
  completionRate: integer("completion_rate").default(0), // percentage of attendees who rated
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSessionMetricSchema = createInsertSchema(sessionMetrics).omit({
  id: true,
  updatedAt: true,
});

export type InsertSessionMetric = z.infer<typeof insertSessionMetricSchema>;
export type SessionMetric = typeof sessionMetrics.$inferSelect;

// Admin Settings (system-wide configuration)
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., "cfp_active", "cfp_start_date", "cfp_end_date", "page_visibility_about"
  value: text("value").notNull(), // JSON or string value
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

// Team Members (invited staff/organizers)
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // admin, organizer, evaluator, content-manager
  permissions: json("permissions"), // array of permission strings
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
  userId: varchar("user_id").references(() => users.id), // links to users table when they accept invite
  status: text("status").notNull().default("invited"), // invited, active, inactive
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  invitedAt: true,
  joinedAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Proposal Evaluators (specific to CFP)
export const proposalEvaluators = pgTable("proposal_evaluators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").notNull().references(() => teamMembers.id),
  expertise: text("expertise"), // area of expertise
  assignedProposalsCount: integer("assigned_proposals_count").default(0),
  completedEvaluations: integer("completed_evaluations").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProposalEvaluatorSchema = createInsertSchema(proposalEvaluators).omit({
  id: true,
  createdAt: true,
});

export type InsertProposalEvaluator = z.infer<typeof insertProposalEvaluatorSchema>;
export type ProposalEvaluator = typeof proposalEvaluators.$inferSelect;

// Proposal Evaluations
export const proposalEvaluations = pgTable("proposal_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  evaluatorId: varchar("evaluator_id").notNull().references(() => proposalEvaluators.id),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  // Evaluation criteria scores (1-5 scale)
  relevanceScore: integer("relevance_score"), // how relevant to WADF themes
  qualityScore: integer("quality_score"), // quality of proposal content
  innovationScore: integer("innovation_score"), // innovation and uniqueness
  impactScore: integer("impact_score"), // potential impact on audience
  feasibilityScore: integer("feasibility_score"), // feasibility within conference format
  overallScore: integer("overall_score"), // calculated average
  comments: text("comments"),
  recommendation: text("recommendation"), // accept, reject, needs-revision
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertProposalEvaluationSchema = createInsertSchema(proposalEvaluations).omit({
  id: true,
  assignedAt: true,
  completedAt: true,
});

export type InsertProposalEvaluation = z.infer<typeof insertProposalEvaluationSchema>;
export type ProposalEvaluation = typeof proposalEvaluations.$inferSelect;

// Tasks (for team collaboration)
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").references(() => teamMembers.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, cancelled
  dueDate: timestamp("due_date"),
  category: text("category"), // content, evaluation, logistics, technical
  relatedEntityType: text("related_entity_type"), // proposal, session, sponsorship, etc.
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Ticket Options (configurable by admin)
export const ticketOptions = pgTable("ticket_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().unique(), // early-bird, regular, vip, custom
  price: integer("price").notNull(), // in cents
  currency: text("currency").notNull().default("EUR"),
  description: text("description"),
  features: json("features"), // array of feature strings
  available: boolean("available").notNull().default(true),
  capacity: integer("capacity"), // max tickets available
  sold: integer("sold").default(0),
  salesStartDate: timestamp("sales_start_date"),
  salesEndDate: timestamp("sales_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTicketOptionSchema = createInsertSchema(ticketOptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sold: true,
});

export type InsertTicketOption = z.infer<typeof insertTicketOptionSchema>;
export type TicketOption = typeof ticketOptions.$inferSelect;

// Sponsorship Packages (configurable by admin)
export const sponsorshipPackages = pgTable("sponsorship_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tier: text("tier").notNull().unique(), // supporter, gala-dinner, gold, diamond, custom
  price: integer("price").notNull(), // in cents
  currency: text("currency").notNull().default("EUR"),
  description: text("description"),
  benefits: json("benefits"), // array of benefit strings
  available: boolean("available").notNull().default(true),
  capacity: integer("capacity"), // max sponsors at this tier
  sold: integer("sold").default(0),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSponsorshipPackageSchema = createInsertSchema(sponsorshipPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sold: true,
});

export type InsertSponsorshipPackage = z.infer<typeof insertSponsorshipPackageSchema>;
export type SponsorshipPackage = typeof sponsorshipPackages.$inferSelect;

// Page Visibility Settings
export const pageSettings = pgTable("page_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull().unique(), // about, tickets, cfp, sponsors, agenda, network
  isVisible: boolean("is_visible").notNull().default(true),
  placeholderTitle: text("placeholder_title"),
  placeholderMessage: text("placeholder_message"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageSettingSchema = createInsertSchema(pageSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertPageSetting = z.infer<typeof insertPageSettingSchema>;
export type PageSetting = typeof pageSettings.$inferSelect;

// CFP Settings
export const cfpSettings = pgTable("cfp_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isActive: boolean("is_active").notNull().default(false),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  placeholderTitle: text("placeholder_title").default("Call for Proposals Opening Soon"),
  placeholderMessage: text("placeholder_message").default("We'll be opening our Call for Proposals soon. Check back for updates!"),
  evaluationCriteria: json("evaluation_criteria"), // array of criteria with descriptions
  submissionGuidelines: text("submission_guidelines"),
  allowedTracks: json("allowed_tracks"), // array of allowed track values
  allowedSessionTypes: json("allowed_session_types"), // array of allowed session types
  minDuration: integer("min_duration").default(15), // minutes
  maxDuration: integer("max_duration").default(90), // minutes
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCfpSettingSchema = createInsertSchema(cfpSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCfpSetting = z.infer<typeof insertCfpSettingSchema>;
export type CfpSetting = typeof cfpSettings.$inferSelect;
