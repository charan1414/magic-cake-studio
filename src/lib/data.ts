import cheesecake from "@/assets/dish-cheesecake.jpg";
import biryani from "@/assets/dish-biryani.jpg";
import burger from "@/assets/dish-burger.jpg";
import wings from "@/assets/dish-wings.jpg";
import cupcakes from "@/assets/dish-cupcakes.jpg";
import roll from "@/assets/dish-roll.jpg";
import fries from "@/assets/dish-fries.jpg";
import craftCake from "@/assets/craft-cake.jpg";
import popcornChickenAsset from "@/assets/popcorn-chicken.jpg.asset.json";
import bomboloniAsset from "@/assets/bomboloni.jpg.asset.json";
import gulabJamunAsset from "@/assets/gulab-jamun.jpg.asset.json";
import tiramisuAsset from "@/assets/tiramisu.jpg.asset.json";
import tresLechesAsset from "@/assets/tres-leches.jpg.asset.json";
import vanillaCupcakeAsset from "@/assets/vanilla-cupcake.jpg.asset.json";
import brownieCupcakeAsset from "@/assets/brownie-cupcake.jpg.asset.json";
import redVelvetCupcakeAsset from "@/assets/red-velvet-cupcake.jpg.asset.json";
import biscoffOverloadAsset from "@/assets/biscoff-overload.jpg.asset.json";
import rasmalaiFusionAsset from "@/assets/rasmalai-fusion.jpg.asset.json";

const popcornChicken = popcornChickenAsset.url;
const bomboloni = bomboloniAsset.url;
const gulabJamun = gulabJamunAsset.url;
const tiramisu = tiramisuAsset.url;
const tres = tresLechesAsset.url;
const vanillaCupcake = vanillaCupcakeAsset.url;
const brownieCupcake = brownieCupcakeAsset.url;
const redVelvetCupcake = redVelvetCupcakeAsset.url;
const biscoffOverload = biscoffOverloadAsset.url;
const rasmalaiFusion = rasmalaiFusionAsset.url;

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  veg: boolean;
  bestSeller?: boolean;
  chefPick?: boolean;
  prepMins: number;
  calories: number;
  ingredients: string[];
};

export const CATEGORIES = [
  { slug: "cakes", name: "Signature Cakes", tagline: "Handcrafted for celebrations" },
  { slug: "cupcakes", name: "Cupcakes", tagline: "Petite indulgence" },
  { slug: "desserts", name: "Desserts", tagline: "Sweet finales" },
  { slug: "fried-chicken", name: "Fried Chicken", tagline: "Crisp. Golden. Unmatched." },
  { slug: "burgers", name: "Burgers", tagline: "Stacked to perfection" },
  { slug: "main-course", name: "Main Course", tagline: "Slow-crafted classics" },
  { slug: "rolls", name: "Rolls", tagline: "Rolled with care" },
  { slug: "street-food", name: "Street Food", tagline: "Bold. Loaded. Alive." },
  { slug: "snacks", name: "Snacks", tagline: "Little bites, big joy" },
];

