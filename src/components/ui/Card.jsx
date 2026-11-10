import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'p-4',
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-soft transition-all duration-150
        ${hoverable ? 'hover:border-brand-200 hover:shadow-md cursor-pointer active:scale-[0.99]' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
