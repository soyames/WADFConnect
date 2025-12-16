import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  try {
    console.log("🔍 Checking admin user...\n");
    
    const admin = await db.select().from(users).where(eq(users.email, 'admin@wadf.org'));
    
    if (admin.length === 0) {
      console.log("❌ Admin user NOT found in database!");
      console.log("\n💡 The admin user needs to be created in production database.");
      console.log("   This script only creates it locally.");
    } else {
      console.log("✅ Admin user found!");
      console.log("\nDetails:");
      console.log(`   ID: ${admin[0].id}`);
      console.log(`   Email: ${admin[0].email}`);
      console.log(`   Name: ${admin[0].name}`);
      console.log(`   Role: ${admin[0].role}`);
      console.log(`   Has Password: ${admin[0].password ? 'Yes' : 'No'}`);
      console.log(`   Created: ${admin[0].createdAt}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAdmin();
