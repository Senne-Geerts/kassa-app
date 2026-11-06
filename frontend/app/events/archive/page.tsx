'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArrowLeft, ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { eventApi } from '@/lib/api';
import type { EventResponse } from '@/lib/api';

export default function EventArchivePage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const allEvents = await eventApi.getAll(false);
        setEvents(allEvents.filter((event) => !event.active));
      } catch (fetchError) {
        console.error('Mislukt om afgeronde evenementen op te halen:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Evenementen ophalen is mislukt.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Afgeronde evenementen</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Bekijk de samenvatting van een afgerond evenement.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Actieve evenementen
        </Button>
      </header>

      {loading && (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      )}

      {error && <p role="alert" className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {!loading && !error && events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Archive className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nog geen afgeronde evenementen</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Wanneer je een evenement afrondt, vind je de samenvatting hier terug.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription>
                {event.startsAt
                  ? `Gestart op ${new Date(event.startsAt).toLocaleDateString('nl-BE')}`
                  : 'Afgerond evenement'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push(`/events/${event.slug}/summary`)}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Bekijk samenvatting
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
