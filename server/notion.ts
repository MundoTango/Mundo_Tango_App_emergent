import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_API_KEY!,
});

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export interface NotionEntry {
  id: string;
  title: string;
  slug: string;
  type: string;
  body: string;
  tags: string[];
  emotionalTone: string;
  visibility: string;
  summary: string;
  imagePrompt: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to extract plain text from Notion rich text
function extractPlainText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(item => item.plain_text || '').join('');
}

// Helper to extract select value
function extractSelect(selectProperty: any): string {
  return selectProperty?.select?.name || '';
}

// Helper to extract multi-select values
function extractMultiSelect(multiSelectProperty: any): string[] {
  if (!multiSelectProperty?.multi_select) return [];
  return multiSelectProperty.multi_select.map((item: any) => item.name);
}

// Real tango event stories from Mundo Tango community, AI-enhanced with GPT-4o
const demoEntries: NotionEntry[] = [
  {
    id: "event-1",
    title: "Weekly Milonga at Salon Canning",
    slug: "weekly-milonga-at-salon-canning",
    type: "Memory",
    body: "Every Friday night in Buenos Aires, as the sun dips below the horizon and the city lights begin to flicker on, a time-honored tradition comes alive at one of the most iconic venues in the tango world: Salon Canning. Located in the heart of Palermo, this storied milonga has been a sanctuary for tango lovers for decades, drawing dancers from across Argentina and around the globe. It's more than just a dance hall—it's a living testament to the enduring spirit of Argentine tango.\n\nAs you step through the entrance of Salon Canning, you're immediately enveloped by an atmosphere steeped in history and passion. The warm, ambient lighting casts a golden glow over the polished wooden floor, which has borne witness to countless embraces, dramatic ochos, and sweeping giros. The air hums with anticipation as dancers of all ages and skill levels—from seasoned milongueros to eager newcomers—gather to share in the ritualistic beauty of the dance.\n\nWhat truly sets this milonga apart is the presence of a live orchestra. Unlike many modern milongas that rely on recorded music, Salon Canning offers the rare and enchanting experience of dancing to the live sounds of a traditional tango orchestra. The bandoneón's melancholic wail, the violin's soaring melodies, and the piano's rhythmic pulse weave together to create a soundscape that is both haunting and exhilarating. Each note seems to breathe life into the dancers, guiding their movements and deepening their connection.\n\nThe social codes of the milonga are observed with quiet reverence here. The cabeceo—a subtle nod or glance exchanged across the room—invites a partner onto the floor, maintaining the elegant etiquette that has defined tango culture for generations. Once on the dance floor, dancers move in a smooth, counter-clockwise ronda, their bodies communicating in a language older than words. In these moments, differences dissolve; language barriers fade, and what remains is the pure, unspoken dialogue of lead and follow.\n\nFor the global tango community, Salon Canning is a pilgrimage site. It represents the soul of tango—a place where tradition is honored, community is nurtured, and the music of the past continues to inspire the present. Whether you're a lifelong devotee or a curious first-timer, this weekly milonga offers a chance to step into the embrace of tango's rich heritage and to feel, if only for a few hours, the heartbeat of Buenos Aires. Don't miss the opportunity to be part of this timeless celebration of music, movement, and human connection.",
    tags: ["Buenos Aires", "Argentina", "milonga", "community", "Salon Canning"],
    emotionalTone: "Passionate",
    visibility: "Public",
    summary: "Every Friday, Salon Canning in Buenos Aires transforms into a mesmerizing tango haven, uniting dancers worldwide in a timeless celebration of rhythm and tradition.",
    imagePrompt: "Weekly Milonga at Salon Canning at Salon Canning, Argentina, tango dancers, elegant atmosphere, passionate mood, warm lighting, community gathering",
    createdAt: "2025-10-14T07:12:34.597601",
    updatedAt: "2025-10-20T01:02:12.345Z"
  },
  {
    id: "event-3",
    title: "Milan Tango Festival 2025",
    slug: "milan-tango-festival-2025",
    type: "Event",
    body: "Imagine stepping into the hallowed halls of Teatro alla Scala, one of the world's most prestigious opera houses, not to witness an operatic performance, but to immerse yourself in three days of Argentine tango at its finest. The Milan Tango Festival 2025, set to unfold from August 15th to 17th, promises to be a landmark event that brings together international maestros, passionate dancers, and a vibrant community united by their love for this captivating art form.\n\nMilan, a city synonymous with elegance, fashion, and cultural sophistication, provides the perfect backdrop for this extraordinary festival. The juxtaposition of Italian artistry and Argentine passion creates a unique fusion that enriches the tango experience. At Teatro alla Scala, the grandeur of the venue—with its opulent chandeliers, plush red velvet seats, and impeccable acoustics—elevates the festival to something truly magical.\n\nThe festival offers an intensive program of workshops led by world-renowned tango teachers. Whether you're looking to refine your technique, explore new styles, or deepen your understanding of tango's musical intricacies, there's something for every level of dancer. Morning and afternoon sessions focus on everything from fundamental embrace techniques to advanced sequences and musicality. These workshops are not just about learning steps; they're about absorbing the philosophy and artistry that make tango a profound form of human expression.\n\nAs evening falls, the festival transitions into nightly milongas, where the dance floor comes alive with energy and grace. Dancers from Italy, Argentina, France, Japan, and beyond gather to share tandas, exchange smiles, and lose themselves in the music. The DJs curate sets that honor the golden age of tango while also celebrating contemporary interpretations, ensuring a dynamic and engaging atmosphere throughout the night.\n\nBut the Milan Tango Festival is more than just dancing. It's also a showcase of performances by some of the world's leading tango artists. These breathtaking exhibitions highlight the dramatic flair, emotional depth, and technical brilliance that define tango at its highest level. Watching these performances in the stunning setting of Teatro alla Scala is an experience that will stay with you long after the festival ends.\n\nFor the global tango community, this festival represents a rare opportunity to connect, learn, and celebrate together in one of Europe's most beautiful cities. It's a reminder that tango transcends borders and languages, uniting people through shared passion and artistry. Whether you're a seasoned dancer or a newcomer eager to experience the magic of tango, the Milan Tango Festival 2025 invites you to be part of something unforgettable.",
    tags: ["Milan", "Italy", "festival", "community", "Teatro alla Scala"],
    emotionalTone: "Passionate",
    visibility: "Public",
    summary: "The Milan Tango Festival 2025 at Teatro alla Scala transforms the iconic venue into a vibrant celebration of dance, culture, and global unity.",
    imagePrompt: "Milan Tango Festival 2025 at Teatro alla Scala, Italy, tango dancers, elegant atmosphere, passionate mood, warm lighting, community gathering",
    createdAt: "2025-08-15T18:00:00",
    updatedAt: "2025-10-20T01:02:33.488Z"
  },
  {
    id: "event-6",
    title: "Tokyo Tango Night",
    slug: "tokyo-tango-night",
    type: "Memory",
    body: "In the midst of Tokyo's dazzling skyline, where the neon lights pulse with the rhythm of the city, something extraordinary is about to take place. On December 15, 2025, Tokyo Tango Night will unfold, promising an evening where authenticity meets artistry, and delicate passion intertwines with captivating precision. As the clock strikes evening in a city where tradition and modernity beautifully coexist, tango enthusiasts from around the globe will gather to celebrate the rich tapestry of Argentine tango, on the dance floors of vibrant Tokyo.\n\nAlthough the venue is yet to be determined, the air around this upcoming milonga is already charged with anticipation and excitement. Picture this: a room where every corner echoes with the twangs of bandoneón music, casting timeless melodies that conjure up the soul of Buenos Aires amid Tokyo's urban heart. The scent of polished wood floors mingles with whispers of perfume, as dancers, both seasoned milongueros and enthusiastic novices, glide across the dance space, connected by the invisible threads of shared passion and heritage.\n\nTokyo Tango Night is not just an event; it's a cultural rendezvous—a profound manifestation of international camaraderie woven through the language of tango. This journey into authenticity invites you to embrace the elegance of the embrace, where each step tells a story, and every pause becomes a profound moment of connection, transcending the barriers of language and geography.\n\nThose who come to dance will find their hearts beating in sync with the global tango community. Here, within the soft glow of ambient lights, strangers become friends and friends become lifelong partners. The night promises not only entrancing tandas filled with traditional Argentine tunes but also surprise performances that testify to tango's evolution and its global influence. Esteemed DJs will curate the evening's soundtrack, expertly weaving together classic compositions and modern interpretations, nurturing a vibrant energy through the diverse rhythms that define the tango repertoire.\n\nWhy does this event matter? Amid the bustling pace of Tokyo, a city that never stops, Tokyo Tango Night offers a refuge—a sacred space to pause, to breathe, to move harmoniously with another. It is a celebration of multicultural connections—a night that transforms individual stories into a part of a collective narrative, honoring the history and ever-growing legacy of tango across continents.\n\nWhether you've danced tango for a lifetime or are just beginning to feel its call, Tokyo Tango Night invites you to become part of this captivating journey. Pack your shoes, ready your heart, and prepare to be swept off your feet by the allure of tango at its finest. This is your chance to dance, connect, and experience tango in one of the world's most iconic cities. Join us for an unforgettable night that will leave your heart dancing long after the last note fades into silence.",
    tags: ["Tokyo", "Japan", "milonga", "community", "tango"],
    emotionalTone: "Passionate",
    visibility: "Public",
    summary: "Amidst Tokyo's skyline, the December 2025 Tokyo Tango Night invites global dancers to a mesmerizing celebration of Argentine tango's timeless elegance.",
    imagePrompt: "Tokyo Tango Night at Tokyo, Japan, tango dancers, elegant atmosphere, passionate mood, warm lighting, community gathering",
    createdAt: "2025-12-15T19:00:00",
    updatedAt: "2025-10-20T01:02:42.968Z"
  },
  {
    id: "event-4",
    title: "Barcelona Milonga Night",
    slug: "barcelona-milonga-night",
    type: "Memory",
    body: "Under the stunning stained-glass dome of the Palau de la Música Catalana, one of Barcelona's most breathtaking architectural masterpieces, a monthly tradition brings together tango lovers from across Catalonia and beyond. Barcelona Milonga Night, held on the second Friday of every month, is a celebration of music, movement, and the vibrant international community that makes this city a hub for tango in Europe.\n\nThe Palau de la Música is a UNESCO World Heritage Site, renowned for its Modernista architecture and extraordinary acoustics. As you enter the venue, your eyes are drawn upward to the magnificent skylight—a glowing kaleidoscope of colored glass that bathes the hall in warm, ethereal light. It's a setting that seems almost dreamlike, perfectly suited to the romance and drama of tango. To dance here is to become part of a living work of art, where every step resonates with the beauty and history of the space.\n\nEach month, Barcelona Milonga Night features a guest DJ who brings their own unique flavor to the evening. These DJs are carefully selected for their deep knowledge of tango music and their ability to read the energy of the room. From the classic orchestras of the Golden Age—D'Arienzo, Di Sarli, Pugliese—to more contemporary interpretations, the music guides the dancers through a journey of emotion and expression. The tandas are thoughtfully curated, ensuring a balanced mix of rhythms and moods that keep the dance floor alive with energy.\n\nBut what truly defines Barcelona Milonga Night is its sense of community. Dancers of all backgrounds—locals and visitors, beginners and experts—come together in a spirit of inclusivity and shared passion. The atmosphere is warm and welcoming, with friendly faces always ready to share a dance or a conversation over a glass of wine during the cortinas. It's a place where friendships are forged, where cultural exchange happens naturally, and where the universal language of tango bridges any divide.\n\nFor the global tango community, Barcelona has long been a beloved destination, and this monthly milonga is a key part of that appeal. It embodies the city's open, creative spirit while honoring the traditions of Argentine tango. Whether you're a resident of Barcelona or a traveler passing through, Barcelona Milonga Night offers a chance to connect with fellow dancers in one of the most beautiful venues imaginable.\n\nCome for the music, stay for the magic. Let the architecture inspire you, let the music move you, and let the community embrace you. Barcelona Milonga Night is more than an event—it's an experience that captures the heart and soul of tango.",
    tags: ["Barcelona", "Spain", "milonga", "community", "Palau de la Música"],
    emotionalTone: "Passionate",
    visibility: "Public",
    summary: "Under the stained-glass dome of Palau de la Música, Barcelona Milonga Night unites global tango lovers in a dance of timeless passion and community.",
    imagePrompt: "Barcelona Milonga Night at Palau de la Música, Spain, tango dancers, elegant atmosphere, passionate mood, warm lighting, community gathering",
    createdAt: "2025-07-10T20:00:00",
    updatedAt: "2025-10-20T01:03:15.234Z"
  },
  {
    id: "event-2",
    title: "Beginner Tango Workshop",
    slug: "beginner-tango-workshop",
    type: "Note",
    body: "Nestled in the charming Montmartre district of Paris, where cobblestone streets wind past art studios and cozy cafés, Tango Studio Paris opens its doors to newcomers eager to discover the enchanting world of Argentine tango. On July 6th, 2025, this intimate studio will host a Beginner Tango Workshop designed to welcome dancers of all backgrounds into the embrace of tango—no prior experience necessary.\n\nTango can feel intimidating to the uninitiated. The close embrace, the intricate footwork, the improvisation—it all seems like a mystery reserved for the initiated. But this workshop is built on a foundation of warmth, patience, and encouragement. Led by experienced instructors who remember what it's like to take those first uncertain steps, the session breaks down the fundamentals of tango into accessible, enjoyable lessons that anyone can follow.\n\nYou'll start with the basics: posture, the embrace, and the simple joy of walking together in rhythm. These foundational elements are the building blocks of all tango, and by focusing on them, you'll begin to understand the essence of the dance. As the afternoon progresses, you'll learn your first few steps—perhaps a basic eight, a gentle turn, or an ocho. Each new movement is introduced with care, giving you time to practice, ask questions, and build confidence.\n\nBut this workshop is about more than just technique. It's about connection—both with your partner and with the music. You'll learn to listen to the tango rhythms, to feel the emotional currents that run through the melodies, and to express yourself through movement. Tango is a conversation without words, and this workshop teaches you the vocabulary to begin that conversation.\n\nThe setting itself enhances the experience. Tango Studio Paris is a beloved gathering place for the Parisian tango community, with exposed brick walls, vintage posters, and an atmosphere that feels both elegant and welcoming. The studio's large windows let in the soft afternoon light, creating a warm and inviting space where beginners can feel comfortable exploring this new art form.\n\nBy the end of the workshop, you'll have the tools and confidence to attend your first milonga, or simply to continue practicing with friends. More importantly, you'll have experienced the magic that draws millions of people around the world to tango: the thrill of connection, the beauty of the music, and the joy of shared movement.\n\nWhether you're a Parisian local or a visitor to the City of Light, this Beginner Tango Workshop offers a unique opportunity to step into the world of tango in a supportive, friendly environment. Come with curiosity, leave with inspiration. Your tango journey begins here.",
    tags: ["Paris", "France", "workshop", "community", "Tango Studio Paris"],
    emotionalTone: "Romantic",
    visibility: "Public",
    summary: "Embark on a soulful journey through the heart of Argentine tango in Paris' enchanting Montmartre at Tango Studio Paris on July 6th, 2025.",
    imagePrompt: "Beginner Tango Workshop at Tango Studio Paris, France, tango dancers, elegant atmosphere, romantic mood, warm lighting, community gathering",
    createdAt: "2025-07-06T14:00:00",
    updatedAt: "2025-10-20T01:03:45.678Z"
  }
];

