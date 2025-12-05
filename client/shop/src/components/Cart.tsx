import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  const formatOrderMessage = () => {
    let message = "Hello! 👋\n\n";
    message += "I would like to place an order for the following items:\n\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.size) {
        message += `   Size: ${item.size}\n`;
      }
      message += `   Quantity: ${item.quantity}\n`;
      // TODO: uncomment later when prices are ready
      // if (item.price) {
      //   message += `   Price: ${item.price.toLocaleString()} RWF\n`;
      // }
      message += "\n";
    });
    
    // TODO: uncomment later when prices are ready
    // const total = getTotalPrice();
    // if (total > 0) {
    //   message += `💰 *Total: ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} RWF*\n\n`;
    // }
    
    message += "Could you please let me know:\n";
    message += "• The total price for these items\n";
    message += "• Available delivery options\n";
    message += "• Payment methods accepted\n\n";
    message += "Thank you! Looking forward to your response!";
    
    return encodeURIComponent(message);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const phoneNumber = '250781178499'; // Rwanda phone number
    const message = formatOrderMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank');
    
    // Optionally clear the cart after checkout
    // clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button 
                  onClick={onClose}
                  className="text-black font-medium hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.size || 'default'}-${index}`} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {/* TODO: uncomment later */}
                      {/* {item.price && <p className="font-semibold">{item.price.toLocaleString()} RWF</p>} */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-xl font-semibold">
                <span>Total:</span>
                {/* TODO: uncomment later */}
                {/* <span>{getTotalPrice().toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} RWF</span> */}
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>💬</span>
                  <span>Checkout on WhatsApp</span>
                </button>
                <button
                  onClick={clearCart}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;