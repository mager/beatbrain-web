import React, { ReactNode, HTMLAttributes } from "react";
import classNames from "classnames";

interface MainProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Main: React.FC<MainProps> = ({ children, className, ...rest }) => {
  const combinedClassName = classNames("pb-16 flex flex-col", className);

  return (
    <div className={combinedClassName} {...rest}>
      {children}
    </div>
  );
};

export default Main;
