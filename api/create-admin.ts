/**
 * One-time API endpoint to create admin user
 * Visit: https://wadfc-onnect.vercel.app/api/create-admin?secret=YOUR_SECRET
 * 
 * IMPORTANT: Delete this file after creating admin!
 */

import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export default async function handler(req: any, res: any) {
  // Simple security: require a secret parameter
  const secret = req.query.secret;
  
  // Change this to a secret value you choose
  const EXPECTED_SECRET = process.env.ADMIN_CREATE_SECRET || "create-admin-2026";
  
  if (secret !== EXPECTED_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const ADMIN_EMAIL = "admin@wadf.org";
    const ADMIN_PASSWORD = "WADF@Admin2026!";
    const ADMIN_NAME = "WADF Administrator";

    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
    
    if (existingAdmin.length > 0) {
      // Update existing admin
      await db.update(users)
        .set({ 
          password: hashedPassword,
          role: "admin"
        })
        .where(eq(users.email, ADMIN_EMAIL));
      
      return res.status(200).json({ 
        success: true,
        message: "Admin password reset",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        note: "DELETE THIS FILE IMMEDIATELY: api/create-admin.ts"
      });
    } else {
      // Create new admin
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: hashedPassword,
        role: "admin",
        firebaseUid: null
      });
      
      return res.status(200).json({ 
        success: true,
        message: "Admin user created",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        note: "DELETE THIS FILE IMMEDIATELY: api/create-admin.ts"
      });
    }
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ 
      error: "Failed to create admin",
      details: error.message 
    });
  }
}
