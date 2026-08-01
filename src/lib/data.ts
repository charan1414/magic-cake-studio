import burger from "@/assets/dish-burger.jpg";
import wings from "@/assets/dish-wings.jpg";
import roll from "@/assets/dish-roll.jpg";
import fries from "@/assets/dish-fries.jpg";
import biryani from "@/assets/dish-biryani.jpg";
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
import blueberryCheesecakeAsset from "@/assets/blueberry-cheesecake.jpg.asset.json";
import blackForestAsset from "@/assets/black-forest-cake.jpg.asset.json";
import belgianTruffleAsset from "@/assets/belgian-dark-truffle.jpg.asset.json";
import kurkureMomosAsset from "@/assets/kurkure-momos.jpg.asset.json";
import eggRiceAsset from "@/assets/egg-rice.jpg.asset.json";
import londonChocolateAsset from "@/assets/landon-chocholate-cake.jpg.asset.json";
import mangoCakeAsset from "@/assets/mango-cake.jpg.asset.json";
import redVelvetCakeAsset from "@/assets/red-velvet-cake.jpg.asset.json";
import jamunCakeAsset from "@/assets/jamun-cake.jpg.asset.json";
import ramenBowlAsset from "@/assets/ramen-bowl.jpg.asset.json";
import strawberryCakeAsset from "@/assets/strawberry-cake.jpg.asset.json";
import pineappleCakeAsset from "@/assets/pineapple-cake.jpg.asset.json";
import fruitCakeAsset from "@/assets/fruit-cake.jpg.asset.json";
import icMango from "@/assets/ic-mango.jpg";
import icStrawberry from "@/assets/ic-strawberry.jpg";
import icJackfruit from "@/assets/ic-jackfruit.jpg";
import icVanilla from "@/assets/ic-vanilla.jpg";
import icButterscotch from "@/assets/ic-butterscotch.jpg";
import icChocolate from "@/assets/ic-chocolate.jpg";
import icBlackcurrant from "@/assets/ic-blackcurrant.jpg";
import icCoconut from "@/assets/ic-coconut.jpg";
import icBiscoff from "@/assets/ic-biscoff.jpg";
import icBlueberry from "@/assets/ic-blueberry.jpg";
import icChocoNutSundae from "@/assets/ic-choco-nut-sundae.jpg";
import icAlmondFudge from "@/assets/ic-almond-fudge.jpg";
import icTrilogy from "@/assets/ic-trilogy.jpg";
import icBananaSplit from "@/assets/ic-banana-split.jpg";
import icGudbud from "@/assets/ic-gudbud.jpg";
import icDbc from "@/assets/ic-dbc.jpg";
import icGjIcecream from "@/assets/ic-gj-icecream.jpg";
import cakeButterscotch from "@/assets/cake-butterscotch.jpg";
import cakeTiramisu from "@/assets/cake-tiramisu.jpg";
import cakeBrownie from "@/assets/cake-brownie.jpg";
import cakeKunafa from "@/assets/cake-kunafa.jpg";
import cakePineappleLychee from "@/assets/cake-pineapple-lychee-cherry.jpg";
import ckButter from "@/assets/ck-butter.jpg";
import ckJamdrop from "@/assets/ck-jamdrop.jpg";
import ckCoconut from "@/assets/ck-coconut.jpg";
import ckSweetsalt from "@/assets/ck-sweetsalt.jpg";
import ckBanana from "@/assets/ck-banana.jpg";
import ckChocochip from "@/assets/ck-chocochip.jpg";
import ckChunk from "@/assets/ck-chunk.jpg";
import ckBelgian from "@/assets/ck-belgian.jpg";
import ckCashew from "@/assets/ck-cashew.jpg";
import ckPistachio from "@/assets/ck-pistachio.jpg";
import ckBiscoff from "@/assets/ck-biscoff.jpg";
import ckNutella from "@/assets/ck-nutella.jpg";
import ckCranberry from "@/assets/ck-cranberry.jpg";
import ckNankhatai from "@/assets/ck-nankhatai.jpg";
import ckJeera from "@/assets/ck-jeera.jpg";
import ckOats from "@/assets/ck-oats.jpg";
import ckRagi from "@/assets/ck-ragi.jpg";
import ckSaltedcaramel from "@/assets/ck-saltedcaramel.jpg";
import ckMultigrain from "@/assets/ck-multigrain.jpg";
import ckPeanutbutter from "@/assets/ck-peanutbutter.jpg";
import ckSeedmix from "@/assets/ck-seedmix.jpg";
import ckDryfruit from "@/assets/ck-dryfruit.jpg";




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
const blueberryCheesecake = blueberryCheesecakeAsset.url;
const blackForest = blackForestAsset.url;
const belgianTruffle = belgianTruffleAsset.url;
const kurkureMomosImg = kurkureMomosAsset.url;
const eggRiceImg = eggRiceAsset.url;
const londonChocolate = londonChocolateAsset.url;
const mangoCake = mangoCakeAsset.url;
const redVelvetCake = redVelvetCakeAsset.url;
const jamunCake = jamunCakeAsset.url;
const ramenBowl = ramenBowlAsset.url;
const strawberryCake = strawberryCakeAsset.url;
const pineappleCake = pineappleCakeAsset.url;
const fruitCake = fruitCakeAsset.url;

