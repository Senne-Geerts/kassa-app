'use client';

import { eventApi, orderApi } from '@/lib/api';
import type { EventResponse, OrderResponse } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [menu, setMenu] = useState<EventResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const event = await eventApi.getBySlug(slug);
        const ordersData = await orderApi.getAll(event.id);
        setMenu(event);
        setOrders(ordersData);
      } catch (error) {
        console.error('Mislukt om gegevens op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

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

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Bestelgeschiedenis</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{menu.name}</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/events/${menu.slug}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar Menu
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-mono">Bestelling: {order.id.slice(0, 8)}...</CardTitle>
                <CardDescription>
                  {order.clientId && <span className="mr-4">Client: {order.clientId}</span>}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {new Date(order.createdAt).toLocaleString('nl-BE')}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="success" className="text-lg font-bold">
                €{order.total.toFixed(2)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.lines.map((line) => (
                  <div key={line.productId} className="flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-1 last:border-0">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {line.name} × {line.quantity}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      €{line.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Clock className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nog geen bestellingen</h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Bestellingen verschijnen hier wanneer ze worden aangemaakt</p>
        </div>
      )}
    </div>
  );
}
