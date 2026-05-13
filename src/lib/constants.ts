export const VENDOR_CATEGORIES = [
  { slug: "venues", label: "Venues & Halls", icon: "🏰", description: "Ballrooms, event halls, and outdoor spaces" },
  { slug: "photography", label: "Photography & Video", icon: "📸", description: "Professional photographers and videographers" },
  { slug: "dresses", label: "Quinceañera Dresses", icon: "👗", description: "Gowns, alterations, and accessories" },
  { slug: "catering", label: "Catering & Cakes", icon: "🎂", description: "Full catering, cakes, and dessert tables" },
  { slug: "djs", label: "DJs & Entertainment", icon: "🎵", description: "DJs, live bands, and MC services" },
  { slug: "florals", label: "Florals & Decorations", icon: "💐", description: "Floral arrangements and event décor" },
  { slug: "hair-makeup", label: "Hair & Makeup", icon: "💄", description: "Beauty artists for the quinceañera and court" },
  { slug: "invitations", label: "Invitations & Printing", icon: "💌", description: "Custom invitations, programs, and favors" },
  { slug: "transportation", label: "Transportation", icon: "🚗", description: "Limousines, party buses, and luxury cars" },
  { slug: "choreography", label: "Choreography & Dance", icon: "💃", description: "Waltz, surprise dance, and court choreography" },
  { slug: "jewelry", label: "Jewelry & Crowns", icon: "👑", description: "Tiaras, jewelry sets, and keepsakes" },
  { slug: "event-planning", label: "Event Planning", icon: "📋", description: "Full-service and day-of coordination" },
] as const;

export const CITIES = [
  {
    slug: "el-paso",
    name: "El Paso",
    state: "TX",
    description: "The Heart of the Border — El Paso's vibrant quinceañera scene",
    population: "678,000",
  },
  {
    slug: "horizon-city",
    name: "Horizon City",
    state: "TX",
    description: "Growing community east of El Paso",
    population: "25,000",
  },
  {
    slug: "socorro",
    name: "Socorro",
    state: "TX",
    description: "Historic border community in El Paso County",
    population: "37,000",
  },
  {
    slug: "las-cruces",
    name: "Las Cruces",
    state: "NM",
    description: "New Mexico's second-largest city, 45 minutes from El Paso",
    population: "113,000",
  },
] as const;

export const PLANNING_CHECKLIST = [
  // 18–12 months out
  { id: "set-date", task: "Set your quinceañera date", timeline: "18–12 months", category: "Planning" },
  { id: "set-budget", task: "Establish your budget", timeline: "18–12 months", category: "Planning" },
  { id: "guest-list", task: "Create initial guest list", timeline: "18–12 months", category: "Planning" },
  { id: "book-venue", task: "Book your venue / hall", timeline: "18–12 months", category: "Venue" },
  { id: "choose-theme", task: "Choose your theme & color palette", timeline: "18–12 months", category: "Planning" },
  // 12–9 months out
  { id: "book-photographer", task: "Book photographer & videographer", timeline: "12–9 months", category: "Vendors" },
  { id: "book-dj", task: "Book DJ or band", timeline: "12–9 months", category: "Vendors" },
  { id: "book-catering", task: "Book catering", timeline: "12–9 months", category: "Vendors" },
  { id: "select-court", task: "Select your court (chambelanes & damas)", timeline: "12–9 months", category: "Court" },
  { id: "dress-shopping", task: "Start quinceañera dress shopping", timeline: "12–9 months", category: "Attire" },
  // 9–6 months out
  { id: "send-invites-order", task: "Order invitations", timeline: "9–6 months", category: "Invitations" },
  { id: "book-florist", task: "Book florist & decorations", timeline: "9–6 months", category: "Vendors" },
  { id: "order-cake", task: "Order quinceañera cake", timeline: "9–6 months", category: "Vendors" },
  { id: "book-hair-makeup", task: "Book hair & makeup artist", timeline: "9–6 months", category: "Attire" },
  { id: "book-transportation", task: "Book limousine or party bus", timeline: "9–6 months", category: "Vendors" },
  // 6–3 months out
  { id: "send-invites", task: "Send out invitations", timeline: "6–3 months", category: "Invitations" },
  { id: "choreography", task: "Start court choreography rehearsals", timeline: "6–3 months", category: "Court" },
  { id: "court-attire", task: "Order court attire (damas & chambelanes)", timeline: "6–3 months", category: "Attire" },
  { id: "accessories", task: "Shop for tiara, jewelry & accessories", timeline: "6–3 months", category: "Attire" },
  { id: "mass-planning", task: "Plan the religious ceremony / mass", timeline: "6–3 months", category: "Ceremony" },
  // 1 month out
  { id: "rsvp-count", task: "Finalize RSVP count with venue & caterer", timeline: "1 month", category: "Planning" },
  { id: "final-fittings", task: "Final dress fittings", timeline: "1 month", category: "Attire" },
  { id: "confirm-vendors", task: "Confirm all vendors & delivery times", timeline: "1 month", category: "Vendors" },
  { id: "day-of-timeline", task: "Create day-of timeline & schedule", timeline: "1 month", category: "Planning" },
  // Week of
  { id: "week-rehearsal", task: "Final rehearsal with full court", timeline: "Week of", category: "Court" },
] as const;

export const BUDGET_CATEGORIES = [
  { id: "venue", label: "Venue & Hall", defaultPercent: 30, min: 500, max: 20000, icon: "🏰" },
  { id: "catering", label: "Catering & Cake", defaultPercent: 25, min: 500, max: 15000, icon: "🎂" },
  { id: "photography", label: "Photography & Video", defaultPercent: 15, min: 300, max: 8000, icon: "📸" },
  { id: "dress", label: "Dress & Attire", defaultPercent: 12, min: 200, max: 6000, icon: "👗" },
  { id: "decorations", label: "Florals & Decorations", defaultPercent: 10, min: 200, max: 5000, icon: "💐" },
  { id: "entertainment", label: "DJ & Entertainment", defaultPercent: 8, min: 200, max: 4000, icon: "🎵" },
] as const;

export const PRICE_GUIDE = [
  { category: "Venues & Halls", low: 800, high: 6000, unit: "event" },
  { category: "Photography", low: 600, high: 3500, unit: "package" },
  { category: "Videography", low: 500, high: 2500, unit: "package" },
  { category: "DJ", low: 400, high: 1800, unit: "event" },
  { category: "Catering (per person)", low: 18, high: 55, unit: "person" },
  { category: "Quinceañera Cake", low: 300, high: 1200, unit: "cake" },
  { category: "Quinceañera Dress", low: 250, high: 1800, unit: "dress" },
  { category: "Florist & Décor", low: 500, high: 3000, unit: "event" },
  { category: "Hair & Makeup", low: 150, high: 600, unit: "person" },
  { category: "Limousine", low: 300, high: 900, unit: "event" },
  { category: "Choreography", low: 200, high: 800, unit: "package" },
  { category: "Invitations (100)", low: 80, high: 350, unit: "set" },
] as const;
