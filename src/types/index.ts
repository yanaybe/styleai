export type WardrobeCategory =
  | "TOPS"
  | "PANTS"
  | "SHORTS"
  | "SKIRTS"
  | "DRESSES"
  | "JACKETS"
  | "SHOES"
  | "BAGS"
  | "JEWELRY"
  | "ACCESSORIES";

export type OutfitRating = "LOVE_IT" | "LIKE_IT" | "NOT_FOR_ME";
export type RecommendationType = "SAFE" | "STYLISH" | "TRENDY";
export type OutfitSource = "AI_GENERATED" | "USER_CREATED" | "IMPORTED";

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: WardrobeCategory;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  pattern?: string | null;
  material?: string | null;
  brand?: string | null;
  formalityLevel?: string | null;
  season: string[];
  styleTags: string[];
  imageUrl: string;
  thumbnailUrl?: string | null;
  timesWorn: number;
  lastWornAt?: Date | null;
  isFavorite: boolean;
  isActive: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface Outfit {
  id: string;
  userId: string;
  name?: string | null;
  occasion?: string | null;
  season?: string | null;
  isSaved: boolean;
  isFavorite: boolean;
  source: OutfitSource;
  imageUrl?: string | null;
  items: OutfitItem[];
  createdAt: Date;
}

export interface OutfitItem {
  id: string;
  outfitId: string;
  itemId: string;
  layerOrder: number;
  item: WardrobeItem;
}

export interface OutfitRecommendation {
  id: string;
  userId: string;
  outfitId?: string | null;
  outfit?: Outfit | null;
  date: Date;
  weatherData?: WeatherSnapshot | null;
  reasoning?: string | null;
  confidenceScore?: number | null;
  type: RecommendationType;
  wasWorn?: boolean | null;
  rating?: OutfitRating | null;
  createdAt: Date;
}

export interface StyleProfile {
  id: string;
  userId: string;
  favoriteColors: string[];
  favoriteBrands: string[];
  styleCategories: string[];
  workEnvironment?: string | null;
  dresscode?: string | null;
  fitPreference?: string | null;
  modestyLevel?: string | null;
  pinterestUrl?: string | null;
  instagramHandle?: string | null;
  fashionInspirations: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  name?: string | null;
  phone?: string | null;
  timezone: string;
  avatarUrl?: string | null;
  onboardingStep: number;
  onboardingDone: boolean;
  whatsappVerified: boolean;
  morningTime: string;
  city?: string | null;
  country?: string | null;
  styleProfile?: StyleProfile | null;
}

export interface WeatherSnapshot {
  temp: number;
  feelsLike: number;
  description: string;
  weatherCode: number;
  precipitationProbability: number;
  uvIndex: number;
}

export interface GeneratedOutfitOption {
  type: RecommendationType;
  name: string;
  itemIds: string[];
  reasoning: string;
  weatherExplanation: string;
  styleExplanation: string;
  confidenceScore: number;
}

export const WARDROBE_CATEGORIES: { value: WardrobeCategory; label: string; emoji: string }[] = [
  { value: "TOPS", label: "Tops", emoji: "👕" },
  { value: "PANTS", label: "Pants", emoji: "👖" },
  { value: "SHORTS", label: "Shorts", emoji: "🩳" },
  { value: "SKIRTS", label: "Skirts", emoji: "👗" },
  { value: "DRESSES", label: "Dresses", emoji: "👗" },
  { value: "JACKETS", label: "Jackets & Coats", emoji: "🧥" },
  { value: "SHOES", label: "Shoes", emoji: "👠" },
  { value: "BAGS", label: "Bags", emoji: "👜" },
  { value: "JEWELRY", label: "Jewelry", emoji: "💎" },
  { value: "ACCESSORIES", label: "Accessories", emoji: "🧣" },
];

export const STYLE_CATEGORIES = [
  "Casual", "Minimalist", "Classic", "Feminine", "Bohemian",
  "Streetwear", "Preppy", "Romantic", "Edgy", "Sporty",
  "Business Casual", "Maximalist", "Vintage", "Coastal",
];

export const FAVORITE_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1a237e" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Blush Pink", hex: "#FFB6C1" },
  { name: "Sage Green", hex: "#8FBC8F" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Cobalt Blue", hex: "#0047AB" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Olive", hex: "#808000" },
];
