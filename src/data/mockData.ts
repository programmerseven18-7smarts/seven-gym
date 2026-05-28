// Seven Gym Management System - Mock Data

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipType: "Basic" | "Premium" | "VIP";
  membershipStatus: "active" | "expired" | "frozen";
  membershipStart: string;
  membershipEnd: string;
  points: number;
  referralCode: string;
  checkins: number;
  lastCheckin?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  joinDate: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialization: string[];
  rating: number;
  totalClients: number;
  activeClients: number;
  monthlyTarget: number;
  currentSessions: number;
  commission: number;
  status: "available" | "busy" | "off";
}

export interface GymClass {
  id: string;
  name: string;
  instructor: string;
  instructorId: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  waitlist: number;
  type: "yoga" | "cardio" | "strength" | "hiit" | "zumba" | "boxing";
  day: string;
  room: string;
}

export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  type: "class" | "pt";
  targetId: string;
  targetName: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  time: string;
  date: string;
  checkoutTime?: string;
}

export interface Product {
  id: string;
  name: string;
  category: "supplement" | "merchandise" | "beverage" | "equipment";
  price: number;
  stock: number;
  minStock: number;
  image: string;
  sku: string;
}

export interface Transaction {
  id: string;
  type: "membership" | "pt" | "product" | "class";
  memberId: string;
  memberName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: "cash" | "transfer" | "qris";
  date: string;
  status: "paid" | "pending" | "failed";
}

export interface Promo {
  id: string;
  name: string;
  description: string;
  discount: number;
  type: "percentage" | "fixed";
  validUntil: string;
  code: string;
  usageCount: number;
  maxUsage: number;
  status: "active" | "expired" | "upcoming";
}

export interface Notification {
  id: string;
  type: "reminder" | "promo" | "birthday" | "expiry";
  title: string;
  message: string;
  recipient: string;
  status: "sent" | "pending" | "failed";
  scheduledTime: string;
  channel: "whatsapp" | "email" | "push";
}

// Mock Members
export const members: Member[] = [
  {
    id: "M001",
    name: "Andi Wijaya",
    email: "andi@email.com",
    phone: "+62 813 1234 5678",
    avatar: "/images/user/user-02.jpg",
    membershipType: "Premium",
    membershipStatus: "active",
    membershipStart: "2024-01-15",
    membershipEnd: "2025-03-15",
    points: 2500,
    referralCode: "ANDI2024",
    checkins: 156,
    lastCheckin: "2025-01-20",
    weight: 75,
    height: 175,
    bmi: 24.5,
    joinDate: "2024-01-15",
  },
  {
    id: "M002",
    name: "Siti Rahayu",
    email: "siti@email.com",
    phone: "+62 815 2345 6789",
    avatar: "/images/user/user-04.jpg",
    membershipType: "VIP",
    membershipStatus: "active",
    membershipStart: "2023-06-01",
    membershipEnd: "2025-06-01",
    points: 5200,
    referralCode: "SITI2023",
    checkins: 312,
    lastCheckin: "2025-01-20",
    weight: 58,
    height: 165,
    bmi: 21.3,
    joinDate: "2023-06-01",
  },
  {
    id: "M003",
    name: "Bimo Satrio",
    email: "bimo@email.com",
    phone: "+62 817 3456 7890",
    avatar: "/images/user/user-05.jpg",
    membershipType: "Basic",
    membershipStatus: "expired",
    membershipStart: "2024-06-01",
    membershipEnd: "2024-12-01",
    points: 800,
    referralCode: "BIMO2024",
    checkins: 45,
    lastCheckin: "2024-11-28",
    weight: 82,
    height: 180,
    bmi: 25.3,
    joinDate: "2024-06-01",
  },
  {
    id: "M004",
    name: "Dewi Lestari",
    email: "dewi@email.com",
    phone: "+62 818 4567 8901",
    avatar: "/images/user/user-06.jpg",
    membershipType: "Premium",
    membershipStatus: "frozen",
    membershipStart: "2024-03-01",
    membershipEnd: "2025-03-01",
    points: 1800,
    referralCode: "DEWI2024",
    checkins: 89,
    lastCheckin: "2024-12-15",
    weight: 62,
    height: 160,
    bmi: 24.2,
    joinDate: "2024-03-01",
  },
  {
    id: "M005",
    name: "Reza Mahendra",
    email: "reza@email.com",
    phone: "+62 819 5678 9012",
    avatar: "/images/user/user-07.jpg",
    membershipType: "VIP",
    membershipStatus: "active",
    membershipStart: "2024-01-01",
    membershipEnd: "2026-01-01",
    points: 4100,
    referralCode: "REZA2024",
    checkins: 245,
    lastCheckin: "2025-01-20",
    weight: 78,
    height: 178,
    bmi: 24.6,
    joinDate: "2024-01-01",
  },
  {
    id: "M006",
    name: "Maya Sari",
    email: "maya@email.com",
    phone: "+62 812 6789 0123",
    avatar: "/images/user/user-08.jpg",
    membershipType: "Premium",
    membershipStatus: "active",
    membershipStart: "2024-08-01",
    membershipEnd: "2025-08-01",
    points: 1200,
    referralCode: "MAYA2024",
    checkins: 67,
    lastCheckin: "2025-01-19",
    weight: 55,
    height: 162,
    bmi: 21.0,
    joinDate: "2024-08-01",
  },
];

