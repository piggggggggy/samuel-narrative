interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-accent-primary border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

interface SpinnerOverlayProps {
  message?: string;
}

export function SpinnerOverlay({ message }: SpinnerOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <Spinner size="lg" />
      {message && (
        <p className="mt-3 text-sm text-text-secondary">{message}</p>
      )}
    </div>
  );
}

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className = "" }: ButtonSpinnerProps) {
  return (
    <div
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
