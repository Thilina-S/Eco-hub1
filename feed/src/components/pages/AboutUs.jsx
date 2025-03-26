import React, { useEffect, useRef, useState } from "react";

export default function AboutUs() {
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState({
    users: 0,
    reaches: 0,
    offices: 0,
    countries: 0,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounts();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const animateCounts = () => {
    const duration = 2000;
    const increment = 25;
    const steps = duration / increment;
    const endValues = {
      users: 10000,
      reaches: 1000000,
      offices: 3,
      countries: 40,
    };

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCounts({
        users: Math.min(Math.floor((endValues.users / steps) * step), endValues.users),
        reaches: Math.min(Math.floor((endValues.reaches / steps) * step), endValues.reaches),
        offices: Math.min(Math.floor((endValues.offices / steps) * step), endValues.offices),
        countries: Math.min(Math.floor((endValues.countries / steps) * step), endValues.countries),
      });

      if (step >= steps) clearInterval(interval);
    }, increment);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-white">
      {/* Top Banner Image */}
      <div className="w-full h-[400px]">
        <img src="../../../public/Aboutusbanner.png" alt="About Us Banner" className="w-full h-full object-cover" />
      </div>

      {/* Hero Section */}
      <div className="min-h-[70vh] bg-white flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 py-20">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-snug">Join <span className="text-green-600">EcoHub</span></h2>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            As EcoHub, we simplify the complexity of waste management and city cleaning processes which are the common problems of people from all over the world. Join us to make the world simpler and more livable with EcoHub solutions.
          </p>
          <a href="" className="inline-block mt-4 bg-green-600 text-white font-semibold px-6 py-3 rounded hover:bg-green-700 transition">REVIEW JOBS</a>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <img src="../../../public/interviews.jpg" alt="Eco Hub Crew" className="w-full h-[400px] object-cover rounded-xl shadow-md" />
        </div>
      </div>

      {/* Core Details Section */}
      <div className="px-6 md:px-16 py-20 flex flex-col lg:flex-row-reverse items-center gap-12">
        <div className="lg:w-1/2">
          <h3 className="text-3xl font-semibold text-gray-800 mb-4">Our pioneering role encourages us to be always better!</h3>
          <p className="text-gray-700 mb-4 text-lg">
            EcoHub designs digitized and end-to-end waste management solutions with a focus on operational excellence in the waste management industry.
          </p>
          <p className="text-gray-700 text-lg">
            EcoHub improves integrated platforms to utilize software and hardware innovations as well as works in cooperation with waste management companies, local authorities, and municipalities all over the world for a more sustainable and digital process management.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img src="../../../public/talk.jpg" alt="EcoHub Exhibition" className="w-full h-[400px] object-cover rounded-xl shadow-lg" />
        </div>
      </div>

      {/* Statistics Section */}
      <div ref={statsRef} className="bg-gray-50 py-20 text-center">
        <p className="text-gray-700 max-w-3xl mx-auto mb-10 px-4 text-lg">
          EcoHub reaches millions of people and provides services to waste companies, smart cities, and municipalities with smart solutions by taking the best practices of waste management companies as a reference.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.users.toLocaleString()}+</h4>
            <p className="text-gray-600 text-lg mt-2">Users</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.reaches.toLocaleString()}+</h4>
            <p className="text-gray-600 text-lg mt-2">Reaches</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.offices}+</h4>
            <p className="text-gray-600 text-lg mt-2">Global Offices</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.countries}+</h4>
            <p className="text-gray-600 text-lg mt-2">Countries</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="px-6 md:px-16 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2">
          <h3 className="text-3xl font-semibold text-gray-800 mb-4">We produce digital solutions with Love!</h3>
          <p className="text-gray-700 text-lg">
            At EcoHub, we have core values meaning much more than just words, which reveal themselves in each step of our business, lead us to success, and make you trust us. In such a way, we manage to be always better following the Sustainable Development Goals of the United Nations to serve sustainability in our business, and Women's Empowerment Principles to promote gender equality in all aspects of working life.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img src="../../../public/interviews.jpg" alt="EcoHub Presentation" className="w-full h-[400px] object-cover rounded-xl shadow-lg" />
        </div>
      </div>
            {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition"
        >
          ↑
        </button>
      )}
    </section>
  );
}