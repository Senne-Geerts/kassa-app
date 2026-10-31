'use client';

import { categoryApi, eventApi } from '@/lib/api';
import type { EventResponse } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await eventApi.getBySlug(slug);
        setEvent(data);
      } catch (error) {
        console.error('Mislukt om evenement op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setIsSubmitting(true);
    try {
      await categoryApi.create(event.id, { name });
      router.push(`/events/${slug}/categories`);
    } catch (error) {
      console.error('Mislukt om categorie te maken:', error);
      const message = error instanceof Error ? error.message : 'Mislukt om categorie te maken';
      alert(message);
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
        <Button variant="outline" onClick={() => router.push(`/events/${slug}/categories`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar Categorieen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorie toevoegen</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Voeg een nieuwe categorie toe aan {event?.name}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Categorie Naam</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv., Eten, Drinken, Nagerechten"
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
                {isSubmitting ? 'Aanmaken...' : 'Categorie aanmaken'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/events/${slug}/categories`)}
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
