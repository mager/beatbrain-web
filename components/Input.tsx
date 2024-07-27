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
      className="w-full px-4 py-4 mt-4 rounded-md border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
    />
  );
};

export default Input;
