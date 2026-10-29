'use client';

import { categoryApi, eventApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, use } from 'react';

export default function EditCategoryPage({ params }: { params: Promise<{ slug: string; categoryId: string }> }) {
  const { slug, categoryId } = use(params);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        setEvent(eventData);

        const catData = await categoryApi.getAll(eventData.id);
        const foundCategory = catData.find((c: any) => c.id === categoryId);
        if (foundCategory) {
          setCategory(foundCategory);
          setName(foundCategory.name);
          setSortOrder(foundCategory.sortOrder.toString());
        }
      } catch (error) {
        console.error('Mislukt om categorie op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !category) return;

    setIsSubmitting(true);
    try {
      await categoryApi.update(event.id, categoryId, {
        name,
        sortOrder: parseInt(sortOrder) || 1,
      });
      window.location.href = `/events/${slug}/categories`;
    } catch (error) {
      console.error('Mislukt om categorie bij te werken:', error);
      alert('Mislukt om categorie bij te werken');
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
        <Button variant="outline" onClick={() => (window.location.href = `/events/${slug}/categories`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar Categorieen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorie bewerken</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Werk categorie gegevens bij</p>
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
                {isSubmitting ? 'Opslaan...' : 'Wijzigingen opslaan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = `/events/${slug}/categories`)}
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
