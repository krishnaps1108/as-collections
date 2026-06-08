import mongoose from 'mongoose';
import Product from '../models/Product.js';

const seedDummyProducts = async () => {
  try {
    // Clear existing products to avoid duplicates during redesign seed
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    console.log('Seeding AS Collections products...');
    const productsList = [
      {
        name: "AS Herbal Hair Oil",
        category: "Hair Care",
        isAdult: false,
        variants: [
          { size: "200ml", price: 300 },
          { size: "500ml", price: 750 },
          { size: "1 Liter", price: 1500 }
        ],
        description: "Pure herbal blend for hair growth, strength and natural shine.",
        ingredients: ["Coconut Oil", "Brahmi", "Hibiscus", "Neem", "Amla"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "AS Weight Loss Powder",
        category: "Wellness",
        isAdult: false,
        variants: [
          { size: "Half Kg", price: 600 },
          { size: "1 Kg", price: 1200 }
        ],
        description: "Natural formula to aid digestion, boost metabolism and support weight management.",
        ingredients: ["Ginger", "Lemongrass", "Haritaki", "Amla", "Green tea"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1611070973770-b1a6726b0c6a?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "AS Weight Gain Powder",
        category: "Wellness",
        isAdult: false,
        variants: [
          { size: "Half Kg", price: 700 },
          { size: "1 Kg", price: 1400 }
        ],
        description: "Nutritious herbal formulation to promote healthy weight gain and vitality.",
        ingredients: ["Ashwagandha", "Shatavari", "Gokshura", "Safed Musli", "Malt"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "AS ABC Malt Powder",
        category: "Nutrition",
        isAdult: false,
        variants: [
          { size: "250g", price: 350 },
          { size: "500g", price: 699 },
          { size: "1 Kg", price: 1398 }
        ],
        description: "A nourishing blend of Apple, Beetroot, and Carrot with grains for daily energy.",
        ingredients: ["Apple", "Beetroot", "Carrot", "Barley Malt", "Cardamom"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1596450514944-a957867f1b21?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "AS Perandai Thoku",
        category: "Herbal Foods",
        isAdult: false,
        variants: [
          { size: "200g", price: 399 },
          { size: "500g", price: 998 },
          { size: "1 Kg", price: 1995 }
        ],
        description: "Traditional herbal dish made from Pirandai (Veldt Grape) to aid bone health and digestion.",
        ingredients: ["Pirandai", "Sesame Oil", "Tamarind", "Red Chillies", "Salt"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Red Wine Soap",
        category: "Soaps",
        isAdult: false,
        price: 150,
        description: "Rich in antioxidants, helps restore skin elasticity and gives a natural glow.",
        ingredients: ["Red Wine extract", "Glycerin", "Coconut oil", "Essential oils"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1607006342465-b74d306b3e8e?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Goat Milk Soap",
        category: "Soaps",
        isAdult: false,
        price: 130,
        description: "Gentle soap for sensitive skin, deeply moisturizing and nourishing.",
        ingredients: ["Fresh Goat Milk", "Olive Oil", "Shea Butter", "Glycerin"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Kuppaimeni Soap",
        category: "Soaps",
        isAdult: false,
        price: 70,
        description: "Traditional skin remedy for acne, rashes, and deep skin cleansing.",
        ingredients: ["Kuppaimeni extract", "Coconut oil", "Neem oil", "Glycerin"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Manjistha Soap",
        category: "Soaps",
        isAdult: false,
        price: 150,
        description: "Formulated with Manjistha root to improve skin texture and reduce pigmentation.",
        ingredients: ["Manjistha extract", "Licorice", "Coconut oil", "Almond oil"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Kojic Acid Soap",
        category: "Soaps",
        isAdult: true,
        price: 160,
        description: "Concentrated skin brightening soap targeting dark spots, age marks, and hyperpigmentation (18+ flagged).",
        ingredients: ["Kojic Acid", "Papaya extract", "Coconut oil", "Tea tree oil"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1607006342465-b74d306b3e8e?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "ABC Soap",
        category: "Soaps",
        isAdult: false,
        price: 180,
        description: "Combines Apple, Beetroot, and Carrot juices for ultimate skin nourishment and vitamins.",
        ingredients: ["Apple juice", "Beetroot juice", "Carrot juice", "Glycerin", "Coconut oil"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1596450514944-a957867f1b21?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Skin Glowing Soap",
        category: "Soaps",
        isAdult: false,
        price: 180,
        description: "A luxury soap crafted to deliver a radiant complexion and deep hydration.",
        ingredients: ["Saffron", "Sandalwood oil", "Turmeric", "Almond oil"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Coconut Oil Soap",
        category: "Soaps",
        isAdult: false,
        price: 150,
        description: "Classic handmade coconut oil soap for deep moisturizing lather and cleansing.",
        ingredients: ["Cold pressed Coconut Oil", "Glycerin", "Water"],
        label: "AS Collections",
        image: "https://images.unsplash.com/photo-1605264964528-06403738d6fc?auto=format&fit=crop&w=600&q=80"
      }
    ];

    await Product.insertMany(productsList);
    console.log('AS Collections products seeded successfully!');
  } catch (error) {
    console.error(`Error seeding products: ${error.message}`);
  }
};

const seedAdminUser = async () => {
  try {
    const adminEmail = 'ascollections2383@gmail.com';
    const User = (await import('../models/User.js')).default;
    const bcrypt = (await import('bcryptjs')).default;
    
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('ascollections2383', salt);
      await User.create({
        name: 'AS Collections Admin',
        email: adminEmail,
        password: hashedPassword,
        age: 35,
        phone: '7395832383',
        role: 'admin'
      });
      console.log('Admin user seeded successfully!');
    }
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDummyProducts();
    await seedAdminUser();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;