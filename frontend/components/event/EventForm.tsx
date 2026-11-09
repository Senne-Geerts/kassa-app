'use client';

import { EventRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface EventFormProps {
  defaultValue?: EventRequest;
  onSubmit: (data: EventRequest) => void;
  autoGenerateSlug?: boolean;
  submitLabel?: string;
  submitLoading?: boolean;
  cancelLink?: string;
}

export const EventForm = ({
  defaultValue,
  onSubmit,
  autoGenerateSlug = false,
  submitLabel = 'Evenement opslaan',
  submitLoading,
  cancelLink,
}: EventFormProps) => {
  const router = useRouter();
  const [name, setName] = useState(defaultValue?.name ?? '');
  const [slug, setSlug] = useState(() =>
    autoGenerateSlug ? slugify(defaultValue?.name ?? '') : defaultValue?.slug ?? '',
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: EventRequest = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      startsAt: formData.get('startsAt') as string,
      active: formData.get('active') === 'on',
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{defaultValue ? 'Evenement bewerken' : 'Nieuw evenement aanmaken'}</CardTitle>
          {defaultValue ? <CardDescription>Bijwerk gegevens van het evenement</CardDescription> : <CardDescription>Maak een nieuw evenement aan voor je menu</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Evenement Naam" description="De naam van je evenement" required>
            <Input
              name="name"
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                setName(nextName);
                if (autoGenerateSlug && !slugManuallyEdited) {
                  setSlug(slugify(nextName));
                }
              }}
              placeholder="Bijv., Pasta Di Skippy 2026"
              required
            />
          </FormField>

          <FormField label="Slug" description="URL-vriendelijke identifier (kleine letters, cijfers, streepjes)" required>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="Bijv., pasta-2026"
              required
            />
          </FormField>

          <FormField label="Startdatum" description="Wanneer start dit evenement?" required>
            <Input
              name="startsAt"
              type="date"
              defaultValue={defaultValue?.startsAt}
              required
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={defaultValue?.active ?? true}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Actief
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={submitLoading}>
          {submitLoading ? 'Opslaan...' : submitLabel}
        </Button>
        {cancelLink && (
          <Button type="button" variant="outline" onClick={() => router.push(cancelLink)}>
            Annuleren
          </Button>
        )}
      </div>
    </form>
  );
};
