import { Image } from '@/Components/ui/Image';

interface ApplicationLogoProps {
    className?: string;
}

export default function ApplicationLogo({ className }: ApplicationLogoProps) {
    return (
        <Image
            src="/logo.jpg"
            alt="Logo"
            className={`h-8 w-auto ${className || ''}`}
            useDefaultFallback={true}
        />
    );
}
