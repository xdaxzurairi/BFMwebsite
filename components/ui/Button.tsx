'use client';

import type { ButtonHTMLAttributes } from 'react';

type IconComp = React.ComponentType<{ className?: string }>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'field' | 'ghost' | '';
  size?: 'sm' | 'lg' | '';
  icon?: IconComp;
  iconRight?: boolean;
  block?: boolean;
};

export function Button({ variant = '', size = '', icon: Icon, iconRight, block, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`btn ${variant ? 'btn-' + variant : ''} ${size ? 'btn-' + size : ''} ${block ? 'btn-block' : ''} ${className}`}
      {...rest}
    >
      {Icon && !iconRight && <Icon />}
      {children}
      {Icon && iconRight && <Icon />}
    </button>
  );
}
