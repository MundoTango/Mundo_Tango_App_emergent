import { db } from '../server/db';
import { users } from '../shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seedTestUser() {
  console.log('🌱 Creating test user for E2E tests...');

  try {
    const testEmail = 'test@mundotango.life';
    const testPassword = 'Test123!';
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log('✅ Test user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Create the test user
    const [newUser] = await db.insert(users).values({
      name: 'Test User',
      username: 'testuser',
      email: testEmail,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      country: 'Argentina',
      city: 'Buenos Aires',
      countryCode: 'AR',
      languages: ['english', 'spanish'],
      tangoRoles: ['dancer'],
      leaderLevel: 3,
      followerLevel: 3,
      yearsOfDancing: 2,
      startedDancingYear: 2023,
      isActive: true,
      isVerified: true,
      formStatus: 2,
      isOnboardingComplete: true,
      codeOfConductAccepted: true,
      termsAccepted: true,
      subscriptionTier: 'free'
    }).returning();
    
    console.log(`✅ Test user created successfully:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   ID: ${newUser.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedTestUser();