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

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) {
    notFound();
  }

  const handleSubmit = async (data: EventRequest) => {
    'use server';
    await eventApi.update(event.id, data);
    redirect('/events');
  };

  const defaultValue: EventRequest = {
    name: event.name,
    slug: event.slug,
    startsAt: event.startsAt,
    active: event.active,
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <EventForm defaultValue={defaultValue} onSubmit={handleSubmit} cancelLink="/events" />
    </div>
  );
}
