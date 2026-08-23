'use client';

import Link from 'next/link';
import { useProductStore } from '@/store/productStore';

export default function ProductsPage() {
  const { products } = useProductStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">Kloksie</Link>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/products" className="hover:text-gray-600">Shop</Link>
            <Link href="/admin" className="hover:text-gray-600 text-sm">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Products Grid */}
      <div className="container py-20">
        <h1 className="text-4xl font-bold mb-12">Our Collection</h1>
        
        {products.length === 0 ? (
          <p className="text-gray-600">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.filter(p => p.status === 'active').map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="relative h-64 mb-4 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
