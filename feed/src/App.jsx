import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";
import Marketplace from "../src/components/pages/Marketplace.jsx"; // Added .jsx extension
import ContactUs from "../src/components/pages/ContactUs.jsx";
import AboutUs from "../src/components/pages/AboutUs.jsx"
import Chatbot from "../src/components/pages/Chatbot.jsx";
import SignIn from "./components/pages/SignIn.jsx";
import Signup from "../src/components/pages/Signup.jsx";
import Profile from "../src/components/pages/Profile.jsx";
import Faq from "./components/pages/Faq.jsx";


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
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/faq" element={<Faq />} />


          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;