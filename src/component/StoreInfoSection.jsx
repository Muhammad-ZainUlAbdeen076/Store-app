import React from "react";

export default function StoreInfoSection() {
  return (
    <div className="w-full bg-gray-100 py-10 px-4 text-center">

      {/* Free Shipping */}
      <p className="text-red-600 font-semibold tracking-wide text-sm md:text-base mb-6">
        FREE SHIPPING ON ALL ORDERS OVER $300
      </p>

      {/* Heading */}
      <h2 className="text-xl md:text-2xl font-medium mb-6">
        Ordering Closes on XXX
      </h2>

      {/* Note */}
      <p className="text-sm text-gray-700 max-w-3xl mx-auto mb-6">
        <span className="font-semibold">NOTE:</span> Based on production requirements for custom apparel, please review estimated shipping timelines below:
      </p>

      {/* Timeline */}
      <p className="text-sm text-gray-800 mb-10">
        Footwear/Eyewear: 1-2 weeks after purchase date &nbsp; | &nbsp;
        Apparel: 3-4 weeks after store closure
      </p>

      {/* Countdown */}
      <div className="flex justify-center gap-6 mb-6">
        {["Days", "Hours", "Minutes", "Seconds"].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-medium">
              0
            </div>
            <span className="text-xs mt-2 text-gray-600">{item}</span>
          </div>
        ))}
      </div>

      {/* Closing Date */}
      <p className="text-sm text-gray-700">
        Store Closes Wednesday, December 27 at 10:59 AM
      </p>

    </div>
  );
}