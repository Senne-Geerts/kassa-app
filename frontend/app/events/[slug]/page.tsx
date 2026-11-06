'use client';

import { eventApi, orderApi } from '@/lib/api';
import type { EventResponse, MenuResponse, MenuProductItem, OrderLineRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Check, Loader2, Plus, Minus, Trash2, ClipboardList } from 'lucide-react';
import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem extends OrderLineRequest {
  product: MenuProductItem;
}

export default function EventMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [menuData, eventData] = await Promise.all([
          eventApi.getMenuBySlug(slug),
          eventApi.getBySlug(slug),
        ]);
        setMenu(menuData);
        setEvent(eventData);
      } catch (error) {
        console.error('Mislukt om menu op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [slug]);

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
    setSearchTerm('');
    setIsSuccess(false);
  };

  const closeEvent = async () => {
    if (!event || !window.confirm(
      `Evenement "${event.name}" afronden? Er kunnen daarna geen nieuwe bestellingen worden geplaatst. Je kunt de samenvatting wel blijven bekijken.`,
    )) {
      return;
    }

    setIsClosing(true);
    setCloseError(null);
    try {
      await eventApi.update(event.id, {
        name: event.name,
        slug: event.slug,
        startsAt: event.startsAt,
        active: false,
      });
      router.push(`/events/${event.slug}/summary`);
    } catch (error) {
      console.error('Mislukt om evenement af te ronden:', error);
      setCloseError(error instanceof Error ? error.message : 'Evenement afronden is mislukt.');
      setIsClosing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu) return;
    setIsSubmitting(true);
    try {
      const clientId = crypto.randomUUID();
      const lines: OrderLineRequest[] = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await orderApi.create(menu.id, { clientId, lines });
      setIsSuccess(true);
    } catch (error) {
      console.error('Mislukt om bestelling aan te maken:', error);
      alert('Mislukt om bestelling aan te maken');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Evenement niet gevonden</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Het opgevraagde evenement bestaat niet.</p>
        </div>
      </div>
    );
  }

  if (event && !event.active) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
        <Card className="w-full">
          <CardContent className="pt-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dit evenement is afgerond</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Er kunnen geen nieuwe bestellingen meer worden geplaatst.
            </p>
            <Button className="mt-6" onClick={() => router.push(`/events/${event.slug}/summary`)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Bekijk samenvatting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Button onClick={clearCart}>Nieuwe Bestelling</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl min-h-screen p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{menu.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Evenementen
          </Button>
          {event?.active && (
            <Button variant="secondary" onClick={closeEvent} disabled={isClosing}>
              <ClipboardList className="mr-2 h-4 w-4" />
              {isClosing ? 'Afronden...' : 'Evenement afronden'}
            </Button>
          )}
        </div>
      </div>
      {closeError && (
        <p role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Evenement afronden is mislukt: {closeError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Product search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Producten zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-md border border-zinc-200 bg-white pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {/* Products grouped by category */}
          {menu.categories.map((category) => {
            const categoryProducts = searchTerm
              ? category.products.filter((p) =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
              : category.products;

            // Only show categories that have matching products or show all if no search
            if (searchTerm && categoryProducts.length === 0) {
              return null;
            }

            return (
              <div key={category.id}>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  {category.name}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => (
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
            );
          })}
        </div>

        {/* Cart panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Bestelling Samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={cart.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Verwerken...' : 'Bestelling Afronden'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
