import { motion } from "framer-motion";
import { Users, Award, Heart, Globe } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Users,
      title: "Customer First",
      desc: "We prioritize your needs and satisfaction.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      desc: "Every product is vetted for quality.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      desc: "Built by Ethiopians, for Ethiopians.",
    },
    {
      icon: Globe,
      title: "Ethiopia Wide",
      desc: "Serving customers across the nation.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-5xl space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            About Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Empowering Ethiopian commerce
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Our Story
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Founded in 2025, Marketplace is Ethiopia’s fastest‑growing C2C
            platform. We connect buyers and sellers across the country, offering
            a safe, convenient, and reliable way to trade. From electronics to
            fashion, home goods to books – we have it all.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Our mission is to democratize e‑commerce in Ethiopia, empowering
            small businesses and individuals to reach a wider audience. With
            integrated Chapa payments, real‑time chat, and nationwide shipping,
            we make buying and selling effortless.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
