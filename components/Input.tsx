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
      className="w-full py-3 px-4 border-4 border-gray-300 focus:border-green-400 focus:outline-none"
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
    />
  );
};

export default Input;
