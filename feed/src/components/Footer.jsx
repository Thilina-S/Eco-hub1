import { FaFacebook, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-emerald-50 text-emerald-800 border-t-4 border-emerald-200 shadow-md">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-600 transition">Services</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Partners</a></li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FOLLOW US</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FaFacebook className="text-emerald-600" />
                <a href="#" className="hover:text-emerald-600 transition">Facebook</a>
              </li>
              <li className="flex items-center gap-2">
                <FaInstagram className="text-emerald-600" />
                <a href="#" className="hover:text-emerald-600 transition">Instagram</a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">LEGAL</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition">Terms & Condition</a></li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CONNECT WITH US</h3>
            <address className="not-italic space-y-2">
              <p>No.123, 2nd Floor,</p>
              <p>Colombo, Sri Lanka</p>
              <p><a href="tel:+94711234567" className="hover:text-emerald-600 transition">+94 71 1 23 45 67</a></p>
              <p><a href="tel:+94717654321" className="hover:text-emerald-600 transition">+94 71 7 65 43 21</a></p>
            </address>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-emerald-200 mt-8 pt-6 text-center md:text-left">
          <p>© 2025 StopIto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;