export type StockStatus = "in" | "low" | "out";

export type Product = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  description: string;
  image: string;
  veg: boolean;
  bestSeller?: boolean;
  chefPick?: boolean;
  prepMins: number;
  calories: number;
  ingredients: string[];
  stock?: StockStatus;
  unitLabel?: string; // e.g. "Scoop", "Piece"
};

export const CATEGORIES = [
  { slug: "seasonal-special", name: "Seasonal Special", tagline: "Limited edition — while the season lasts" },
  { slug: "cakes", name: "Signature Cakes", tagline: "Handcrafted for celebrations" },
  { slug: "ice-cream", name: "Ice Cream", tagline: "Small-batch scoops & signature sundaes" },
  { slug: "cupcakes", name: "Cupcakes", tagline: "Petite indulgence" },
  { slug: "desserts", name: "Desserts", tagline: "Sweet finales" },
  { slug: "fried-chicken", name: "Fried Chicken", tagline: "Crisp. Golden. Unmatched." },
  { slug: "burgers", name: "Burgers", tagline: "Stacked to perfection" },
  { slug: "main-course", name: "Main Course", tagline: "Slow-crafted classics" },
  { slug: "rolls", name: "Rolls", tagline: "Rolled with care" },
  { slug: "street-food", name: "Street Food", tagline: "Bold. Loaded. Alive." },
  { slug: "snacks", name: "Snacks", tagline: "Little bites, big joy" },
];

// Ice cream sub-category groupings — surfaced by the category page.
export const ICE_CREAM_GROUPS = [
  { slug: "seasonal", name: "Seasonal Specials", emoji: "🌴" },
  { slug: "classics", name: "Everyday Classics", emoji: "🍦" },
  { slug: "sundaes", name: "Signature Sundaes", emoji: "⭐" },
  { slug: "combo", name: "Dessert Combo", emoji: "🍨" },
];

