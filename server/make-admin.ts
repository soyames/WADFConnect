/**
 * Script to make a user an admin
 * Usage: tsx server/make-admin.ts your-email@example.com
 */

import { getDatabase } from "./mongodb";

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.error("Usage: tsx server/make-admin.ts your-email@example.com");
  process.exit(1);
}

async function makeAdmin() {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    const db = await getDatabase();
    const result = await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.error(`❌ No user found with email: ${email}`);
      console.log("\n💡 Make sure:");
      console.log("   1. The user has created an account (purchased a ticket or signed up)");
      console.log("   2. The email address is correct");
      process.exit(1);
    }

    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully made ${email} an admin!`);
      console.log("\n🎉 You can now access the admin dashboard at: /admin");
      console.log("   Log out and log back in to see the changes.");
    } else {
      console.log(`ℹ️  User ${email} is already an admin.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

makeAdmin();
