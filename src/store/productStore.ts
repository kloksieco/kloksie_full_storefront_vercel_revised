import { create } from 'zustand';
import { Product } from '@/types/product';

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  
  setProducts: (products) => set({ products }),
  
  addProduct: (product) => 
    set((state) => ({ 
      products: [...state.products, product] 
    })),
  
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  
  getProductById: (id) => {
    const state = get();
    return state.products.find((p) => p.id === id);
  },
}));
