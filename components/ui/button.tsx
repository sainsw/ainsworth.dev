import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
}

const base =
  'inline-flex items-center justify-center whitespace-nowrap h-8 px-3 text-sm font-medium rounded-full border transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300 dark:focus:ring-neutral-700'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'border-neutral-300 text-neutral-900 bg-white hover:bg-black hover:text-white hover:border-black dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-900 dark:hover:bg-white dark:hover:text-black dark:hover:border-white',
  outline:
    'border-neutral-400 text-neutral-900 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:hover:border-neutral-600',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const cls = `${base} ${variants[variant]} ${className}`.trim()
    return <button ref={ref} className={cls} {...props} />
  }
)

Button.displayName = 'Button'

