const MAP: Record<string, string> = {
  smartphones: 'Mobile Development',
  laptops: 'Computer Science',
  fragrances: 'Product Design',
  skincare: 'Health & Wellness',
  groceries: 'Food Science',
  furniture: 'Interior Design',
  tops: 'Fashion Design',
  'womens-dresses': 'Fashion Design',
  'womens-shoes': 'Footwear Design',
  'mens-shirts': 'Fashion Design',
  'mens-shoes': 'Footwear Design',
  'mens-watches': 'Product Engineering',
  'womens-watches': 'Product Design',
  'womens-bags': 'Accessories Design',
  sunglasses: 'Eyewear Design',
  automotive: 'Automotive Engineering',
  motorcycle: 'Mechanical Engineering',
  lighting: 'Electrical Engineering',
};

export function mapCategory(raw: string): string {
  return MAP[raw?.toLowerCase()] ?? raw;
}
