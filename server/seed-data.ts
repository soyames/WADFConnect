import { storage } from "./storage";
import type { InsertTicketOption } from "@shared/schema";

/**
 * Seed default ticket options if none exist
 * These can be managed and updated via the admin dashboard
 */
export async function seedTicketOptions() {
  try {
    // Check if ticket options already exist
    const existingOptions = await storage.getAllTicketOptions();
    
    if (existingOptions.length > 0) {
      console.log(`✓ Ticket options already exist (${existingOptions.length} options)`);
      return;
    }

    console.log('📝 Creating default ticket options...');

    const defaultTicketOptions: InsertTicketOption[] = [
      {
        name: "Free Test Ticket",
        type: "test-free",
        price: 0, // Free ticket
        currency: "EUR",
        description: "Test ticket for demonstration purposes - Get full access to the conference for free!",
        features: JSON.stringify([
          "Full conference access",
          "All sessions and workshops",
          "Networking opportunities",
          "Conference materials",
          "Certificate of attendance"
        ]),
        available: true,
        capacity: 100,
        salesStartDate: new Date("2026-01-01"),
        salesEndDate: new Date("2026-12-31")
      },
      {
        name: "One-Day Pass",
        type: "one-day",
        price: 15000, // €150.00 (price in cents)
        currency: "EUR",
        description: "Access to all sessions and workshops for one day of your choice",
        features: JSON.stringify([
          "Access to all sessions on selected day",
          "Morning coffee and lunch included",
          "Networking sessions",
          "Conference materials",
          "Certificate of attendance"
        ]),
        available: true,
        capacity: 300,
        salesStartDate: new Date("2026-01-01"),
        salesEndDate: new Date("2026-06-30")
      },
      {
        name: "Two-Day Pass",
        type: "two-day",
        price: 25000, // €250.00 (price in cents)
        currency: "EUR",
        description: "Full access to two consecutive days of the conference",
        features: JSON.stringify([
          "Access to all sessions for 2 days",
          "Daily breakfast, coffee breaks, and lunch",
          "Evening networking events",
          "Priority seating",
          "Conference materials and swag bag",
          "Certificate of attendance"
        ]),
        available: true,
        capacity: 200,
        salesStartDate: new Date("2026-01-01"),
        salesEndDate: new Date("2026-06-30")
      },
      {
        name: "Full Conference Pass",
        type: "full-conference",
        price: 45000, // €450.00 (price in cents)
        currency: "EUR",
        description: "Complete access to all three days of WADF 2026 with exclusive perks",
        features: JSON.stringify([
          "Access to all 3 days and sessions",
          "All meals and refreshments",
          "VIP networking reception",
          "Exclusive workshop access",
          "Premium swag bag",
          "1-on-1 mentorship session",
          "Priority seating at keynotes",
          "Certificate of attendance",
          "Post-event community access"
        ]),
        available: true,
        capacity: 500,
        salesStartDate: new Date("2026-01-01"),
        salesEndDate: new Date("2026-06-30")
      },
      {
        name: "Early Bird - Full Conference",
        type: "early-bird",
        price: 35000, // €350.00 (price in cents) - 22% discount
        currency: "EUR",
        description: "Special early bird pricing for the full conference pass - Limited availability!",
        features: JSON.stringify([
          "All Full Conference Pass benefits",
          "22% discount (Save €100)",
          "Early access to session selection",
          "Exclusive early bird community group",
          "Bonus workshop session",
          "Premium seating guarantee"
        ]),
        available: true,
        capacity: 150,
        salesStartDate: new Date("2026-01-01"),
        salesEndDate: new Date("2026-03-31") // Early bird ends March 31
      }
    ];

    // Create all ticket options
    for (const ticketOption of defaultTicketOptions) {
      const created = await storage.createTicketOption(ticketOption);
      console.log(`  ✓ Created: ${created.name} - €${(created.price / 100).toFixed(2)}`);
    }

    console.log(`✅ Successfully created ${defaultTicketOptions.length} default ticket options`);
    console.log('💡 You can manage these tickets via the Admin Dashboard > Ticket Options section');

  } catch (error) {
    console.error('❌ Error seeding ticket options:', error);
    throw error;
  }
}

/**
 * Seed default conference settings if none exist
 */
export async function seedConferenceSettings() {
  try {
    const existingSettings = await storage.getConferenceSettings();
    
    if (existingSettings) {
      console.log('✓ Conference settings already exist');
      return;
    }

    console.log('📝 Creating default conference settings...');

    const defaultSettings = {
      eventName: "West Africa Design Forum 2026",
      eventDate: "To Be Confirmed Soon",
      eventLocation: "To Be Confirmed Soon",
      eventVenue: null,
      eventDescription: "Premier design conference bringing together designers, innovators, and industry experts from across West Africa.",
      isDateConfirmed: false,
      isLocationConfirmed: false,
    };

    await storage.updateConferenceSettings(defaultSettings);
    console.log('✅ Successfully created default conference settings');

  } catch (error) {
    console.error('❌ Error seeding conference settings:', error);
    throw error;
  }
}

/**
 * Initialize all seed data
 */
export async function initializeSeedData() {
  console.log('\n🌱 Initializing seed data...\n');
  
  try {
    await seedTicketOptions();
    await seedConferenceSettings();
    console.log('\n✅ Seed data initialization complete\n');
  } catch (error) {
    console.error('\n❌ Seed data initialization failed:', error);
  }
}
