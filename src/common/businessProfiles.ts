export interface BusinessCategoryTemplate {
  name: string;
  profile: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  iconName: string;
  module: 'fastfood' | 'minimart';
  description: string;
  suggestedUnits: string[];
  suggestedSizes: string[];
  defaultCategories: BusinessCategoryTemplate[];
  features: {
    hasKitchenKDS?: boolean;
    hasWeighingScale?: boolean;
    hasImeiSerial?: boolean;
    hasBatchExpiry?: boolean;
    hasColorShades?: boolean;
    hasPipeDecimals?: boolean;
  };
}

export const BUSINESS_PROFILES: Record<string, BusinessProfile> = {
  footwear: {
    id: 'footwear',
    name: 'Footwear & Shoes Store',
    iconName: 'Footprints',
    module: 'minimart',
    description: 'Specialized for shoe shops with sizes 38 - 45, colors, pairs and article codes',
    suggestedUnits: ['PAIR', 'PCS'],
    suggestedSizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    defaultCategories: [
      { name: 'Formal Shoes', profile: 'footwear' },
      { name: 'Sneakers & Joggers', profile: 'footwear' },
      { name: 'Slippers & Chappal', profile: 'footwear' },
      { name: 'Sandals & Peshawari', profile: 'footwear' },
      { name: 'Boots & High Tops', profile: 'footwear' },
      { name: 'Kids Footwear', profile: 'footwear' },
    ],
    features: {
      hasColorShades: true,
    },
  },
  apparel: {
    id: 'apparel',
    name: 'Garments, Clothing & Boutique',
    iconName: 'Shirt',
    module: 'minimart',
    description: 'Standard apparel sizes (XS to 3XL) and unstitched fabric / meter measurements',
    suggestedUnits: ['PCS', 'SUIT', 'METER', 'GAZ', 'SET'],
    suggestedSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    defaultCategories: [
      { name: 'Gents Kurta & Shalwar Kameez', profile: 'apparel' },
      { name: 'Casual Shirts & Polos', profile: 'apparel' },
      { name: 'Trousers, Jeans & Pants', profile: 'apparel' },
      { name: 'Ladies Unstitched Suits', profile: 'apparel' },
      { name: 'Ladies Ready-to-Wear (Pret)', profile: 'apparel' },
      { name: 'Kids Wear', profile: 'apparel' },
      { name: 'Jackets & Winter Wear', profile: 'apparel' },
    ],
    features: {
      hasColorShades: true,
    },
  },
  grocery: {
    id: 'grocery',
    name: 'Grocery, Supermarket & Mini Mart',
    iconName: 'ShoppingBag',
    module: 'minimart',
    description: 'Barcode scanning POS with weighed loose grains (KG/Grams) and FMCG items',
    suggestedUnits: ['KG', 'GRAM', 'LITER', 'PACK', 'BOX', 'PCS'],
    suggestedSizes: ['250g', '500g', '1 KG', '5 KG'],
    defaultCategories: [
      { name: 'Beverages & Cold Drinks', profile: 'grocery' },
      { name: 'Snacks, Chips & Biscuits', profile: 'grocery' },
      { name: 'Dairy, Milk & Eggs', profile: 'grocery' },
      { name: 'Staples, Rice, Flour & Daal', profile: 'grocery' },
      { name: 'Cooking Oil & Banaspati Ghee', profile: 'grocery' },
      { name: 'Household & Cleaning', profile: 'grocery' },
      { name: 'Spices & Condiments', profile: 'grocery' },
    ],
    features: {
      hasWeighingScale: true,
    },
  },
  cosmetics: {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty Store',
    iconName: 'Palette',
    module: 'minimart',
    description: 'Beauty products with shade color numbers (#01, #08) and bottle volume sizes',
    suggestedUnits: ['PCS', 'PACK', 'BOTTLE', 'SET'],
    suggestedSizes: ['#01 Red', '#08 Nude', '#14 Maroon', '#22 Gold', '50ml', '100ml', '250ml'],
    defaultCategories: [
      { name: 'Lipsticks & Lip Gloss', profile: 'cosmetics' },
      { name: 'Foundations & Face Powders', profile: 'cosmetics' },
      { name: 'Skin Care, Creams & Serums', profile: 'cosmetics' },
      { name: 'Eye Makeup & Mascara', profile: 'cosmetics' },
      { name: 'Perfumes & Body Mists', profile: 'cosmetics' },
      { name: 'Hair Care & Shampoos', profile: 'cosmetics' },
      { name: 'Nail Polishes & Nail Care', profile: 'cosmetics' },
    ],
    features: {
      hasColorShades: true,
      hasBatchExpiry: true,
    },
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy & Medical Store',
    iconName: 'Cross',
    module: 'minimart',
    description: 'Medicines with strip/box/tablet division, batch numbers and expiry tracking',
    suggestedUnits: ['STRIP', 'BOX', 'TABLET', 'SYRUP', 'PCS'],
    suggestedSizes: ['Strip (10 Tablets)', 'Box (100 Tablets)', '60ml', '120ml'],
    defaultCategories: [
      { name: 'Tablets & Capsules', profile: 'pharmacy' },
      { name: 'Syrups & Suspensions', profile: 'pharmacy' },
      { name: 'Injections & Infusions', profile: 'pharmacy' },
      { name: 'Ointments & Topical Drops', profile: 'pharmacy' },
      { name: 'Medical Devices & Surgicals', profile: 'pharmacy' },
      { name: 'Baby Food & Diapers', profile: 'pharmacy' },
    ],
    features: {
      hasBatchExpiry: true,
    },
  },
  electronics: {
    id: 'electronics',
    name: 'Mobile, Electronics & Accessories',
    iconName: 'Smartphone',
    module: 'minimart',
    description: 'Smartphones and electronics with unique IMEI/Serial numbers and warranty tracking',
    suggestedUnits: ['PCS', 'SET'],
    suggestedSizes: ['64GB', '128GB', '256GB', '512GB'],
    defaultCategories: [
      { name: 'Smartphones & Handsets', profile: 'electronics' },
      { name: 'Chargers, Adapters & Cables', profile: 'electronics' },
      { name: 'Wireless Earbuds & Audio', profile: 'electronics' },
      { name: 'Screen Protectors & Glass', profile: 'electronics' },
      { name: 'Mobile Covers & Pouches', profile: 'electronics' },
      { name: 'Power Banks & Batteries', profile: 'electronics' },
    ],
    features: {
      hasImeiSerial: true,
    },
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery & Sweets / Confectionery',
    iconName: 'Cake',
    module: 'minimart',
    description: 'Fresh confectionery and traditional sweets sold by box / weight (250g, 500g, 1 KG)',
    suggestedUnits: ['KG', 'GRAM', 'DABBA', 'PCS', 'BOX'],
    suggestedSizes: ['250g', '500g', '1 KG', '2 KG'],
    defaultCategories: [
      { name: 'Traditional Sweets & Mithai', profile: 'bakery' },
      { name: 'Cakes, Pastries & Desserts', profile: 'bakery' },
      { name: 'Bakery Biscuits & Cookies', profile: 'bakery' },
      { name: 'Fresh Breads, Rusk & Buns', profile: 'bakery' },
      { name: 'Savories, Samosa & Nimko', profile: 'bakery' },
    ],
    features: {
      hasWeighingScale: true,
    },
  },
  food: {
    id: 'food',
    name: 'Fast Food, Cafe & Restaurant',
    iconName: 'Utensils',
    module: 'fastfood',
    description: 'Food and kitchen menu with KDS ticket dispatch, portion sizes and deal combos',
    suggestedUnits: ['PCS', 'SERVING', 'DEAL', 'PACK'],
    suggestedSizes: ['Regular', 'Small', 'Medium', 'Large', 'Family', 'Half', 'Full'],
    defaultCategories: [
      { name: 'Burgers & Sandwiches', profile: 'food' },
      { name: 'Pizzas & Calzones', profile: 'food' },
      { name: 'Crispy Broast & Wings', profile: 'food' },
      { name: 'Karahi, Handi & Gravies', profile: 'food' },
      { name: 'BBQ, Tikka & Kebabs', profile: 'food' },
      { name: 'Cold Beverages & Shakes', profile: 'food' },
      { name: 'Family Deals & Combos', profile: 'food' },
    ],
    features: {
      hasKitchenKDS: true,
    },
  },
  hardware: {
    id: 'hardware',
    name: 'Hardware, Sanitary & Paint Store',
    iconName: 'Wrench',
    module: 'minimart',
    description: 'Building materials, paints, plumbing, sanitary fittings, fasteners and tools',
    suggestedUnits: ['METER', 'FEET', 'KG', 'GALLON', 'QUARTER', 'BALTI', 'PCS'],
    suggestedSizes: ['Quarter (1L)', 'Gallon (4L)', 'Balti (16L)', '0.5 KG', '1.0 KG', 'Half Inch', 'One Inch'],
    defaultCategories: [
      { name: 'Paints, Distemper & Coatings', profile: 'hardware' },
      { name: 'Sanitary Fittings & Bathroom Pipes', profile: 'hardware' },
      { name: 'Fasteners, Screws & Nails', profile: 'hardware' },
      { name: 'Hand Tools & Power Equipment', profile: 'hardware' },
      { name: 'Locks, Handles & Security', profile: 'hardware' },
    ],
    features: {
      hasPipeDecimals: true,
      hasWeighingScale: true,
    },
  },
  electric: {
    id: 'electric',
    name: 'Electrical Store & Lighting',
    iconName: 'Zap',
    module: 'minimart',
    description: 'Electrical cables, switches, sockets, LED lights, breakers, conduits and appliances',
    suggestedUnits: ['COIL', 'METER', 'FEET', 'PCS', 'PACK', 'BOX'],
    suggestedSizes: ['1.5mm', '2.5mm', '7/29', '7/36', '7/44', '9W', '12W', '18W'],
    defaultCategories: [
      { name: 'Electrical Cables & Flexible Wires', profile: 'electric' },
      { name: 'Switches, Sockets & Face Plates', profile: 'electric' },
      { name: 'LED Lights, Bulbs & Panels', profile: 'electric' },
      { name: 'Circuit Breakers & DB Distribution Boxes', profile: 'electric' },
      { name: 'PVC Conduit Pipes & Fittings', profile: 'electric' },
      { name: 'Ceiling & Exhaust Fans', profile: 'electric' },
      { name: 'Extension Boards & Power Strips', profile: 'electric' },
    ],
    features: {
      hasPipeDecimals: true,
    },
  },
};