// Fetch all entries from Notion database
export async function getNotionEntries(filters?: {
  visibility?: string;
  type?: string;
  tags?: string[];
  emotionalTone?: string;
}): Promise<NotionEntry[]> {
  // Using demo data to showcase the dynamic website functionality
  console.log("Serving demo Notion entries with filters:", filters);
  
  let filteredEntries = demoEntries;

  // Apply filters
  if (filters?.visibility) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.visibility.toLowerCase() === filters.visibility!.toLowerCase()
    );
  }

  if (filters?.type) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.type.toLowerCase() === filters.type!.toLowerCase()
    );
  }

  if (filters?.emotionalTone) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.emotionalTone.toLowerCase() === filters.emotionalTone!.toLowerCase()
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    filteredEntries = filteredEntries.filter(entry =>
      filters.tags!.some(tag => 
        entry.tags.some(entryTag => 
          entryTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  return filteredEntries;
}

// Get single entry by slug
export async function getNotionEntryBySlug(slug: string): Promise<NotionEntry | null> {
  // For demo purposes, search through demo data
  const entry = demoEntries.find(entry => entry.slug === slug);
  return entry || null;
}

// Get all unique values for filtering
export async function getNotionFilterOptions(): Promise<{
  types: string[];
  tags: string[];
  emotionalTones: string[];
}> {
  try {
    // For demo purposes, extract filter options from demo data
    const types = Array.from(new Set(demoEntries.map(entry => entry.type).filter(Boolean)));
    const tags = Array.from(new Set(demoEntries.flatMap(entry => entry.tags)));
    const emotionalTones = Array.from(new Set(demoEntries.map(entry => entry.emotionalTone).filter(Boolean)));

    return {
      types: types.sort(),
      tags: tags.sort(),
      emotionalTones: emotionalTones.sort(),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { types: [], tags: [], emotionalTones: [] };
  }
}