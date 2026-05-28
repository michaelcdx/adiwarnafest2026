import React from 'react'

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  loading?: boolean
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, loading, disabled, ...props }, ref) => {
    return (
      <div className="button-wrap">
        <button
          ref={ref}
          className="premium-btn"
          disabled={disabled || loading}
          {...props}
        >
          <span>{children}</span>
        </button>
        <div className="button-shadow"></div>
      </div>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'
