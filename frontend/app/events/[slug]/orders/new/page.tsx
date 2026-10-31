'use client';

import { eventApi, orderApi, OrderLineRequest } from '@/lib/api';
import type { MenuResponse, MenuProductItem } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useEffect, useMemo, useState, use } from 'react';
import { Plus, Minus, Trash2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem extends OrderLineRequest {
  product: MenuProductItem;
}

export default function NewOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await eventApi.getMenuBySlug(slug);
        setMenu(data);
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      } catch (error) {
        console.error('Mislukt om menu op te halen:', error);
      }
    }
    fetchData();
  }, [slug]);

  const filteredProducts = useMemo(() => {
    if (!menu) return [];
    const category = menu.categories.find((c) => c.id === selectedCategory);
    if (!category) return [];
    return category.products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [menu, selectedCategory, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  }, [cart]);

  const addToCart = (product: MenuProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setClientId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu) return;
    setIsSubmitting(true);
    try {
      const lines: OrderLineRequest[] = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await orderApi.create(menu.id, { clientId: clientId || crypto.randomUUID(), lines });
      setIsSuccess(true);
    } catch (error) {
      console.error('Mislukt om bestelling aan te maken:', error);
      alert('Mislukt om bestelling aan te maken');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Bestelling Afgerond!</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">De bestelling is succesvol geregistreerd.</p>
            <div className="mt-6">
              <Button onClick={() => router.push(`/events/${slug}`)}>Terug naar Evenement</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!menu) return <div className="container mx-auto p-6">Menu laden...</div>;

  return (
    <div className="container mx-auto min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nieuwe Bestelling</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{menu.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bestelling ID</p>
          <p className="font-mono text-zinc-900 dark:text-zinc-50">{clientId || crypto.randomUUID().slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {menu.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Producten zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-md border border-zinc-200 bg-white pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">⌘K</span>
          </div>

          {/* Product grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredProducts.map((product: MenuProductItem) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto flex-col items-start justify-start text-left py-4"
                onClick={() => addToCart(product)}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{product.name}</span>
                <span className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                  €{product.price.toFixed(2)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Cart panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Bestelling Samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Client / Tafel ID
                </label>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Bijv., T1 of gastennaam"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{item.product.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        €{item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    Nog geen items toegevoegd
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Totaal</span>
                  <span className="text-blue-600 dark:text-blue-400">€{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  Wissen
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Verwerken...' : 'Afrekenen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