export const PRODUCTS: Product[] = [
  // Cakes
  { slug: "belgian-dark-truffle", name: "Belgian Dark Truffle", category: "cakes", price: 1499, description: "A cathedral of Belgian couverture, whipped ganache, and gold-leaf embellishments.", image: craftCake, veg: true, bestSeller: true, chefPick: true, prepMins: 1440, calories: 420, ingredients: ["Belgian dark chocolate", "Fresh cream", "Butter", "Cocoa", "24k gold leaf"] },
  { slug: "black-forest", name: "Black Forest Reserve", category: "cakes", price: 899, description: "Kirsch-soaked sponge, black cherries, and clouds of whipped cream.", image: cheesecake, veg: true, bestSeller: true, prepMins: 1440, calories: 380, ingredients: ["Chocolate sponge", "Fresh cream", "Cherries", "Dark chocolate shavings"] },
  { slug: "blueberry-cheesecake", name: "Blueberry Cheesecake", category: "cakes", price: 1199, description: "Silken cream cheese on a butter-crumb base with wild blueberry compote.", image: cheesecake, veg: true, chefPick: true, prepMins: 1440, calories: 410, ingredients: ["Cream cheese", "Blueberries", "Digestive", "Butter", "Vanilla"] },
  { slug: "rasmalai-fusion", name: "Rasmalai Fusion", category: "cakes", price: 1299, description: "Cardamom sponge, saffron cream, pistachio crumb — an heirloom, reimagined.", image: craftCake, veg: true, prepMins: 1440, calories: 395, ingredients: ["Cardamom sponge", "Saffron cream", "Pistachio", "Rose petals"] },
  { slug: "biscoff-overload", name: "Biscoff Overload", category: "cakes", price: 1099, description: "Layers of Biscoff cream, caramelised biscuit crunch, and warm spice.", image: craftCake, veg: true, prepMins: 1440, calories: 440, ingredients: ["Biscoff spread", "Vanilla sponge", "Whipped cream", "Biscoff biscuits"] },

  // Cupcakes
  { slug: "red-velvet-cupcake", name: "Red Velvet Cupcake", category: "cupcakes", price: 129, description: "Cocoa-tinted crumb crowned with cream cheese frosting.", image: cupcakes, veg: true, prepMins: 60, calories: 260, ingredients: ["Cocoa", "Buttermilk", "Cream cheese", "Butter"] },
  { slug: "brownie-cupcake", name: "Brownie Cupcake", category: "cupcakes", price: 149, description: "Fudgy brownie in a cupcake shell, ganache glaze.", image: cupcakes, veg: true, chefPick: true, prepMins: 60, calories: 320, ingredients: ["Dark chocolate", "Butter", "Eggs", "Walnuts"] },
  { slug: "vanilla-bean-cupcake", name: "Vanilla Bean Cupcake", category: "cupcakes", price: 119, description: "Madagascar vanilla, Swiss meringue buttercream.", image: cupcakes, veg: true, prepMins: 60, calories: 240, ingredients: ["Vanilla bean", "Butter", "Sugar", "Eggs"] },

  // Desserts
  { slug: "tres-leches", name: "Tres Leches", category: "desserts", price: 249, description: "Three-milk soaked sponge with a whisper of cinnamon.", image: tres, veg: true, bestSeller: true, prepMins: 30, calories: 310, ingredients: ["Milk", "Condensed milk", "Evaporated milk", "Vanilla", "Cinnamon"] },
  { slug: "tiramisu", name: "Classic Tiramisu", category: "desserts", price: 279, description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.", image: tres, veg: true, chefPick: true, prepMins: 45, calories: 330, ingredients: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa"] },
  { slug: "gulab-jamun", name: "Ghee Gulab Jamun", category: "desserts", price: 149, description: "Golden, saffron-scented, drenched in rose syrup.", image: tres, veg: true, prepMins: 20, calories: 280, ingredients: ["Khoya", "Ghee", "Saffron", "Rose", "Cardamom"] },
  { slug: "bomboloni", name: "Bomboloni", category: "desserts", price: 199, description: "Cloud-soft Italian doughnuts filled with vanilla custard.", image: cupcakes, veg: true, prepMins: 25, calories: 290, ingredients: ["Enriched dough", "Vanilla custard", "Sugar"] },

  // Fried Chicken
  { slug: "fire-wings", name: "Golden Fire Wings", category: "fried-chicken", price: 349, description: "Twice-fried wings tossed in house-smoked gochujang glaze.", image: wings, veg: false, bestSeller: true, prepMins: 25, calories: 480, ingredients: ["Chicken wings", "Gochujang", "Garlic", "Honey"] },
  { slug: "popcorn-chicken", name: "Popcorn Chicken", category: "fried-chicken", price: 249, description: "Bite-sized, buttermilk brined, spiced crust.", image: wings, veg: false, prepMins: 20, calories: 420, ingredients: ["Chicken breast", "Buttermilk", "Spices", "Flour"] },
  { slug: "crispy-leg-pieces", name: "Crispy Leg Pieces", category: "fried-chicken", price: 299, description: "Whole leg pieces, 24-hour brine, shatter crust.", image: wings, veg: false, chefPick: true, prepMins: 25, calories: 510, ingredients: ["Chicken leg", "Buttermilk", "Herbs", "Panko"] },

  // Burgers
  { slug: "signature-crispy", name: "Signature Crispy Burger", category: "burgers", price: 279, description: "Buttermilk-fried chicken, house pickles, gold-toasted brioche.", image: burger, veg: false, bestSeller: true, prepMins: 20, calories: 620, ingredients: ["Chicken", "Brioche", "Pickles", "House mayo", "Lettuce"] },
  { slug: "tandoori-burger", name: "Tandoori Burger", category: "burgers", price: 249, description: "Charred tandoori patty, mint chutney, caramelised onions.", image: burger, veg: false, prepMins: 20, calories: 580, ingredients: ["Chicken", "Tandoori spice", "Mint chutney", "Onion"] },
  { slug: "veg-crispy", name: "Veg Crispy Burger", category: "burgers", price: 219, description: "Crunchy panko patty, tangy slaw, sriracha aioli.", image: burger, veg: true, prepMins: 18, calories: 540, ingredients: ["Vegetable patty", "Slaw", "Sriracha aioli", "Brioche"] },

  // Main Course
  { slug: "dum-biryani", name: "Hyderabadi Dum Biryani", category: "main-course", price: 399, description: "Aged basmati, saffron, slow-sealed handi, unveiled at your table.", image: biryani, veg: false, bestSeller: true, chefPick: true, prepMins: 90, calories: 720, ingredients: ["Basmati rice", "Chicken", "Saffron", "Ghee", "Whole spices", "Yogurt"] },
  { slug: "pepper-chicken", name: "Malabar Pepper Chicken", category: "main-course", price: 349, description: "Coastal spice, cracked pepper, curry leaves.", image: biryani, veg: false, prepMins: 45, calories: 480, ingredients: ["Chicken", "Black pepper", "Curry leaves", "Coconut oil"] },
  { slug: "egg-rice", name: "Ghee Egg Rice", category: "main-course", price: 219, description: "Wok-tossed rice, farm eggs, brown butter, spring onion.", image: biryani, veg: false, prepMins: 20, calories: 520, ingredients: ["Basmati rice", "Eggs", "Ghee", "Spring onion"] },

  // Rolls
  { slug: "chicken-roll", name: "Kolkata Chicken Roll", category: "rolls", price: 189, description: "Flaky paratha, spiced chicken, pickled onions.", image: roll, veg: false, prepMins: 15, calories: 460, ingredients: ["Paratha", "Chicken", "Onion", "Mint chutney"] },
  { slug: "paneer-roll", name: "Malai Paneer Roll", category: "rolls", price: 169, description: "Creamy paneer tikka wrapped in warm paratha.", image: roll, veg: true, chefPick: true, prepMins: 15, calories: 480, ingredients: ["Paneer", "Cashew cream", "Paratha", "Onion"] },

  // Street Food
  { slug: "loaded-fries", name: "Truffle Loaded Fries", category: "street-food", price: 269, description: "Hand-cut fries, aged cheddar, herb salt, black truffle oil.", image: fries, veg: true, bestSeller: true, prepMins: 15, calories: 560, ingredients: ["Potato", "Cheddar", "Truffle oil", "Herbs"] },
  { slug: "kurkure-momos", name: "Kurkure Momos", category: "street-food", price: 199, description: "Crackling shell, molten spiced filling, house schezwan.", image: fries, veg: true, prepMins: 20, calories: 440, ingredients: ["Momos", "Corn flakes", "Schezwan sauce"] },
  { slug: "ramen-bowl", name: "Chef's Ramen Bowl", category: "street-food", price: 329, description: "Slow-simmered broth, ramen noodles, soft egg, chilli oil.", image: fries, veg: false, prepMins: 25, calories: 560, ingredients: ["Ramen", "Chicken broth", "Egg", "Chilli oil"] },

  // Snacks
  { slug: "paneer-puff", name: "Paneer Puff", category: "snacks", price: 79, description: "Buttery puff pastry, spiced paneer heart.", image: fries, veg: true, prepMins: 10, calories: 260, ingredients: ["Puff pastry", "Paneer", "Onion", "Spices"] },
  { slug: "samosa", name: "Handmade Samosa", category: "snacks", price: 49, description: "Golden crust, spiced potato and pea filling.", image: fries, veg: true, prepMins: 10, calories: 220, ingredients: ["Wheat", "Potato", "Peas", "Spices"] },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getByCategory = (cat: string) => PRODUCTS.filter((p) => p.category === cat);

