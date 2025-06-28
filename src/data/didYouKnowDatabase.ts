// Curated Did You Know Facts Database
import { CuratedDidYouKnowFact, FactCategory } from '../types/didYouKnow.types';

export const CURATED_DID_YOU_KNOW_FACTS: CuratedDidYouKnowFact[] = [
  // SCIENCE FACTS
  {
    fact: "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    category: FactCategory.SCIENCE,
    tags: ["honey", "preservation", "archaeology", "ancient egypt"],
    difficulty: "easy",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that a single bolt of lightning contains enough energy to power a 100-watt light bulb for more than 3 months?",
    category: FactCategory.SCIENCE,
    tags: ["lightning", "energy", "electricity", "power"],
    difficulty: "moderate",
    estimatedReadTime: 10,
    isVerified: true
  },
  {
    fact: "Did you know that diamonds can be made from peanut butter? Scientists have successfully created diamonds by subjecting carbon-rich peanut butter to extreme pressure.",
    category: FactCategory.SCIENCE,
    tags: ["diamonds", "peanut butter", "carbon", "pressure"],
    difficulty: "advanced",
    estimatedReadTime: 14,
    isVerified: true
  },
  {
    fact: "Did you know that water can boil and freeze at the same time? This phenomenon, called the triple point, occurs at a specific temperature and pressure.",
    category: FactCategory.SCIENCE,
    tags: ["water", "triple point", "physics", "states of matter"],
    difficulty: "advanced",
    estimatedReadTime: 13,
    isVerified: true
  },

  // SPACE FACTS
  {
    fact: "Did you know that one day on Venus is longer than one year on Venus? Venus rotates so slowly that it takes 243 Earth days to complete one rotation, but only 225 Earth days to orbit the Sun.",
    category: FactCategory.SPACE,
    tags: ["venus", "rotation", "orbit", "planets"],
    difficulty: "moderate",
    estimatedReadTime: 16,
    isVerified: true
  },
  {
    fact: "Did you know that there are more possible games of chess than there are atoms in the observable universe? The number of possible chess games is estimated to be 10^120.",
    category: FactCategory.SPACE,
    tags: ["chess", "universe", "atoms", "mathematics"],
    difficulty: "advanced",
    estimatedReadTime: 15,
    isVerified: true
  },
  {
    fact: "Did you know that neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth?",
    category: FactCategory.SPACE,
    tags: ["neutron stars", "density", "mass", "astronomy"],
    difficulty: "advanced",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that the footprints left by astronauts on the Moon will likely remain there for millions of years? The Moon has no atmosphere or weather to erode them.",
    category: FactCategory.SPACE,
    tags: ["moon", "astronauts", "footprints", "preservation"],
    difficulty: "easy",
    estimatedReadTime: 14,
    isVerified: true
  },

  // ANIMALS FACTS
  {
    fact: "Did you know that octopuses have three hearts and blue blood? Two hearts pump blood to the gills, while the third pumps blood to the rest of the body.",
    category: FactCategory.ANIMALS,
    tags: ["octopus", "hearts", "blood", "marine life"],
    difficulty: "moderate",
    estimatedReadTime: 13,
    isVerified: true
  },
  {
    fact: "Did you know that elephants are afraid of bees? Despite their size, elephants will avoid areas where they hear bee sounds and have a special warning call for bees.",
    category: FactCategory.ANIMALS,
    tags: ["elephants", "bees", "fear", "behavior"],
    difficulty: "easy",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that a group of flamingos is called a 'flamboyance'? These pink birds also get their color from the shrimp and algae they eat.",
    category: FactCategory.ANIMALS,
    tags: ["flamingos", "group names", "color", "diet"],
    difficulty: "easy",
    estimatedReadTime: 11,
    isVerified: true
  },
  {
    fact: "Did you know that dolphins have names for each other? They use unique whistle signatures to identify and call specific individuals in their pod.",
    category: FactCategory.ANIMALS,
    tags: ["dolphins", "communication", "names", "intelligence"],
    difficulty: "moderate",
    estimatedReadTime: 13,
    isVerified: true
  },

  // HUMAN BODY FACTS
  {
    fact: "Did you know that your brain uses about 20% of your body's total energy, despite only making up about 2% of your body weight?",
    category: FactCategory.HUMAN_BODY,
    tags: ["brain", "energy", "metabolism", "body weight"],
    difficulty: "moderate",
    estimatedReadTime: 11,
    isVerified: true
  },
  {
    fact: "Did you know that you produce about 1.5 liters of saliva every day? That's enough to fill about 6 cups!",
    category: FactCategory.HUMAN_BODY,
    tags: ["saliva", "production", "daily", "digestion"],
    difficulty: "easy",
    estimatedReadTime: 9,
    isVerified: true
  },
  {
    fact: "Did you know that your stomach gets an entirely new lining every 3-4 days? The stomach acid is so strong it would dissolve the stomach without this constant renewal.",
    category: FactCategory.HUMAN_BODY,
    tags: ["stomach", "lining", "acid", "regeneration"],
    difficulty: "moderate",
    estimatedReadTime: 14,
    isVerified: true
  },
  {
    fact: "Did you know that humans are the only animals that blush? This emotional response is unique to our species and involves the dilation of blood vessels in the face.",
    category: FactCategory.HUMAN_BODY,
    tags: ["blushing", "emotions", "unique", "blood vessels"],
    difficulty: "easy",
    estimatedReadTime: 12,
    isVerified: true
  },

  // TECHNOLOGY FACTS
  {
    fact: "Did you know that the first computer bug was an actual bug? In 1947, Grace Hopper found a moth trapped in a computer relay, coining the term 'computer bug'.",
    category: FactCategory.TECHNOLOGY,
    tags: ["computer bug", "grace hopper", "history", "programming"],
    difficulty: "easy",
    estimatedReadTime: 13,
    isVerified: true
  },
  {
    fact: "Did you know that more than 90% of the world's currency exists only digitally? Physical cash and coins represent less than 10% of all money.",
    category: FactCategory.TECHNOLOGY,
    tags: ["digital currency", "money", "cash", "economics"],
    difficulty: "moderate",
    estimatedReadTime: 11,
    isVerified: true
  },
  {
    fact: "Did you know that the first webcam was created to monitor a coffee pot? Cambridge University researchers wanted to check if the coffee was ready without leaving their desks.",
    category: FactCategory.TECHNOLOGY,
    tags: ["webcam", "coffee", "cambridge", "invention"],
    difficulty: "easy",
    estimatedReadTime: 13,
    isVerified: true
  },
  {
    fact: "Did you know that WiFi stands for nothing? Despite popular belief, it's not an acronym - it was just a catchy name chosen by a marketing company.",
    category: FactCategory.TECHNOLOGY,
    tags: ["wifi", "acronym", "marketing", "naming"],
    difficulty: "easy",
    estimatedReadTime: 10,
    isVerified: true
  },

  // HISTORY FACTS
  {
    fact: "Did you know that Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza? The pyramid was built around 2580 BC, while Cleopatra lived around 30 BC.",
    category: FactCategory.HISTORY,
    tags: ["cleopatra", "pyramids", "timeline", "ancient egypt"],
    difficulty: "moderate",
    estimatedReadTime: 16,
    isVerified: true
  },
  {
    fact: "Did you know that Oxford University is older than the Aztec Empire? Oxford was founded around 1096, while the Aztec Empire began around 1345.",
    category: FactCategory.HISTORY,
    tags: ["oxford university", "aztec empire", "timeline", "education"],
    difficulty: "moderate",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that Napoleon was actually average height for his time? The myth of his short stature came from the difference between French and English measurements.",
    category: FactCategory.HISTORY,
    tags: ["napoleon", "height", "myth", "measurements"],
    difficulty: "easy",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that the Great Wall of China isn't visible from space with the naked eye? This is a common myth - astronauts have confirmed it's not visible without aid.",
    category: FactCategory.HISTORY,
    tags: ["great wall", "space", "myth", "visibility"],
    difficulty: "easy",
    estimatedReadTime: 13,
    isVerified: true
  },

  // FOOD FACTS
  {
    fact: "Did you know that bananas are berries, but strawberries aren't? Botanically speaking, berries must have seeds inside their flesh, which bananas do but strawberries don't.",
    category: FactCategory.FOOD,
    tags: ["bananas", "strawberries", "berries", "botany"],
    difficulty: "moderate",
    estimatedReadTime: 13,
    isVerified: true
  },
  {
    fact: "Did you know that chocolate was once used as currency? The Aztecs valued cacao beans so highly that they used them as money for trading.",
    category: FactCategory.FOOD,
    tags: ["chocolate", "currency", "aztecs", "cacao"],
    difficulty: "easy",
    estimatedReadTime: 11,
    isVerified: true
  },
  {
    fact: "Did you know that carrots were originally purple? Orange carrots were developed in the Netherlands in the 17th century to honor the Dutch royal family.",
    category: FactCategory.FOOD,
    tags: ["carrots", "purple", "orange", "netherlands"],
    difficulty: "easy",
    estimatedReadTime: 12,
    isVerified: true
  },
  {
    fact: "Did you know that vanilla is the second most expensive spice in the world after saffron? It takes months to properly cure vanilla beans after harvesting.",
    category: FactCategory.FOOD,
    tags: ["vanilla", "expensive", "spice", "saffron"],
    difficulty: "moderate",
    estimatedReadTime: 12,
    isVerified: true
  }
];

// Helper function to get facts by category
export const getFactsByCategory = (category: FactCategory): CuratedDidYouKnowFact[] => {
  return CURATED_DID_YOU_KNOW_FACTS.filter(fact => fact.category === category);
};

// Helper function to get random facts
export const getRandomFacts = (count: number, excludeIds: string[] = []): CuratedDidYouKnowFact[] => {
  const availableFacts = CURATED_DID_YOU_KNOW_FACTS.filter((_, index) => 
    !excludeIds.includes(index.toString())
  );
  
  const shuffled = [...availableFacts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
