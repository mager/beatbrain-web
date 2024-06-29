import React from "react";

const Dropdown = ({ isOpen, children }) => {
  return (
    <div className="relative inline-block text-left">
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-6 w-56 bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
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
