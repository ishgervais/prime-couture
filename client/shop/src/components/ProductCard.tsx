import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | string[]; // Support both single image and array of images
  category: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  
  // Convert single image to array for consistency
  const images = Array.isArray(product.image) ? product.image : [product.image];
  const hasMultipleImages = images.length > 1;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.image) ? product.image[0] : product.image,
      size: 'M'
    });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const currentImage = images[currentImageIndex];
  const isCurrentImageLoaded = imageLoaded[currentImageIndex];
  const isCurrentImageError = imageError[currentImageIndex];

  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-50"
      onClick={() => onProductClick(product)}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Loading skeleton */}
        {!isCurrentImageLoaded && !isCurrentImageError && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-80" />
          </div>
        )}
        
        {/* Image container with slide effect */}
        <div className="relative w-full h-80 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentImageIndex ? 'translate-x-0' : 
                index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              {!imageError[index] ? (
                <img 
                  src={image} 
                  alt={`${product.name} - Image ${index + 1}`}
                  className={`w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 ${
                    imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📷</span>
                    </div>
                    <p className="text-sm">Image unavailable</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Navigation arrows - only show if multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full 
                         bg-white/80 backdrop-blur-sm text-gray-700 opacity-0 group-hover:opacity-100 
                         transition-all duration-300 hover:bg-white hover:scale-110 flex items-center justify-center
                         shadow-lg z-20"
            >
              <ChevronLeft size={16} />
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full 
                         bg-white/80 backdrop-blur-sm text-gray-700 opacity-0 group-hover:opacity-100 
                         transition-all duration-300 hover:bg-white hover:scale-110 flex items-center justify-center
                         shadow-lg z-20"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        
        {/* Image dots indicator - only show if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(index, e)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Image counter - only show if multiple images */}
        {hasMultipleImages && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white 
                         px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 
                         transition-opacity duration-300">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Enhanced Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-y-16 group-hover:translate-y-0 
                     bg-white/95 backdrop-blur-sm text-black px-8 py-3 rounded-full font-medium text-sm
                     opacity-0 group-hover:opacity-100 transition-all duration-500
                     hover:bg-black hover:text-white border border-gray-200 hover:border-black
                     shadow-lg hover:shadow-xl z-20"
        >
          Add to Cart
        </button>
      </div>
      
      <div className="p-6 bg-white">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
          {product.category}
        </div>
        <h3 className="font-medium text-lg mb-3 group-hover:text-gray-600 transition-colors leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          {/* TODO: to uncomment later */}
          {/* <span className="text-sm font-bold text-black">{product.price.toLocaleString()} RWF</span> */}
          <span className="text-sm font-bold text-black">--</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-black transition-colors duration-300 flex items-center justify-center">
            <span className="text-gray-400 group-hover:text-white text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;