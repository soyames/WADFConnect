import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger when a new team member is invited
 * Sends email notification with invitation details
 */
export const onTeamMemberInvited = functions.firestore
  .document("team_members/{memberId}")
  .onCreate(async (snap, context) => {
    const teamMember = snap.data();
    
    functions.logger.info("New team member invited:", {
      email: teamMember.email,
      role: teamMember.role,
    });

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // Send invitation email with invitation token
    
    return null;
  });

/**
 * Trigger when a ticket is purchased
 * Creates user account if it doesn't exist and sends confirmation
 */
export const onTicketPurchased = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snap, context) => {
    const ticket = snap.data();
    
    functions.logger.info("New ticket purchased:", {
      ticketId: context.params.ticketId,
      userId: ticket.userId,
      tier: ticket.tier,
    });

    // Get user details
    const userDoc = await db.collection("users").doc(ticket.userId).get();
    
    if (userDoc.exists) {
      const user = userDoc.data();
      
      // TODO: Send confirmation email with ticket details
      functions.logger.info("Sending ticket confirmation to:", user?.email);
    }

    return null;
  });

/**
 * Trigger when a proposal status changes
 * Notifies the submitter about status updates
 */
export const onProposalStatusChange = functions.firestore
  .document("proposals/{proposalId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed
    if (before.status !== after.status) {
      functions.logger.info("Proposal status changed:", {
        proposalId: context.params.proposalId,
        oldStatus: before.status,
        newStatus: after.status,
      });

      // Get user details
      const userDoc = await db.collection("users").doc(after.userId).get();
      
      if (userDoc.exists) {
        const user = userDoc.data();
        
        // TODO: Send status change notification email
        functions.logger.info("Notifying submitter:", {
          email: user?.email,
          status: after.status,
        });
      }
    }

    return null;
  });

/**
 * Trigger when attendance is marked
 * Can generate certificate automatically after session completion
 */
export const onAttendanceMarked = functions.firestore
  .document("attendance/{attendanceId}")
  .onCreate(async (snap, context) => {
    const attendance = snap.data();
    
    functions.logger.info("Attendance marked:", {
      userId: attendance.userId,
      sessionId: attendance.sessionId,
    });

    // Get session details
    const sessionDoc = await db.collection("sessions").doc(attendance.sessionId).get();
    
    if (sessionDoc.exists) {
      const session = sessionDoc.data();
      
      // Check if session is completed
      if (session && new Date(session.endTime) < new Date()) {
        functions.logger.info("Session completed, checking certificate eligibility");
        
        // TODO: Check if user qualifies for certificate
        // Generate certificate if eligible
      }
    }

    return null;
  });

/**
 * Scheduled function to aggregate daily analytics
 * Runs every day at midnight UTC
 */
