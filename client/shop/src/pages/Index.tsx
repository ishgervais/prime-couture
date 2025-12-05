import React, { useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Cart from '../components/Cart';
import ProductDetail from '../components/ProductDetail';
import AuthModal from '../components/AuthModal';
import { CartProvider } from '../context/CartContext';
import Footer from '@/components/Footer';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const products: Product[] = [
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
      id: 1,
      name: "Beige Serenity Shirt",
      price: 450000,
      image: "/imgs/IMG_8367.JPG",
      category: "Shirts",
      description: "Beige serenity_subtle, sleek, and endlessly refined"
    },
    {
      id: 7,
      name: "Monochrome Couple Set",
      price: 450000,
      image: "/imgs/IMG_6408.JPG",
      category: "Formal",
      description: "His & Hers matching formalwear—luxury black & white pieces for weddings and galas."
    },
    // {
    //   id: 8,
    //   name: "White Peak Lapel Tuxedo",
    //   price: 450000,
    //   image: "/imgs/IMG_6409.JPG",
    //   category: "Formal",
    //   description: "White tuxedo with peak lapel and black accents. Ultimate formalwear elegance."
    // },
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
    // {
    //   id: 16,
    //   name: "Botanical Luxe Suit",
    //   price: 450000,
    //   image: "/imgs/IMG_6837.JPG",
    //   category: "Suits",
    //   description: "Leafy environment tone tailored for both modern nature-inspired weddings and chic office wear."
    // },
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
        <Header
          onCartOpen={() => setIsCartOpen(true)}
        />

        {/* Hero Section - Enhanced with more animations and luxury feel */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-60 blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-bl from-black/5 to-transparent rounded-full opacity-40 blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-gray-200 to-transparent rounded-full opacity-50 blur-2xl animate-pulse delay-1000"></div>

            {/* More floating geometric shapes */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-black rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-12 bg-gray-300 rotate-45 animate-pulse delay-700"></div>
            <div className="absolute bottom-1/3 left-1/5 w-6 h-6 border border-gray-200 rotate-45 animate-bounce delay-500"></div>
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-gray-100 rounded-full animate-ping delay-1200"></div>
            <div className="absolute bottom-1/4 right-1/3 w-8 h-1 bg-gray-200 rotate-12 animate-pulse delay-800"></div>
          </div>

          {/* Luxury grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 py-32 relative z-10 text-center">
            {/* Enhanced Logo and Brand */}
            <div className="mb-16">
              <div className="inline-flex items-center justify-center mb-12 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent blur-2xl"></div>
                  <img
                    src="/logos/logo-vector.png"
                    alt="Prime Couture Logo"
                    className="w-32 h-32 object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h1 className="text-5xl md:text-9xl font-extralight mb-6 tracking-tight text-black leading-none">
                PRIME COUTURE
              </h1>
              <div className="flex items-center justify-center mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-black to-transparent w-80"></div>
              </div>
              <p className="text-xl text-gray-500 tracking-[0.3em] font-light uppercase">
                {/* Crafted Excellence Since 2025 */}
                signature tailored pieces
              </p>
            </div>

            {/* <div className="max-w-5xl mx-auto mb-20">
              <p className="text-3xl md:text-4xl text-gray-600 mb-10 leading-relaxed font-extralight">
                Quiet Luxury
                <span className="italic text-black font-light">, loud legacy.</span>
              </p>
              <p className="text-xl text-gray-500 leading-relaxed font-light max-w-3xl mx-auto">
                Discover our curated collection of premium menswear, meticulously crafted for the modern gentleman who values excellence and uncompromising quality.
              </p>
            </div> */}

            {/* Fixed buttons with proper hover effects */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <button className="group relative bg-black text-white px-16 py-5 overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-105 border border-black">
                <span className="relative z-10 font-light tracking-[0.2em] text-lg uppercase transition-colors duration-500 group-hover:text-black">
                  Explore Collection
                </span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </button>

              <button className="group border-2 border-black text-black px-16 py-5 hover:bg-black hover:text-white transition-all duration-500 hover:shadow-xl transform hover:scale-105">
                <span className="font-light tracking-[0.2em] text-lg uppercase">Custom Tailoring</span>
              </button>
            </div>

            {/* New luxury badge */}
            <div className="mt-16 inline-flex items-center space-x-4 px-8 py-3 border border-gray-200 rounded-full bg-white/80 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-light tracking-wider">Handcrafted in Rwanda</span>
            </div>
          </div>

          {/* Enhanced Scroll Indicator */}
          <div className="absolute bottom-4 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
              </div>
              <span className="text-xs text-gray-400 font-light tracking-wider uppercase">Discover</span>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-10 w-72 h-72 bg-black/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-60"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-block mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-px bg-black"></div>
                  <span className="text-sm tracking-widest text-gray-500 uppercase">Our Philosophy</span>
                  <div className="w-8 h-px bg-black"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-extralight tracking-wide text-black">Excellence in Every Thread</h2>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">✂</span>
                </div>
                <h3 className="text-2xl font-light mb-4 text-black">Tailored in Rwanda</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  Each garment is cut and stitched by skilled Rwandan artisans, blending modern silhouettes with traditional craftsmanship rooted in cultural pride.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">◊</span>
                </div>
                <h3 className="text-2xl font-light mb-4 text-black">Luxury Fabrics</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  We hand-select premium fabrics from Italy, Turkey, and beyond—ensuring elegance, comfort, and long-lasting quality in every tailored piece.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">⧗</span>
                </div>
                <h3 className="text-2xl font-light mb-4 text-black">Signature Timelessness</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  Prime Couture pieces are made to endure—refined, minimal, and sophisticated styles that honor elegance across cultures and generations.
                </p>
              </div>
            </div>


          </div>
        </section>

        {/* Featured Products */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-block mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-px bg-black"></div>
                  <span className="text-sm tracking-widest text-gray-500 uppercase">Curated Selection</span>
                  <div className="w-8 h-px bg-black"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-extralight tracking-wide text-black">Featured Collection</h2>
              </div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Handpicked pieces that embody our commitment to excellence and sophisticated style
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : (
                products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-32 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-extralight mb-8 tracking-wide">
              Elevate Your Presence with Prime Couture
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light">
              Discover timeless elegance, tailored to perfection in Rwanda. Let our artisans craft a look that speaks luxury, confidence, and individuality.
            </p>
            <button className="bg-white text-black px-12 py-4 hover:bg-gray-100 transition-all duration-300 font-light tracking-wider text-lg hover:shadow-2xl">
              BOOK YOUR FITTING
            </button>
          </div>

        </section>

        {/* Minimalist Footer */}
        <Footer />

        {/* Cart and Product Detail Modals */}
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <ProductDetail
          product={selectedProduct}
          isOpen={isProductDetailOpen}
          onClose={handleCloseProductDetail}
        />
      </div>
    </CartProvider>
  );
};

export default Index;
