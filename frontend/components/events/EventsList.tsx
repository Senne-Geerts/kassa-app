'use client';

import { eventApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Clock, Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function EventsList() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await eventApi.getAll(true);
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
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Kies een evenement</h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">Selecteer een evenement om het menu te bekijken</p>
        </div>
        <Button onClick={() => router.push('/events/new')}>
          Nieuw evenement
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription>
                {event.active ? 'Actief evenement' : 'Inactief evenement'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {new Date(event.startsAt).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Clock className="h-4 w-4" />
                  <span>Aangemaakt: {new Date(event.createdAt).toLocaleDateString('nl-BE')}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/events/${event.slug}`)}
                >
                  Afrekenen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${event.slug}/menu`)}
                >
                  Menu Bewerken
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Calendar className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Geen actieve evenementen</h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Maak je eerste evenement aan om te starten</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/events/new')}>
              Evenement aanmaken
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
