import { useState, useEffect } from 'react';
import { Concert } from '../types/concert';

export type ConcertFormData = Omit<Concert, 'id' | 'created_at' | 'user_status'>;

interface ConcertFormProps {
  onSubmit: (data: ConcertFormData) => Promise<void>;
  error: string | null;
  success: string | null;
  initialData?: Partial<ConcertFormData>;
  submitLabel?: string;
}

const initialFormState: ConcertFormData = {
  artist_name: '',
  venue: '',
  date: '',
  time: '',
  image_url: '',
  description: '',
  organizer: '',
  genre: '',
  original_url: '',
};

export function ConcertForm({ onSubmit, error, success, initialData, submitLabel }: ConcertFormProps) {
  const [form, setForm] = useState<ConcertFormData>({
    ...initialFormState,
    ...initialData,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialFormState, ...initialData });
    }
  }, [initialData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    if (!error) {
      setForm(initialFormState);
    }
  }

  const inputClass =
    'w-full bg-white/10 text-white border border-white/20 px-4 py-3 text-sm ' +
    'placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors';

  const labelClass = 'block text-white/70 text-xs font-bold uppercase tracking-wide mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Artist *</label>
          <input
            type="text"
            name="artist_name"
            value={form.artist_name}
            onChange={handleChange}
            placeholder="ELEPHANT9"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sted *</label>
          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="VAKTBUA"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Dato *</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Klokkeslett *</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Arrangør *</label>
          <input
            type="text"
            name="organizer"
            value={form.organizer}
            onChange={handleChange}
            placeholder="DIRTY OLD TOWN"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sjanger</label>
          <input
            type="text"
            name="genre"
            value={form.genre || ''}
            onChange={handleChange}
            placeholder="Jazz"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Beskrivelse</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Kort beskrivelse av konserten..."
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Bilde-URL</label>
        <input
          type="url"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Original-URL</label>
        <input
          type="url"
          name="original_url"
          value={form.original_url || ''}
          onChange={handleChange}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-400 text-sm bg-green-400/10 px-4 py-2">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Lagrer...' : (submitLabel || 'Legg til konsert')}
      </button>
    </form>
  );
}
