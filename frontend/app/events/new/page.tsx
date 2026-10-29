import { eventApi, EventRequest } from '@/lib/api';
import { redirect } from 'next/navigation';
import { EventForm } from '@/components/event/EventForm';

export default function NewEventPage() {
  const handleSubmit = async (data: EventRequest) => {
    'use server';
    await eventApi.create(data);
    redirect('/events');
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <EventForm onSubmit={handleSubmit} submitLabel="Evenement aanmaken" cancelLink="/events" />
    </div>
  );
}
