// MB.MD OPTION 2: Transform Real Events to Notion Stories
// One-time script to generate AI-enhanced content from database events

import OpenAI from "openai";

// Use direct OpenAI API (your key) instead of AI Integrations endpoint
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RealEvent {
  id: number;
  title: string;
  description: string | null;
  location: string;
  start_date: string;
  event_type: string;
  music_style: string | null;
  level: string | null;
  venue: string | null;
  city: string;
  country: string;
}

// Top 5 real events from database (diverse, interesting)
const realEvents: RealEvent[] = [
  {
    id: 1,
    title: "Weekly Milonga at Salon Canning",
    description: "Traditional milonga every Friday night with live orchestra",
    location: "Buenos Aires, Argentina",
    start_date: "2025-10-14T07:12:34.597601",
    event_type: "milonga",
    music_style: null,
    level: null,
    venue: "Salon Canning",
    city: "Buenos Aires",
    country: "Argentina"
  },
  {
    id: 3,
    title: "Milan Tango Festival 2025",
    description: "Three days of workshops, milongas, and performances with international maestros",
    location: "Milan, Italy",
    start_date: "2025-08-15T18:00:00",
    event_type: "festival",
    music_style: null,
    level: null,
    venue: "Teatro alla Scala",
    city: "Milan",
    country: "Italy"
  },
  {
    id: 6,
    title: "Tokyo Tango Night",
    description: "Authentic Argentine tango in Tokyo",
    location: "Tokyo, Japan",
    start_date: "2025-12-15T19:00:00",
    event_type: "milonga",
    music_style: null,
    level: null,
    venue: null,
    city: "Tokyo",
    country: "Japan"
  },
  {
    id: 4,
    title: "Barcelona Milonga Night",
    description: "Monthly community milonga with guest DJs",
    location: "Barcelona, Spain",
    start_date: "2025-07-10T20:00:00",
    event_type: "milonga",
    music_style: null,
    level: null,
    venue: "Palau de la Música",
    city: "Barcelona",
    country: "Spain"
  },
  {
    id: 2,
    title: "Beginner Tango Workshop",
    description: "Learn the fundamentals of Argentine tango in a welcoming environment",
    location: "Paris, France",
    start_date: "2025-07-06T14:00:00",
    event_type: "workshop",
    music_style: null,
    level: null,
    venue: "Tango Studio Paris",
    city: "Paris",
    country: "France"
  }
];

async function generateStoryContent(event: RealEvent): Promise<string> {
  // Using GPT-4o (production-ready model)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a passionate tango community storyteller. Transform event details into engaging 300-500 word narratives that capture the culture, emotion, and community spirit of tango. Write in a warm, inviting tone that makes readers want to attend. Focus on the unique cultural aspects and what makes each event special.`
      },
      {
        role: "user",
        content: `Create an engaging story for this tango event:

Title: ${event.title}
Description: ${event.description || 'A wonderful tango event'}
Location: ${event.location}
Venue: ${event.venue || 'TBD'}
Event Type: ${event.event_type}
Date: ${new Date(event.start_date).toLocaleDateString()}

Write a compelling 300-500 word narrative that would inspire dancers to attend. Highlight the cultural significance, the atmosphere, what dancers can expect, and why this event matters to the global tango community.`
      }
    ],
    max_completion_tokens: 1200
  });

  return completion.choices[0]?.message?.content || "";
}

async function generateSummary(content: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Create a compelling 1-sentence summary (max 150 characters) of this tango event story."
      },
      {
        role: "user",
        content: content
      }
    ],
    max_completion_tokens: 50
  });

  return completion.choices[0]?.message?.content || "";
}

async function determineEmotionalTone(content: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Analyze the emotional tone of this tango story. Respond with ONLY ONE WORD from: Joyful, Nostalgic, Inspiring, Romantic, Melancholic, Passionate, Reflective"
      },
      {
        role: "user",
        content: content
      }
    ],
    max_completion_tokens: 10
  });

  return completion.choices[0]?.message?.content?.trim() || "Joyful";
}

export async function transformAllEvents() {
  console.log("🎨 Starting AI transformation of 5 real Mundo Tango events...\n");

  const results = [];

  for (const event of realEvents) {
    console.log(`\n📝 Transforming: ${event.title}`);
    
    try {
      // Generate AI-enhanced content
      const body = await generateStoryContent(event);
      console.log(`  ✅ Generated ${body.length} characters of content`);
      
      const summary = await generateSummary(body);
      console.log(`  ✅ Summary: ${summary}`);
      
      const emotionalTone = await determineEmotionalTone(body);
      console.log(`  ✅ Tone: ${emotionalTone}`);

      // Create slug
      const slug = event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Generate tags
      const tags = [
        event.city,
        event.country,
        event.event_type,
        "community",
        event.venue || "tango"
      ].filter(Boolean);

      const notionEntry = {
        id: `event-${event.id}`,
        title: event.title,
        slug,
        type: event.event_type === 'workshop' ? 'Note' : event.event_type === 'festival' ? 'Event' : 'Memory',
        body,
        tags,
        emotionalTone,
        visibility: "Public",
        summary: summary.substring(0, 200),
        imagePrompt: `${event.title} at ${event.venue || event.city}, ${event.country}, tango dancers, elegant atmosphere, ${emotionalTone.toLowerCase()} mood, warm lighting, community gathering`,
        createdAt: event.start_date,
        updatedAt: new Date().toISOString()
      };

      results.push(notionEntry);
      console.log(`  ✅ Transformation complete!`);
      
    } catch (error) {
      console.error(`  ❌ Failed to transform event ${event.id}:`, error);
    }
  }

  console.log(`\n\n🎉 Transformation complete! Generated ${results.length}/5 stories.`);
  console.log("\n📄 TypeScript code to paste into server/notion.ts:\n");
  console.log("export const demoEntries: NotionEntry[] = " + JSON.stringify(results, null, 2) + ";");
  
  return results;
}

// Run if executed directly
if (require.main === module) {
  transformAllEvents()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
