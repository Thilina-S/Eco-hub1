import React, { useState } from "react";

const faqs = [
  {
    question: "What is Eco Hub?",
    answer:
      "A platform to promote sustainable waste management and connect eco-conscious users."
  },
  {
    question: "Who can use Eco Hub?",
    answer: "Anyone—individuals, communities, and businesses."
  },
  {
    question: "Is Eco Hub free?",
    answer:
      "Yes, free for individuals. Businesses get extra tools with premium features."
  },
  {
    question: "How does it reduce waste?",
    answer:
      "Through tracking tools, eco tips, challenges, and local recycling info."
  },
  {
    question: "Can I find recycling centers or brands?",
    answer:
      "Yes! Easily locate nearby centers and eco-friendly businesses."
  },
  {
    question: "What are EcoPoints?",
    answer: "Reward points for taking eco-friendly actions on the platform."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all data is encrypted and protected."
  },
  {
    question: "How do I join clean-up events?",
    answer: "Visit the Events page to join or host a clean-up drive."
  },
  {
    question: "Can businesses partner with Eco Hub?",
    answer:
      "Yes, we support collaborations with eco-conscious organizations."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-tr from-green-50 to-green-100 min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-6xl w-full bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Image */}
        <div className="lg:w-1/2 bg-green-100 flex items-center justify-center p-8">
          <img
            src="../../../public/faq_img.png"
            alt="FAQ Illustration"
            className="max-w-full h-auto"
          />
        </div>

        {/* FAQ Content */}
        <div className="lg:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-green-800 mb-8">FAQ</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left text-lg font-medium text-green-900 focus:outline-none flex justify-between"
                >
                  {faq.question}
                  <span>{activeIndex === index ? "−" : "+"}</span>
                </button>
                {activeIndex === index && (
                  <p className="mt-2 text-gray-700 text-sm">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

