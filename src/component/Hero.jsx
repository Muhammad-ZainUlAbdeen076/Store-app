import React from 'react'
import heroImg from "../assets/hero.png"; // 👈 apni image ka path

function Hero() {
  return (
    <div className="w-full">
      <img
        src={heroImg}
        alt="hero"
        className="w-full h-[180px] sm:h-[200px] md:h-[300px] lg:h-[350px] object-fit"
      />
    </div>
  )
}

export default Hero