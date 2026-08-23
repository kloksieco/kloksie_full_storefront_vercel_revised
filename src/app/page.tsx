'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useProductStore } from '@/store/productStore';
import { mockProducts } from '@/lib/mockData';

export default function Home() {
  const { products, setProducts } = useProductStore();

  useEffect(() => {
    // Load mock products on first load
    setProducts(mockProducts);
  }, [setProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold">Kloksie</h1>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/products" className="hover:text-gray-600">Shop</Link>
            <Link href="/admin" className="hover:text-gray-600 text-sm">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-6xl font-bold mb-4">Kloksie</h2>
          <p className="text-2xl mb-8">Pieces with Presence</p>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover our curated collection of handcrafted pieces, each one designed 
            with intention and quality.
          </p>
          <Link href="/products" className="btn-primary">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 container">
        <h3 className="text-3xl font-bold mb-12">Featured Pieces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 3).map((product) => (
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
              <h4 className="text-lg font-semibold">{product.name}</h4>
              <p className="text-gray-600">${product.price}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container text-center">
          <p>&copy; 2024 Kloksie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
