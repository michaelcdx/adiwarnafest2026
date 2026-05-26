export interface MenuItem {
  name: string;
  price: string;
}

export interface Vendor {
  id: string;
  id_display?: string;
  name: string;
  description: string;
  floor: 'Ground' | '1st';
  x: number;
  y: number;
  isSpecial: boolean;
  reserved?: boolean;
  image: string;
  localImage?: string;
  tags?: string[];
  menu: MenuItem[];
}

const placeholderImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop";

export const vendorsData: Vendor[] = [
  // ── 1st Floor · Booths 1–20 ──────────────────────────────────────────────
  {
    id: 'B1',
    name: 'Dayleetaste',
    description: 'Craving authentic Korean comfort food? Dayleetaste brings the vibrant flavors of Seoul straight to your plate. From perfectly rolled, savory Kimbap and glassy Japchae noodles to hearty Bibimbap bowls, they serve up classic dishes made with love. Top off your meal with a refreshing, guilt-free Konjac Fruit Jelly!',
    floor: '1st',
    x: 31, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Kimbap', 'Japchae', 'Bibimbap', 'Konjac Fruit Jelly'],
    menu: [
      { name: 'Kimbap', price: 'RM 10.00' },
      { name: 'Japchae', price: 'RM 12.00' },
      { name: 'Bibimbap', price: 'RM 14.00' },
      { name: 'Konjac Fruit Jelly', price: 'RM 5.00' },
    ]
  },
  {
    id: 'B2',
    name: 'Base patisserie',
    description: 'Calling all tea connoisseurs and chocolate purists! Base patisserie specializes in intensely rich premium treats. Indulge in their signature kaw-kaw (extra thick) cake series featuring deeply aromatic Matcha, Hojicha, and Genmaicha profiles. Don\'t miss their velvety Nama Chocolate (71% dark) — a decadent, melt-in-your-mouth experience.',
    floor: '1st',
    x: 34, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Matcha kaw-kaw cake', 'Hojicha kaw-kaw cake', 'Genmaicha kaw-kaw cake', 'Nama chocolate 71% dark'],
    menu: [
      { name: 'Matcha kaw-kaw cake', price: 'RM 18.00' },
      { name: 'Hojicha kaw-kaw cake', price: 'RM 18.00' },
      { name: 'Genmaicha kaw-kaw cake', price: 'RM 18.00' },
      { name: 'Nama chocolate 71% dark', price: 'RM 22.00' },
    ]
  },
  {
    id: 'B3',
    name: 'Dodo Cookies',
    description: 'Indulge in rich, freshly baked treats at Dodo Cookies. From soft chewy bites to decadent brownies, this booth is the perfect stop for dessert lovers looking for something sweet and satisfying.',
    floor: '1st',
    x: 39, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Cookies', 'Brownies', 'Dubai Chewy Cookie'],
    menu: [
      { name: 'Cookies', price: '—' },
      { name: 'Brownies', price: '—' },
      { name: 'Dubai Chewy Cookie', price: '—' },
    ]
  },
  {
    id: 'B4',
    name: 'Southern SVD Resources',
    description: 'Looking for the ultimate crunch? Southern SVD Resources has your snack cravings completely covered. They bring a spectacular crunch lineup featuring a premium Murukku collection, savory Mixture series, and uniquely crispy banana tapioca chips — perfect high-quality snacks to share (or keep all to yourself)!',
    floor: '1st',
    x: 42, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Mixture Series', 'Special snacks', 'Premium Murukku collection', 'Banana tapioca chips variety', 'Peanut special'],
    menu: [
      { name: 'Premium Murukku Collection', price: 'RM 12.00' },
      { name: 'Mixture Series Pack', price: 'RM 10.00' },
      { name: 'Banana Tapioca Chips', price: 'RM 8.00' },
      { name: 'Peanut Special', price: 'RM 9.00' },
    ]
  },
  {
    id: 'B5',
    name: 'H&F Luxe',
    description: 'Where indulgence meets wholesome freshness. H&F Luxe offers a beautifully balanced menu. Treat yourself to the intricate, rich flavors of traditional Sarawak Layer Cake, or keep it light with crisp healthy sandwiches and fresh fruit. Pair your choice with their signature, ultra-refreshing Fresh Watermelon Juice infused with cool mint leaves.',
    floor: '1st',
    x: 47, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Sarawak Layer Cake', 'Cumin Milk Biscuits', 'Fresh Watermelon Juice with Mint leaves', 'Fresh fruit', 'Healthy sandwich'],
    menu: [
      { name: 'Sarawak Layer Cake', price: 'RM 15.00' },
      { name: 'Cumin Milk Biscuits', price: 'RM 10.00' },
      { name: 'Fresh Watermelon Juice w/ Mint', price: 'RM 9.00' },
      { name: 'Healthy Sandwich', price: 'RM 12.00' },
    ]
  },
  {
    id: 'B6',
    name: 'Sweet Tooth',
    description: 'Satisfy your cravings instantly at Sweet Tooth! True to its name, this booth serves up pure happiness in the form of fudgy, decadent brownies and thick, gooey soft-baked cookies. Whether you are a classic Chocochip lover or a vibrant Matcha enthusiast, these freshly baked delights are impossible to resist.',
    floor: '1st',
    x: 50, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Brownies', 'Chocochip soft cookies', 'Matcha soft cookies'],
    menu: [
      { name: 'Brownies (Slice)', price: 'RM 8.00' },
      { name: 'Chocochip Soft Cookies', price: 'RM 6.00' },
      { name: 'Matcha Soft Cookies', price: 'RM 6.00' },
      { name: 'Cookie Combo Box', price: 'RM 22.00' },
    ]
  },
  {
    id: 'B7',
    name: 'Sweety23',
    description: 'Treat yourself to an elegant fusion of modern and traditional desserts at Sweety23. Dive into their cloud-like, chewy Strawberry Daifuku, indulge in a rich caramelized slice of Burnt Cheesecake, or cool down with premium Gelato. A dreamy dessert escape you won\'t want to skip.',
    floor: '1st',
    x: 55, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Strawberry daifuku', 'Burnt cheesecake', 'Matcha', 'Gelato'],
    menu: [
      { name: 'Strawberry Daifuku', price: 'RM 8.00' },
      { name: 'Burnt Cheesecake (Slice)', price: 'RM 14.00' },
      { name: 'Matcha Dessert', price: 'RM 10.00' },
      { name: 'Gelato (Single Scoop)', price: 'RM 9.00' },
    ]
  },
  {
    id: 'B8',
    name: 'Bakso Bos',
    description: 'Ready for a bold flavor explosion? Bakso Bos brings the authentic, fiery street food culture of Indonesia straight to the venue. From savory grilled Bakso bakar and iconic Ayam penyet to comforting street eats like Siomay, Batagor, and Cilok — every dish is packed with traditional spices.',
    floor: '1st',
    x: 58, y: 62,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 8.jpg',
    tags: ['Bakso bakar', 'Ayam bakar', 'Ayam penyet', 'Nasi bakar', 'Nasi ambeng', 'Siomay', 'Batagor', 'Tahu bakso', 'Cilok', 'Minuman Indonesia'],
    menu: [
      { name: 'Bakso Bakar', price: 'RM 8.00' },
      { name: 'Ayam Penyet', price: 'RM 14.00' },
      { name: 'Siomay / Batagor', price: 'RM 10.00' },
      { name: 'Nasi Ambeng', price: 'RM 15.00' },
      { name: 'Minuman Indonesia', price: 'RM 5.00' },
    ]
  },
  {
    id: 'B9',
    name: 'Very Nutty',
    description: 'Go absolutely wild for snacks at Very Nutty! Perfect for quick energy or a crunchy dynamic bite, this booth offers a premium, flavorful variety of nutty treats that pack a delicious, wholesome punch.',
    floor: '1st',
    x: 63, y: 62,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Nuts', 'Wholesome Snacks', 'Premium Bites'],
    menu: [
      { name: 'Signature Nutty Mix', price: 'RM 12.00' },
      { name: 'Premium Nut Pack', price: 'RM 20.00' },
    ]
  },
  {
    id: 'B10',
    name: 'Artbead',
    description: 'Add a pop of personality to your style at Artbead! Specializing in beautiful, intricately crafted bead accessories, this booth features unique handmade pieces that make the perfect statement or a thoughtful gift for someone special.',
    floor: '1st',
    x: 66, y: 62,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 10.jpg',
    tags: ['Beads accessories'],
    menu: [
      { name: 'Beaded Bracelet', price: 'RM 18.00' },
      { name: 'Beaded Necklace', price: 'RM 35.00' },
      { name: 'Beaded Earrings (Pair)', price: 'RM 22.00' },
    ]
  },
  {
    id: 'B11',
    name: 'Yingfin',
    description: 'Discover something truly unique at Yingfin. Stop by to explore their custom curation, chat with the friendly creators, and pick up a special treat or item to brighten your day.',
    floor: '1st',
    x: 64, y: 48,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Specialty Items', 'Artisan', 'Unique Finds'],
    menu: [
      { name: 'Signature Item', price: 'RM 25.00' },
    ]
  },
  {
    id: 'B12',
    name: 'Passion Fruit',
    description: 'Beat the heat and revitalize your body at Passion Fruit. Specializing in classic, time-tested coolers, they serve up deeply soothing Luohan Guo herbal tea and icy, refreshing Aiyu Jelly Ice — the ultimate hydrating pitstop to cool down and refresh your palate.',
    floor: '1st',
    x: 61, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 12.jpg',
    tags: ['罗汉果凉水', '爱玉冰'],
    menu: [
      { name: '罗汉果凉水 (Luohan Guo Tea)', price: 'RM 6.00' },
      { name: '爱玉冰 (Aiyu Jelly Ice)', price: 'RM 7.00' },
    ]
  },
  {
    id: 'B13',
    name: 'Tea Amore',
    description: 'Sip on liquid happiness at Tea Amore! Whether you are looking for the calm, earthy bliss of premium Matcha or the vibrant, effervescent pop of a Sparkling Fruity Drink, they craft the perfect refreshing beverage to elevate your day.',
    floor: '1st',
    x: 56, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 13.jpg',
    tags: ['Matcha', 'Sparkling fruity drinks'],
    menu: [
      { name: 'Matcha (Hot / Iced)', price: 'RM 10.00' },
      { name: 'Sparkling Fruity Drink', price: 'RM 9.00' },
    ]
  },
  {
    id: 'B14',
    name: 'Simpulan Crochet',
    description: 'Experience the charm of slow, intentional craftsmanship at Simpulan Crochet. Every single item is lovingly handmade — adorable plushie dolls, vibrant everlasting crochet flowers, stylish bags, and whimsical keychains. Bring home a stitched piece of cozy art.',
    floor: '1st',
    x: 53, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 14.jpg',
    tags: ['Bag handmade', 'Keychain', 'Plushie doll', 'Flower', 'Accessories'],
    menu: [
      { name: 'Crochet Keychain', price: 'RM 10.00' },
      { name: 'Plushie Doll', price: 'RM 35.00' },
      { name: 'Handmade Bag', price: 'RM 55.00' },
      { name: 'Crochet Flower', price: 'RM 15.00' },
    ]
  },
  {
    id: 'B15',
    name: '吃飯糰 and Celebrate Dessert',
    description: 'Two amazing concepts come together in one massive double-booth! Fuel up with hearty, comforting, traditionally wrapped rice balls from 吃飯糰, then head right over to Celebrate Dessert to treat yourself to an exquisite celebratory sweet finish. The perfect savory-and-sweet tag team!',
    floor: '1st',
    x: 48, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 15-16.jpg',
    tags: ['Rice Balls', 'Celebration Desserts', 'Double Booth'],
    menu: [
      { name: 'Classic Rice Ball', price: 'RM 6.00' },
      { name: 'Celebration Dessert', price: 'RM 10.00' },
    ]
  },
  {
    id: 'B16',
    name: '吃飯糰 and Celebrate Dessert',
    description: 'Two amazing concepts come together in one massive double-booth! Fuel up with hearty, comforting, traditionally wrapped rice balls from 吃飯糰, then head right over to Celebrate Dessert to treat yourself to an exquisite celebratory sweet finish. The perfect savory-and-sweet tag team!',
    floor: '1st',
    x: 45, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 15-16.jpg',
    tags: ['Rice Balls', 'Celebration Desserts', 'Double Booth'],
    menu: [
      { name: 'Classic Rice Ball', price: 'RM 6.00' },
      { name: 'Celebration Dessert', price: 'RM 10.00' },
    ]
  },
  {
    id: 'B17',
    name: 'Cidayu Craft',
    description: 'Level up your everyday aesthetic with Cidayu Craft. This booth is a treasure trove of adorable, trendy accessories — from quirky enamel pins and stylish phone chains to gorgeous desktop decorations and hair pieces. Guaranteed to find the perfect charm to express your unique style.',
    floor: '1st',
    x: 40, y: 48,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Keychains', 'Decoration for desktops', 'Hair accessories', 'Phone chain', 'Enamel pins', 'Women accessories'],
    menu: [
      { name: 'Enamel Pin', price: 'RM 12.00' },
      { name: 'Phone Chain', price: 'RM 15.00' },
      { name: 'Hair Accessory', price: 'RM 10.00' },
      { name: 'Desktop Decoration', price: 'RM 25.00' },
    ]
  },
  {
    id: 'B18',
    name: 'Baked by Meowparent',
    description: 'Whipping up comfort food with a playful touch, Baked by Meowparent delivers delicious contrast. Dive into their rich, ultra-indulgent Moist Cake, or switch gears with a bold, tangy plate of fresh, crisp Rojak Buah tossed in a savory local sauce.',
    floor: '1st',
    x: 37, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 18.jpg',
    tags: ['Moist cake', 'Rojak buah'],
    menu: [
      { name: 'Moist Cake (Slice)', price: 'RM 12.00' },
      { name: 'Rojak Buah', price: 'RM 8.00' },
      { name: 'Whole Moist Cake', price: 'RM 45.00' },
    ]
  },
  {
    id: 'B19',
    name: 'KY Mochi',
    description: 'Prepare for a viral dessert sensation at KY Mochi x Bakeyin collab! Renowned for their crowd-pleasing treats, they feature pillow-soft Daifuku Mochi (Xue Mei Niang) and crisp, cream-filled Puffs. Don\'t miss their sensational Dubai Chocolate Mochi or their stunning 3-inch mini cakes in vibrant fruity and premium tea flavors.',
    floor: '1st',
    x: 32, y: 48,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Daifuku Mochi', 'Xue Mei Niang', 'Dubai Chocolate Mochi', 'Cream Puffs', 'Mini Cakes'],
    menu: [
      { name: 'Daifuku Mochi / Xue Mei Niang', price: 'RM 6.00' },
      { name: 'Dubai Chocolate Mochi', price: 'RM 9.00' },
      { name: 'Cream Puff', price: 'RM 7.00' },
      { name: '3-inch Mini Cake', price: 'RM 35.00' },
    ]
  },
  {
    id: 'B20',
    name: 'Face Painting & Henna by Sya',
    description: 'Wear your art on your face! Beautiful, temporary body art created by Sya. Whether you want a fun, vibrant face painting look to celebrate the festive campus vibes or an elegant, intricately detailed traditional Henna design, Sya transforms your vision into a gorgeous reality.',
    floor: '1st',
    x: 29, y: 48,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/FirstFloor/Booth 20.jpg',
    tags: ['Face painting'],
    menu: [
      { name: 'Simple Face Paint Design', price: 'RM 15.00' },
      { name: 'Full Face Paint Design', price: 'RM 30.00' },
      { name: 'Henna (Small, Wrist)', price: 'RM 20.00' },
      { name: 'Henna (Full Hand)', price: 'RM 45.00' },
    ]
  },

  // ── Ground Floor · Booths 21–32 ──────────────────────────────────────────
  {
    id: 'B21',
    name: 'Mamamiiya',
    description: 'Elevate your dessert game with the luxurious, trendy bakes at Mamamiiya. Famous for their rich Dubai Chewy Cookies and decadent Tiramisu, they also craft pillow-soft Cream Cheese Mochi Balls and an intensely rich Dark Burnt Cheesecake that will leave you completely spellbound.',
    floor: 'Ground',
    x: 51, y: 75,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 21.jpg',
    tags: ['Dubai chewy cookies', 'Cream cheese mochi ball', 'Dark chocolate crisp oat', 'Tiramisu', 'Burnt cheese cake'],
    menu: [
      { name: 'Dubai Chewy Cookies', price: 'RM 12.00' },
      { name: 'Cream Cheese Mochi Ball', price: 'RM 8.00' },
      { name: 'Tiramisu', price: 'RM 15.00' },
      { name: 'Dark Burnt Cheesecake', price: 'RM 14.00' },
    ]
  },
  {
    id: 'B22',
    name: 'Micimatcha',
    description: 'Micimatcha seamlessly bridges the gap between premium Japanese tea culture and comforting Indonesian heritage flavors. Sip through an inventive menu of specialty Matcha drinks infused with Sea Salt, Rose, or Earl Grey. Pair your drink with sweet local classics like Dadar gulung and Pisang cokelat, or fill up on a hearty plate of savory Nasi kuning!',
    floor: 'Ground',
    x: 52, y: 63,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 22.jpg',
    tags: ['Matcha strawberry', 'Matcha latte', 'Matcha earl grey', 'Matcha seasalt', 'Rose matcha', 'Dadar gulung', 'Pisang cokelat', 'Nasi kuning'],
    menu: [
      { name: 'Matcha Latte / Strawberry', price: 'RM 12.00' },
      { name: 'Matcha Earl Grey / Sea Salt', price: 'RM 12.00' },
      { name: 'Rose Matcha', price: 'RM 13.00' },
      { name: 'Nasi Kuning', price: 'RM 10.00' },
      { name: 'Dadar Gulung / Pisang Cokelat', price: 'RM 5.00' },
    ]
  },
  {
    id: 'B23',
    name: 'Creamme',
    description: 'Light, airy, and beautifully delicate, Creamme is a soft dessert dream come true. Specializing in elegant multi-layered Mille Crepe Cakes and convenient Cakes-in-a-Cup, they also offer a premium textural lineup of gourmet mochi treats — from silky Snow Mochi to indulgent Cream Cheese Daifuku.',
    floor: 'Ground',
    x: 52, y: 46,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 23.jpg',
    tags: ['Cake in cup', 'Mille crepe cake', 'Snow mochi', 'Cream cheese mochi', 'Daifuku mochi'],
    menu: [
      { name: 'Cake in Cup', price: 'RM 12.00' },
      { name: 'Mille Crepe Cake (Slice)', price: 'RM 16.00' },
      { name: 'Snow Mochi', price: 'RM 6.00' },
      { name: 'Cream Cheese Daifuku', price: 'RM 7.00' },
    ]
  },
  {
    id: 'B24',
    name: 'Gracia Fortune Enterprise',
    description: 'Gracia Fortune Enterprise brings a powerhouse menu packed with bold, savory meals and satisfying finger foods. Get your protein fix with aromatic Nasi ayam berempah, tender Dendeng sapi, or fire up your palate with spicy Oseng mercon sapi. Save room for their savory Risol ham mayo or indulgent cream puffs!',
    floor: 'Ground',
    x: 55, y: 46,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Nasi ayam berempah, telor sambal', 'Dendeng sapi', 'Oseng mercon sapi', 'Potatoes crispy', 'Crispy kriuk', 'Risol ham mayo', 'Loh bak chicken', 'Lumpia sayur', 'Brownies', 'Creamy puff'],
    menu: [
      { name: 'Nasi Ayam Berempah', price: 'RM 12.00' },
      { name: 'Dendeng Sapi', price: 'RM 14.00' },
      { name: 'Oseng Mercon Sapi', price: 'RM 14.00' },
      { name: 'Risol Ham Mayo', price: 'RM 5.00' },
      { name: 'Creamy Puff', price: 'RM 6.00' },
    ]
  },
  {
    id: 'B25',
    name: 'Taufufah Sejuk Kanada Shop',
    description: 'Keep things smooth, classic, and completely refreshing with Taufufah Sejuk Kanada Shop. Specializing in the silkiest chilled Taufufa (Taufufa sejuk), it is the ultimate velvety treat to soothe your palate. Pair it with a cold, pure bottle of fresh Soya Milk for a nostalgic, healthy refreshment.',
    floor: 'Ground',
    x: 60, y: 46,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 25.jpg',
    tags: ['Taufufa sejuk', 'Air soya'],
    menu: [
      { name: 'Taufufa Sejuk', price: 'RM 7.00' },
      { name: 'Air Soya', price: 'RM 5.00' },
    ]
  },
  {
    id: 'B26',
    name: 'Gummy Ape',
    description: 'Unchain your inner child at Gummy Ape! A paradise of chewy, fruity, colorful goodness, this booth is fully loaded with an impressive assortment of premium gummy candies. Mix, match, and bag up your favorites for a fun, sweet treat to chew on while you explore the event.',
    floor: 'Ground',
    x: 63, y: 46,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 26.jpg',
    tags: ['Gummy'],
    menu: [
      { name: 'Gummy Mix Bag (Small)', price: 'RM 8.00' },
      { name: 'Gummy Mix Bag (Large)', price: 'RM 15.00' },
    ]
  },
  {
    id: 'B27',
    name: 'Stacie Collection',
    description: 'Step up your style game with Stacie Collection. Bringing a carefully curated selection of trendy fashion items, gorgeous statement pieces, and lifestyle accessories, this boutique booth is a must-visit for anyone looking to refresh their wardrobe with unique finds.',
    floor: 'Ground',
    x: 68, y: 46,
    isSpecial: false,
    image: placeholderImage,
    tags: ['Fashion', 'Accessories', 'Lifestyle', 'Statement Pieces'],
    menu: [
      { name: 'Fashion Accessory', price: 'RM 25.00' },
      { name: 'Statement Piece', price: 'RM 45.00' },
    ]
  },
  {
    id: 'B28',
    name: 'Honey CC',
    description: 'Experience nature\'s finest sweetness at Honey CC. Specializing in delightfully sweet creations and refreshing treats, this booth brings a smooth, natural buzz to the festival floor that will hit the spot perfectly.',
    floor: 'Ground',
    x: 71, y: 46,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 28.jpg',
    tags: ['Honey', 'Natural Treats', 'Sweet Creations'],
    menu: [
      { name: 'Honey Creation', price: 'RM 12.00' },
    ]
  },
  {
    id: 'B29',
    name: 'Paste and Bake',
    description: 'Paste and Bake takes your palate on a high-end gastronomic journey. They specialize in sophisticated, artisan-crafted flavor profiles — from earthy Kuki Black Sesame and Premium Kagoshima Matcha, to vibrant citrusy infusions like Lychee Yuzu and Coconut Lime. Every bite is a masterclass in culinary balance.',
    floor: 'Ground',
    x: 54, y: 56,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 29.jpg',
    tags: ['Tie guan yin', 'Mango lime', 'Coconut lime', 'Premium kagoshima matcha', 'Hikari roasted japanese rice', 'Kuki black sesame', 'Sicilian pistachio', 'Lychee yuzu', 'Salted caramel', 'Madagascar vanilla'],
    menu: [
      { name: 'Premium Kagoshima Matcha', price: 'RM 15.00' },
      { name: 'Kuki Black Sesame', price: 'RM 15.00' },
      { name: 'Lychee Yuzu', price: 'RM 15.00' },
      { name: 'Salted Caramel', price: 'RM 15.00' },
      { name: 'Madagascar Vanilla', price: 'RM 15.00' },
    ]
  },
  {
    id: 'B30',
    id_display: 'Anytime Fitness',
    name: 'Anytime Fitness',
    description: 'Take care of your body at the Anytime Fitness booth! Perfect for the health-conscious explorer, stop by to find clean fuel, active living inspiration, or nutritious snack options designed to keep your energy high and your lifestyle vibrant.',
    floor: 'Ground',
    x: 62, y: 56,
    isSpecial: true,
    image: '/Anytime_fitness_logo.jpeg',
    localImage: '/Anytime_fitness_logo.jpeg',
    tags: ['Health', 'Fitness', 'Active Living'],
    menu: [
      { name: 'Visit for Details', price: '—' },
    ]
  },
  {
    id: 'B31',
    name: 'Jajan Yuk',
    description: 'Jajan Yuk brings the ultimate, comforting joy of Indonesian night markets right to the ground floor! Feast on addictive freshly swirled telur gulung (egg rolls), hearty sosis telur, seasoned Kentang bumbu fries, and sweet creamy Jasuke. Street food perfection in every bite!',
    floor: 'Ground',
    x: 69, y: 56,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 31.jpg',
    tags: ['Telur gulung', 'Sosis telur', 'Kentang bumbu', 'Jasuke'],
    menu: [
      { name: 'Telur Gulung', price: 'RM 5.00' },
      { name: 'Sosis Telur', price: 'RM 6.00' },
      { name: 'Kentang Bumbu', price: 'RM 7.00' },
      { name: 'Jasuke', price: 'RM 7.00' },
    ]
  },
  {
    id: 'B32',
    name: 'Nice Tea',
    description: 'There is always time for a truly Nice Tea! Quench your thirst with their vibrant, crisp Fresh Fruit Tea series, or indulge in the velvety, smooth comfort of their Fresh Milk Tea series. Want to double down on luxury? Pair your premium brew with a rich, decadent slice of their signature Tiramisu.',
    floor: 'Ground',
    x: 63, y: 75,
    isSpecial: false,
    image: placeholderImage,
    localImage: '/VendorBooth/GroundFloor/Booth 32.jpg',
    tags: ['Fresh fruit tea series', 'Fresh milk tea series', 'Tiramisu'],
    menu: [
      { name: 'Fresh Fruit Tea', price: 'RM 10.00' },
      { name: 'Fresh Milk Tea', price: 'RM 11.00' },
      { name: 'Tiramisu', price: 'RM 14.00' },
    ]
  },

  // ── Special ───────────────────────────────────────────────────────────────
  {
    id: 'GADPA',
    id_display: 'GADPA BOOTH',
    name: 'GADPA Official Booth',
    description: 'Visit the official festival hub for refreshing treats and event access essentials!',
    floor: '1st',
    x: 72, y: 48,
    isSpecial: true,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
    tags: ['Nutrisari', 'Sugar Donuts', 'Simfoni Tickets'],
    menu: [
      { name: 'Nutrisari', price: 'RM 5.00' },
      { name: 'Sugar Donuts', price: 'RM 4.00' },
      { name: 'Simfoni Tickets', price: '—' },
    ]
  }
];
