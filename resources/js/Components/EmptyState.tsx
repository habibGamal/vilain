import { useLanguage } from '@/Contexts/LanguageContext';
import { ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-muted/50 p-8 rounded-xl max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {icon || <ExternalLink className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-medium mb-2">{message}</h3>
      </div>
    </div>
  );
}
