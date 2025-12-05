
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

const Collections = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const collections: Product[] = [];

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
              <h1 className="text-6xl font-extralight mb-6 tracking-wide">Collections</h1>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-32 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Curated collections for every occasion. Complete ensembles designed to make a lasting impression.
              </p>
            </div>

            {Array.isArray(collections) && collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {collections.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState label="collections" />
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

export default Collections;