// Mock Trainers
export const trainers: Trainer[] = [
  {
    id: "T001",
    name: "Dimas Pratama",
    email: "dimas@sevengym.id",
    phone: "+62 815 9876 5432",
    avatar: "/images/user/user-03.jpg",
    specialization: ["Strength Training", "Bodybuilding"],
    rating: 4.9,
    totalClients: 45,
    activeClients: 12,
    monthlyTarget: 60,
    currentSessions: 48,
    commission: 4800000,
    status: "available",
  },
  {
    id: "T002",
    name: "Sarah Amelia",
    email: "sarah@sevengym.id",
    phone: "+62 816 8765 4321",
    avatar: "/images/user/user-09.jpg",
    specialization: ["Yoga", "Pilates", "Flexibility"],
    rating: 4.8,
    totalClients: 38,
    activeClients: 15,
    monthlyTarget: 50,
    currentSessions: 42,
    commission: 4200000,
    status: "busy",
  },
  {
    id: "T003",
    name: "Kevin Hartono",
    email: "kevin@sevengym.id",
    phone: "+62 817 7654 3210",
    avatar: "/images/user/user-10.jpg",
    specialization: ["HIIT", "Cardio", "Fat Loss"],
    rating: 4.7,
    totalClients: 52,
    activeClients: 18,
    monthlyTarget: 70,
    currentSessions: 65,
    commission: 6500000,
    status: "available",
  },
  {
    id: "T004",
    name: "Linda Kusuma",
    email: "linda@sevengym.id",
    phone: "+62 818 6543 2109",
    avatar: "/images/user/user-11.jpg",
    specialization: ["Zumba", "Dance Fitness", "Aerobics"],
    rating: 4.9,
    totalClients: 60,
    activeClients: 20,
    monthlyTarget: 55,
    currentSessions: 52,
    commission: 5200000,
    status: "available",
  },
];

// Mock Classes
export const gymClasses: GymClass[] = [
  {
    id: "C001",
    name: "Morning Yoga",
    instructor: "Sarah Amelia",
    instructorId: "T002",
    time: "06:00",
    duration: 60,
    capacity: 20,
    enrolled: 18,
    waitlist: 3,
    type: "yoga",
    day: "Monday",
    room: "Studio A",
  },
  {
    id: "C002",
    name: "HIIT Blast",
    instructor: "Kevin Hartono",
    instructorId: "T003",
    time: "07:30",
    duration: 45,
    capacity: 15,
    enrolled: 15,
    waitlist: 5,
    type: "hiit",
    day: "Monday",
    room: "Main Floor",
  },
  {
    id: "C003",
    name: "Zumba Party",
    instructor: "Linda Kusuma",
    instructorId: "T004",
    time: "18:00",
    duration: 60,
    capacity: 25,
    enrolled: 22,
    waitlist: 0,
    type: "zumba",
    day: "Monday",
    room: "Studio B",
  },
  {
    id: "C004",
    name: "Strength Foundations",
    instructor: "Dimas Pratama",
    instructorId: "T001",
    time: "08:00",
    duration: 60,
    capacity: 12,
    enrolled: 10,
    waitlist: 0,
    type: "strength",
    day: "Tuesday",
    room: "Weight Room",
  },
  {
    id: "C005",
    name: "Boxing Cardio",
    instructor: "Kevin Hartono",
    instructorId: "T003",
    time: "17:00",
    duration: 45,
    capacity: 15,
    enrolled: 14,
    waitlist: 2,
    type: "boxing",
    day: "Tuesday",
    room: "Studio A",
  },
  {
    id: "C006",
    name: "Evening Yoga",
    instructor: "Sarah Amelia",
    instructorId: "T002",
    time: "19:00",
    duration: 60,
    capacity: 20,
    enrolled: 16,
    waitlist: 0,
    type: "yoga",
    day: "Wednesday",
    room: "Studio A",
  },
];

