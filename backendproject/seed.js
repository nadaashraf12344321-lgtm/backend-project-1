const dotenv = require("dotenv");
const connectDB = require("./config/db-config");
const Category = require("./config/models/category-model");
const Product = require("./config/models/product-model");

dotenv.config();

const sampleCategories = [
  {
    name: "Handbags & Totes",
    description: "Premium leather handbags, daily tote bags, and stylish shoulder bags."
  },
  {
    name: "Backpacks",
    description: "Ergonomic laptop backpacks, executive leather backpacks, and travel rucksacks."
  },
  {
    name: "Crossbody & Messengers",
    description: "Compact crossbody bags, urban messenger bags, and sling bags."
  },
  {
    name: "Travel & Duffel Bags",
    description: "Durable travel luggage, weekend duffel bags, and carry-on bags."
  },
  {
    name: "Wallets & Clutches",
    description: "Genuine leather wallets, organizer pouches, and evening clutches."
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Seeding BagStore database...");

    // Clear existing sample categories and products
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Insert categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Inserted ${createdCategories.length} Bag Categories.`);

    // Map category IDs
    const handbagCat = createdCategories.find((c) => c.name === "Handbags & Totes")._id;
    const backpackCat = createdCategories.find((c) => c.name === "Backpacks")._id;
    const crossbodyCat = createdCategories.find((c) => c.name === "Crossbody & Messengers")._id;
    const travelCat = createdCategories.find((c) => c.name === "Travel & Duffel Bags")._id;
    const walletCat = createdCategories.find((c) => c.name === "Wallets & Clutches")._id;

    // Sample bag products
    const sampleProducts = [
      {
        name: "Classic Leather Executive Backpack",
        description: "Premium full-grain leather backpack with padded 15-inch laptop compartment.",
        price: 129.99,
        quantity: 25,
        category: backpackCat,
        imageUrl: "/uploads/products/leather-backpack.jpg"
      },
      {
        name: "Vintage Canvas Everyday Tote Bag",
        description: "Spacious heavy-duty cotton canvas tote bag with reinforced handles.",
        price: 49.99,
        quantity: 40,
        category: handbagCat,
        imageUrl: "/uploads/products/canvas-tote.jpg"
      },
      {
        name: "Luxury Italian Leather Handbag",
        description: "Elegant handcrafted Italian leather handbag with gold accents.",
        price: 249.99,
        quantity: 15,
        category: handbagCat,
        imageUrl: "/uploads/products/leather-handbag.jpg"
      },
      {
        name: "Waterproof Travel Duffel Bag",
        description: "High-capacity water-resistant Oxford travel duffel with shoe compartment.",
        price: 79.99,
        quantity: 30,
        category: travelCat,
        imageUrl: "/uploads/products/travel-duffel.jpg"
      },
      {
        name: "Compact Minimalist Crossbody Bag",
        description: "Sleek weather-resistant crossbody bag for daily essentials and phone.",
        price: 39.99,
        quantity: 50,
        category: crossbodyCat,
        imageUrl: "/uploads/products/crossbody-bag.jpg"
      },
      {
        name: "Slim Bifold Leather Wallet",
        description: "RFID-blocking genuine leather bifold wallet with multiple card slots.",
        price: 29.99,
        quantity: 60,
        category: walletCat,
        imageUrl: "/uploads/products/leather-wallet.jpg"
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${createdProducts.length} Bag Products.`);

    console.log("BagStore Database Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
