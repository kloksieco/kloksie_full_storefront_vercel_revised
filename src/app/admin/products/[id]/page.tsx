'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { Product } from '@/types/product';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, updateProduct } = useProductStore();
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'Decor',
    image: '',
    stock: 0,
    sku: '',
    status: 'active' as 'active' | 'inactive' | 'draft',
  });

  useEffect(() => {
    const productData = getProductById(params.id as string);
    if (productData) {
      setProduct(productData);
      setFormData({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        image: productData.image,
        stock: productData.stock,
        sku: productData.sku,
        status: productData.status as 'active' | 'inactive' | 'draft',
      });
    }
  }, [params.id, getProductById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      updateProduct(params.id as string, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link href="/admin/products" className="btn-primary">
            Back to Products
          </Link>
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
              <h2 className="text-3xl font-bold mb-8">Edit Product</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="Decor">Decor</option>
                      <option value="Art">Art</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                  />
                  {formData.image && (
                    <div className="mt-2 h-32 bg-gray-100 rounded overflow-hidden">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
                  <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <Link href="/admin/products" className="btn-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