// Mock Bookings
export const bookings: Booking[] = [
  {
    id: "B001",
    memberId: "M001",
    memberName: "Andi Wijaya",
    type: "class",
    targetId: "C001",
    targetName: "Morning Yoga",
    date: "2025-01-21",
    time: "06:00",
    status: "confirmed",
  },
  {
    id: "B002",
    memberId: "M002",
    memberName: "Siti Rahayu",
    type: "pt",
    targetId: "T001",
    targetName: "Dimas Pratama",
    date: "2025-01-21",
    time: "10:00",
    status: "confirmed",
  },
  {
    id: "B003",
    memberId: "M005",
    memberName: "Reza Mahendra",
    type: "class",
    targetId: "C002",
    targetName: "HIIT Blast",
    date: "2025-01-21",
    time: "07:30",
    status: "pending",
  },
  {
    id: "B004",
    memberId: "M006",
    memberName: "Maya Sari",
    type: "pt",
    targetId: "T002",
    targetName: "Sarah Amelia",
    date: "2025-01-22",
    time: "09:00",
    status: "confirmed",
  },
];

// Mock Check-ins
export const checkIns: CheckIn[] = [
  {
    id: "CI001",
    memberId: "M001",
    memberName: "Andi Wijaya",
    memberAvatar: "/images/user/user-02.jpg",
    time: "06:15",
    date: "2025-01-20",
    checkoutTime: "08:30",
  },
  {
    id: "CI002",
    memberId: "M002",
    memberName: "Siti Rahayu",
    memberAvatar: "/images/user/user-04.jpg",
    time: "07:00",
    date: "2025-01-20",
    checkoutTime: "09:15",
  },
  {
    id: "CI003",
    memberId: "M005",
    memberName: "Reza Mahendra",
    memberAvatar: "/images/user/user-07.jpg",
    time: "08:30",
    date: "2025-01-20",
  },
  {
    id: "CI004",
    memberId: "M006",
    memberName: "Maya Sari",
    memberAvatar: "/images/user/user-08.jpg",
    time: "09:00",
    date: "2025-01-20",
  },
];

// Mock Products
export const products: Product[] = [
  {
    id: "P001",
    name: "Whey Protein Gold Standard",
    category: "supplement",
    price: 850000,
    stock: 25,
    minStock: 10,
    image: "/images/product/product-01.jpg",
    sku: "SUP-WP-001",
  },
  {
    id: "P002",
    name: "BCAA Powder",
    category: "supplement",
    price: 450000,
    stock: 18,
    minStock: 8,
    image: "/images/product/product-02.jpg",
    sku: "SUP-BC-001",
  },
  {
    id: "P003",
    name: "Seven Gym T-Shirt",
    category: "merchandise",
    price: 150000,
    stock: 50,
    minStock: 15,
    image: "/images/product/product-03.jpg",
    sku: "MER-TS-001",
  },
  {
    id: "P004",
    name: "Protein Shake Ready",
    category: "beverage",
    price: 35000,
    stock: 5,
    minStock: 20,
    image: "/images/product/product-04.jpg",
    sku: "BEV-PS-001",
  },
  {
    id: "P005",
    name: "Gym Gloves Pro",
    category: "equipment",
    price: 175000,
    stock: 30,
    minStock: 10,
    image: "/images/product/product-05.jpg",
    sku: "EQP-GL-001",
  },
];

// Mock Transactions
export const transactions: Transaction[] = [
  {
    id: "TRX001",
    type: "membership",
    memberId: "M001",
    memberName: "Andi Wijaya",
    items: [{ name: "Premium Membership - 3 Months", qty: 1, price: 1500000 }],
    total: 1500000,
    paymentMethod: "transfer",
    date: "2025-01-15",
    status: "paid",
  },
  {
    id: "TRX002",
    type: "pt",
    memberId: "M002",
    memberName: "Siti Rahayu",
    items: [{ name: "PT Session - 10x", qty: 1, price: 2000000 }],
    total: 2000000,
    paymentMethod: "qris",
    date: "2025-01-18",
    status: "paid",
  },
  {
    id: "TRX003",
    type: "product",
    memberId: "M005",
    memberName: "Reza Mahendra",
    items: [
      { name: "Whey Protein Gold Standard", qty: 1, price: 850000 },
      { name: "BCAA Powder", qty: 1, price: 450000 },
    ],
    total: 1300000,
    paymentMethod: "cash",
    date: "2025-01-19",
    status: "paid",
  },
  {
    id: "TRX004",
    type: "membership",
    memberId: "M006",
    memberName: "Maya Sari",
    items: [{ name: "Premium Membership - 1 Year", qty: 1, price: 5000000 }],
    total: 5000000,
    paymentMethod: "transfer",
    date: "2025-01-20",
    status: "pending",
  },
];

