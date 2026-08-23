export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  status: 'active' | 'inactive' | 'draft';
}
