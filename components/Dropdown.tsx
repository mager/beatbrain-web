import React from "react";

const Dropdown = ({ isOpen, children }) => {
  return (
    <div className="relative inline-block text-left">
      {isOpen && (
        <div className="z-10 origin-top-right absolute right-0 mt-6 w-40 bg-white ring-1 ring-black ring-opacity-5 border border-gray-300">
          <div
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
