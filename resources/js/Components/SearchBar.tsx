import { useEffect, useRef, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const { t } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
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
