import React from 'react';

function Atmosphere() {
  const leavesCount = 12;
  const pollenCount = 18;

  return (
    <div className="nature-atmosphere">
      {/* 3D background canopy parallax layer */}
      <div className="bg-layer-canopy" />
      
      {/* Drifting fog/mist overlay */}
      <div className="fog-overlay" />

      {/* Falling Leaves */}
      <div className="leaves-container">
        {Array.from({ length: leavesCount }).map((_, i) => {
          const left = Math.random() * 100; // random percentage
          const delay = Math.random() * 8; // random delay
          const duration = 8 + Math.random() * 10; // random duration
          const size = 12 + Math.random() * 24; // random size in px
          return (
            <svg
              key={`leaf-${i}`}
              className="falling-leaf"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              viewBox="0 0 24 24"
            >
              <path d="M17,8C8,20 4,21 3,21C3,21 3,20 4,17C8,4 20,3 21,3C21,3 20,4 17,8Z" />
            </svg>
          );
        })}
      </div>

      {/* Floating Pollen */}
      {Array.from({ length: pollenCount }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 10 + Math.random() * 15;
        const size = 2 + Math.random() * 4;
        return (
          <div
            key={`pollen-${i}`}
            className="pollen-particle"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size}px`
            }}
          />
        );
      })}
    </div>
  );
}

export default Atmosphere;
