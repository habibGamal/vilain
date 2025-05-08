import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardFooter
} from '@/Components/ui/card';
import { useLanguage } from '@/Contexts/LanguageContext';
import useCart from '@/hooks/use-cart';
import { ShoppingBag } from 'lucide-react';
import { Image } from '@/Components/ui/Image';
import { Link } from "@inertiajs/react";

interface ProductCardProps {
  product: App.Models.Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { getLocalizedField, t } = useLanguage();
  const { addToCart, addingToCart } = useCart();
  const discountPercentage = product.sale_price ?
    Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="aspect-[1/1] relative bg-muted">
          <Image
            src={product.featured_image || '/placeholder.svg'}
            alt={getLocalizedField(product, 'name')}
            className="object-contain w-full h-full aspect-square"
          />
          {product.sale_price && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              {discountPercentage}% {t('off', 'OFF')}
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1">
          {product.brand && (
            <p className="text-sm text-muted-foreground mb-1 truncate">
                {getLocalizedField(product.brand, 'name')}
            </p>
          )}
          <h3 className="font-medium mb-2 line-clamp-2">
            {getLocalizedField(product, 'name')}
          </h3>
          <div className="flex items-center flex-wrap gap-2 mt-auto pt-2">
            {product.sale_price ? (
              <>
                <span className="font-bold">{Number(product.sale_price).toFixed(2)} EGP</span>
                <span className="text-muted-foreground text-sm line-through">{Number(product.price).toFixed(2)} $</span>
              </>
            ) : (
              <span className="font-bold">{Number(product.price).toFixed(2)} EGP</span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => addToCart(product.id, 1)}
          disabled={addingToCart[product.id] || product.quantity <= 0}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {addingToCart[product.id]
            ? t('adding', 'Adding...')
            : product.quantity <= 0
              ? t('out_of_stock', 'Out of Stock')
              : t('add_to_cart', 'Add to Cart')
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
