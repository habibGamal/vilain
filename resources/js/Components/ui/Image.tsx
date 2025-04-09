import React, { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  fallback?: React.ReactNode;
  fallbackSrc?: string;
  onError?: (error: unknown) => void;
  useDefaultFallback?: boolean;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = '', fallback, fallbackSrc, onError, useDefaultFallback = true, ...props }, ref) => {
    const [error, setError] = useState<boolean>(false);
    const defaultFallbackSrc = '/placeholder.svg';

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setError(true);
      if (onError) {
        onError(e);
      }
    };

    if (error) {
      // If fallbackSrc is provided, render an image with the fallback source
      if (fallbackSrc) {
        return (
          <img
            ref={ref}
            className={cn(className)}
            src={fallbackSrc}
            alt={alt}
            {...props}
          />
        );
      }

      // If useDefaultFallback is true and no custom fallbackSrc, use the placeholder
      if (useDefaultFallback) {
        return (
          <img
            ref={ref}
            className={cn(className)}
            src={defaultFallbackSrc}
            alt={alt}
            {...props}
          />
        );
      }

      // If fallback element is provided, render it
      if (fallback) {
        return <>{fallback}</>;
      }      // Default fallback is an empty div with the same dimensions if useDefaultFallback is false
      return <div className={cn("bg-muted", className)} role="img" aria-label={alt} {...props} />;
    }

    // Render the original image if no error
    return (
      <img
        ref={ref}
        className={cn(className)}
        src={src}
        alt={alt}
        onError={handleError}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export { Image };
