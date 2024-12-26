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
      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
    />
  );
};

export default Input;