// Mock Promos
export const promos: Promo[] = [
  {
    id: "PR001",
    name: "New Year Promo",
    description: "Diskon 20% untuk membership baru",
    discount: 20,
    type: "percentage",
    validUntil: "2025-01-31",
    code: "NEWYEAR25",
    usageCount: 45,
    maxUsage: 100,
    status: "active",
  },
  {
    id: "PR002",
    name: "Referral Bonus",
    description: "Gratis 1 bulan untuk setiap referral",
    discount: 500000,
    type: "fixed",
    validUntil: "2025-12-31",
    code: "REFER2025",
    usageCount: 23,
    maxUsage: 500,
    status: "active",
  },
  {
    id: "PR003",
    name: "Flash Sale PT",
    description: "Diskon 30% untuk paket PT",
    discount: 30,
    type: "percentage",
    validUntil: "2025-01-25",
    code: "FLASHPT",
    usageCount: 12,
    maxUsage: 20,
    status: "active",
  },
];

// Mock Notifications/Automations
export const notifications: Notification[] = [
  {
    id: "N001",
    type: "expiry",
    title: "Membership Expiry Reminder",
    message: "Membership Anda akan berakhir dalam 7 hari. Perpanjang sekarang!",
    recipient: "M003",
    status: "sent",
    scheduledTime: "2025-01-20 09:00",
    channel: "whatsapp",
  },
  {
    id: "N002",
    type: "reminder",
    title: "Workout Reminder",
    message: "Sudah waktunya gym! Jangan lupa latihan hari ini.",
    recipient: "all-members",
    status: "pending",
    scheduledTime: "2025-01-21 06:00",
    channel: "push",
  },
  {
    id: "N003",
    type: "promo",
    title: "Flash Sale Alert",
    message: "Flash Sale PT dimulai! Diskon 30% hanya hari ini.",
    recipient: "all-members",
    status: "sent",
    scheduledTime: "2025-01-20 10:00",
    channel: "whatsapp",
  },
];

// Membership packages for POS
export const membershipPackages = [
  { id: "MP001", name: "Basic - 1 Bulan", price: 300000, duration: 1 },
  { id: "MP002", name: "Basic - 3 Bulan", price: 800000, duration: 3 },
  { id: "MP003", name: "Premium - 1 Bulan", price: 500000, duration: 1 },
  { id: "MP004", name: "Premium - 3 Bulan", price: 1350000, duration: 3 },
  { id: "MP005", name: "Premium - 1 Tahun", price: 5000000, duration: 12 },
  { id: "MP006", name: "VIP - 1 Bulan", price: 800000, duration: 1 },
  { id: "MP007", name: "VIP - 1 Tahun", price: 8000000, duration: 12 },
];

// PT packages for POS
export const ptPackages = [
  { id: "PT001", name: "PT Session - 4x", price: 800000, sessions: 4 },
  { id: "PT002", name: "PT Session - 8x", price: 1500000, sessions: 8 },
  { id: "PT003", name: "PT Session - 12x", price: 2100000, sessions: 12 },
  { id: "PT004", name: "PT Session - 20x", price: 3200000, sessions: 20 },
];

// Dashboard stats
export const dashboardStats = {
  todayRevenue: 8500000,
  monthRevenue: 125000000,
  activeMembers: 342,
  totalMembers: 456,
  todayCheckins: 78,
  avgDailyCheckins: 85,
  classBookings: 45,
  ptSessions: 18,
  expiredMembers: 23,
  frozenMembers: 8,
};

// Rewards catalog
export const rewards = [
  { id: "R001", name: "Free Protein Shake", points: 500, stock: 50 },
  { id: "R002", name: "1 Free PT Session", points: 2000, stock: 20 },
  { id: "R003", name: "Seven Gym T-Shirt", points: 1500, stock: 30 },
  { id: "R004", name: "1 Month Extension", points: 5000, stock: 10 },
  { id: "R005", name: "Free Class Pass (5x)", points: 1000, stock: 25 },
];

