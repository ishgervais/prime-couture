
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

const Suits = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const suits: Product[] = [
    // {
    //   id: 1,
    //   name: "Ivory Luxe Suit",
    //   price: 450000,
    //   image: "/imgs/IMG_6136.JPG",
    //   category: "Suits",
    //   description: "Elegant ivory suit tailored for distinguished occasions and summer elegance."
    // },
    {
      id: 2,
      name: "Double-Breasted Cream Ensemble",
      price: 450000,
      image: "/imgs/IMG_6138.JPG",
      category: "Suits",
      description: "Cream double-breasted suit with refined lapels and tailored fit for standout formal looks."
    },
    // {
    //   id: 3,
    //   name: "Royal Blue Trim Set",
    //   price: 450000,
    //   image: "/imgs/IMG_6143.JPG",
    //   category: "Suits",
    //   description: "Deep blue suit accented with rich trim. Made for evening prestige and bold statements."
    // },
    {
      id: 4,
      name: "Navy Modern Cut Suit",
      price: 450000,
      image: "/imgs/IMG_6144.JPG",
      category: "Suits",
      description: "Structured navy suit crafted for business class and formal elegance."
    },
    // {
    //   id: 5,
    //   name: "Olive Gentleman’s Choice",
    //   price: 450000,
    //   image: "/imgs/IMG_6261.JPG",
    //   category: "Suits",
    //   description: "Earth-toned olive suit perfect for blending tradition with modern design."
    // },
    {
      id: 6,
      name: "Amber Classic Blazer",
      price: 450000,
      image: "/imgs/IMG_6276.JPG",
      category: "Blazers",
      description: "A timeless amber brown blazer that brings warmth and heritage to your wardrobe."
    },
    {
      id: 7,
      name: "Monochrome Couple Set",
      price: 450000,
      image: "/imgs/IMG_6408.JPG",
      category: "Formal",
      description: "His & Hers matching formalwear—luxury black & white pieces for weddings and galas."
    },
    {
      id: 8,
      name: "Navy Safari Suit",
      price: 450000,
      image: "/imgs/IMG_8363.JPG",
      category: "Formal",
      description: "Navy precision, structured safari elegance with sculpted chest pockets."
    },
    {
      id: 9,
      name: "Crimson Velvet Suit",
      price: 450000,
      image: "/imgs/IMG_6461.JPG",
      category: "Suits",
      description: "Crimson velvet suit designed for high-end events and powerful style statements."
    },
    // {
    //   id: 10,
    //   name: "Garden Green Two-Piece",
    //   price: 450000,
    //   image: "/imgs/IMG_6828.JPG",
    //   category: "Suits",
    //   description: "Fresh green suit set inspired by nature. Lightweight and luxurious."
    // },
    {
      id: 11,
      name: "Classic Beige Formalwear",
      price: 450000,
      image: "/imgs/IMG_6830.JPG",
      category: "Suits",
      description: "Subtle beige two-piece with modern cut. Ideal for day weddings or boardroom elegance."
    },
    // {
    //   id: 12,
    //   name: "Palm Green Outfit",
    //   price: 450000,
    //   image: "/imgs/IMG_6831.JPG",
    //   category: "Suits",
    //   description: "Leaf-inspired green suit for tropical class with Rwandan design roots."
    // },
    {
      id: 13,
      name: "Textured Cream Suit",
      price: 450000,
      image: "/imgs/IMG_6833.JPG",
      category: "Suits",
      description: "A refined cream suit with subtle texture for soft luxury statements."
    },
    // {
    //   id: 14,
    //   name: "Bronze Checkered Smartwear",
    //   price: 450000,
    //   image: "/imgs/IMG_6835.JPG",
    //   category: "Blazers",
    //   description: "Bronze tone with checkered detail. For the stylish man of tradition and ambition."
    // },
    // {
    //   id: 15,
    //   name: "Desert Tone Blazer",
    //   price: 450000,
    //   image: "/imgs/IMG_6836.JPG",
    //   category: "Blazers",
    //   description: "Earthy sand-colored blazer that balances minimalism and elegance."
    // },
    {
      id: 16,
      name: "Sage Safari Suit",
      price: 450000,
      image: "/imgs/IMG_8364.JPG",
      category: "Suits",
      description: "Soft sage, sharp lines, a minimalist safari cut with a refined collar and tonal buttons."
    },
    {
      id: 17,
      name: "Sky Blue Walk Set",
      price: 450000,
      image: "/imgs/IMG_6838.JPG",
      category: "Suits",
      description: "Casual formal blue suit perfect for warm days, designed to walk with confidence."
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
              <h1 className="text-6xl font-extralight mb-6 tracking-wide">Suits</h1>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-32 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Discover our collection of meticulously crafted suits, designed for the modern gentleman who appreciates timeless elegance.
              </p>
            </div>

            {Array.isArray(suits) && suits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {suits.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
               <EmptyState label="suits" />
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

export default Suits;
