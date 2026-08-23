'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { mockProducts } from '@/lib/mockData';

export default function AdminPage() {
  const { products, setProducts, deleteProduct } = useProductStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load products on mount
    setProducts(mockProducts);
  }, [setProducts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple auth (in production, use proper backend authentication)
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="w-full btn-primary">
              Login
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">Demo password: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="container flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold">Kloksie Admin</h1>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-300">← Back to Store</Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="hover:text-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 bg-black text-white rounded">
                Dashboard
              </Link>
              <Link href="/admin/products" className="block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                Products
              </Link>
              <Link href="/admin/products/new" className="block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                Add Product
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded">
                  <p className="text-sm opacity-90">Total Products</p>
                  <p className="text-4xl font-bold">{products.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded">
                  <p className="text-sm opacity-90">Active Products</p>
                  <p className="text-4xl font-bold">{products.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded">
                  <p className="text-sm opacity-90">Total Stock</p>
                  <p className="text-4xl font-bold">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Recent Products</h3>
                  <Link href="/admin/products/new" className="btn-primary">
                    Add Product
                  </Link>
                </div>
                
                {products.length === 0 ? (
                  <p className="text-gray-600">No products yet. Create your first product!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Stock</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{product.name}</td>
                            <td className="px-4 py-2">${product.price}</td>
                            <td className="px-4 py-2">{product.stock}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                product.status === 'active' ? 'bg-green-100 text-green-800' :
                                product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:underline">
                                Edit
                              </Link>
                              {' | '}
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
