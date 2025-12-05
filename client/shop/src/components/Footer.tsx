import {
  AiOutlineInstagram,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineEnvironment,
} from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <img
                src="/logos/logo-vector.png"
                alt="Prime Couture Logo"
                className="w-12 h-12 object-contain mr-4"
              />
              <h3 className="text-3xl font-extralight tracking-wider text-black">
                PRIME COUTURE
              </h3>
            </div>
            <p className="text-gray-600 font-light leading-relaxed max-w-md">
              Crafted in Rwanda. Designed for the world. Prime Couture blends
              luxury tailoring with timeless elegance to redefine modern fashion.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-medium mb-6 text-lg text-black">Collections</h4>
            <ul className="space-y-3 text-gray-600 font-light">
              <li className="hover:text-black transition-colors cursor-pointer">
                Tailored Suits
              </li>
              <li className="hover:text-black transition-colors cursor-pointer">
                Signature Shirts
              </li>
              <li className="hover:text-black transition-colors cursor-pointer">
                Luxury Accessories
              </li>
              <li className="hover:text-black transition-colors cursor-pointer">
                Formal Wear
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-medium mb-6 text-lg text-black">Connect</h4>
            <ul className="space-y-3 text-gray-600 font-light">
              <li>
                <a
                  href="https://instagram.com/primecouture.ag"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-black transition-colors"
                >
                  <AiOutlineInstagram size={20} />
                  <span>@primecouture.ag</span>
                </a>
              </li>
              {/* TODO: Add Newsletter Signup */}
              {/* <li className="flex items-center space-x-2 hover:text-black transition-colors cursor-pointer">
                <AiOutlineMail size={20} />
                <span>Join Our Newsletter</span>
              </li> */}
              <li>
                <a
                  href="tel:+250781178499"
                  className="flex items-center space-x-2 hover:text-black transition-colors"
                >
                  <AiOutlinePhone size={20} />
                  <span>+250 781 178 499</span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/ge4vEhhe1P5SdBBM8?g_st=com.google.maps.preview.copy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-black transition-colors"
                >
                  <AiOutlineEnvironment size={20} />
                  <span>Kigali, Rwanda</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 font-light">
              &copy; {new Date().getFullYear()} Prime Couture. Handcrafted in Rwanda.
            </p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <span className="text-gray-500 font-light hover:text-black transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="text-gray-500 font-light hover:text-black transition-colors cursor-pointer">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