// Cake studio options
export const CAKE_SHAPES = ["Round", "Heart", "Square", "Rectangle", "Hexagon", "Two Tier", "Three Tier", "Number", "Alphabet"];
export const CAKE_SIZES = [
  { label: "500 g", value: 500, mult: 0.7 },
  { label: "1 kg", value: 1000, mult: 1 },
  { label: "1.5 kg", value: 1500, mult: 1.4 },
  { label: "2 kg", value: 2000, mult: 1.8 },
  { label: "3 kg", value: 3000, mult: 2.6 },
  { label: "5 kg", value: 5000, mult: 4.2 },
];
export const CAKE_FLAVORS = ["Vanilla", "Chocolate", "Red Velvet", "Butterscotch", "Coffee", "Belgian Dark", "Biscoff", "Pistachio", "Rasmalai"];
export const CAKE_FILLINGS = ["Chocolate Ganache", "Nutella", "Fresh Cream", "Biscoff", "Mango", "Strawberry", "Blueberry", "Salted Caramel", "Pistachio"];
export const CAKE_FROSTINGS = ["Whipped Cream", "Buttercream", "Chocolate Ganache", "Cream Cheese", "Mirror Glaze", "Fondant"];
export const CAKE_THEMES = [
  { name: "Luxury Black & Gold", color: "#111111", accent: "#D4A857" },
  { name: "White & Gold", color: "#F5EFE3", accent: "#C9A34E" },
  { name: "Rose Gold", color: "#E9C6B2", accent: "#B76E79" },
  { name: "Pastel Pink", color: "#F6D5D5", accent: "#E4A2A2" },
  { name: "Royal Blue", color: "#25406B", accent: "#F1D278" },
  { name: "Emerald", color: "#1F5241", accent: "#D4A857" },
  { name: "Lavender", color: "#C7B8E1", accent: "#7A5EA6" },
  { name: "Minimal White", color: "#F7F4EE", accent: "#8A8A8A" },
];
export const CAKE_DECORATIONS = [
  "Fresh Flowers", "Chocolate Shards", "Macarons", "Ferrero Rocher",
  "Oreos", "Biscoff Cookies", "Fresh Fruits", "24K Gold Leaf",
  "Silver Pearls", "Edible Glitter", "Mini Cupcakes", "Custom Topper",
];

// Serviceability: Lakkur, Malur (approx)
export const LAKKUR = { lat: 13.0071, lng: 77.9436 };
export const DELIVERY_RADIUS_KM = 20;
export const MALUR_PINCODES = ["563130", "563125", "563135", "562123", "562135", "563159"];

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
