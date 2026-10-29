'use client';

import { categoryApi, eventApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface EventData {
  id: string;
  name: string;
  slug: string;
  startsAt: string;
  active: boolean;
  createdAt: string;
}

export default function MenuEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add category form state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Edit category state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Edit product state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');

  // Add product state
  const [showAddProduct, setShowAddProduct] = useState<string | null>(null); // categoryId
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const eventData = await eventApi.getBySlug(slug);
        setEvent(eventData);

        const catData = await categoryApi.getAll(eventData.id);
        // Fetch products for each category
        const categoriesWithProducts = await Promise.all(
          (Array.isArray(catData) ? catData : []).map(async (category: Category) => {
            const prodData = await productApi.getAll(eventData.id, category.id);
            return { ...category, products: Array.isArray(prodData) ? prodData : [] };
          })
        );
        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error('Mislukt om menu op te halen:', error);
        alert('Mislukt om menu op te halen');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setIsSubmitting(true);
    try {
      const newCategory = await categoryApi.create(event.id, {
        name: newCategoryName,
      });
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Mislukt om categorie toe te voegen:', error);
      alert('Mislukt om categorie toe te voegen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
  };

  const saveEditCategory = async (categoryId: string) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const updatedCategory = await categoryApi.update(event.id, categoryId, {
        name: editCategoryName,
      });
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? updatedCategory : c)));
      setEditingCategoryId(null);
    } catch (error) {
      console.error('Mislukt om categorie bij te werken:', error);
      alert('Mislukt om categorie bij te werken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryName('');
  };

  const deleteCategory = async (categoryId: string) => {
    if (!event) return;
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) return;

    setIsSubmitting(true);
    try {
      await categoryApi.delete(event.id, categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error('Mislukt om categorie te verwijderen:', error);
      alert('Mislukt om categorie te verwijderen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = async (categoryId: string) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const newProduct = await productApi.create(event.id, categoryId, {
        name: newProductName,
        price: parseFloat(newProductPrice) || 0,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, products: [...(c.products || []), newProduct] }
            : c
        )
      );
      setNewProductName('');
      setNewProductPrice('');
      setShowAddProduct(null);
    } catch (error) {
      console.error('Mislukt om product toe te voegen:', error);
      alert('Mislukt om product toe te voegen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditProduct = (categoryId: string, product: Product) => {
    setEditingProductId(product.id);
    setEditProductName(product.name);
    setEditProductPrice(product.price.toString());
  };

  const saveEditProduct = async (categoryId: string, productId: string) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const updatedProduct = await productApi.update(event.id, categoryId, productId, {
        name: editProductName,
        price: parseFloat(editProductPrice) || 0,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, products: (c.products || []).map((p: Product) => (p.id === productId ? updatedProduct : p)) }
            : c
        )
      );
      setEditingProductId(null);
    } catch (error) {
      console.error('Mislukt om product bij te werken:', error);
      alert('Mislukt om product bij te werken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditProductName('');
    setEditProductPrice('');
  };

  const deleteProduct = async (categoryId: string, productId: string) => {
    if (!event) return;
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    setIsSubmitting(true);
    try {
      await productApi.delete(event.id, categoryId, productId);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, products: (c.products || []).filter((p: Product) => p.id !== productId) }
            : c
        )
      );
    } catch (error) {
      console.error('Mislukt om product te verwijderen:', error);
      alert('Mislukt om product te verwijderen');
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
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Evenementen
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Menu bewerken</h1>
            <p className="text-zinc-500 dark:text-zinc-400">{event?.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/events/${slug}`)}>
          Terug naar Evenement
        </Button>
      </div>

      <div className="space-y-6">
        {/* Add Category Section */}
        <Card>
          <CardHeader>
            <CardTitle>Categorie toevoegen</CardTitle>
            <CardDescription>Voeg een nieuwe categorie toe aan het menu</CardDescription>
          </CardHeader>
          <CardContent>
            {showAddCategory ? (
              <form onSubmit={addCategory} className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="newCategoryName">Naam</Label>
                  <Input
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Bijv., Eten, Drinken"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Toevoegen...' : 'Toevoegen'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                    Annuleren
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowAddCategory(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nieuwe Categorie
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Categories Section */}
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nog geen categorieen</h3>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">Voeg categorieen toe om te starten</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    {editingCategoryId === category.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); saveEditCategory(category.id); }}>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            placeholder="Categorie naam"
                            required
                          />
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            Opslaan
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEditCategory} disabled={isSubmitting}>
                            Annuleren
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingCategoryId !== category.id && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => startEditCategory(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bewerken
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Verwijderen
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    {/* Add Product Form */}
                    {showAddProduct === category.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); addProduct(category.id); }} className="flex flex-col gap-3 sm:flex-row mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={`newProductName-${category.id}`} className="sr-only">Product Naam</Label>
                          <Input
                            id={`newProductName-${category.id}`}
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="Product Naam"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`newProductPrice-${category.id}`} className="sr-only">Prijs</Label>
                          <Input
                            id={`newProductPrice-${category.id}`}
                            type="number"
                            step="0.01"
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            placeholder="Prijs"
                            min="0"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Toevoegen...' : 'Toevoegen'}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddProduct(null)}>
                            Annuleren
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowAddProduct(category.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nieuw Product
                      </Button>
                    )}

                    {/* Products List */}
                    {category.products && category.products.length > 0 ? (
                      <div className="space-y-2">
                        {(category.products as Product[]).map((product) => (
                          <Card key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3">
                            <div className="flex-1">
                              {editingProductId === product.id ? (
                                <form onSubmit={(e) => { e.preventDefault(); saveEditProduct(category.id, product.id); }} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <Input
                                    value={editProductName}
                                    onChange={(e) => setEditProductName(e.target.value)}
                                    placeholder="Product Naam"
                                    required
                                  />
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editProductPrice}
                                      onChange={(e) => setEditProductPrice(e.target.value)}
                                      placeholder="Prijs"
                                      min="0"
                                      className="w-24"
                                      required
                                    />
                                    <Button type="submit" size="sm" disabled={isSubmitting}>
                                      Opslaan
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={cancelEditProduct} disabled={isSubmitting}>
                                      Annuleren
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-zinc-500 dark:text-zinc-400">€{product.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {editingProductId !== product.id && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => startEditProduct(category.id, product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Bewerken
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => deleteProduct(category.id, product.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Verwijderen
                                  </Button>
                                </>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">Nog geen producten in deze categorie</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
