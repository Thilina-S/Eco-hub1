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
        <img src="../../../public/Aboutusbanner.png" alt="About Us Banner" className="object-cover w-full h-full" />
      </div>

      {/* Hero Section */}
      <div className="min-h-[70vh] bg-white flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 py-20">
        <div className="mb-10 lg:w-1/2 lg:mb-0">
          <h2 className="mb-6 text-5xl font-bold leading-snug text-gray-800">Join <span className="text-green-600">EcoHub</span></h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            As EcoHub, we simplify the complexity of waste management and city cleaning processes which are the common problems of people from all over the world. Join us to make the world simpler and more livable with EcoHub solutions.
          </p>
          <a href="" className="inline-block px-6 py-3 mt-4 font-semibold text-white transition bg-green-600 rounded hover:bg-green-700">REVIEW JOBS</a>
        </div>
        <div className="flex justify-center lg:w-1/2">
          <img src="../../../public/interviews.jpg" alt="Eco Hub Crew" className="w-full h-[400px] object-cover rounded-xl shadow-md" />
        </div>
      </div>

      {/* Core Details Section */}
      <div className="flex flex-col items-center gap-12 px-6 py-20 md:px-16 lg:flex-row-reverse">
        <div className="lg:w-1/2">
          <h3 className="mb-4 text-3xl font-semibold text-gray-800">Our pioneering role encourages us to be always better!</h3>
          <p className="mb-4 text-lg text-gray-700">
            EcoHub designs digitized and end-to-end waste management solutions with a focus on operational excellence in the waste management industry.
          </p>
          <p className="text-lg text-gray-700">
            EcoHub improves integrated platforms to utilize software and hardware innovations as well as works in cooperation with waste management companies, local authorities, and municipalities all over the world for a more sustainable and digital process management.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img src="../../../public/talk.jpg" alt="EcoHub Exhibition" className="w-full h-[400px] object-cover rounded-xl shadow-lg" />
        </div>
      </div>

      {/* Statistics Section */}
      <div ref={statsRef} className="py-20 text-center bg-green-200">
        <p className="max-w-3xl px-4 mx-auto mb-10 text-lg text-gray-700">
          EcoHub reaches millions of people and provides services to waste companies, smart cities, and municipalities with smart solutions by taking the best practices of waste management companies as a reference.
        </p>
        <div className="grid max-w-6xl grid-cols-2 gap-10 px-4 mx-auto md:grid-cols-4">
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.users.toLocaleString()}+</h4>
            <p className="mt-2 text-lg text-gray-600">Users</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.reaches.toLocaleString()}+</h4>
            <p className="mt-2 text-lg text-gray-600">Reaches</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.offices}+</h4>
            <p className="mt-2 text-lg text-gray-600">Global Offices</p>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-4xl font-extrabold text-green-600">{counts.countries}+</h4>
            <p className="mt-2 text-lg text-gray-600">Countries</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="flex flex-col items-center gap-12 px-6 py-20 md:px-16 lg:flex-row">
        <div className="lg:w-1/2">
          <h3 className="mb-4 text-3xl font-semibold text-gray-800">We produce digital solutions with Love!</h3>
          <p className="text-lg text-gray-700">
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
          className="fixed z-50 p-3 text-white transition bg-green-600 rounded-full shadow-lg bottom-6 right-6 hover:bg-green-700"
        >
          ↑
        </button>
      )}
    </section>
  );
}