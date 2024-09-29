import React, { ReactNode, HTMLAttributes } from "react";
import classNames from "classnames";

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Box: React.FC<BoxProps> = ({ children, className, ...rest }) => {
  const combinedClassName = classNames("py-4", className);

  return (
    <div className={combinedClassName} {...rest}>
      {children}
    </div>
  );
};

export default Box;