export const aggregateDailyAnalytics = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    functions.logger.info("Running daily analytics aggregation");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Calculate revenue snapshot
      const ticketsSnapshot = await db.collection("tickets")
        .where("purchasedAt", ">=", today)
        .get();

      let dailyRevenue = 0;
      ticketsSnapshot.forEach((doc) => {
        const ticket = doc.data();
        dailyRevenue += ticket.price || 0;
      });

      // Store revenue snapshot
      await db.collection("revenue_snapshots").add({
        date: admin.firestore.Timestamp.fromDate(today),
        totalRevenue: dailyRevenue,
        ticketsSold: ticketsSnapshot.size,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Calculate engagement metrics
      const activeUsersSnapshot = await db.collection("users")
        .where("lastLoginAt", ">=", today)
        .get();

      const connectionsSnapshot = await db.collection("connections")
        .where("createdAt", ">=", today)
        .get();

      const messagesSnapshot = await db.collection("messages")
        .where("sentAt", ">=", today)
        .get();

      // Store engagement metrics
      await db.collection("engagement_metrics").add({
        date: admin.firestore.Timestamp.fromDate(today),
        activeUsers: activeUsersSnapshot.size,
        newConnections: connectionsSnapshot.size,
        messagesSent: messagesSnapshot.size,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info("Daily analytics aggregated successfully", {
        revenue: dailyRevenue,
        activeUsers: activeUsersSnapshot.size,
      });
    } catch (error) {
      functions.logger.error("Error aggregating analytics:", error);
    }

    return null;
  });

/**
 * Trigger when a new connection request is created
 * Notifies the addressee about the connection request
 */
export const onConnectionRequest = functions.firestore
  .document("connections/{connectionId}")
  .onCreate(async (snap, context) => {
    const connection = snap.data();
    
    if (connection.status === "pending") {
      // Get addressee details
      const addresseeDoc = await db.collection("users").doc(connection.addresseeId).get();
      const requesterDoc = await db.collection("users").doc(connection.requesterId).get();
      
      if (addresseeDoc.exists && requesterDoc.exists) {
        const addressee = addresseeDoc.data();
        const requester = requesterDoc.data();
        
        functions.logger.info("New connection request:", {
          from: requester?.name,
          to: addressee?.name,
        });
        
        // TODO: Send notification to addressee
      }
    }

    return null;
  });

/**
 * Trigger when a new message is sent
 * Sends push notification to recipient if they're not online
 */
export const onNewMessage = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    
    // Get conversation to find recipient
    const conversationDoc = await db.collection("conversations")
      .doc(message.conversationId).get();
    
    if (conversationDoc.exists) {
      const conversation = conversationDoc.data();
      
      // Determine recipient
      const recipientId = conversation?.participant1Id === message.senderId 
        ? conversation?.participant2Id 
        : conversation?.participant1Id;
      
      if (recipientId) {
        const recipientDoc = await db.collection("users").doc(recipientId).get();
        
        if (recipientDoc.exists) {
          const recipient = recipientDoc.data();
          
          functions.logger.info("New message sent:", {
            to: recipient?.name,
            conversationId: message.conversationId,
          });
          
          // TODO: Send push notification if recipient is offline
        }
      }
    }

    return null;
  });

/**
 * HTTP function to generate certificate on demand
 */
export const generateCertificate = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated to generate certificate"
    );
  }

  const { userId, sessionId } = data;

  if (!userId || !sessionId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "userId and sessionId are required"
    );
  }

  try {
    // Verify attendance
    const attendanceQuery = await db.collection("attendance")
      .where("userId", "==", userId)
      .where("sessionId", "==", sessionId)
      .get();

    if (attendanceQuery.empty) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Attendance not found for this session"
      );
    }

    // Get user and session details
    const userDoc = await db.collection("users").doc(userId).get();
    const sessionDoc = await db.collection("sessions").doc(sessionId).get();

    if (!userDoc.exists || !sessionDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User or session not found"
      );
    }

    const user = userDoc.data();
    const session = sessionDoc.data();

    // Generate certificate
    const certificate = {
      userId,
      sessionId,
      userName: user?.name,
      sessionTitle: session?.title,
      issuedAt: admin.firestore.FieldValue.serverTimestamp(),
      certificateUrl: "", // TODO: Generate PDF and upload to storage
    };

    const certRef = await db.collection("certificates").add(certificate);

    functions.logger.info("Certificate generated:", {
      certificateId: certRef.id,
      userId,
      sessionId,
    });

    return {
      success: true,
      certificateId: certRef.id,
    };
  } catch (error) {
    functions.logger.error("Error generating certificate:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate certificate"
    );
  }
});

/**
 * HTTP function to send test email (for debugging)
 */
export const sendTestEmail = functions.https.onCall(async (data, context) => {
  // Require admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated"
    );
  }

  // Verify user is admin
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const user = userDoc.data();

  if (!user || (user.role !== "admin" && user.role !== "organizer")) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin access required"
    );
  }

  const { to, subject, body } = data;

  functions.logger.info("Test email request:", { to, subject });

  // TODO: Integrate with email service
  // For now, just log

  return {
    success: true,
    message: "Email logged (integration pending)",
  };
});