// Challenges
export const challenges = [
  {
    id: "CH001",
    name: "January Warrior",
    description: "Check-in 20x dalam bulan Januari",
    target: 20,
    reward: 1000,
    participants: 156,
    endDate: "2025-01-31",
  },
  {
    id: "CH002",
    name: "Class Explorer",
    description: "Ikuti 5 kelas berbeda minggu ini",
    target: 5,
    reward: 500,
    participants: 89,
    endDate: "2025-01-26",
  },
  {
    id: "CH003",
    name: "Referral Master",
    description: "Ajak 3 teman bergabung",
    target: 3,
    reward: 2000,
    participants: 34,
    endDate: "2025-02-28",
  },
];

// Compatibility aliases for the generated prototype pages.
export const mockMembers = members.map((member) => ({
  id: member.id,
  name: member.name,
  email: member.email,
  phone: member.phone,
  avatar: member.avatar,
  membership: member.membershipType,
  membershipType: member.membershipType,
  status: member.membershipStatus,
  membershipStatus: member.membershipStatus,
  joinDate: member.joinDate,
  membershipEnd: member.membershipEnd,
  points: member.points,
  checkins: member.checkins,
  weight: member.weight,
  height: member.height,
  bmi: member.bmi,
}));

export const mockTrainers = [
  {
    id: "trainer-1",
    name: "Dimas Pratama",
    email: "dimas@sevengym.id",
    phone: "+62 815 9876 5432",
    avatar: "/images/user/user-03.jpg",
    status: "active" as const,
    specializations: ["Strength Training", "Bodybuilding", "Muscle Gain"],
    rating: 4.9,
    totalClients: 45,
    activeClients: 12,
    hourlyRate: 250000,
    monthlyTarget: 60,
    currentSessions: 48,
    commission: 4800000,
  },
  {
    id: "trainer-2",
    name: "Sarah Amelia",
    email: "sarah@sevengym.id",
    phone: "+62 816 8765 4321",
    avatar: "/images/user/user-09.jpg",
    status: "active" as const,
    specializations: ["Yoga", "Pilates", "Mobility"],
    rating: 4.8,
    totalClients: 38,
    activeClients: 15,
    hourlyRate: 220000,
    monthlyTarget: 50,
    currentSessions: 42,
    commission: 4200000,
  },
  {
    id: "trainer-3",
    name: "Kevin Hartono",
    email: "kevin@sevengym.id",
    phone: "+62 817 7654 3210",
    avatar: "/images/user/user-10.jpg",
    status: "on-leave" as const,
    specializations: ["HIIT", "Cardio", "Fat Loss"],
    rating: 4.7,
    totalClients: 52,
    activeClients: 18,
    hourlyRate: 230000,
    monthlyTarget: 70,
    currentSessions: 65,
    commission: 6500000,
  },
  {
    id: "trainer-4",
    name: "Linda Kusuma",
    email: "linda@sevengym.id",
    phone: "+62 818 6543 2109",
    avatar: "/images/user/user-11.jpg",
    status: "active" as const,
    specializations: ["Zumba", "Dance Fitness", "Aerobics"],
    rating: 4.9,
    totalClients: 60,
    activeClients: 20,
    hourlyRate: 210000,
    monthlyTarget: 55,
    currentSessions: 52,
    commission: 5200000,
  },
];

