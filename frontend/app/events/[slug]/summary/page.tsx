'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Loader2, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { eventApi, orderApi, summaryApi } from '@/lib/api';
import type { EventResponse, EventSummaryResponse, OrderResponse } from '@/lib/api';

const currency = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' });

export default function EventSummaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [summary, setSummary] = useState<EventSummaryResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        const [summaryData, orderData] = await Promise.all([
          summaryApi.get(eventData.id),
          orderApi.getAll(eventData.id),
        ]);
        setEvent(eventData);
        setSummary(summaryData);
        setOrders(orderData);
      } catch (fetchError) {
        console.error('Mislukt om evenementensamenvatting op te halen:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Samenvatting ophalen is mislukt.');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [slug]);

  const totals = useMemo(() => {
    const categories = summary?.categories ?? [];
    return {
      revenue: categories.reduce((total, category) => total + category.totalRevenue, 0),
      quantity: categories.reduce((total, category) => total + category.totalQuantitySold, 0),
    };
  }, [summary]);

  return (
    <main className="container mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Evenementensamenvatting</h1>
          {event && <p className="mt-1 text-zinc-500 dark:text-zinc-400">{event.name}</p>}
        </div>
        <Button variant="outline" onClick={() => router.push('/events/archive')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Afgeronde evenementen
        </Button>
      </header>

      {loading && (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      )}

      {error && <p role="alert" className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {!loading && !error && event && summary && (
        <>
          {event.active && (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Dit evenement staat nog open. De cijfers kunnen nog veranderen zolang er bestellingen worden geplaatst.
            </p>
          )}

          <section aria-label="Totalen" className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Omzet</p>
                  <p className="text-2xl font-bold">{currency.format(totals.revenue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Bestellingen</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Artikelen verkocht</p>
                  <p className="text-2xl font-bold">{totals.quantity}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {summary.categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Geen verkopen geregistreerd</h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  Er zijn geen bestellingen voor dit evenement.
                </p>
              </CardContent>
            </Card>
          ) : (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Verkoop per categorie en artikel</h2>
              {summary.categories
                .toSorted((left, right) => right.totalRevenue - left.totalRevenue)
                .map((category) => (
                  <Card key={category.categoryId}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{category.categoryName}</CardTitle>
                        <CardDescription>{category.totalQuantitySold} artikelen verkocht</CardDescription>
                      </div>
                      <Badge variant="success">{currency.format(category.totalRevenue)}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {category.products
                          .toSorted((left, right) => right.quantitySold - left.quantitySold)
                          .map((product) => (
                            <div key={product.productId} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                              <div>
                                <p className="font-medium">{product.nameSnapshot}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.quantitySold} verkocht</p>
                              </div>
                              <p className="font-medium">{currency.format(product.revenue)}</p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
