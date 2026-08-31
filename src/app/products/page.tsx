'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProductStore } from '@/store/productStore';

const categories = ['SHOES', 'SHIRTS', 'ACCESSORIES', 'PANTS', 'SHORTS', 'LONG SLEEVE', 'JACKETS'];

export default function ProductsPage() {
  const { products } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const activeProducts = products.filter((product) => product.status === 'active');
  const filteredProducts = selectedCategory === 'ALL'
    ? activeProducts
    : activeProducts.filter((product) => product.category?.toUpperCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">Kloksie</Link>
          <div className="flex gap-6 items-center">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/products" className="hover:text-gray-600">Shop</Link>
            <Link href="/admin" className="hover:text-gray-600 text-sm">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="container py-20">
        <h1 className="text-4xl font-bold mb-10">Our Collection</h1>

        <div className="flex flex-wrap gap-3 mb-12 border-b border-gray-200 pb-8">
          {['ALL', ...categories].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 text-sm font-medium border transition ${
                selectedCategory === category
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-600">
              No products available in {selectedCategory === 'ALL' ? 'the collection' : selectedCategory} yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="relative h-64 mb-4 bg-gray-100 rounded overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
