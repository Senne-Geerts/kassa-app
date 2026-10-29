'use client';

import { categoryApi, eventApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useEffect, useState, use } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
}

export default function ProductListPage({ params }: { params: Promise<{ slug: string; categoryId: string }> }) {
  const { slug, categoryId } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        setEvent(eventData);

        const catData = await categoryApi.getAll(eventData.id);
        const foundCategory = catData.find((c: any) => c.id === categoryId);
        setCategory(foundCategory);

        const prodData = await productApi.getAll(eventData.id, categoryId);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (error) {
        console.error('Mislukt om producten op te halen:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId, slug]);

  const deleteProduct = async (productId: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    try {
      await productApi.delete(event.id, categoryId, productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Mislukt om product te verwijderen:', error);
      alert('Mislukt om product te verwijderen');
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
          <Button variant="outline" onClick={() => (window.location.href = `/events/${slug}/categories`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Categorieen
          </Button>
          <Button onClick={() => (window.location.href = `/events/${slug}/categories/${categoryId}/products/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Product
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Categorie: {category?.name}</CardTitle>
          <CardDescription>{category?.sortOrder > 0 ? `Sort Volgorde: ${category.sortOrder}` : ''}</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription>
                  €{product.price.toFixed(2)} | Sort Volgorde: {product.sortOrder}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/events/${slug}/categories/${categoryId}/products/${product.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Bewerken
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Verwijderen
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nog geen producten</h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Voeg producten toe aan deze categorie</p>
        </div>
      )}
    </div>
  );
}
