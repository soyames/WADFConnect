/**
 * Script to create admin user in PostgreSQL
 * Usage: npx tsx server/create-admin-postgres.ts
 */

import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@wadf.org";
const ADMIN_PASSWORD = "WADF@Admin2026!";
const ADMIN_NAME = "WADF Administrator";

async function createAdmin() {
  try {
    console.log("🔑 Creating admin user in PostgreSQL...\n");
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log(`📝 Admin user already exists. Updating password...`);
      
      await db.update(users)
        .set({ 
          password: hashedPassword,
          role: "admin"
        })
        .where(eq(users.email, ADMIN_EMAIL));
      
      console.log(`✅ Admin password reset successful!`);
    } else {
      console.log(`📝 Creating new admin user...`);
      
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: hashedPassword,
        role: "admin",
        firebaseUid: null
      });
      
      console.log(`✅ Admin user created successfully!`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Admin Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login at: https://wadfc-onnect.vercel.app/login");
    console.log("🔐 Admin Dashboard: https://wadfc-onnect.vercel.app/admin");
    console.log("\n⚠️  IMPORTANT: Change this password after logging in!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("\n💡 Make sure:");
    console.log("   1. DATABASE_URL is set in .env.local");
    console.log("   2. Database is accessible");
    console.log("   3. Users table exists (run: npm run db:push)");
    process.exit(1);
  }
}

createAdmin();
