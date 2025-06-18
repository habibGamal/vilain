import { useEffect, useRef, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Loader2, Search, X } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { SearchSuggestions } from '@/Components/SearchSuggestions';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const { t, currentLocale } = useI18n();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Focus input when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setShowSuggestions(false);
    }
  }, [isOpen]);

  // Handle clicks outside of the search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Show suggestions when query changes
  useEffect(() => {
    if (query.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.get('/search', { q: query.trim() });
      onClose();
    }
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
    onClose();
  };

  return (
    <div
      ref={searchRef}
      className={`fixed top-0 left-0 w-full h-screen bg-background/95 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className="container mx-auto pt-20 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('search_products')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-md focus-within:shadow-lg transition-shadow duration-300">
              <div className="absolute ltr:left-4 rtl:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={t('search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(
                  "border-2 focus:border-primary/50 pl-12 pr-12 text-lg h-16 rounded-xl",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  currentLocale === 'ar' ? "pr-12 pl-16" : "pl-12 pr-16"
                )}
              />
              <div className="absolute ltr:right-4 rtl:left-4 top-1/2 transform -translate-y-1/2">
                {query && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setQuery('')}
                    className="mr-1 h-8 w-8 rounded-full hover:bg-muted"
                    aria-label={t('clear')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="rounded-full h-8 w-8 p-0"
                  aria-label={t('search')}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Search Suggestions */}
          <div className="relative">
            <SearchSuggestions
              query={query}
              isOpen={showSuggestions}
              onClose={closeSuggestions}
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
