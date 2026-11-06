import { eventApi, EventRequest } from '@/lib/api';
import { notFound, redirect } from 'next/navigation';
import { EventForm } from '@/components/event/EventForm';

async function getEvent(slug: string) {
  try {
    return await eventApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export default async function CloneEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sourceEvent = await getEvent(slug);
  if (!sourceEvent) {
    notFound();
  }

  const handleSubmit = async (data: EventRequest) => {
    'use server';
    await eventApi.clone(sourceEvent.id, data);
    redirect('/events');
  };

  const defaultValue: EventRequest = {
    name: `${sourceEvent.name} (Kopie)`,
    slug: `${sourceEvent.slug}-kopie`,
    startsAt: sourceEvent.startsAt,
    active: true,
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <EventForm defaultValue={defaultValue} onSubmit={handleSubmit} autoGenerateSlug submitLabel="Kloon aanmaken" cancelLink="/events" />
    </div>
  );
}
