import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How do I create an account?",
      a: 'Click "Sign Up" on the top right, fill in your name, email, phone, and password. You can also choose to become a seller during registration.',
    },
    {
      q: "How do I buy a product?",
      a: "Browse products, add to cart, proceed to checkout, and pay using Chapa (TeleBirr, CBE Birr, cards). After payment, you can track your order.",
    },
    {
      q: "How do I become a seller?",
      a: 'During registration check "I want to sell products". Already a user? Go to Profile → Become a Seller.',
    },
    {
      q: "How do I list a product?",
      a: 'After becoming a seller, go to "My Products" → "Add Product". Fill in title, description, price, images, and shipping options.',
    },
    {
      q: "How does payment work?",
      a: "All payments are processed securely via Chapa. Buyers pay online; sellers receive earnings in their wallet after commission deduction.",
    },
    {
      q: "How do I withdraw my earnings?",
      a: "Go to Wallet → Request Withdrawal. Admin will approve and send money to your bank/TeleBirr.",
    },
    {
      q: "How do I track my order?",
      a: 'Go to Orders → click "Track" on any order. You’ll see real‑time status updates.',
    },
    {
      q: "How do I contact support?",
      a: 'Use the "Support" link in your account to create a ticket. Our team responds within 24 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Everything you need to know
          </p>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <span>{faq.q}</span>
                {openIndex === idx ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
