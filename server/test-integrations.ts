// MB.MD S1 Integration Testing - OpenAI + Stripe
// Testing all integrations in parallel for production readiness

import OpenAI from "openai";
import Stripe from "stripe";

// OpenAI Integration (Replit AI Integrations - no API key needed, billed to credits)
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Stripe Integration (latest API version)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

interface EventData {
  id: number;
  title: string;
  description: string | null;
  location: string;
  start_date: string;
  event_type: string;
}

interface EnhancedNotionEntry {
  id: string;
  title: string;
  slug: string;
  type: "Event" | "Memory" | "Note" | "Reflection";
  body: string;
  tags: string[];
  emotionalTone: string;
  visibility: "Public" | "Private";
  summary: string;
  imagePrompt: string;
  createdAt: string;
  updatedAt: string;
}

// Test OpenAI content enhancement
export async function testOpenAIEnhancement(eventTitle: string, eventDescription: string, location: string): Promise<string> {
  try {
    console.log("🤖 Testing OpenAI content enhancement...");
    
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a creative tango community content writer. Transform event information into engaging, narrative-style stories that capture the passion and culture of tango."
        },
        {
          role: "user",
          content: `Transform this tango event into an engaging story (300-500 words):
Title: ${eventTitle}
Description: ${eventDescription}
Location: ${location}

Create a compelling narrative that would inspire dancers to attend, highlighting the cultural significance and community aspect.`
        }
      ],
      max_completion_tokens: 1000
    });

    const enhancedContent = completion.choices[0]?.message?.content || "";
    console.log("✅ OpenAI enhancement successful!");
    return enhancedContent;
  } catch (error: any) {
    console.error("❌ OpenAI test failed:", error.message);
    throw error;
  }
}

// Test Stripe payment intent creation
export async function testStripePayment(amount: number = 2000): Promise<{ clientSecret: string; id: string }> {
  try {
    if (!stripe) {
      throw new Error("Stripe not configured - missing STRIPE_SECRET_KEY");
    }

    console.log("💳 Testing Stripe payment intent creation...");
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // $20.00 in cents
      currency: "usd",
      description: "Mundo Tango - Event Registration Test",
      metadata: {
        test: "integration_test",
        platform: "mundo_tango"
      }
    });

    console.log("✅ Stripe payment intent created:", paymentIntent.id);
    return {
      clientSecret: paymentIntent.client_secret || "",
      id: paymentIntent.id
    };
  } catch (error: any) {
    console.error("❌ Stripe test failed:", error.message);
    throw error;
  }
}

// Transform database event into enhanced Notion entry
export async function transformEventToNotionEntry(event: EventData): Promise<EnhancedNotionEntry> {
  try {
    console.log(`📝 Transforming event: ${event.title}`);
    
    // Use OpenAI to enhance the description
    const enhancedBody = await testOpenAIEnhancement(
      event.title,
      event.description || "A tango event in the community",
      event.location
    );

    // Generate summary using OpenAI
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Create a brief 1-sentence summary (max 100 characters) of this tango event."
        },
        {
          role: "user",
          content: enhancedBody
        }
      ],
      max_completion_tokens: 50
    });

    const summary = summaryCompletion.choices[0]?.message?.content || event.title;

    // Extract tags from location and event type
    const tags = [
      event.location.split(',')[0].trim(),
      event.event_type || "milonga",
      "community",
      "tango"
    ];

    // Create slug from title
    const slug = event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const notionEntry: EnhancedNotionEntry = {
      id: `event-${event.id}`,
      title: event.title,
      slug,
      type: "Event",
      body: enhancedBody,
      tags,
      emotionalTone: "Joyful",
      visibility: "Public",
      summary: summary.substring(0, 200),
      imagePrompt: `A vibrant tango ${event.event_type} in ${event.location}, dancers embracing in elegant poses, warm lighting, community atmosphere`,
      createdAt: event.start_date,
      updatedAt: new Date().toISOString()
    };

    console.log(`✅ Enhanced entry created: ${notionEntry.title}`);
    return notionEntry;
  } catch (error: any) {
    console.error(`❌ Failed to transform event ${event.id}:`, error.message);
    throw error;
  }
}

// Run comprehensive integration tests (ADMIN ONLY)
export async function runIntegrationTests() {
  console.log("\n🚀 MB.MD S1 Integration Testing Starting (Admin-initiated)...\n");
  
  const results = {
    openai: false,
    stripe: false,
    openaiResponse: null as string | null,
    stripePaymentId: null as string | null,
    errors: [] as string[]
  };

  // Test OpenAI with validation
  try {
    const response = await testOpenAIEnhancement(
      "Test Tango Milonga",
      "A beautiful evening of traditional tango dancing",
      "Buenos Aires, Argentina"
    );
    
    // Validate response is not empty
    if (!response || response.length < 50) {
      throw new Error("OpenAI returned empty or too short response");
    }
    
    results.openai = true;
    results.openaiResponse = response.substring(0, 100) + "...";
    console.log("✅ OpenAI test PASSED - Generated content validated");
  } catch (error: any) {
    results.errors.push(`OpenAI: ${error.message}`);
    console.error("❌ OpenAI test FAILED:", error.message);
  }

  // Test Stripe with validation
  try {
    const payment = await testStripePayment(2000);
    
    // Validate payment intent
    if (!payment.clientSecret || !payment.id) {
      throw new Error("Stripe did not return valid payment intent");
    }
    
    results.stripe = true;
    results.stripePaymentId = payment.id;
    console.log("✅ Stripe test PASSED - Payment intent created:", payment.id);
  } catch (error: any) {
    results.errors.push(`Stripe: ${error.message}`);
    console.error("❌ Stripe test FAILED:", error.message);
  }

  console.log("\n📊 Integration Test Results:");
  console.log(`✅ OpenAI: ${results.openai ? "PASSED" : "FAILED"}`);
  console.log(`✅ Stripe: ${results.stripe ? "PASSED" : "FAILED"}`);
  
  if (results.errors.length > 0) {
    console.log("\n❌ Errors:");
    results.errors.forEach(err => console.log(`  - ${err}`));
  }

  return results;
}
