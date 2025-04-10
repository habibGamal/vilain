import { useEffect, useRef, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Loader2, Search, X } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Image } from './ui/Image';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const { t, currentLocale , getLocalizedField,direction } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<App.Interfaces.SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Focus input when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSuggestions([]);
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

  // Fetch suggestions when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/search/suggestions', {
        params: { q: query }
      });
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.get('/search', { q: query.trim() });
      onClose();
    }
  };

  const handleSuggestionClick = (id: string) => {
    router.get(`/products/${id}`);
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
                  disabled={isLoading}
                  aria-label={t('search')}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="mt-6 relative z-10">
              {suggestions.length > 0 ? (
                <div className="bg-background border rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-200">
                  <ul className="divide-y divide-border/40">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          className="w-full px-4 py-4 text-left flex items-center hover:bg-muted/50 transition-colors duration-200"
                          onClick={() => handleSuggestionClick(suggestion.id)}
                        >
                          {suggestion.image ? (
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
                              <Image
                                src={suggestion.image}
                                alt={getLocalizedField(suggestion, 'name')}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Search className="h-6 w-6 text-primary/70" />
                            </div>
                          )}
                          <div className="flex-1 ltr:ml-4 rtl:mr-4 rtl:text-right">
                            <p className="font-medium line-clamp-1">
                              {getLocalizedField(suggestion, 'name')}
                            </p>
                            {suggestion.price && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {suggestion.price} {t('currency.egp', 'EGP')}
                            </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 bg-primary/10 rounded-full p-1.5">
                            <Search className="h-4 w-4 text-primary/70" />
                          </div>
                        </button>
                      </li>
                    ))}
                    <li>
                      <Button
                        variant="ghost"
                        onClick={handleSearch}
                        className="w-full py-3 rounded-none hover:bg-primary/5 text-primary hover:text-primary/90 font-medium"
                      >
                        {t('view_all_results')} ({suggestions.length}+)
                      </Button>
                    </li>
                  </ul>
                </div>
              ) : query.length >= 2 && !isLoading ? (
                <div className="bg-background border rounded-xl shadow-lg p-8 text-center animate-in fade-in duration-200">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">{t('no_results_found')}</h3>
                  <p className="text-muted-foreground">{t('try_different_search')}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return isOpen ? (
    <div
      ref={searchRef}
      className="border-t border-border/40 py-3"
    >
      <div className="container flex items-center px-4">
        <Input
          ref={searchInputRef}
          placeholder={t('search_products', "Search products...")}
          className="flex-1"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="ltr:ml-2 rtl:mr-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          className="ltr:ml-1 rtl:mr-1"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ) : null;
}
