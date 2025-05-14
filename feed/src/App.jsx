import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";
import Marketplace from "../src/components/pages/Marketplace.jsx";
import ContactUs from "../src/components/pages/ContactUs.jsx";
import AboutUs from "../src/components/pages/AboutUs.jsx";
import Chatbot from "../src/components/pages/Chatbot.jsx";
import SignIn from "./components/pages/SignIn.jsx"; // Keep SignIn
import Login from "../src/components/pages/SignIn.jsx"; // Add Login if you want a login page
import Signup from "../src/components/pages/Signup.jsx";
import Profile from "../src/components/pages/Profile.jsx";
import Faq from "./components/pages/Faq.jsx";
import Cart from "./components/pages/Cart.jsx";
import Checkout from "./components/pages/Checkout.jsx";
import ItemView from "./components/pages/ItemView.jsx";  // Import ItemView
import MyItems from "./components/pages/MyItems.jsx";
import MyPosts from "./components/pages/MyPosts.jsx";
import Wishlist from "./components/pages/Wishlist.jsx";
import AdminDashboard from "./components/pages/AdminDashboard.jsx";
import Logout from "./components/pages/logout.jsx";
import ForgotPassword from "./components/pages/ForgotPassword.jsx";
import ResetPassword from "./components/pages/ResetPassword.jsx";
import MyReviews from "./components/pages/MyReviews.jsx";
import AdminNotice from "./components/pages/AdminComponents/AdminNotice.jsx";
import Notices from "./components/pages/Notices.jsx";
import AdminUsers from "./components/pages/AdminComponents/AdminUsers.jsx";
import AdminPosts from "./components/pages/AdminComponents/AdminPosts.jsx";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/login" element={<Login />} /> {/* Add this route */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/itemview/:productId" element={<ItemView />} /> {/* Update the route to include :productId */}
            <Route path="/myitems" element={<MyItems />} />
            <Route path="/myposts" element={<MyPosts />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/myreviews" element={<MyReviews />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/adminnotice" element={<AdminNotice />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/adminusers" element={<AdminUsers />} />
            <Route path="/adminusers" element={<AdminUsers />} />
            <Route path="/adminposts" element={<AdminPosts />} />
            
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
