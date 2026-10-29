'use client';

import { categoryApi, eventApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, use } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ slug: string; categoryId: string; productId: string }> }) {
  const { slug, categoryId, productId } = use(params);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        setEvent(eventData);

        const prodData = await productApi.getAll(eventData.id, categoryId);
        const foundProduct = prodData.find((p: any) => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setName(foundProduct.name);
          setPrice(foundProduct.price.toString());
          setSortOrder(foundProduct.sortOrder.toString());
        }
      } catch (error) {
        console.error('Mislukt om product op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId, categoryId, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !product) return;

    setIsSubmitting(true);
    try {
      await productApi.update(event.id, categoryId, productId, {
        name,
        price: parseFloat(price),
        sortOrder: parseInt(sortOrder) || 1,
      });
      window.location.href = `/events/${slug}/categories/${categoryId}/products`;
    } catch (error) {
      console.error('Mislukt om product bij te werken:', error);
      alert('Mislukt om product bij te werken');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => (window.location.href = `/events/${slug}/categories/${categoryId}/products`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar Producten
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product bewerken</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Werk product gegevens bij</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Naam</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv., Pizza Margherita"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Prijs (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="sortOrder">Sort Volgorde</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Opslaan...' : 'Wijzigingen opslaan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = `/events/${slug}/categories/${categoryId}/products`)}
              >
                Annuleren
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
