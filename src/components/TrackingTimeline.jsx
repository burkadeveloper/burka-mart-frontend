import { CheckCircle, Package, Truck, MapPin } from "lucide-react";

const steps = [
  "pending",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];
const icons = [Package, Package, Truck, Truck, MapPin, CheckCircle];

export default function TrackingTimeline({ history, currentStatus }) {
  const currentIndex = steps.indexOf(currentStatus);
  return (
    <div className="flex flex-wrap justify-between mt-8">
      {steps.map((step, idx) => {
        const Icon = icons[idx];
        const isCompleted = idx <= currentIndex;
        return (
          <div key={step} className="flex flex-col items-center w-24">
            <div
              className={`rounded-full p-2 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs capitalize mt-1">
              {step.replace("_", " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
