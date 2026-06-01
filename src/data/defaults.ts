import skatesImg from "@/assets/skates1.jpg";
import helmetImg from "@/assets/helmet1.jpg";
import guardsImg from "@/assets/guards1.jpg";
import wheelsImg from "@/assets/wheels1.jpg";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  featured?: boolean;
};

export type Service = { id: string; title: string; description: string | null; icon: string | null };
export type Testimonial = { id: string; name: string; message: string; rating: number | null };

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "sample-skates", name: "Urban Pro Inline Skates", description: "Responsive city skates built for smooth Nairobi street rides.", price: 12500, image_url: skatesImg, category: "Skates", stock: 8 },
  { id: "sample-helmet", name: "Street Guard Helmet", description: "Lightweight protection with a secure fit for daily sessions.", price: 4200, image_url: helmetImg, category: "Helmets", stock: 12 },
  { id: "sample-guards", name: "Impact Wrist & Knee Guards", description: "Comfortable protection for beginners, commuters, and park riders.", price: 3500, image_url: guardsImg, category: "Guards", stock: 15 },
  { id: "sample-wheels", name: "Smooth Ride Wheel Set", description: "Durable replacement wheels for faster, cleaner rolling.", price: 5200, image_url: wheelsImg, category: "Wheels", stock: 10 },
];

export const DEFAULT_SERVICES: Service[] = [
  { id: "1", title: "Coaching & Lessons", description: "Beginner to pro — group and private skate lessons with certified instructors.", icon: null },
  { id: "2", title: "Premium Shop", description: "Skates, guards, helmets, wheels and accessories from top global brands.", icon: null },
  { id: "3", title: "Community Sessions", description: "Weekly meetups, skate-outs across Nairobi, and regular community events.", icon: null },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "sample-review-1", name: "Amani K.", message: "The coaching gave me confidence in one session. Main Sk8 feels like a shop, school, and family all at once.", rating: 5 },
  { id: "sample-review-2", name: "Brian M.", message: "They helped me choose the right skates and adjusted everything properly. Now my weekend rides feel completely different.", rating: 5 },
  { id: "sample-review-3", name: "Nia W.", message: "Our school program was organized, safe, and full of energy. The kids are still talking about it.", rating: 5 },
];

export const WHATSAPP_NUMBER = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WHATSAPP_NUMBER
  ? (import.meta as any).env.VITE_WHATSAPP_NUMBER
  : "254700000000";
