import { PrismaClient, Role, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus, AttrType, CollectionMode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper to calculate paisa (1 BDT = 100 paisa)
const bdt = (amount: number) => amount * 100;

async function main() {
  console.log("🌟 Seeding Astrox Database with Astral Luxe Catalog...");

  // 1. Clean existing records if any
  await prisma.activityLog.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeDef.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users (Owner, Manager, Staff, Customer)
  const passwordHash = await bcrypt.hash("Astrox@2026", 10);

  const owner = await prisma.user.create({
    data: {
      email: "owner@astrox.com",
      phone: "01700000001",
      name: "Tanjir Rahman (Owner)",
      passwordHash,
      role: Role.OWNER,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@astrox.com",
      phone: "01700000002",
      name: "Fardos Alahi (Manager)",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@astrox.com",
      phone: "01700000003",
      name: "Karim Ahmed (Fulfillment Staff)",
      passwordHash,
      role: Role.STAFF,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@astrox.com",
      phone: "01819999888",
      name: "Sabrina Hossain",
      passwordHash,
      role: Role.CUSTOMER,
      loyaltyPoints: 350,
      addresses: {
        create: [
          {
            label: "Home (Gulshan)",
            fullName: "Sabrina Hossain",
            phone: "01819999888",
            division: "Dhaka",
            district: "Dhaka",
            area: "Gulshan-2",
            street: "House 14, Road 45, Apt 5B",
            postcode: "1212",
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log("👤 Users seeded (Owner, Manager, Staff, Customer).");

  // 3. Departments and Categories Hierarchy (Level 1 -> Level 2 -> Level 3)
  const departmentsData = [
    {
      slug: "women",
      nameEn: "Women's Fashion",
      nameBn: "নারীদের ফ্যাশন",
      iconName: "Sparkles",
      optionPreset: "apparel",
      categories: [
        {
          slug: "women-ethnic",
          nameEn: "Ethnic & Festive",
          nameBn: "ঐতিহ্যবাহী পোশাক",
          sub: [
            { slug: "saree", nameEn: "Sarees & Muslin", nameBn: "শাড়ি ও মসলিন" },
            { slug: "salwar-kameez", nameEn: "Three-Piece & Salwar Kameez", nameBn: "থ্রি-পিস ও সালোয়ার কামিজ" },
            { slug: "kurtis", nameEn: "Kurtis & Tunics", nameBn: "কুর্তি ও টিউনিস" },
            { slug: "unstitched", nameEn: "Luxury Unstitched Fabric", nameBn: "আনস্টিচড ফেব্রিক" },
          ],
        },
        {
          slug: "women-western",
          nameEn: "Western & Contemporary",
          nameBn: "ওয়েস্টার্ন পরিধান",
          sub: [
            { slug: "women-tops", nameEn: "Tops & Silk Blouses", nameBn: "টপস ও ব্লাউজ" },
            { slug: "women-dresses", nameEn: "Evening Dresses & Gowns", nameBn: "ড্রেস ও গাউন" },
            { slug: "women-jeans", nameEn: "Trousers & Denims", nameBn: "ট্রাউজার ও জিন্স" },
          ],
        },
        {
          slug: "women-winter",
          nameEn: "Winterwear & Shawls",
          nameBn: "শীতকালীন শাল ও পোশাক",
          sub: [
            { slug: "pashmina-shawls", nameEn: "Pashmina & Silk Shawls", nameBn: "পশমিনা ও সিল্ক শাল" },
            { slug: "women-jackets", nameEn: "Cashmere Cardigans & Coats", nameBn: "কার্ডিগান ও কোট" },
          ],
        },
      ],
    },
    {
      slug: "men",
      nameEn: "Men's Luxury",
      nameBn: "পুরুষদের ফ্যাশন",
      iconName: "User",
      optionPreset: "apparel",
      categories: [
        {
          slug: "men-ethnic",
          nameEn: "Ethnic Panjabi & Kabli",
          nameBn: "পাঞ্জাবি ও কাবলি",
          sub: [
            { slug: "festive-panjabi", nameEn: "Festive Silk & Jacquard Panjabi", nameBn: "উৎসবের সিল্ক পাঞ্জাবি" },
            { slug: "casual-panjabi", nameEn: "Fine Cotton Daily Panjabi", nameBn: "সুতি ক্যাজুয়াল পাঞ্জাবি" },
            { slug: "kabli-suits", nameEn: "Executive Kabli Sets", nameBn: "এক্সিকিউটিভ কাবলি সেট" },
            { slug: "koti-waistcoats", nameEn: "Handcrafted Koti & Waistcoats", nameBn: "কটি ও ওয়েস্টকোট" },
          ],
        },
        {
          slug: "men-western",
          nameEn: "Shirts & Casuals",
          nameBn: "শার্ট ও ক্যাজুয়াল",
          sub: [
            { slug: "formal-shirts", nameEn: "Egyptian Cotton Formal Shirts", nameBn: "ফর্মাল শার্ট" },
            { slug: "casual-shirts", nameEn: "Linen & Chambray Shirts", nameBn: "লিনেন ক্যাজুয়াল শার্ট" },
            { slug: "polo-tees", nameEn: "Mercerized Polos & Tees", nameBn: "প্রিমিয়াম পোলো ও টি-শার্ট" },
          ],
        },
        {
          slug: "men-winter",
          nameEn: "Men's Winter Edition",
          nameBn: "পুরুষদের উইন্টার কালেকশন",
          sub: [
            { slug: "hoodies-jackets", nameEn: "Tailored Bombers & Hoodies", nameBn: "বম্বার জ্যাকেট ও হুডি" },
            { slug: "men-blazers", nameEn: "Italian Wool Blazers", nameBn: "উল ব্লেজার" },
          ],
        },
      ],
    },
    {
      slug: "phones-wearables",
      nameEn: "Phones & Wearables",
      nameBn: "স্মার্টফোন ও গ্যাজেট",
      iconName: "Smartphone",
      optionPreset: "electronics",
      categories: [
        {
          slug: "flagship-smartphones",
          nameEn: "Smartphones & Tablets",
          nameBn: "স্মার্টফোন ও ট্যাবলেট",
          sub: [
            { slug: "flagship-phones", nameEn: "Flagship Phones (Official Warranty)", nameBn: "ফ্ল্যাগশিপ স্মার্টফোন" },
            { slug: "tablets", nameEn: "Pro Tablets & Stylus", nameBn: "ট্যাবলেট ও স্টাইলাস" },
          ],
        },
        {
          slug: "smartwatches",
          nameEn: "Smartwatches & Bands",
          nameBn: "স্মার্টওয়াচ ও ফিটনেস ব্যান্ড",
          sub: [
            { slug: "amoled-smartwatches", nameEn: "AMOLED Calling Smartwatches", nameBn: "অ্যামোলেড স্মার্টওয়াচ" },
            { slug: "fitness-bands", nameEn: "Health & GPS Bands", nameBn: "জিপিএস ফিটনেস ব্যান্ড" },
          ],
        },
      ],
    },
    {
      slug: "audio-electronics",
      nameEn: "Audio & Tech",
      nameBn: "অডিও ও টেকনোলজি",
      iconName: "Headphones",
      optionPreset: "electronics",
      categories: [
        {
          slug: "audio-wearables",
          nameEn: "TWS Earbuds & Headphones",
          nameBn: "ইয়ারবাডস ও হেডফোন",
          sub: [
            { slug: "anc-tws", nameEn: "Active Noise Cancelling TWS", nameBn: "নয়েজ ক্যান্সেলিং বাডস" },
            { slug: "over-ear-headphones", nameEn: "Studio Over-Ear Headphones", nameBn: "স্টুডিও হেডফোন" },
            { slug: "bluetooth-speakers", nameEn: "Hi-Fi Bluetooth Speakers", nameBn: "ব্লুটুথ স্পিকার" },
          ],
        },
        {
          slug: "computing-peripherals",
          nameEn: "Laptops & Desk Gear",
          nameBn: "ল্যাপটপ ও ডেস্ক গিয়ার",
          sub: [
            { slug: "ultrabooks", nameEn: "Ultrabooks & Creators Laptops", nameBn: "আল্ট্রাবুক ল্যাপটপ" },
            { slug: "mechanical-keyboards", nameEn: "Custom Mechanical Keyboards", nameBn: "মেকানিক্যাল কিবোর্ড" },
          ],
        },
      ],
    },
    {
      slug: "beauty-fragrance",
      nameEn: "Beauty & Fragrance",
      nameBn: "সৌন্দর্য ও সুগন্ধি",
      iconName: "Flame",
      optionPreset: "beauty",
      categories: [
        {
          slug: "k-beauty",
          nameEn: "K-Beauty Authentic Skincare",
          nameBn: "অথেনটিক কোরিয়ান স্কিনকেয়ার",
          sub: [
            { slug: "serums-ampoules", nameEn: "Niacinamide & Snail Serums", nameBn: "সিরাম ও অ্যাম্পুল" },
            { slug: "sunscreens-spf", nameEn: "Hydrating Sunscreens SPF 50+", nameBn: "সানস্ক্রিন" },
            { slug: "cleansers", nameEn: "Low pH Gentle Cleansers", nameBn: "ক্লিনজার" },
          ],
        },
        {
          slug: "luxury-perfumes",
          nameEn: "Artisanal Fragrance & Attar",
          nameBn: "পারফিউম ও আতর",
          sub: [
            { slug: "eau-de-parfum", nameEn: "Signature Eau De Parfum (EDP)", nameBn: "সিগনেচার পারফিউম" },
            { slug: "pure-dehn-al-oud", nameEn: "Pure Dehn Al Oud & Musk", nameBn: "আতর ও রয়্যাল মাস্ক" },
          ],
        },
      ],
    },
    {
      slug: "bags-watches-jewellery",
      nameEn: "Bags, Timepieces & Jewels",
      nameBn: "ব্যাগ, ঘড়ি ও জুয়েলারি",
      iconName: "Watch",
      optionPreset: "apparel",
      categories: [
        {
          slug: "luxury-leather-bags",
          nameEn: "Full-Grain Leather Bags",
          nameBn: "লেদার ব্যাগ ও লাগেজ",
          sub: [
            { slug: "executive-briefcase", nameEn: "Briefcases & Messenger Bags", nameBn: "ব্রিফকেস ও মেসেঞ্জার ব্যাগ" },
            { slug: "leather-backpacks", nameEn: "Minimalist Leather Backpacks", nameBn: "লেদার ব্যাকপ্যাক" },
            { slug: "wallets-accessories", nameEn: "Slim Wallets & Cardholders", nameBn: "ওয়ালেট ও কার্ডহোল্ডার" },
          ],
        },
        {
          slug: "luxury-timepieces",
          nameEn: "Chronographs & Mechanical Watches",
          nameBn: "প্রিমিয়াম ক্রোনোগ্রাফ ঘড়ি",
          sub: [
            { slug: "mens-chronographs", nameEn: "Sapphire Glass Chronographs", nameBn: "পুরুষদের ঘড়ি" },
            { slug: "womens-elegance-watch", nameEn: "Gold-Tone Dress Watches", nameBn: "নারীদের ড্রেস ওয়াচ" },
          ],
        },
      ],
    },
    {
      slug: "home-living",
      nameEn: "Home & Living",
      nameBn: "গৃহসজ্জা ও লাইফস্টাইল",
      iconName: "Home",
      optionPreset: "home",
      categories: [
        {
          slug: "luxury-bedding",
          nameEn: "Bedding & Comforters",
          nameBn: "বেডশিট ও কম্ফোর্টার",
          sub: [
            { slug: "egyptian-bedsheets", nameEn: "600-Thread Count Satin Sheets", nameBn: "সাটিন বেডশিট" },
            { slug: "winter-quilts", nameEn: "Microfiber Down Duvets", nameBn: "উইন্টার ডুভেট" },
          ],
        },
        {
          slug: "home-decor",
          nameEn: "Aromatherapy & Ambient Décor",
          nameBn: "হোম ডেকর ও অ্যারোমাথেরাপি",
          sub: [
            { slug: "scented-candles", nameEn: "Soy Wax Candles & Diffusers", nameBn: "সুগন্ধি মোমবাতি ও ডিফিউজার" },
            { slug: "ambient-lamps", nameEn: "Architectural Table Lamps", nameBn: "টেবিল ল্যাম্প" },
          ],
        },
      ],
    },
    {
      slug: "kids-baby",
      nameEn: "Kids & Juniors",
      nameBn: "বাচ্চাদের পোশাক ও যত্ন",
      iconName: "Smile",
      optionPreset: "apparel",
      categories: [
        {
          slug: "kids-festive",
          nameEn: "Kids Festive & Eid Wear",
          nameBn: "বাচ্চাদের উৎসবের পোশাক",
          sub: [
            { slug: "boys-panjabi", nameEn: "Junior Boys Panjabi Sets", nameBn: "ছেলেদের পাঞ্জাবি সেট" },
            { slug: "girls-frocks", nameEn: "Girls Party Frocks & Gowns", nameBn: "মেয়েদের ফ্রক ও গাউন" },
          ],
        },
      ],
    },
    {
      slug: "sports-outdoors",
      nameEn: "Activewear & Fitness",
      nameBn: "স্পোর্টস ও ফিটনেস",
      iconName: "Activity",
      optionPreset: "apparel",
      categories: [
        {
          slug: "activewear",
          nameEn: "Gym & Performance Apparel",
          nameBn: "অ্যাক্টিভওয়্যার ও জিম পোশাক",
          sub: [
            { slug: "dri-fit-tees", nameEn: "Seamless Compression & Dri-Fit", nameBn: "ড্রাই-ফিট টি-শার্ট" },
            { slug: "joggers-track", nameEn: "Tech Fleece Joggers", nameBn: "জগার্স ও ট্র্যাক প্যান্ট" },
          ],
        },
      ],
    },
    {
      slug: "gifts-hampers",
      nameEn: "Curated Hampers & Corporate",
      nameBn: "উপহার ও গিফট হ্যাম্পার",
      iconName: "Gift",
      optionPreset: "home",
      categories: [
        {
          slug: "curated-gift-boxes",
          nameEn: "Luxury Gift Sets",
          nameBn: "লাক্সারি গিফট বক্স",
          sub: [
            { slug: "eid-hampers", nameEn: "Royal Festive Hampers", nameBn: "রয়্যাল উৎসবের হ্যাম্পার" },
            { slug: "corporate-boxes", nameEn: "Executive Leather & Pen Set", nameBn: "কর্পোরেট গিফট সেট" },
          ],
        },
      ],
    },
  ];

  // Map to hold leaf category IDs for seeding products
  const categoryMap = new Map<string, string>();

  let deptPos = 1;
  for (const dept of departmentsData) {
    const parentDept = await prisma.category.create({
      data: {
        slug: dept.slug,
        nameEn: dept.nameEn,
        nameBn: dept.nameBn,
        depth: 1,
        position: deptPos++,
        iconName: dept.iconName,
        optionPreset: dept.optionPreset,
      },
    });

    let catPos = 1;
    for (const cat of dept.categories) {
      const l2Cat = await prisma.category.create({
        data: {
          parentId: parentDept.id,
          slug: cat.slug,
          nameEn: cat.nameEn,
          nameBn: cat.nameBn,
          depth: 2,
          position: catPos++,
          optionPreset: dept.optionPreset,
        },
      });

      let subPos = 1;
      for (const sub of cat.sub) {
        const l3Cat = await prisma.category.create({
          data: {
            parentId: l2Cat.id,
            slug: sub.slug,
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            depth: 3,
            position: subPos++,
            optionPreset: dept.optionPreset,
          },
        });
        categoryMap.set(sub.slug, l3Cat.id);
      }
    }
  }

  console.log(`📁 Seeded 10 Departments with Level 2 and Level 3 category taxonomy.`);

  // 4. Create Occasion Collections
  const collectionsData = [
    {
      slug: "winter-edit",
      titleEn: "The Winter Edit 2026",
      titleBn: "উইন্টার এডিট ২০২৬",
      subtitleEn: "Sublime Cashmere, Hand-Spun Pashminas & Tailored Warmth",
      subtitleBn: "অভিজাত কাশ্মীরি শাল, পশমিনা ও প্রিমিয়াম উইন্টার জ্যাকেট",
      badgeEn: "SEASONAL LUXE",
      badgeBn: "শীতকালীন স্পেশাল",
      heroUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1600&auto=format&fit=crop&q=80",
      mode: CollectionMode.MANUAL,
    },
    {
      slug: "eid-festive",
      titleEn: "Royal Eid Festive Preview",
      titleBn: "রয়্যাল ঈদ স্পেশাল প্রিভিউ",
      subtitleEn: "Hand-embossed Jacquard Panjabis & Golden Muslin Sarees",
      subtitleBn: "হাতে বোনা জ্যাকার্ড পাঞ্জাবি ও রাজকীয় সোনালী মসলিন শাড়ি",
      badgeEn: "EID COLLECTION",
      badgeBn: "ঈদ কালেকশন",
      heroUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=80",
      mode: CollectionMode.MANUAL,
    },
    {
      slug: "k-beauty-sanctuary",
      titleEn: "Seoul Glow: Authentic K-Beauty",
      titleBn: "অথেনটিক কোরিয়ান স্কিনকেয়ার",
      subtitleEn: "100% Verified Glass-Skin Regimens Direct from Korea",
      subtitleBn: "১০০% ভেরিফাইড কোরিয়ান গ্লাস-স্কিন রুটিন",
      badgeEn: "K-BEAUTY OFFICIAL",
      badgeBn: "কোরিয়ান অফিসিয়াল",
      heroUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&auto=format&fit=crop&q=80",
      mode: CollectionMode.MANUAL,
    },
    {
      slug: "astral-audio",
      titleEn: "Precision Acoustics & ANC",
      titleBn: "প্রিমিয়াম অডিও ও নয়েজ ক্যান্সেলেশন",
      subtitleEn: "Audiophile Soundscapes Engineered for Perfection",
      subtitleBn: "অতুলনীয় শব্দের গভীরতা ও প্রিমিয়াম বিল্ড",
      badgeEn: "TECH DROP",
      badgeBn: "হাই-ফাই অডিও",
      heroUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
      mode: CollectionMode.MANUAL,
    },
    {
      slug: "gift-to-bangladesh",
      titleEn: "Gift to Bangladesh (Expatriate Special)",
      titleBn: "প্রবাসীদের জন্য স্পেশাল গিফট সার্ভিস",
      subtitleEn: "Send curated luxury directly to loved ones with personalized wax-sealed cards",
      subtitleBn: "প্রিয়জনের জন্য পাঠান লাক্সারি উপহার ও হাতে লেখা শুভেচ্ছা কার্ড",
      badgeEn: "GLOBAL EXPRESS",
      badgeBn: "আন্তর্জাতিক পেমেন্ট",
      heroUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop&q=80",
      mode: CollectionMode.MANUAL,
    },
  ];

  const collectionMap = new Map<string, string>();
  for (const c of collectionsData) {
    const col = await prisma.collection.create({
      data: c,
    });
    collectionMap.set(c.slug, col.id);
  }

  // 5. Storefront Banners (Campaign Hero Slides with Desktop & Mobile preview)
  await prisma.banner.createMany({
    data: [
      {
        titleEn: "Astral Elegance, Tailored in Dhaka",
        titleBn: "অ্যাস্ট্রাল এলিগেন্স — আভিজাত্যের নতুন সংজ্ঞা",
        subtitleEn: "Discover handwoven Muslin sarees, Jacquard Panjabis & Precision Audio.",
        subtitleBn: "ঐতিহ্যবাহী ঢাকাই মসলিন শাড়ি, সিল্ক পাঞ্জাবি এবং প্রিমিয়াম গ্যাজেট কালেকশন।",
        tagEn: "ASTROX SIGNATURE 2026",
        tagBn: "অ্যাস্ট্রক্স সিগনেচার ২০২৬",
        ctaLabelEn: "Explore The Collection",
        ctaLabelBn: "কালেকশন দেখুন",
        ctaType: "COLLECTION",
        ctaTarget: "winter-edit",
        desktopUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=85",
        mobileUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
        position: 1,
        isActive: true,
      },
      {
        titleEn: "The Royal Eid Festive Preview",
        titleBn: "রাজকীয় ঈদ উৎসবের প্রস্তুতি",
        subtitleEn: "Pure silk embroidery with champagne-gold threadwork. Free delivery across Bangladesh.",
        subtitleBn: "খাঁটি সিল্কে শ্যাম্পেইন-গোল্ড সুতার কাজ। সমগ্র বাংলাদেশে ফ্রি ডেলিভারি।",
        tagEn: "ROYAL EID PREVIEW",
        tagBn: "রয়্যাল ঈদ প্রিভিউ",
        ctaLabelEn: "Shop Festive Edit",
        ctaLabelBn: "উৎসবের পোশাক কিনুন",
        ctaType: "COLLECTION",
        ctaTarget: "eid-festive",
        desktopUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&auto=format&fit=crop&q=85",
        mobileUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
        position: 2,
        isActive: true,
      },
      {
        titleEn: "Glass Skin Alchemy: Verified K-Beauty",
        titleBn: "কোরিয়ান গ্লাস স্কিন ম্যাজিক",
        subtitleEn: "100% authentic, air-freighted directly from Seoul. With authenticity guarantee.",
        subtitleBn: "সিউল থেকে সরাসরি আমদানিকৃত ১০০% আসল কোরিয়ান স্কিনকেয়ার প্রোডাক্ট।",
        tagEn: "100% AUTHENTIC GUARANTEE",
        tagBn: "১০০% অথেনটিক গ্যারান্টি",
        ctaLabelEn: "Discover K-Beauty",
        ctaLabelBn: "কে-বিউটি কালেকশন",
        ctaType: "COLLECTION",
        ctaTarget: "k-beauty-sanctuary",
        desktopUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&auto=format&fit=crop&q=85",
        mobileUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
        position: 3,
        isActive: true,
      },
    ],
  });

  console.log("🎨 Hero Banners seeded.");

  // 6. Curated Products with Multi-Variants (Colors, Sizes, Specs, Images)
  const productsToCreate = [
    // --- 1. Saree (Women's Fashion)
    {
      code: "AX-000101",
      slug: "dhakai-jamdani-golden-muslin-saree",
      nameEn: "Imperial Dhakai Jamdani Muslin Saree",
      nameBn: "ঢাকাই জামদানি গোল্ডেন মসলিন শাড়ি",
      subtitleEn: "Hand-loomed with gold zari threadwork on featherlight muslin",
      subtitleBn: "পালকের মতো হালকা মসলিনে সোনালী জরির নিখুঁত জামদানি কাজ",
      descriptionEn: "A timeless masterpiece honoring Bengal's weaving heritage. Woven over 8 months by master artisans in Sonargaon using pure combed cotton count 300 and gilded zari thread. Drapes with regal fluidity and catches ambient light with quiet champagne luminance.",
      descriptionBn: "সোনারগাঁয়ের ঐতিহ্যবাহী কারিগরদের ৮ মাসের নিপুণ পরিশ্রমে তৈরি। ৩০০ কাউন্টের মিহি সুতো ও সোনালী জরির অনবদ্য মেলবন্ধন। যেকোনো বিশেষ উৎসব বা অভ্যর্থনায় আনে অনবদ্য রাজকীয় ব্যক্তিত্ব।",
      categoryKey: "saree",
      brand: "Astrox Heritage",
      badge: "Astral Reserve",
      basePrice: bdt(18500),
      compareAtPrice: bdt(22000),
      isFeatured: true,
      isFlashDeal: false,
      optionNames: ["Colour", "Blouse Piece"],
      variants: [
        { sku: "AX-SAR-01-GLD", option1: "Champagne Gold", option2: "With Unstitched Blouse", swatchHex: "#D9BC82", price: bdt(18500), stock: 8 },
        { sku: "AX-SAR-01-BLK", option1: "Midnight Black", option2: "With Unstitched Blouse", swatchHex: "#111116", price: bdt(18500), stock: 6 },
        { sku: "AX-SAR-01-EMR", option1: "Imperial Emerald", option2: "With Unstitched Blouse", swatchHex: "#0D3A2D", price: bdt(19000), stock: 4 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80", colorKey: "Champagne Gold" },
        { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80", colorKey: "Midnight Black" },
        { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1000&auto=format&fit=crop&q=80", colorKey: "Imperial Emerald" },
      ],
      collectionKey: "eid-festive",
    },

    // --- 2. Three-Piece (Women's Fashion)
    {
      code: "AX-000102",
      slug: "luxe-embroidered-lawn-three-piece",
      nameEn: "Auric Velvet Embroidered Lawn Three-Piece",
      nameBn: "ভেলভেট এমব্রয়ডারি লন থ্রি-পিস",
      subtitleEn: "Swiss lawn kameez with organza cutwork dupatta & tonal pants",
      subtitleBn: "অরগাঞ্জা কাটওয়ার্ক ওড়না সহ প্রিমিয়াম সুইস লন কামিজ",
      descriptionEn: "Tailored from ultra-dense 80s Swiss lawn. Adorned with tone-on-tone thread embroidery across the neckline and daman. Paired with a delicate organza dupatta featuring scalloped metallic zari edging.",
      descriptionBn: "৮০ কাউন্টের প্রিমিয়াম সুইস লনে সুতার দৃষ্টিনন্দন এমব্রয়ডারি। সাথে অরগাঞ্জা কাটওয়ার্ক ওড়না যা প্রতিটি অনুষ্ঠানে দেয় পরিপূর্ণ ও মার্জিত আউটলুক।",
      categoryKey: "salwar-kameez",
      brand: "Astrox Femme",
      badge: "Trending",
      basePrice: bdt(8450),
      compareAtPrice: bdt(9800),
      isFeatured: true,
      isFlashDeal: true,
      flashPrice: bdt(7600),
      flashEndsAt: new Date(Date.now() + 86400000 * 5),
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-3PC-02-CRM-S", option1: "Opal Cream", option2: "S", swatchHex: "#EFE1BF", stock: 12 },
        { sku: "AX-3PC-02-CRM-M", option1: "Opal Cream", option2: "M", swatchHex: "#EFE1BF", stock: 15 },
        { sku: "AX-3PC-02-CRM-L", option1: "Opal Cream", option2: "L", swatchHex: "#EFE1BF", stock: 9 },
        { sku: "AX-3PC-02-NVY-M", option1: "Royal Navy", option2: "M", swatchHex: "#152238", stock: 10 },
        { sku: "AX-3PC-02-NVY-L", option1: "Royal Navy", option2: "L", swatchHex: "#152238", stock: 8 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80", colorKey: "Opal Cream" },
        { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80", colorKey: "Royal Navy" },
      ],
      collectionKey: "eid-festive",
    },

    // --- 3. Pashmina Shawl (Women's Winterwear)
    {
      code: "AX-000103",
      slug: "kashmiri-hand-spun-pashmina-shawl",
      nameEn: "Artisanal Royal Pashmina Shawl",
      nameBn: "হাতে বোনা রয়েল পশমিনা শাল",
      subtitleEn: "100% fine grade Cashmere with Sozni needlework border",
      subtitleBn: "১০০% খাঁটি কাশ্মীরি ক্যাশমিয়ার ও সূক্ষ্ম সুজনী সূচিকর্ম",
      descriptionEn: "Sourced from the high plateaus of Ladakh and hand-spun by master artisans. Incredibly light yet providing transcendent warmth against brisk evening breezes.",
      descriptionBn: "লাদাখের পাহাড়ি ক্যাশমিয়ার পশম দিয়ে বিশেষভাবে তৈরি। অত্যন্ত হালকা ও উষ্ণ। শীতের রাতের আভিজাত্য বাড়াতে অনন্য সঙ্গী।",
      categoryKey: "pashmina-shawls",
      brand: "Astrox Atelier",
      badge: "Winter Drop",
      basePrice: bdt(14200),
      compareAtPrice: bdt(16500),
      isFeatured: true,
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-SHW-03-CHR", option1: "Charcoal Black", option2: "Free Size", swatchHex: "#222226", stock: 14 },
        { sku: "AX-SHW-03-IVR", option1: "Ivory Gold", option2: "Free Size", swatchHex: "#ECE5D8", stock: 10 },
        { sku: "AX-SHW-03-MAR", option1: "Regal Maroon", option2: "Free Size", swatchHex: "#5E1925", stock: 7 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1000&auto=format&fit=crop&q=80", colorKey: "Charcoal Black" },
        { url: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1000&auto=format&fit=crop&q=80", colorKey: "Ivory Gold" },
      ],
      collectionKey: "winter-edit",
    },

    // --- 4. Festive Panjabi (Men's Luxury)
    {
      code: "AX-000201",
      slug: "jacquard-silk-kabli-panjabi-midnight-gold",
      nameEn: "Obsidian & Gold Jacquard Festive Panjabi",
      nameBn: "অবসিডিয়ান গোল্ড জ্যাকার্ড রয়্যাল পাঞ্জাবি",
      subtitleEn: "Semi-fitted luxury cotton-silk weave with champagne metallic buttons",
      subtitleBn: "কটন-সিল্ক মিশ্রণ ও শ্যাম্পেইন মেটালিক বোতাম সহ সেমি-ফিটেড পাঞ্জাবি",
      descriptionEn: "Architectural precision meets Bengali regal heritage. Featuring subtle geometric motifs woven directly into high-sheen silk-cotton blend. Mandarin collar with recessed stitching and custom engraved Astrox astral insignia buttons.",
      descriptionBn: "আধুনিক ফিটিং এবং বাঙালি ঐতিহ্যবাহী শৌর্যের অনবদ্য প্রকাশ। সুতা এবং সিল্কের নিখুঁত জ্যাকার্ড উইভিং। কলার ও বোতামে রয়েছে অ্যাস্ট্রক্স সিগনেচার মেটালিক ছোঁয়া।",
      categoryKey: "festive-panjabi",
      brand: "Astrox Homme",
      badge: "Signature Choice",
      basePrice: bdt(6950),
      compareAtPrice: bdt(7990),
      isFeatured: true,
      isFlashDeal: true,
      flashPrice: bdt(6200),
      flashEndsAt: new Date(Date.now() + 86400000 * 3),
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-PAN-01-BLK-38", option1: "Obsidian Black", option2: "38 (S)", swatchHex: "#0D0D12", stock: 16 },
        { sku: "AX-PAN-01-BLK-40", option1: "Obsidian Black", option2: "40 (M)", swatchHex: "#0D0D12", stock: 22 },
        { sku: "AX-PAN-01-BLK-42", option1: "Obsidian Black", option2: "42 (L)", swatchHex: "#0D0D12", stock: 18 },
        { sku: "AX-PAN-01-BLK-44", option1: "Obsidian Black", option2: "44 (XL)", swatchHex: "#0D0D12", stock: 7 },
        { sku: "AX-PAN-01-WHT-40", option1: "Chantilly White", option2: "40 (M)", swatchHex: "#FAF9F6", stock: 14 },
        { sku: "AX-PAN-01-WHT-42", option1: "Chantilly White", option2: "42 (L)", swatchHex: "#FAF9F6", stock: 15 },
        { sku: "AX-PAN-01-GOL-40", option1: "Champagne Gold", option2: "40 (M)", swatchHex: "#D9BC82", stock: 8 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1000&auto=format&fit=crop&q=80", colorKey: "Obsidian Black" },
        { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1000&auto=format&fit=crop&q=80", colorKey: "Chantilly White" },
      ],
      collectionKey: "eid-festive",
    },

    // --- 5. Executive Kabli Set (Men's Luxury)
    {
      code: "AX-000202",
      slug: "monochrome-executive-kabli-suit",
      nameEn: "Sovereign Double-Placket Kabli Suit",
      nameBn: "সার্বভৌম ডাবল-প্লাকেট এক্সিকিউটিভ কাবলি সেট",
      subtitleEn: "Includes tailored kabli kurta & matching relaxed-fit pajama trousers",
      subtitleBn: "ম্যাচিং ট্রাউজার পায়জামা সহ আরামদায়ক এক্সিকিউটিভ কাবলি",
      descriptionEn: "Engineered for high-profile gatherings and festive prayers. Crafted from non-crease Japanese microfiber-cotton blend that stays razor-sharp from dawn until midnight.",
      descriptionBn: "জাপানি মাইক্রোফাইবার কটন ব্লেন্ডে তৈরি যা সারাদিন কোঁচকায় না। মসৃণ ডাবল প্লাকেট ও মার্জিত কলার আপনাকে দেবে আভিজাত্যের নিশ্চয়তা।",
      categoryKey: "kabli-suits",
      brand: "Astrox Homme",
      badge: "Bestseller",
      basePrice: bdt(8800),
      compareAtPrice: bdt(10200),
      isFeatured: true,
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-KAB-02-OLV-40", option1: "Sage Olive", option2: "40 (M)", swatchHex: "#394235", stock: 12 },
        { sku: "AX-KAB-02-OLV-42", option1: "Sage Olive", option2: "42 (L)", swatchHex: "#394235", stock: 10 },
        { sku: "AX-KAB-02-CHR-40", option1: "Anthracite Grey", option2: "40 (M)", swatchHex: "#2C2E33", stock: 14 },
        { sku: "AX-KAB-02-CHR-42", option1: "Anthracite Grey", option2: "42 (L)", swatchHex: "#2C2E33", stock: 11 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=1000&auto=format&fit=crop&q=80", colorKey: "Sage Olive" },
        { url: "https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=1000&auto=format&fit=crop&q=80", colorKey: "Anthracite Grey" },
      ],
      collectionKey: "eid-festive",
    },

    // --- 6. Handcrafted Koti / Waistcoat (Men)
    {
      code: "AX-000203",
      slug: "matka-silk-embroidered-royal-koti",
      nameEn: "Matka Silk Emperor Koti (Waistcoat)",
      nameBn: "মটকা সিল্ক এমব্রয়ডার্ড রয়্যাল কটি",
      subtitleEn: "Layer over any classic panjabi for immediate ceremonial grandeur",
      subtitleBn: "যেকোনো পাঞ্জাবির সাথে পরিধানযোগ্য রয়্যাল কটি",
      descriptionEn: "Structured from pure indigenous Matka silk with subtle slub texture. Features hand-knotted buttons, inner silk lining and concealed pockets for phone and cards.",
      descriptionBn: "খাঁটি দেশীয় মটকা সিল্কের ঐতিহ্যবাহী বুনন। নিখুঁত ইনার লাইনিং ও সূক্ষ্ম ডিজাইনে তৈরি যা যেকোনো সাধারণ পাঞ্জাবিকে পরিণত করে রাজকীয় পোশাকে।",
      categoryKey: "koti-waistcoats",
      brand: "Astrox Homme",
      badge: "Craft Drop",
      basePrice: bdt(4950),
      compareAtPrice: bdt(5800),
      isFeatured: false,
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-KOT-03-GLD-40", option1: "Antique Gold", option2: "40 (M)", swatchHex: "#C5A059", stock: 9 },
        { sku: "AX-KOT-03-GLD-42", option1: "Antique Gold", option2: "42 (L)", swatchHex: "#C5A059", stock: 7 },
        { sku: "AX-KOT-03-BLK-40", option1: "Jet Black", option2: "40 (M)", swatchHex: "#08080A", stock: 12 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80", colorKey: "Antique Gold" },
      ],
      collectionKey: "eid-festive",
    },

    // --- 7. TWS ANC Earbuds (Audio & Electronics)
    {
      code: "AX-000301",
      slug: "astrox-nova-pro-anc-wireless-earbuds",
      nameEn: "Astrox Nova Pro ANC Wireless Earbuds",
      nameBn: "অ্যাস্ট্রক্স নোভা প্রো অ্যাক্টিভ নয়েজ ক্যান্সেলিং বাডস",
      subtitleEn: "Hi-Res Audio LDAC, 48dB Hybrid ANC, 40-Hour Battery & Wireless Charge",
      subtitleBn: "হাই-রেজ অডিও, ৪৮ ডেসিবেল হাইব্রিড এএনসি ও ৪০ ঘণ্টার ব্যাটারি ব্যাকআপ",
      descriptionEn: "Engineered with dual 11mm coaxial titanium drivers and Knowles balanced armatures. Delivers profound, distortion-free sub-bass with pristine vocal clarity. IPX5 water resistance with ultra-low 38ms gaming latency mode.",
      descriptionBn: "ডুয়াল টাইটানিয়াম ড্রাইভার সমৃদ্ধ যা প্রদান করে সর্বোচ্চ স্পষ্ট শব্দ এবং ডিপ বেস। ৪৮ ডেসিবেল হাইব্রিড নয়েজ ক্যান্সেলেশন শহরের কোলাহলকে করে দেবে নিমেষেই শান্ত।",
      categoryKey: "anc-tws",
      brand: "Astrox Tech",
      badge: "Official 1-Year Warranty",
      basePrice: bdt(7200),
      compareAtPrice: bdt(8500),
      isFeatured: true,
      isFlashDeal: true,
      flashPrice: bdt(6499),
      flashEndsAt: new Date(Date.now() + 86400000 * 2),
      optionNames: ["Colour", "Warranty"],
      warrantyEn: "12 Months Official Replacement Warranty",
      warrantyBn: "১২ মাসের অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি",
      variants: [
        { sku: "AX-EAR-01-MBL", option1: "Matte Obsidian", option2: "1 Year Official", swatchHex: "#18191E", stock: 25 },
        { sku: "AX-EAR-01-WHT", option1: "Ceramic White", option2: "1 Year Official", swatchHex: "#F2F2F5", stock: 18 },
        { sku: "AX-EAR-01-GLD", option1: "Champagne Edition", option2: "1 Year Official", swatchHex: "#D9BC82", stock: 14 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=80", colorKey: "Matte Obsidian" },
        { url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=1000&auto=format&fit=crop&q=80", colorKey: "Ceramic White" },
      ],
      collectionKey: "astral-audio",
    },

    // --- 8. AMOLED Calling Smartwatch (Phones & Wearables)
    {
      code: "AX-000302",
      slug: "astrox-chronos-elite-amoled-smartwatch",
      nameEn: "Astrox Chronos Elite AMOLED Smartwatch",
      nameBn: "অ্যাস্ট্রক্স ক্রোনোস এলিট অ্যামোলেড স্মার্টওয়াচ",
      subtitleEn: "1.43'' Sapphire AMOLED Display, Titanium Bezel & Bluetooth HD Calling",
      subtitleBn: "১.৪৩ ইঞ্চি স্যাফায়ার অ্যামোলেড ডিসপ্লে, টাইটানিয়াম ফ্রেম ও ব্লুটুথ এইচডি কলিং",
      descriptionEn: "Seamless elegance meets biometric precision. Continuous SpO2, heart rate, sleep architecture and 100+ sports tracking. Always-on display with 1000 nits peak brightness for effortless readability under direct Dhaka sunlight.",
      descriptionBn: "টাইটানিয়াম বেজেল এবং প্রিমিয়াম লেদার স্ট্র্যাপ সহ আধুনিক স্মার্টওয়াচ। ১০০০ নিটস ব্রাইটনেস যুক্ত অ্যামোলেড স্ক্রিন রোদের মধ্যেও দেবে পরিষ্কার ভিজিবিলিটি।",
      categoryKey: "amoled-smartwatches",
      brand: "Astrox Tech",
      badge: "New Release",
      basePrice: bdt(9400),
      compareAtPrice: bdt(11500),
      isFeatured: true,
      optionNames: ["Case Colour", "Strap Material"],
      warrantyEn: "1 Year Astrox Care Warranty",
      warrantyBn: "১ বছর অ্যাস্ট্রক্স কেয়ার ওয়ারেন্টি",
      variants: [
        { sku: "AX-WCH-02-TBLK-LTH", option1: "Titanium Black", option2: "Italian Leather Strap", swatchHex: "#1C1C22", stock: 15 },
        { sku: "AX-WCH-02-TBLK-SIL", option1: "Titanium Black", option2: "Sport Silicone Strap", swatchHex: "#1C1C22", stock: 20 },
        { sku: "AX-WCH-02-GOLD-LTH", option1: "Champagne Gold", option2: "Saddle Tan Leather", swatchHex: "#D4AF6A", stock: 11 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80", colorKey: "Titanium Black" },
        { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&auto=format&fit=crop&q=80", colorKey: "Champagne Gold" },
      ],
      collectionKey: "astral-audio",
    },

    // --- 9. K-Beauty Snail Mucin & Peptide Serum (Beauty & Fragrance)
    {
      code: "AX-000401",
      slug: "cosrx-advanced-snail-96-mucin-essence",
      nameEn: "Astrox Pure Glow Snail & Peptide Ampoule",
      nameBn: "অ্যাস্ট্রক্স পিওর গ্লো স্নেল ও পেপটাইড অ্যাম্পুল",
      subtitleEn: "96% Snail Secretion Filtrate + Multi-Peptide Complex (100ml)",
      subtitleBn: "৯৬% স্নেল ফিলট্রেট ও মাল্টি-পেপটাইড ফর্মুলা (১০০ মিলি)",
      descriptionEn: "Authentic Korean essence formulated to repair compromised skin barriers, intensely hydrate, and impart the coveted glass-skin luminescence. 100% genuine with verifiable QR seal.",
      descriptionBn: "কোরিয়ার সেরা ফর্মুলেশনে তৈরি যা ত্বকের আর্দ্রতা ধরে রেখে ত্বককে করে তোলে মসৃণ, কোমল এবং দীপ্তিময়। ১০০% অথেনটিক প্রোডাক্ট নিশ্চয়তা।",
      categoryKey: "serums-ampoules",
      brand: "Seoul Alchemy",
      badge: "K-Beauty Verified",
      basePrice: bdt(2150),
      compareAtPrice: bdt(2600),
      isFeatured: true,
      optionNames: ["Size"],
      variants: [
        { sku: "AX-KBE-01-100ML", option1: "100ml Full Size", option2: null, swatchHex: "#E2D9CC", stock: 45 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&auto=format&fit=crop&q=80" },
        { url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&auto=format&fit=crop&q=80" },
      ],
      collectionKey: "k-beauty-sanctuary",
    },

    // --- 10. Luxury Eau De Parfum (Beauty & Fragrance)
    {
      code: "AX-000402",
      slug: "astral-oud-grand-cru-eau-de-parfum",
      nameEn: "Astral Oud Grand Cru — Eau De Parfum",
      nameBn: "অ্যাস্ট্রাল উদ গ্র্যান্ড ক্রু — ও দ্য পারফিউম",
      subtitleEn: "Smoky Cambodian Oud, Damask Rose & Warm Ambergris (100ml)",
      subtitleBn: "কম্বোডিয়ান উদ, দামেস্ক গোলাপ ও খাঁটি অ্যাম্বারের রাজকীয় সুবাস",
      descriptionEn: "An intoxicating oriental composition that lingers for over 16 hours. Opens with pink peppercorn and velvety Turkish rose, developing into rich smoked agarwood and vanilla benzoin.",
      descriptionBn: "১৬ ঘণ্টারও বেশি স্থায়ী রাজকীয় সুবাস। দুর্লভ কম্বোডিয়ান আগর কাঠ ও গোলাপের সুষম মিশ্রণ আপনাকে আলাদা করে তুলবে যেকোনো মজলিসে।",
      categoryKey: "eau-de-parfum",
      brand: "Astrox Parfums",
      badge: "Masterpiece",
      basePrice: bdt(6800),
      compareAtPrice: bdt(7900),
      isFeatured: true,
      optionNames: ["Volume"],
      variants: [
        { sku: "AX-PRF-02-100ML", option1: "100ml Extrait", option2: null, swatchHex: "#8B6508", stock: 19 },
        { sku: "AX-PRF-02-50ML", option1: "50ml Travel Spray", option2: null, swatchHex: "#8B6508", price: bdt(3900), stock: 24 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&auto=format&fit=crop&q=80" },
      ],
      collectionKey: "gift-to-bangladesh",
    },

    // --- 11. Full-Grain Leather Briefcase (Bags & Watches)
    {
      code: "AX-000501",
      slug: "bengal-full-grain-leather-executive-briefcase",
      nameEn: "Sovereign Full-Grain Leather Briefcase",
      nameBn: "ফুল-গ্রেইন এক্সিকিউটিভ লেদার ব্রিফকেস",
      subtitleEn: "Vegetable-tanned calfskin with solid brass locks & laptop sleeve",
      subtitleBn: "প্রিমিয়াম ভেজিটেবল ট্যানড লেদার ও ব্রাস হার্ডওয়্যার",
      descriptionEn: "Handcrafted from top-grade Hazaribagh heritage cowhide, meticulously conditioned with natural oils to develop an extraordinary patina over decades of service.",
      descriptionBn: "১০০% অরিজিনাল ফুল-গ্রেইন লেদারে তৈরি যা বছরের পর বছর ধরে উজ্জ্বল থাকে। ১৫.৬ ইঞ্চি পর্যন্ত ল্যাপটপ সহজে বহনযোগ্য।",
      categoryKey: "executive-briefcase",
      brand: "Astrox Leathercraft",
      badge: "Lifetime Leather",
      basePrice: bdt(11900),
      compareAtPrice: bdt(14000),
      isFeatured: false,
      optionNames: ["Colour"],
      variants: [
        { sku: "AX-BAG-01-TAN", option1: "Cognac Tan", option2: null, swatchHex: "#8B4513", stock: 9 },
        { sku: "AX-BAG-01-BLK", option1: "Raven Black", option2: null, swatchHex: "#111115", stock: 12 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80", colorKey: "Cognac Tan" },
      ],
      collectionKey: "gift-to-bangladesh",
    },

    // --- 12. Luxury Bedding (Home & Living)
    {
      code: "AX-000601",
      slug: "royal-satin-egyptian-cotton-bedsheet-set",
      nameEn: "600-Thread Count Egyptian Cotton Bedding Set",
      nameBn: "৬০০ থ্রেড কাউন্ট মিশরীয় সুতি বেডশিট সেট",
      subtitleEn: "King Size (90x100) sheet + 2 Oxford pillow shams with gold piping",
      subtitleBn: "কিং সাইজ বিছানার চাদর ও ২ টি পিলো কভার",
      descriptionEn: "Woven from extra-long staple Egyptian Giza cotton for a silken texture that becomes softer with every wash. Hypoallergenic, breathable, and stays cool in tropical weather.",
      descriptionBn: "দীর্ঘ আঁশের মিশরীয় সুতায় তৈরি যা অত্যন্ত মসৃণ এবং আরামদায়ক। ঘরের ভেতর আধুনিক পাঁচ তারকা হোটেলের রাজকীয় আমেজ তৈরি করবে।",
      categoryKey: "egyptian-bedsheets",
      brand: "Astrox Maison",
      badge: "5-Star Luxury",
      basePrice: bdt(5800),
      compareAtPrice: bdt(6900),
      isFeatured: false,
      optionNames: ["Colour", "Size"],
      variants: [
        { sku: "AX-BED-01-CHM-KNG", option1: "Champagne Pearl", option2: "King (90x100 inch)", swatchHex: "#E7DFCF", stock: 18 },
        { sku: "AX-BED-01-SLV-KNG", option1: "Silver Fog", option2: "King (90x100 inch)", swatchHex: "#B8B8C0", stock: 12 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80", colorKey: "Champagne Pearl" },
      ],
      collectionKey: "winter-edit",
    },
  ];

  for (const item of productsToCreate) {
    const catId = categoryMap.get(item.categoryKey);
    if (!catId) continue;

    const prod = await prisma.product.create({
      data: {
        code: item.code,
        slug: item.slug,
        nameEn: item.nameEn,
        nameBn: item.nameBn,
        subtitleEn: item.subtitleEn,
        subtitleBn: item.subtitleBn,
        descriptionEn: item.descriptionEn,
        descriptionBn: item.descriptionBn,
        categoryId: catId,
        brand: item.brand,
        badge: item.badge,
        basePrice: item.basePrice,
        compareAtPrice: item.compareAtPrice,
        isFeatured: item.isFeatured,
        isFlashDeal: item.isFlashDeal || false,
        flashPrice: item.flashPrice,
        flashEndsAt: item.flashEndsAt,
        optionNames: item.optionNames,
        warrantyEn: item.warrantyEn,
        warrantyBn: item.warrantyBn,
        ratingAvg: 4.8 + (Math.random() * 0.2),
        ratingCount: Math.floor(18 + Math.random() * 45),
        soldCount: Math.floor(40 + Math.random() * 120),
        variants: {
          create: item.variants.map((v: any) => ({
            sku: v.sku,
            option1: v.option1,
            option2: v.option2,
            swatchHex: v.swatchHex,
            price: v.price || item.basePrice,
            stock: v.stock,
            lowAt: 5,
          })),
        },
        images: {
          create: item.images.map((img: any, idx: number) => ({
            url: img.url,
            colorKey: img.colorKey || null,
            position: idx,
            altEn: item.nameEn,
            altBn: item.nameBn,
          })),
        },
      },
    });

    // Link to collection if specified
    if (item.collectionKey && collectionMap.has(item.collectionKey)) {
      await prisma.collectionProduct.create({
        data: {
          collectionId: collectionMap.get(item.collectionKey)!,
          productId: prod.id,
          position: 1,
        },
      });
    }

    // Add 1 verified review per product
    await prisma.review.create({
      data: {
        productId: prod.id,
        authorName: "Tanvir Ahmed, Banani",
        rating: 5,
        title: "Unmatched craftsmanship & luxury delivery",
        comment: "Received the order in Dhaka within 24 hours in the bespoke black and gold box with wax seal. The fabric drape and stitching precision are far superior to usual local brands.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }

  console.log(`🛍️ Seeded ${productsToCreate.length} Signature Multi-Variant Products.`);

  // 7. Active Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "ASTROX10",
        titleEn: "10% Welcome Privilege",
        titleBn: "১০% ওয়েলকাম ডিসকাউন্ট",
        discountType: "PERCENT",
        discountValue: 10,
        minSubtotal: bdt(2000),
        maxDiscount: bdt(1000),
        isActive: true,
      },
      {
        code: "EIDLUXE",
        titleEn: "Flat ৳500 Off on Festive Edits",
        titleBn: "উৎসবের পোশাকে ৳৫০০ ছাড়",
        discountType: "FIXED",
        discountValue: bdt(500),
        minSubtotal: bdt(5000),
        isActive: true,
      },
      {
        code: "FREESHIP",
        titleEn: "Complimentary Express Delivery",
        titleBn: "ফ্রি হোম ডেলিভারি",
        discountType: "FREE_SHIPPING",
        discountValue: bdt(120),
        minSubtotal: bdt(2500),
        isActive: true,
      },
    ],
  });

  // 8. Realistic Orders for Studio Dashboard Analytics
  const firstProduct = await prisma.product.findFirst({
    where: { slug: "jacquard-silk-kabli-panjabi-midnight-gold" },
    include: { variants: true, images: true },
  });

  const secondProduct = await prisma.product.findFirst({
    where: { slug: "astrox-nova-pro-anc-wireless-earbuds" },
    include: { variants: true, images: true },
  });

  if (firstProduct && secondProduct) {
    const v1 = firstProduct.variants[0];
    const v2 = secondProduct.variants[0];

    // Seed 14 sample orders across various statuses
    const sampleOrders = [
      { no: "AX-2026-1001", status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.COD, name: "Mahfuzur Rahman", phone: "01711223344", district: "Dhaka", total: bdt(7070), daysAgo: 6 },
      { no: "AX-2026-1002", status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.BKASH, name: "Nusrat Jahan", phone: "01822334455", district: "Chattogram", total: bdt(7320), daysAgo: 5 },
      { no: "AX-2026-1003", status: OrderStatus.SHIPPED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.SSLCOMMERZ, name: "Dr. Asif Kamal", phone: "01933445566", district: "Dhaka", total: bdt(14150), daysAgo: 3 },
      { no: "AX-2026-1004", status: OrderStatus.CONFIRMED, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD, name: "Farhana Yeasmin", phone: "01744556677", district: "Sylhet", total: bdt(6950), daysAgo: 2 },
      { no: "AX-2026-1005", status: OrderStatus.OUT_FOR_DELIVERY, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD, name: "Sikder Monir", phone: "01555667788", district: "Dhaka", total: bdt(7200), daysAgo: 1 },
      { no: "AX-2026-1006", status: OrderStatus.PLACED, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD, name: "Shakib Al Hasan", phone: "01666778899", district: "Rajshahi", total: bdt(7080), daysAgo: 0 },
      { no: "AX-2026-1007", status: OrderStatus.CANCELLED, payStatus: PaymentStatus.FAILED, payMethod: PaymentMethod.NAGAD, name: "Kamrul Islam", phone: "01777889900", district: "Khulna", total: bdt(6950), daysAgo: 4 },
      { no: "AX-2026-1008", status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.STRIPE, name: "Zubair Masood (London Gift)", phone: "01888990011", district: "Dhaka", total: bdt(18500), daysAgo: 7 },
    ];

    for (const o of sampleOrders) {
      const createdDate = new Date(Date.now() - o.daysAgo * 86400000);
      const order = await prisma.order.create({
        data: {
          orderNumber: o.no,
          customerName: o.name,
          customerPhone: o.phone,
          customerEmail: `${o.phone}@astrox-guest.com`,
          division: "Dhaka",
          district: o.district,
          area: "Central Area",
          street: "Road 12, Block C",
          postcode: "1200",
          subtotal: o.total - bdt(120),
          shippingFee: bdt(120),
          total: o.total,
          paymentMethod: o.payMethod,
          paymentStatus: o.payStatus,
          status: o.status,
          createdAt: createdDate,
          items: {
            create: [
              {
                productId: firstProduct.id,
                variantId: v1.id,
                productCode: firstProduct.code,
                productSlug: firstProduct.slug,
                titleEn: firstProduct.nameEn,
                titleBn: firstProduct.nameBn,
                variantLabel: `${v1.option1} / ${v1.option2}`,
                sku: v1.sku,
                imageUrl: firstProduct.images[0].url,
                unitPrice: v1.price || firstProduct.basePrice,
                qty: 1,
                lineTotal: v1.price || firstProduct.basePrice,
              },
            ],
          },
          events: {
            create: [
              {
                status: OrderStatus.PLACED,
                titleEn: "Order Placed",
                titleBn: "অর্ডার গৃহীত হয়েছে",
                actorName: "Customer Checkout",
                createdAt: createdDate,
              },
              ...(o.status !== OrderStatus.PLACED
                ? [
                    {
                      status: o.status,
                      titleEn: `Status updated to ${o.status}`,
                      titleBn: `অর্ডার স্ট্যাটাস: ${o.status}`,
                      actorName: "Astrox Studio Logistics",
                      createdAt: new Date(createdDate.getTime() + 3600000 * 2),
                    },
                  ]
                : []),
            ],
          },
        },
      });

      if (o.payStatus === PaymentStatus.PAID) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            method: o.payMethod,
            providerRef: `REF-${o.no}-${Math.floor(Math.random() * 99999)}`,
            amount: o.total,
            status: PaymentStatus.PAID,
          },
        });
      }
    }
    console.log("📊 Seeded 8 historical and live orders for Studio Dashboard.");
  }

  // 9. Store Global Settings
  await prisma.setting.upsert({
    where: { key: "store_profile" },
    update: {},
    create: {
      key: "store_profile",
      valueJson: {
        storeName: "Astrox",
        tagline: "Astral Luxury Tailored for Bangladesh",
        contactEmail: "concierge@astrox.com",
        contactPhone: "+880 1700-000001",
        insideDhakaShippingPaisa: 7000,
        outsideDhakaShippingPaisa: 13000,
        freeShippingThresholdPaisa: 250000,
        currencySymbol: "৳",
        currencyCode: "BDT",
      },
    },
  });

  console.log("✨ Astrox Database Seeding Complete! Ready for Phase 1.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
