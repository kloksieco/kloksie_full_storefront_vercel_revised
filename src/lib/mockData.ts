import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Minimalist Vase',
    price: 89.99,
    description: 'A sleek minimalist vase with elegant curves. Perfect for modern interiors.',
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d782b?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578500494198-246f612d782b?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578500494198-246f612d782b?w=500&h=500&fit=crop',
    ],
    stock: 15,
    sku: 'VASE-001',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ceramic Bowl',
    price: 49.99,
    description: 'Handcrafted ceramic bowl with natural glazing.',
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop',
    ],
    stock: 25,
    sku: 'BOWL-001',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
