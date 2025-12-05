
import React, { useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductDetail from '../components/ProductDetail';
import { CartProvider } from '../context/CartContext';
import Footer from '@/components/Footer';
import EmptyState from '@/components/ui/EmptyState';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

const Shirts = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const shirts: Product[] = [
    {
      id: 1,
      name: "Beige Serenity Shirt",
      price: 450000,
      image: "/imgs/IMG_8367.JPG",
      category: "Shirts",
      description: "Beige serenity_subtle, sleek, and endlessly refined"
    }
  ];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onCartOpen={() => setIsCartOpen(true)} />

        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-extralight mb-6 tracking-wide">Shirts</h1>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-32 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Essential foundations for the sophisticated wardrobe. Each shirt is crafted with precision and attention to detail.
              </p>
            </div>

            {Array.isArray(shirts) && shirts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {shirts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState label="shirts" />
            )}

          </div>
        </div>

        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <ProductDetail
          product={selectedProduct}
          isOpen={isProductDetailOpen}
          onClose={handleCloseProductDetail}
        />
      </div>
      <Footer />
    </CartProvider>
  );
};

export default Shirts;
