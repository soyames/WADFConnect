/**
 * Script to reset admin password
 * Usage: npx tsx server/reset-admin-password.ts
 */

import { getDatabase } from "./mongodb";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@wadf.org";
const NEW_PASSWORD = "WADF@Admin2026!";

async function resetAdminPassword() {
  try {
    console.log("🔑 Resetting admin password...\n");
    
    const db = await getDatabase();
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    
    // Try to update existing admin user
    const updateResult = await db.collection('users').updateOne(
      { email: ADMIN_EMAIL },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount > 0) {
      console.log(`✅ Password reset successful for ${ADMIN_EMAIL}!`);
    } else {
      // Create new admin user if doesn't exist
      console.log(`📝 Admin user not found. Creating new admin user...`);
      
      const insertResult = await db.collection('users').insertOne({
        email: ADMIN_EMAIL,
        name: "WADF Administrator",
        password: hashedPassword,
        role: "admin",
        firebaseUid: null,
        createdAt: new Date()
      });

      if (insertResult.acknowledged) {
        console.log(`✅ New admin user created: ${ADMIN_EMAIL}`);
      } else {
        console.error("❌ Failed to create admin user");
        process.exit(1);
      }
    }

    console.log("\n📋 Admin Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login at: https://wadfc-onnect.vercel.app/login");
    console.log("🔐 Admin Dashboard: https://wadfc-onnect.vercel.app/admin");
    console.log("\n⚠️  IMPORTANT: Change this password after logging in!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetAdminPassword();
