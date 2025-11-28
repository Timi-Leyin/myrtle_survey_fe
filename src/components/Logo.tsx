import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fixed?: boolean;
}

const sizeClasses = {
  sm: "h-8 sm:h-10 md:h-12",
  md: "h-10 sm:h-12 md:h-16",
  lg: "h-12 sm:h-16 md:h-20",
};

export const Logo = ({ className, size = "md", fixed = false }: LogoProps) => {
  if (fixed) {
    return (
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <img
            src="/logo.png"
            alt="Myrtle Logo"
            className={cn(
              "w-auto object-contain drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity duration-300",
              sizeClasses[size],
              className
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <img
        src="/logo.png"
        alt="Myrtle Logo"
        className={cn(
          "w-auto object-contain drop-shadow-md",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
};
