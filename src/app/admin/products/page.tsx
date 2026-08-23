'use client';

import Link from 'next/link';
import { useProductStore } from '@/store/productStore';

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProductStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="container flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold">Kloksie Admin</h1>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-300">← Back to Store</Link>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                Dashboard
              </Link>
              <Link href="/admin/products" className="block px-4 py-2 bg-black text-white rounded">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Products</h2>
                <Link href="/admin/products/new" className="btn-primary">
                  + Add Product
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No products yet</p>
                  <Link href="/admin/products/new" className="btn-primary">
                    Create First Product
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Image</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-left">Stock</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          </td>
                          <td className="px-4 py-3">{product.name}</td>
                          <td className="px-4 py-3">{product.category}</td>
                          <td className="px-4 py-3">${product.price}</td>
                          <td className="px-4 py-3">{product.stock}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.status === 'active' ? 'bg-green-100 text-green-800' :
                              product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${product.name}"?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
