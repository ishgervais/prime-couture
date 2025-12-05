import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');

  if (!isOpen || !product) return null;

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        
        {/* Desktop Layout */}
        <div className="hidden md:flex md:h-[80vh]">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-50">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          
          {/* Content */}
          <div className="md:w-1/2 flex flex-col">
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  {/* TODO: to uncomment later */}
                  {/* <p className="text-2xl font-bold">{product.price.toLocaleString()} RWF</p> */}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-600">
                  {product.description || "Crafted from the finest materials with attention to every detail. This piece represents the perfect blend of style, comfort, and luxury that defines modern elegance."}
                </p>
                
                {/* Size Selection */}
                <div>
                  <h3 className="font-semibold mb-4">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <div className="p-8 border-t bg-white rounded-br-lg">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={onClose}
              className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image */}
          <div className="h-64 bg-gray-50">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              {/* TODO: to uncomment later */}
              {/* <p className="text-xl font-bold">{product.price.toLocaleString()} RWF</p> */}
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-600">
                {product.description || "Crafted from the finest materials with attention to every detail. This piece represents the perfect blend of style, comfort, and luxury that defines modern elegance."}
              </p>
              
              {/* Size Selection */}
              <div>
                <h3 className="font-semibold mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;