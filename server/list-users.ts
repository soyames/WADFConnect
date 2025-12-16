/**
 * Script to list all users
 * Usage: tsx server/list-users.ts
 */

import { getDatabase } from "./mongodb";

async function listUsers() {
  try {
    console.log("📋 Fetching all users...\n");
    
    const db = await getDatabase();
    const users = await db.collection('users').find({}).toArray();

    if (users.length === 0) {
      console.log("❌ No users found in the database.");
      console.log("\n💡 Create a user by:");
      console.log("   1. Purchasing a ticket on the website");
      console.log("   2. Or signing up");
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'attendee'}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log();
    });

    console.log("\n💡 To make a user admin, run:");
    console.log("   tsx server/make-admin.ts user@example.com");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

listUsers();
