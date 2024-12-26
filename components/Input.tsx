import React, { ChangeEvent } from "react";

type Props = {
  value: string;
  setValue: (e: string) => void;
  placeholder: string;
};

const Input: React.FC<Props> = ({ value, setValue, placeholder }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return (
    <input
      className={`w-full text-md px-4 py-4 rounded-md border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 
                  transition-all duration-200 ease-in-out 
                  ${value ? "border-2 border-green-500 shadow-md" : ""}`}
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
    />
  );
};

export default Input;
