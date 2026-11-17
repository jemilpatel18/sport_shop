import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { USER_ROLES, ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../constants';
import { slugify, generateOrderNumber } from './helpers';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'SportZone Admin',
      email: 'admin@sportzone.com',
      password: 'Admin@123456',
      phone: '+1 (555) 019-9999',
      role: USER_ROLES.ADMIN,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      addresses: [
        {
          fullName: 'SportZone HQ Operations',
          phone: '+1 (555) 019-9999',
          street: '100 Olympic Way, Suite 400',
          city: 'Eugene',
          state: 'OR',
          postalCode: '97401',
          country: 'United States',
          isDefault: true,
          type: 'work',
        },
      ],
      isEmailVerified: true,
    });

    const customerUser = await User.create({
      name: 'Alex Morgan',
      email: 'customer@sportzone.com',
      password: 'Customer@123456',
      phone: '+1 (555) 019-2834',
      role: USER_ROLES.CUSTOMER,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      addresses: [
        {
          fullName: 'Alex Morgan',
          phone: '+1 (555) 019-2834',
          street: '742 Evergreen Terrace',
          apartment: 'Apt 4B',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
          isDefault: true,
          type: 'home',
        },
      ],
      isEmailVerified: true,
    });

    console.log('[Seed] Creating categories...');
    const categoriesData = [
      {
        name: 'Cricket',
        slug: 'cricket',
        description: 'Pro-grade English willow bats, protective gear, match balls & kit bags.',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
        itemCount: 4,
        featured: true,
      },
      {
        name: 'Volleyball',
        slug: 'volleyball',
        description: 'FIVB-certified match balls, spiking shoes, knee pads & court gear.',
        image: '/images/volleyball.jpg',
        itemCount: 3,
        featured: true,
      },
      {
        name: 'Chess',
        slug: 'chess',
        description: 'Tournament chess sets, Staunton pieces, chess clocks & strategy guides.',
        image: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=1000&auto=format&fit=crop',
        itemCount: 3,
        featured: true,
      },
      {
        name: 'Football',
        slug: 'football',
        description: 'FIFA quality pro match balls, speed cleats, shin guards & keeper gloves.',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
        itemCount: 5,
        featured: true,
      },
      {
        name: 'Badminton',
        slug: 'badminton',
        description: 'Ultra-light graphite racquets, tournament shuttlecocks & court footwear.',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop',
        itemCount: 4,
        featured: true,
      },
      {
        name: 'Fitness & Gym',
        slug: 'fitness',
        description: 'Heavy duty dumbbells, resistance bands, power racks & recovery gear.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
        itemCount: 5,
        featured: true,
      },
      {
        name: 'Sportswear',
        slug: 'sportswear',
        description: 'Breathable dry-fit jerseys, compression tights, athletic hoodies & tracksuits.',
        image: 'https://images.unsplash.com/photo-1483721074573-586540da5703?q=80&w=1000&auto=format&fit=crop',
        itemCount: 5,
        featured: true,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Ergonomic duffels, stainless insulated bottles, sweatbands & safety braces.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
        itemCount: 3,
        featured: true,
      },
    ];

    const categories = await Category.insertMany(categoriesData);

    console.log('[Seed] Creating brands...');
    const brandsData = [
      {
        name: 'Nike',
        slug: 'nike',
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop',
        description: 'Just Do It. World leader in athletic footwear, apparel and sports equipment.',
        itemCount: 6,
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=300&auto=format&fit=crop',
        description: 'Through sport, we have the power to change lives.',
        itemCount: 5,
      },
      {
        name: 'Puma',
        slug: 'puma',
        logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=300&auto=format&fit=crop',
        description: 'Forever Faster. Designing sports products for the fastest athletes.',
        itemCount: 4,
      },
      {
        name: 'Under Armour',
        slug: 'under-armour',
        logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
        description: 'Pioneering performance apparel and moisture-wicking athlete garments.',
        itemCount: 3,
      },
      {
        name: 'Yonex',
        slug: 'yonex',
        logo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=300&auto=format&fit=crop',
        description: 'Japanese world benchmark in badminton racquets and court equipment.',
        itemCount: 4,
      },
      {
        name: 'SG Cricket',
        slug: 'sg-cricket',
        logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=300&auto=format&fit=crop',
        description: 'Indias iconic cricket manufacturer trusted by test legends.',
        itemCount: 3,
      },
    ];

    const brands = await Brand.insertMany(brandsData);

    console.log('[Seed] Creating products...');
    const productsData = [
      {
        name: 'Nike Mercurial Superfly 9 Elite FG',
        slug: 'nike-mercurial-superfly-9-elite-fg',
        sku: 'NIK-FB-1001',
        description: 'Designed for blistering speed with Zoom Air cushioning and Vaporposite+ upper for surgical control at top velocity.',
        brand: 'Nike',
        category: 'Football',
        originalPrice: 285.0,
        price: 249.99,
        discount: 12,
        stock: 24,
        sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
        colors: [
          { name: 'Metallic Copper', hex: '#b87333' },
          { name: 'Volt Yellow', hex: '#cefc02' },
          { name: 'Blackout', hex: '#111111' },
        ],
        images: [
          'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Surface: 'Firm Ground (FG)',
          Upper: 'Vaporposite+ with flyknit collar',
          Weight: '205 grams',
          Studs: 'Tri-star traction pattern',
        },
        features: [
          '3/4 length Zoom Air unit in outsole plate',
          'Speed cage structure inside secures foot with zero bulk',
          'Micro-texture grip across high-touch striking zones',
        ],
        rating: 4.9,
        reviewCount: 84,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['football', 'cleats', 'speed', 'nike'],
      },
      {
        name: 'Adidas Predator Elite Fold-Over Tongue FG',
        slug: 'adidas-predator-elite-tongue-fg',
        sku: 'ADI-FB-1002',
        description: 'The return of the iconic fold-over tongue with precision Strikeskin rubber fins for swerving match winners.',
        brand: 'Adidas',
        category: 'Football',
        originalPrice: 280.0,
        price: 259.99,
        discount: 7,
        stock: 18,
        sizes: ['US 8.5', 'US 9.5', 'US 10.5', 'US 11.5'],
        colors: [
          { name: 'Solar Red', hex: '#ff2800' },
          { name: 'Core Black', hex: '#000000' },
        ],
        images: [
          'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Surface: 'Firm Ground',
          Collar: 'Fold-over tongue with elastic strap',
          Weight: '218 grams',
        },
        features: ['Strikeskin 3D rubber elements', 'Controlframe 2.0 stability plate'],
        rating: 4.8,
        reviewCount: 52,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isActive: true,
        tags: ['football', 'predator', 'control'],
      },
      {
        name: 'Yonex Astrox 99 Pro Badminton Racquet',
        slug: 'yonex-astrox-99-pro',
        sku: 'YNX-BD-2001',
        description: 'Head-heavy power frame equipped with Namd graphite and Rotational Generator System for devastating smashes.',
        brand: 'Yonex',
        category: 'Badminton',
        originalPrice: 240.0,
        price: 219.0,
        discount: 9,
        stock: 15,
        sizes: ['3U-G4', '4U-G5'],
        colors: [
          { name: 'Cherry Sunburst', hex: '#e34234' },
          { name: 'White Tiger', hex: '#f8f8f8' },
        ],
        images: [
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Flex: 'Extra Stiff',
          Frame: 'HM Graphite + Namd + Volume Cut Resin',
          Balance: 'Head Heavy',
          Origin: 'Made in Japan',
        },
        features: ['Power-Assist Bumper adds weight into shuttle impact', 'Rotational Generator System balance'],
        rating: 4.9,
        reviewCount: 41,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['badminton', 'yonex', 'racquet'],
      },
      {
        name: 'SG HP 33 English Willow Cricket Bat',
        slug: 'sg-hp-33-english-willow-bat',
        sku: 'SG-CR-3001',
        description: 'Endorsed by Hardik Pandya, hand-crafted from Grade 1 selected English willow with monster edges and feather-light pickup.',
        brand: 'SG Cricket',
        category: 'Cricket',
        originalPrice: 420.0,
        price: 369.99,
        discount: 12,
        stock: 8,
        sizes: ['Short Handle (SH)', 'Long Handle (LH)'],
        colors: [{ name: 'Natural Willow', hex: '#d2b48c' }],
        images: [
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Willow: 'Grade 1 Hand Selected English Willow',
          Weight: '1160 - 1190 grams (2lb 9oz - 2lb 10oz)',
          Edge: '39 - 41mm',
          Handle: 'Round 12-piece Sarawak cane',
        },
        features: ['Thick bottom profile for big boundaries', 'Pre-pressed and knocked'],
        rating: 5.0,
        reviewCount: 29,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['cricket', 'bat', 'willow', 'hardik'],
      },
      {
        name: 'Under Armour HeatGear Compression Long Sleeve',
        slug: 'ua-heatgear-compression-long-sleeve',
        sku: 'UA-SW-4001',
        description: 'Original performance baselayer that keeps you cool, locked in and dry through intense training sessions.',
        brand: 'Under Armour',
        category: 'Sportswear',
        originalPrice: 45.0,
        price: 38.0,
        discount: 15,
        stock: 45,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Pitch Gray', hex: '#444444' },
          { name: 'Royal Blue', hex: '#002366' },
          { name: 'White', hex: '#ffffff' },
        ],
        images: [
          'https://images.unsplash.com/photo-1483721074573-586540da5703?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Material: '84% Polyester / 16% Elastane',
          Fit: 'Ultra-tight, second-skin compression',
          Technology: 'HeatGear with 4-way stretch',
        },
        features: ['Strategic mesh underarm panels', 'Anti-odor fabric treatment'],
        rating: 4.7,
        reviewCount: 110,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: true,
        isActive: true,
        tags: ['sportswear', 'gym', 'compression'],
      },
      {
        name: 'Nike Pro Dri-FIT Power Training Shorts',
        slug: 'nike-pro-dri-fit-training-shorts',
        sku: 'NIK-SW-4002',
        description: 'Stretchy fabric with sweat-wicking support lets you move effortlessly between sets and sprints.',
        brand: 'Nike',
        category: 'Sportswear',
        originalPrice: 40.0,
        price: 32.5,
        discount: 18,
        stock: 35,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Anthracite', hex: '#292929' },
          { name: 'Sport Red', hex: '#d32f2f' },
        ],
        images: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Inseam: '9 inches',
          Material: '89% Recycled Polyester / 11% Spandex',
        },
        features: ['Snug elastic waistband with jacquard logo', 'Ventilated hem for mobility'],
        rating: 4.6,
        reviewCount: 48,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
        tags: ['sportswear', 'shorts', 'training'],
      },
      {
        name: 'Cast Iron Hex Dumbbell Set (Pair 25kg)',
        slug: 'cast-iron-hex-dumbbell-set-25kg',
        sku: 'FIT-GYM-5001',
        description: 'Commercial gym quality rubber-encased hexagonal dumbbells with knurled ergonomic chrome handles.',
        brand: 'Nike',
        category: 'Fitness & Gym',
        originalPrice: 160.0,
        price: 139.0,
        discount: 13,
        stock: 12,
        sizes: ['25 kg Pair'],
        colors: [{ name: 'Matte Black', hex: '#1c1c1c' }],
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Weight: '2 x 25 kg (50 kg total)',
          Handle: 'Contoured chrome knurl',
          Ends: 'Heavy duty virgin rubber coated hex',
        },
        features: ['Anti-roll hexagonal head design', 'Quiet drop dampening rubber'],
        rating: 4.8,
        reviewCount: 37,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: false,
        isActive: true,
        tags: ['fitness', 'gym', 'dumbbells', 'strength'],
      },
      {
        name: 'Puma Phase Sports Duffel Gym Bag 35L',
        slug: 'puma-phase-sports-duffel-bag-35l',
        sku: 'PUM-ACC-6001',
        description: 'Durable weather-resistant duffel with separate breathable shoe tunnel and padded shoulder strap.',
        brand: 'Puma',
        category: 'Accessories',
        originalPrice: 42.0,
        price: 29.99,
        discount: 28,
        stock: 30,
        sizes: ['35 Liters'],
        colors: [
          { name: 'Puma Black', hex: '#0a0a0a' },
          { name: 'Navy Blue', hex: '#1a237e' },
        ],
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Volume: '35 Liters',
          Dimensions: '50cm x 26cm x 24cm',
          Material: '100% Water-repellent Poly 600D',
        },
        features: ['Zippered ventilated shoe compartment', 'Mesh side water bottle pocket'],
        rating: 4.6,
        reviewCount: 65,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['accessories', 'bag', 'duffel', 'puma'],
      },
      {
        name: 'Magnetic Travel Chess Set — Staunton Pieces',
        slug: 'magnetic-travel-chess-set-staunton',
        sku: 'SZ-CH-2001',
        description: 'Compact tournament-style travel chess set with weighted Staunton pieces, magnetic storage and a foldable 20-inch vinyl board.',
        brand: 'SportZone Pro',
        category: 'Chess',
        originalPrice: 89.99,
        price: 64.99,
        discount: 28,
        stock: 30,
        sizes: ['Standard 2.1kg', 'Deluxe Weighted 2.8kg'],
        colors: [
          { name: 'Classic Brown/Beige', hex: '#8B5E3C' },
          { name: 'Tournament Green/White', hex: '#14532D' },
        ],
        images: [
          'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          'Board Size': '20 x 20 inches (folding vinyl)',
          'Piece Height': 'King 3.75" / Pawn 1.75"',
          Material: 'Resin weighted pieces, felted bases',
          Weight: 'Approx. 2.1 kg',
        },
        features: ['Weighted Staunton pieces with felted bases', 'Magnetic pieces stay in place during travel', 'Folding 20" vinyl board with algebraic notation'],
        rating: 4.8,
        reviewCount: 76,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['chess', 'chess set', 'staunton', 'travel'],
      },
      {
        name: 'Digital Chess Clock — Tournament DGT-Style',
        slug: 'digital-chess-clock-tournament-dgt-style',
        sku: 'SZ-CH-2002',
        description: 'FIDE-compliant digital chess clock with dual displays, move counter, sound alerts and adjustable time controls.',
        brand: 'SportZone Pro',
        category: 'Chess',
        originalPrice: 54.99,
        price: 39.99,
        discount: 27,
        stock: 45,
        sizes: ['Standard'],
        colors: [{ name: 'Black', hex: '#111111' }],
        images: [
          'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Display: 'Dual LCD, 20-digit',
          'Time Controls': '1+0 to 90 min + increments',
          Dimensions: '8.3" x 3.9" x 0.8"',
        },
        features: ['Adjustable time controls', 'Move counter with indicators', 'Long-life battery'],
        rating: 4.7,
        reviewCount: 52,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
        tags: ['chess', 'chess clock', 'tournament', 'timing'],
      },
      {
        name: 'Tournament Chess Board — Roll-Up Silicone Mat 21"',
        slug: 'tournament-chess-board-rollup-silicone',
        sku: 'SZ-CH-2003',
        description: 'Professional roll-up silicone chess board with algebraic coordinates, non-slip backing and crease-free tournament surface.',
        brand: 'SportZone Pro',
        category: 'Chess',
        originalPrice: 69.99,
        price: 49.99,
        discount: 29,
        stock: 60,
        sizes: ['21 inch'],
        colors: [{ name: 'Green/Beige', hex: '#14532D' }],
        images: [
          'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1000&auto=format&fit=crop',
        ],
        specifications: {
          Size: '21" x 21" (2" squares)',
          Material: 'Food-grade silicone',
          Weight: '340g',
        },
        features: ['Algebraic notation printed on both sides', 'Rolls flat for travel', 'Non-slip rubber backing'],
        rating: 4.6,
        reviewCount: 34,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
        tags: ['chess', 'chess board', 'silicone', 'tournament'],
      },
      {
        name: 'FIVB Official Match Volleyball — Pro Court Series',
        slug: 'fivb-official-match-volleyball-pro-court',
        sku: 'SZ-VB-3001',
        description: 'Official FIVB-certified match volleyball built for indoor competitive play with hand-stitched PU leather panels.',
        brand: 'SportZone Pro',
        category: 'Volleyball',
        originalPrice: 59.99,
        price: 44.99,
        discount: 25,
        stock: 80,
        sizes: ['Size 5'],
        colors: [{ name: 'Classic Blue/Yellow', hex: '#2563EB' }],
        images: [
          '/images/volleyball.jpg',
        ],
        specifications: {
          Size: 'Size 5 — 65–67 cm circumference',
          Weight: '260–280 g',
          Material: 'PU leather panels, butyl bladder',
          Certification: 'FIVB official',
        },
        features: ['FIVB-approved official match ball', 'Butyl bladder holds air for months', 'Hand-stitched PU leather panels'],
        rating: 4.8,
        reviewCount: 64,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isActive: true,
        tags: ['volleyball', 'fivb', 'match ball', 'indoor'],
      },
      {
        name: 'ProSpike Volleyball Shoes — Lightweight Jump Support',
        slug: 'prospike-volleyball-shoes-jump-support',
        sku: 'SZ-VB-3002',
        description: 'Court-specific volleyball footwear with lateral stability, responsive cushioning and a lightweight upper.',
        brand: 'Nike',
        category: 'Volleyball',
        originalPrice: 175.0,
        price: 139.0,
        discount: 21,
        stock: 25,
        sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
        colors: [
          { name: 'Black/Volt', hex: '#111111' },
          { name: 'White/Red', hex: '#FFFFFF' },
        ],
        images: [
          '/images/volleyball.jpg',
        ],
        specifications: {
          Outsole: 'Non-marking gum rubber',
          Midsole: 'Responsive foam cushioning',
          Upper: 'Engineered mesh',
        },
        features: ['Gum rubber outsole for indoor grip', 'Foam midsole for landing shock absorption', 'Breathable engineered mesh upper'],
        rating: 4.7,
        reviewCount: 48,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
        tags: ['volleyball', 'shoes', 'indoor court', 'jump'],
      },
      {
        name: 'ShockGuard Volleyball Knee Pads — Pair',
        slug: 'shockguard-volleyball-knee-pads-pair',
        sku: 'SZ-VB-3003',
        description: 'Gel-cushioned knee pads designed for volleyball diving and floor defense.',
        brand: 'SportZone Pro',
        category: 'Volleyball',
        originalPrice: 34.99,
        price: 24.99,
        discount: 29,
        stock: 120,
        sizes: ['One Size'],
        colors: [{ name: 'Black', hex: '#111111' }],
        images: [
          '/images/volleyball.jpg',
        ],
        specifications: {
          Padding: 'Dual-density gel',
          Sizes: 'One size fits most (30–45cm knee)',
          Material: 'Neoprene sleeve, EVA padding',
        },
        features: ['Gel impact padding at patella', 'Breathable moisture-wicking sleeves', 'Non-slip silicone grip strips'],
        rating: 4.5,
        reviewCount: 29,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false,
        isActive: true,
        tags: ['volleyball', 'knee pads', 'protection', 'diving'],
      },
    ];

    const products = await Product.insertMany(productsData);

    console.log('[Seed] Creating promotional coupons...');
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + 90);

    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountPercentage: 10,
        minOrderValue: 50,
        maxDiscount: 25,
        expiryDate: expiry,
        isActive: true,
        description: '10% off on your first order over $50',
      },
      {
        code: 'SPORTZONE20',
        discountType: 'percentage',
        discountPercentage: 20,
        minOrderValue: 150,
        maxDiscount: 50,
        expiryDate: expiry,
        isActive: true,
        description: '20% off high performance gear on orders above $150',
      },
      {
        code: 'ATHLETE25',
        discountType: 'percentage',
        discountPercentage: 25,
        minOrderValue: 200,
        maxDiscount: 75,
        expiryDate: expiry,
        isActive: true,
        description: 'Elite athlete savings: 25% off purchases over $200',
      },
    ];

    await Coupon.insertMany(couponsData);

    console.log('[Seed] Creating demo sample order...');
    const demoProduct = products[0];
    const orderNumber = generateOrderNumber();

    await Order.create({
      orderNumber,
      user: customerUser._id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      items: [
        {
          product: demoProduct._id,
          name: demoProduct.name,
          image: demoProduct.images[0],
          brand: demoProduct.brand,
          price: demoProduct.price,
          quantity: 1,
          size: 'US 10',
          color: 'Metallic Copper',
        },
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: PAYMENT_METHODS.RAZORPAY_CARD,
      paymentStatus: PAYMENT_STATUS.PAID,
      orderStatus: ORDER_STATUS.CONFIRMED,
      subtotal: demoProduct.price,
      discount: 0,
      shipping: 0,
      tax: 20.0,
      total: demoProduct.price + 20.0,
      timeline: [
        {
          status: ORDER_STATUS.PENDING,
          title: 'Order Placed',
          description: 'Payment authorized and digital order received.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          completed: true,
        },
        {
          status: ORDER_STATUS.CONFIRMED,
          title: 'Order Confirmed',
          description: 'Order confirmed and scheduled for warehouse picking.',
          timestamp: new Date().toISOString(),
          completed: true,
        },
      ],
      trackingNumber: 'SZ-LOG-891042',
      trackingCarrier: 'SportZone Express Logistics',
    });

    console.log('[Seed] Creating demo product review...');
    await Review.create({
      user: customerUser._id,
      product: demoProduct._id,
      userName: customerUser.name,
      rating: 5,
      title: 'Incredible grip and lockdown at full speed!',
      comment:
        'Played two tournament matches with the Superfly 9. The Zoom Air unit provides immediate spring response off the turf. Worth every penny for competitive wingers.',
      verifiedPurchase: true,
      status: 'approved',
    });

    console.log('==================================================');
    console.log('✅ SPORTZONE database seeding completed successfully!');
    console.log('Admin account:    admin@sportzone.com / Admin@123456');
    console.log('Customer account: customer@sportzone.com / Customer@123456');
    console.log(`Categories:       ${categories.length}`);
    console.log(`Brands:           ${brands.length}`);
    console.log(`Products:         ${products.length}`);
    console.log('==================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();