export const mockClasses = [
  {
    id: "class-1",
    name: "Morning Yoga",
    trainerId: "trainer-2",
    description: "Kelas mobilitas pagi untuk recovery, napas, dan fleksibilitas.",
    category: "flexibility",
    schedule: [
      { day: "Senin", time: "06:00" },
      { day: "Rabu", time: "06:00" },
      { day: "Jumat", time: "06:00" },
    ],
    currentParticipants: 18,
    maxParticipants: 20,
    duration: 60,
    status: "active" as const,
  },
  {
    id: "class-2",
    name: "HIIT Blast",
    trainerId: "trainer-3",
    description: "Sirkuit intensitas tinggi untuk fat loss dan conditioning.",
    category: "cardio",
    schedule: [
      { day: "Senin", time: "07:30" },
      { day: "Kamis", time: "18:30" },
    ],
    currentParticipants: 15,
    maxParticipants: 15,
    duration: 45,
    status: "full" as const,
  },
  {
    id: "class-3",
    name: "Strength Foundations",
    trainerId: "trainer-1",
    description: "Teknik dasar squat, deadlift, bench, dan progres beban aman.",
    category: "strength",
    schedule: [
      { day: "Selasa", time: "08:00" },
      { day: "Kamis", time: "08:00" },
    ],
    currentParticipants: 10,
    maxParticipants: 12,
    duration: 60,
    status: "active" as const,
  },
  {
    id: "class-4",
    name: "Boxing Cardio",
    trainerId: "trainer-3",
    description: "Pad work dan footwork ringan untuk stamina dan koordinasi.",
    category: "martial-arts",
    schedule: [
      { day: "Selasa", time: "17:00" },
      { day: "Sabtu", time: "09:00" },
    ],
    currentParticipants: 14,
    maxParticipants: 16,
    duration: 45,
    status: "active" as const,
  },
  {
    id: "class-5",
    name: "Zumba Party",
    trainerId: "trainer-4",
    description: "Dance cardio energik untuk member pemula sampai intermediate.",
    category: "dance",
    schedule: [
      { day: "Senin", time: "18:00" },
      { day: "Rabu", time: "18:00" },
    ],
    currentParticipants: 22,
    maxParticipants: 25,
    duration: 60,
    status: "active" as const,
  },
];

export const mockPTSessions = [
  {
    id: "session-1",
    trainerId: "trainer-1",
    memberId: "M001",
    memberName: "Andi Wijaya",
    date: "2026-05-26",
    time: "08:00",
    duration: 60,
    status: "scheduled" as const,
    focus: "Strength Training",
    notes: "Fokus teknik squat dan progres beban bertahap.",
  },
  {
    id: "session-2",
    trainerId: "trainer-1",
    memberId: "M002",
    memberName: "Siti Rahayu",
    date: "2026-05-26",
    time: "10:00",
    duration: 60,
    status: "completed" as const,
    focus: "Lower Body Hypertrophy",
    notes: "Volume latihan selesai, lanjut mobility cooldown.",
  },
  {
    id: "session-3",
    trainerId: "trainer-1",
    memberId: "M005",
    memberName: "Reza Mahendra",
    date: "2026-05-27",
    time: "17:00",
    duration: 45,
    status: "scheduled" as const,
    focus: "Push Day",
    notes: "Cek bahu kanan sebelum bench press.",
  },
  {
    id: "session-4",
    trainerId: "trainer-2",
    memberId: "M006",
    memberName: "Maya Sari",
    date: "2026-05-27",
    time: "09:00",
    duration: 60,
    status: "scheduled" as const,
    focus: "Mobility & Core",
    notes: "Prioritaskan breathing dan pelvic stability.",
  },
  {
    id: "session-5",
    trainerId: "trainer-3",
    memberId: "M004",
    memberName: "Dewi Lestari",
    date: "2026-05-25",
    time: "18:00",
    duration: 45,
    status: "cancelled" as const,
    focus: "Fat Loss Circuit",
    notes: "Member reschedule karena agenda kantor.",
  },
];

export const mockInventory = products.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category === "beverage" ? "consumable" : product.category,
  stock: product.stock,
  minStock: product.minStock,
  price: product.price,
  sku: product.sku,
  image: product.image,
}));

export const mockTransactions = [
  {
    id: "INV-2605-001",
    type: "membership" as const,
    memberName: "Andi Wijaya",
    description: "Premium Membership - 3 Bulan",
    amount: 1500000,
    status: "completed" as const,
    date: "2026-05-26",
  },
  {
    id: "INV-2605-002",
    type: "pt-session" as const,
    memberName: "Siti Rahayu",
    description: "Paket PT Session - 10x",
    amount: 2000000,
    status: "completed" as const,
    date: "2026-05-26",
  },
  {
    id: "INV-2605-003",
    type: "product" as const,
    memberName: "Reza Mahendra",
    description: "Whey Protein + BCAA Powder",
    amount: 1300000,
    status: "completed" as const,
    date: "2026-05-25",
  },
  {
    id: "INV-2605-004",
    type: "class" as const,
    memberName: "Maya Sari",
    description: "Class Pass - 5x",
    amount: 350000,
    status: "pending" as const,
    date: "2026-05-25",
  },
  {
    id: "INV-2605-005",
    type: "membership" as const,
    memberName: "Bimo Satrio",
    description: "Renewal Basic - 1 Bulan",
    amount: 300000,
    status: "failed" as const,
    date: "2026-05-24",
  },
];
