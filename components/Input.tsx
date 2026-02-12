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
      className="w-full py-2.5 px-4 bg-terminal-bg border border-terminal-border rounded text-phosphor font-mono text-sm placeholder:text-phosphor-dim/40 focus:border-accent/50 focus:outline-none transition-colors"
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
    />
  );
};

export default Input;
