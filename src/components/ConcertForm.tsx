import { useState, useEffect } from 'react';
import { Concert } from '../types/concert';
import styles from './ConcertForm.module.css';

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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.gridSm}>
        <div>
          <label className="label">Artist *</label>
          <input
            type="text"
            name="artist_name"
            value={form.artist_name}
            onChange={handleChange}
            placeholder="ELEPHANT9"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Sted *</label>
          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="VAKTBUA"
            required
            className="input"
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div>
          <label className="label">Dato *</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Klokkeslett *</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
      </div>

      <div className={styles.gridSm}>
        <div>
          <label className="label">Arrangør *</label>
          <input
            type="text"
            name="organizer"
            value={form.organizer}
            onChange={handleChange}
            placeholder="DIRTY OLD TOWN"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Sjanger</label>
          <input
            type="text"
            name="genre"
            value={form.genre || ''}
            onChange={handleChange}
            placeholder="Jazz"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Beskrivelse</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Kort beskrivelse av konserten..."
          rows={3}
          className="input"
        />
      </div>

      <div>
        <label className="label">Bilde-URL</label>
        <input
          type="url"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://..."
          className="input"
        />
      </div>

      <div>
        <label className="label">Original-URL</label>
        <input
          type="url"
          name="original_url"
          value={form.original_url || ''}
          onChange={handleChange}
          placeholder="https://..."
          className="input"
        />
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="alert-success">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary"
      >
        {submitting ? 'Lagrer...' : (submitLabel || 'Legg til konsert')}
      </button>
    </form>
  );
}
