'use client';

import { categoryApi, eventApi } from '@/lib/api';
import type { CategoryResponse, EventResponse } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        setEvent(eventData);

        const catData = await categoryApi.getAll(eventData.id);
        setCategories(catData);
      } catch (error) {
        console.error('Mislukt om categorieen op te halen:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) return;

    try {
      if (!event) return;
      await categoryApi.delete(event.id, categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error('Mislukt om categorie te verwijderen:', error);
      alert('Mislukt om categorie te verwijderen');
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
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Categorieen</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Beheer menu categorieen voor {event?.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Evenementen
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={() => router.push(`/events/${slug}/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Categorie
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/events/${slug}/categories/${category.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Bewerken
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Verwijderen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/events/${slug}/categories/${category.id}/products`)}
              >
                Producten beheren
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nog geen categorieen</h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Maak je eerste categorie om te starten</p>
        </div>
      )}
    </div>
  );
}
