'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Building2,
  Clock,
  CheckCircle2,
  Star,
  Filter,
  Grid3X3,
  List,
  ArrowRight,
  FileText,
  Truck,
} from 'lucide-react';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString()}`;
};

const categories = [
  'All Categories',
  'IT Equipment',
  'Office Furniture',
  'Office Supplies',
  'Safety Equipment',
  'HVAC',
  'Medical Equipment',
];

export default function MarketplaceCataloguePage() {
  const { catalogItems, cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useMarketplaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
      return matchesSearch && matchesCategory && item.isActive && !item.isDeleted;
    });
  }, [catalogItems, searchQuery, categoryFilter]);

  const cartItems = useMemo(() => {
    return cart.map((cartItem) => {
      const item = catalogItems.find((i) => i.id === cartItem.itemId);
      return {
        ...cartItem,
        item,
        total: (item?.unitPrice.amount || 0) * cartItem.quantity,
      };
    }).filter((ci) => ci.item);
  }, [cart, catalogItems]);

  const cartTotal = cartItems.reduce((sum, ci) => sum + ci.total, 0);
  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleAddToCart = (itemId: string) => {
    const qty = quantities[itemId] || 1;
    addToCart(itemId, qty);
    setQuantities((prev) => ({ ...prev, [itemId]: 1 }));
  };

  const getItemDetails = (itemId: string) => {
    return catalogItems.find((i) => i.id === itemId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Marketplace Catalogue (S14)</h1>
          <p className="text-sm text-zinc-500">
            Browse and purchase from government-approved suppliers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            My Orders
          </Button>

          {/* Shopping Cart Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-600">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
                <SheetDescription>
                  {cartItems.length} item(s) in your cart
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-280px)] mt-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((cartItem) => (
                      <div key={cartItem.itemId} className="flex gap-4 p-3 rounded-lg border">
                        <div className="h-16 w-16 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                          <Package className="h-8 w-8 text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {cartItem.item?.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatCurrency(cartItem.item?.unitPrice.amount || 0)} / {cartItem.item?.unit}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(cartItem.itemId, Math.max(1, cartItem.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{cartItem.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(cartItem.itemId, cartItem.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600 ml-auto"
                              onClick={() => removeFromCart(cartItem.itemId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-zinc-900">
                            {formatCurrency(cartItem.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {cartItems.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Subtotal</span>
                      <span className="text-lg font-bold text-zinc-900">{formatCurrency(cartTotal)}</span>
                    </div>
                    <SheetFooter className="flex-col gap-2">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="w-full" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </SheetFooter>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search catalogue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {filteredItems.length} items
        </p>
        <Select defaultValue="relevance">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-zinc-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-zinc-300" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.frameworkAgreementId && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      Framework
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm line-clamp-2 mt-2">{item.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-zinc-900">
                    {formatCurrency(item.unitPrice.amount)}
                  </span>
                  <span className="text-xs text-zinc-500">/ {item.unit}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                  <Truck className="h-3 w-3" />
                  <span>{item.leadTimeDays} days delivery</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantities((prev) => ({
                        ...prev,
                        [item.id]: Math.max(item.minimumOrderQuantity, (prev[item.id] || 1) - 1)
                      }))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{quantities[item.id] || 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantities((prev) => ({
                        ...prev,
                        [item.id]: (prev[item.id] || 1) + 1
                      }))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    size="sm"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex items-center p-4 gap-4">
                <div className="h-20 w-20 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <Package className="h-10 w-10 text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    {item.frameworkAgreementId && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        Framework
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-zinc-900">{item.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Building2 className="h-3 w-3" />
                      <span>Supplier ID: {item.supplierId}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Truck className="h-3 w-3" />
                      <span>{item.leadTimeDays} days</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-900">
                    {formatCurrency(item.unitPrice.amount)}
                  </p>
                  <p className="text-xs text-zinc-500">per {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantities((prev) => ({
                        ...prev,
                        [item.id]: Math.max(item.minimumOrderQuantity, (prev[item.id] || 1) - 1)
                      }))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{quantities[item.id] || 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantities((prev) => ({
                        ...prev,
                        [item.id]: (prev[item.id] || 1) + 1
                      }))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No items found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