// NOTE: For cake categories (`cakes` and `seasonal-special`) `price` is the
// 500 g base price. Larger sizes are computed via `cakePrice()` with bulk
// discounts (₹80 off at 1 kg, up to ₹560 off at 5 kg vs strict linear).
export const PRODUCTS: Product[] = [
  // Seasonal Special (500 g base price)
  { slug: "mango-magic-cake", name: "Mango Magic Cake", category: "seasonal-special", price: 379, description: "Alphonso mango cream, soft vanilla sponge, fresh mango cubes crowning the top.", image: mangoCake, veg: true, bestSeller: true, chefPick: true, prepMins: 1440, calories: 380, ingredients: ["Alphonso mango", "Vanilla sponge", "Fresh cream", "Mango compote"] },
  { slug: "strawberry-bliss-cake", name: "Strawberry Bliss Cake", category: "seasonal-special", price: 379, description: "Whipped strawberry cream, fresh berries, and a soft vanilla crumb.", image: strawberryCake, veg: true, chefPick: true, prepMins: 1440, calories: 360, ingredients: ["Fresh strawberries", "Vanilla sponge", "Whipped cream", "Strawberry compote"] },

  // Cakes (500 g base price)
  { slug: "belgian-dark-truffle", name: "Belgian Dark Truffle", category: "cakes", price: 399, description: "A cathedral of Belgian couverture, whipped ganache, and gold-leaf embellishments.", image: belgianTruffle, veg: true, bestSeller: true, chefPick: true, prepMins: 1440, calories: 420, ingredients: ["Belgian dark chocolate", "Fresh cream", "Butter", "Cocoa", "24k gold leaf"] },
  { slug: "black-forest", name: "Black Forest Reserve", category: "cakes", price: 389, description: "Kirsch-soaked sponge, black cherries, and clouds of whipped cream.", image: blackForest, veg: true, bestSeller: true, prepMins: 1440, calories: 380, ingredients: ["Chocolate sponge", "Fresh cream", "Cherries", "Dark chocolate shavings"] },
  { slug: "blueberry-cheesecake", name: "Blueberry Cheesecake", category: "cakes", price: 499, description: "Silken cream cheese on a butter-crumb base with wild blueberry compote.", image: blueberryCheesecake, veg: true, chefPick: true, prepMins: 1440, calories: 410, ingredients: ["Cream cheese", "Blueberries", "Digestive", "Butter", "Vanilla"] },
  { slug: "rasmalai-fusion", name: "Rasmalai Fusion", category: "cakes", price: 399, description: "Cardamom sponge, saffron cream, pistachio crumb — an heirloom, reimagined.", image: rasmalaiFusion, veg: true, prepMins: 1440, calories: 395, ingredients: ["Cardamom sponge", "Saffron cream", "Pistachio", "Rose petals"] },
  { slug: "biscoff-overload", name: "Biscoff Overload", category: "cakes", price: 399, description: "Layers of Biscoff cream, caramelised biscuit crunch, and warm spice.", image: biscoffOverload, veg: true, prepMins: 1440, calories: 440, ingredients: ["Biscoff spread", "Vanilla sponge", "Whipped cream", "Biscoff biscuits"] },
  { slug: "london-chocolate", name: "London Chocolate Loaf", category: "cakes", price: 449, description: "London-style layered chocolate loaf, molten ganache glaze, silken chocolate cream.", image: londonChocolate, veg: true, chefPick: true, prepMins: 1440, calories: 460, ingredients: ["Dark chocolate", "Cocoa sponge", "Ganache", "Butter"] },
  { slug: "pineapple-cake", name: "Pineapple Cream Cake", category: "cakes", price: 369, description: "Fluffy vanilla sponge, whipped cream, ripe pineapple chunks.", image: pineappleCake, veg: true, prepMins: 1440, calories: 340, ingredients: ["Pineapple", "Vanilla sponge", "Whipped cream", "Sugar syrup"] },
  { slug: "jamun-cake", name: "Gulab Jamun Cake", category: "cakes", price: 389, description: "Vanilla cream cake studded with soft, syrup-soaked gulab jamun.", image: jamunCake, veg: true, prepMins: 1440, calories: 420, ingredients: ["Gulab jamun", "Vanilla sponge", "Whipped cream", "Cardamom"] },
  { slug: "fruit-cake", name: "Fresh Fruit Cake", category: "cakes", price: 449, description: "Vanilla sponge crowned with kiwi, berries, and seasonal fresh fruits.", image: fruitCake, veg: true, prepMins: 1440, calories: 350, ingredients: ["Fresh fruits", "Vanilla sponge", "Whipped cream", "Fruit glaze"] },
  { slug: "red-velvet-cake", name: "Red Velvet Cake", category: "cakes", price: 379, description: "Cocoa-kissed crimson sponge with clouds of cream cheese frosting.", image: redVelvetCake, veg: true, prepMins: 1440, calories: 400, ingredients: ["Cocoa", "Buttermilk", "Cream cheese", "Butter"] },

  // Cupcakes (per piece)
  { slug: "red-velvet-cupcake", name: "Red Velvet Cupcake", category: "cupcakes", price: 49, description: "Cocoa-tinted crumb crowned with cream cheese frosting.", image: redVelvetCupcake, veg: true, prepMins: 60, calories: 260, ingredients: ["Cocoa", "Buttermilk", "Cream cheese", "Butter"] },
  { slug: "brownie-cupcake", name: "Brownie Cupcake", category: "cupcakes", price: 69, description: "Fudgy brownie in a cupcake shell, ganache glaze.", image: brownieCupcake, veg: true, chefPick: true, prepMins: 60, calories: 320, ingredients: ["Dark chocolate", "Butter", "Eggs", "Walnuts"] },
  { slug: "vanilla-bean-cupcake", name: "Vanilla Bean Cupcake", category: "cupcakes", price: 39, description: "Madagascar vanilla, Swiss meringue buttercream.", image: vanillaCupcake, veg: true, prepMins: 60, calories: 240, ingredients: ["Vanilla bean", "Butter", "Sugar", "Eggs"] },

  // Desserts
  { slug: "tres-leches", name: "Tres Leches", category: "desserts", price: 199, description: "Three-milk soaked sponge with a whisper of cinnamon.", image: tres, veg: true, bestSeller: true, prepMins: 30, calories: 310, ingredients: ["Milk", "Condensed milk", "Evaporated milk", "Vanilla", "Cinnamon"] },
  { slug: "tiramisu", name: "Classic Tiramisu", category: "desserts", price: 249, description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.", image: tiramisu, veg: true, chefPick: true, prepMins: 45, calories: 330, ingredients: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa"] },
  { slug: "gulab-jamun", name: "Ghee Gulab Jamun", category: "desserts", price: 15, description: "Golden, saffron-scented, drenched in rose syrup. Priced per piece.", image: gulabJamun, veg: true, prepMins: 20, calories: 280, ingredients: ["Khoya", "Ghee", "Saffron", "Rose", "Cardamom"] },
  { slug: "bomboloni", name: "Bomboloni", category: "desserts", price: 99, description: "Cloud-soft Italian doughnuts filled with vanilla custard. Per piece.", image: bomboloni, veg: true, prepMins: 25, calories: 290, ingredients: ["Enriched dough", "Vanilla custard", "Sugar"] },

  // Fried Chicken
  { slug: "fire-wings", name: "Golden Fire Wings", category: "fried-chicken", price: 349, description: "Twice-fried wings tossed in house-smoked gochujang glaze.", image: wings, veg: false, bestSeller: true, prepMins: 25, calories: 480, ingredients: ["Chicken wings", "Gochujang", "Garlic", "Honey"] },
  { slug: "popcorn-chicken", name: "Popcorn Chicken", category: "fried-chicken", price: 249, description: "Bite-sized, buttermilk brined, spiced crust.", image: popcornChicken, veg: false, prepMins: 20, calories: 420, ingredients: ["Chicken breast", "Buttermilk", "Spices", "Flour"] },
  { slug: "crispy-leg-pieces", name: "Crispy Leg Pieces", category: "fried-chicken", price: 79, description: "Whole leg pieces, 24-hour brine, shatter crust. Per piece.", image: wings, veg: false, chefPick: true, prepMins: 25, calories: 510, ingredients: ["Chicken leg", "Buttermilk", "Herbs", "Panko"] },

  // Burgers
  { slug: "signature-crispy", name: "Signature Crispy Burger", category: "burgers", price: 89, description: "Buttermilk-fried chicken, house pickles, gold-toasted brioche.", image: burger, veg: false, bestSeller: true, prepMins: 20, calories: 620, ingredients: ["Chicken", "Brioche", "Pickles", "House mayo", "Lettuce"] },
  { slug: "tandoori-burger", name: "Tandoori Burger", category: "burgers", price: 99, description: "Charred tandoori patty, mint chutney, caramelised onions.", image: burger, veg: false, prepMins: 20, calories: 580, ingredients: ["Chicken", "Tandoori spice", "Mint chutney", "Onion"] },
  { slug: "veg-crispy", name: "Veg Crispy Burger", category: "burgers", price: 59, description: "Crunchy panko patty, tangy slaw, sriracha aioli.", image: burger, veg: true, prepMins: 18, calories: 540, ingredients: ["Vegetable patty", "Slaw", "Sriracha aioli", "Brioche"] },

  // Main Course
  { slug: "dum-biryani", name: "Hyderabadi Dum Biryani", category: "main-course", price: 159, description: "Aged basmati, saffron, slow-sealed handi, unveiled at your table.", image: biryani, veg: false, bestSeller: true, chefPick: true, prepMins: 90, calories: 720, ingredients: ["Basmati rice", "Chicken", "Saffron", "Ghee", "Whole spices", "Yogurt"] },
  { slug: "pepper-chicken", name: "Malabar Pepper Chicken", category: "main-course", price: 349, description: "Coastal spice, cracked pepper, curry leaves.", image: biryani, veg: false, prepMins: 45, calories: 480, ingredients: ["Chicken", "Black pepper", "Curry leaves", "Coconut oil"] },
  { slug: "egg-rice", name: "Ghee Egg Rice", category: "main-course", price: 69, description: "Wok-tossed rice, farm eggs, brown butter, spring onion.", image: eggRiceImg, veg: false, prepMins: 20, calories: 520, ingredients: ["Basmati rice", "Eggs", "Ghee", "Spring onion"] },

  // Rolls
  { slug: "chicken-roll", name: "Kolkata Chicken Roll", category: "rolls", price: 79, description: "Flaky paratha, spiced chicken, pickled onions.", image: roll, veg: false, prepMins: 15, calories: 460, ingredients: ["Paratha", "Chicken", "Onion", "Mint chutney"] },
  { slug: "paneer-roll", name: "Malai Paneer Roll", category: "rolls", price: 69, description: "Creamy paneer tikka wrapped in warm paratha.", image: roll, veg: true, chefPick: true, prepMins: 15, calories: 480, ingredients: ["Paneer", "Cashew cream", "Paratha", "Onion"] },

  // Street Food
  { slug: "loaded-fries", name: "Truffle Loaded Fries", category: "street-food", price: 269, description: "Hand-cut fries, aged cheddar, herb salt, black truffle oil.", image: fries, veg: true, bestSeller: true, prepMins: 15, calories: 560, ingredients: ["Potato", "Cheddar", "Truffle oil", "Herbs"] },
  { slug: "kurkure-momos", name: "Kurkure Momos", category: "street-food", price: 99, description: "Crackling shell, molten spiced filling, house schezwan.", image: kurkureMomosImg, veg: true, prepMins: 20, calories: 440, ingredients: ["Momos", "Corn flakes", "Schezwan sauce"] },
  { slug: "ramen-bowl", name: "Chef's Ramen Bowl", category: "street-food", price: 329, description: "Slow-simmered broth, ramen noodles, soft egg, chilli oil.", image: ramenBowl, veg: false, prepMins: 25, calories: 560, ingredients: ["Ramen", "Chicken broth", "Egg", "Chilli oil"] },

  // Snacks
  { slug: "paneer-puff", name: "Paneer Puff", category: "snacks", price: 25, description: "Buttery puff pastry, spiced paneer heart.", image: fries, veg: true, prepMins: 10, calories: 260, ingredients: ["Puff pastry", "Paneer", "Onion", "Spices"] },
  { slug: "samosa", name: "Handmade Samosa", category: "snacks", price: 19, description: "Golden crust, spiced potato and pea filling.", image: fries, veg: true, prepMins: 10, calories: 220, ingredients: ["Wheat", "Potato", "Peas", "Spices"] },

  // Ice Cream · Seasonal Specials
  { slug: "ic-mango-bliss", name: "Mango Bliss", category: "ice-cream", subcategory: "seasonal", price: 29, unitLabel: "Scoop", description: "Made using real seasonal Alphonso mango pulp, delivering a naturally sweet tropical flavour.", image: icMango, veg: true, bestSeller: true, chefPick: true, prepMins: 5, calories: 180, ingredients: ["Alphonso mango pulp", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-strawberry-delight", name: "Strawberry Delight", category: "ice-cream", subcategory: "seasonal", price: 39, unitLabel: "Scoop", description: "Prepared with real strawberries for a naturally fresh and creamy dessert.", image: icStrawberry, veg: true, prepMins: 5, calories: 190, ingredients: ["Strawberries", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-jackfruit-paradise", name: "Jackfruit Paradise", category: "ice-cream", subcategory: "seasonal", price: 29, unitLabel: "Scoop", description: "Crafted using fresh seasonal jackfruit with authentic tropical richness.", image: icJackfruit, veg: true, prepMins: 5, calories: 195, ingredients: ["Jackfruit", "Milk", "Cream", "Sugar"], stock: "in" },

  // Ice Cream · Everyday Classics
  { slug: "ic-classic-vanilla", name: "Classic Vanilla", category: "ice-cream", subcategory: "classics", price: 29, unitLabel: "Scoop", description: "Rich and creamy vanilla made using premium ingredients.", image: icVanilla, veg: true, prepMins: 5, calories: 170, ingredients: ["Vanilla bean", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-butterscotch-crunch", name: "Butterscotch Crunch", category: "ice-cream", subcategory: "classics", price: 29, unitLabel: "Scoop", description: "Smooth butterscotch with crunchy caramel bits.", image: icButterscotch, veg: true, prepMins: 5, calories: 210, ingredients: ["Butterscotch", "Caramel praline", "Milk", "Cream"], stock: "in" },
  { slug: "ic-chocolate-delight", name: "Chocolate Delight", category: "ice-cream", subcategory: "classics", price: 39, unitLabel: "Scoop", description: "Creamy chocolate ice cream prepared using premium cocoa.", image: icChocolate, veg: true, bestSeller: true, prepMins: 5, calories: 220, ingredients: ["Premium cocoa", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-black-currant", name: "Black Currant", category: "ice-cream", subcategory: "classics", price: 39, unitLabel: "Scoop", description: "Refreshing berry flavour with rich black currant goodness.", image: icBlackcurrant, veg: true, prepMins: 5, calories: 190, ingredients: ["Black currant", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-tender-coconut", name: "Tender Coconut", category: "ice-cream", subcategory: "classics", price: 49, unitLabel: "Scoop", description: "Made using real tender coconut pieces.", image: icCoconut, veg: true, prepMins: 5, calories: 205, ingredients: ["Tender coconut", "Milk", "Cream", "Sugar"], stock: "in" },
  { slug: "ic-lotus-biscoff", name: "Lotus Biscoff", category: "ice-cream", subcategory: "classics", price: 59, unitLabel: "Scoop", description: "Creamy caramelised biscuit ice cream with crunchy Biscoff crumble.", image: icBiscoff, veg: true, chefPick: true, prepMins: 5, calories: 240, ingredients: ["Biscoff spread", "Biscoff biscuit", "Milk", "Cream"], stock: "in" },
  { slug: "ic-blueberry-bliss", name: "Blueberry Bliss", category: "ice-cream", subcategory: "classics", price: 69, unitLabel: "Scoop", description: "Made using real blueberries.", image: icBlueberry, veg: true, prepMins: 5, calories: 210, ingredients: ["Blueberries", "Milk", "Cream", "Sugar"], stock: "in" },

  // Ice Cream · Signature Sundaes
  { slug: "ic-chocolate-nut-sundae", name: "Chocolate Nut Sundae", category: "ice-cream", subcategory: "sundaes", price: 89, description: "2 scoops chocolate ice cream, roasted nuts, chocolate sauce and whipped cream.", image: icChocoNutSundae, veg: true, prepMins: 10, calories: 460, ingredients: ["Chocolate ice cream", "Roasted nuts", "Chocolate sauce", "Whipped cream"], stock: "in" },
  { slug: "ic-almond-fudge", name: "Almond Fudge", category: "ice-cream", subcategory: "sundaes", price: 99, description: "Premium almond ice cream layered with chocolate fudge.", image: icAlmondFudge, veg: true, prepMins: 10, calories: 480, ingredients: ["Almond ice cream", "Chocolate fudge", "Sliced almonds"], stock: "in" },
  { slug: "ic-trilogy", name: "Trilogy", category: "ice-cream", subcategory: "sundaes", price: 111, description: "Vanilla + Chocolate + Strawberry served with sauces, nuts and wafer sticks.", image: icTrilogy, veg: true, chefPick: true, prepMins: 10, calories: 520, ingredients: ["Vanilla", "Chocolate", "Strawberry", "Sauces", "Nuts", "Wafer sticks"], stock: "in" },
  { slug: "ic-banana-split", name: "Banana Split", category: "ice-cream", subcategory: "sundaes", price: 123, description: "Fresh banana with three scoops of ice cream, sauces, nuts and whipped cream.", image: icBananaSplit, veg: true, prepMins: 10, calories: 560, ingredients: ["Banana", "Ice cream (3 scoops)", "Chocolate sauce", "Strawberry sauce", "Nuts", "Whipped cream"], stock: "in" },
  { slug: "ic-gudbud-special", name: "Gudbud Special", category: "ice-cream", subcategory: "sundaes", price: 139, description: "Premium layered dessert with fruits, jelly, cake pieces, nuts and syrups.", image: icGudbud, veg: true, bestSeller: true, prepMins: 12, calories: 580, ingredients: ["Fruits", "Jelly", "Cake pieces", "Ice cream", "Nuts", "Syrups"], stock: "in" },
  { slug: "ic-dbc", name: "DBC (Death By Chocolate)", category: "ice-cream", subcategory: "sundaes", price: 149, description: "Chocolate brownie, chocolate ice cream, chocolate sauce, chips, fudge and whipped cream.", image: icDbc, veg: true, chefPick: true, prepMins: 12, calories: 640, ingredients: ["Chocolate brownie", "Chocolate ice cream", "Chocolate sauce", "Chocolate chips", "Fudge", "Whipped cream"], stock: "in" },

  // Ice Cream · Dessert Combo
  { slug: "ic-gulab-jamun-icecream", name: "Gulab Jamun with Ice Cream", category: "ice-cream", subcategory: "combo", price: 49, description: "Warm gulab jamun served with creamy vanilla ice cream.", image: icGjIcecream, veg: true, prepMins: 8, calories: 380, ingredients: ["Gulab jamun", "Sugar syrup", "Vanilla ice cream"], stock: "in" },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getByCategory = (cat: string) => PRODUCTS.filter((p) => p.category === cat);

// Cake studio options
export const CAKE_SHAPES = ["Round", "Heart", "Square", "Rectangle", "Hexagon", "Two Tier", "Three Tier", "Number", "Alphabet"];
// Sizes for cakes. `units` = number of 500 g portions. `discount` = INR
// off vs the strict linear (units × 500g price) — a bulk discount so
// buying a larger cake is cheaper per kg. Rule of thumb per user:
// ₹80 off at 1 kg, ₹200 off at 2 kg, and scaling up from there.
export const CAKE_SIZES = [
  { label: "500 g", value: 500, units: 1, discount: 0 },
  { label: "1 kg", value: 1000, units: 2, discount: 80 },
  { label: "1.5 kg", value: 1500, units: 3, discount: 140 },
  { label: "2 kg", value: 2000, units: 4, discount: 200 },
  { label: "3 kg", value: 3000, units: 6, discount: 320 },
  { label: "5 kg", value: 5000, units: 10, discount: 560 },
];
export type CakeSize = (typeof CAKE_SIZES)[number];
export const cakePrice = (base500: number, size: CakeSize) =>
  Math.max(base500, base500 * size.units - size.discount);
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
