'use client';

import { eventApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, Copy, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AdminEventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await eventApi.getAll(false);
        setEvents(data);
      } catch (error) {
        console.error('Mislukt om evenementen op te halen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Evenementen</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Beheer evenementen en menu</p>
        </div>
        <Button onClick={() => (window.location.href = '/events/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuw evenement
        </Button>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <CardDescription>
                  Start: {new Date(event.startsAt).toLocaleDateString('nl-BE')} | Slug: {event.slug}
                </CardDescription>
              </div>
              <Badge variant={event.active ? 'success' : 'default'}>
                {event.active ? 'Actief' : 'Inactief'}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => (window.location.href = `/events/${event.slug}`)}>
                  Menu bekijken
                </Button>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = `/events/${event.slug}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Bewerken
                </Button>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = `/events/${event.slug}/clone`)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Kloon
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => (window.location.href = `/events/${event.slug}/categories`)}
                >
                  Categorieen beheren
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
                      await eventApi.delete(event.id);
                      window.location.reload();
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Verwijderen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
