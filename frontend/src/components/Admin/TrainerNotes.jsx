import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';

const BACKEND_URL = 'http://localhost:5000';

export default function TrainerNotes({ customerId, notes = [], onNoteAdded, onNoteDeleted, token }) {
  const { t } = useLanguage();
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const activeToken = token || sessionStorage.getItem('pulsefit_admin_token') || localStorage.getItem('pulsefit_admin_token');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ note: noteText.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save note');
      }

      setNoteText('');
      if (onNoteAdded) {
        onNoteAdded(data.note);
      }
    } catch (err) {
      console.error('Note creation error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm(t('admin.deleteNoteConfirm') || 'Delete note?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${customerId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (response.ok) {
        if (onNoteDeleted) {
          onNoteDeleted(noteId);
        }
      }
    } catch (err) {
      console.error('Note deletion error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>📝</span>
          <span>{t('admin.trainerNotesTitle')}</span>
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('admin.trainerNotesDesc')}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-amber-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={t('admin.addNotePlaceholder')}
          maxLength={2000}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {noteText.length} / 2000
          </span>

          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!noteText.trim() || isSubmitting}
            className="px-4"
          >
            {isSubmitting ? t('admin.btnSavingNote') : t('admin.btnAddNote')}
          </Button>
        </div>
      </form>

      {/* Existing Notes List */}
      <div className="space-y-2.5 pt-2">
        {notes.length > 0 ? (
          notes.map((n) => {
            const formattedDate = new Date(n.createdAt || n.created_at).toLocaleString();
            return (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-1.5 group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 border-b border-slate-900 pb-1">
                  <span className="font-semibold text-emerald-400">⚡ Trainer Note</span>
                  <div className="flex items-center gap-2">
                    <span>{formattedDate}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-slate-500 hover:text-red-400 text-xs px-1 cursor-pointer transition-colors"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {n.note}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-6 px-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
            <p className="text-xs text-slate-500">{t('admin.noNotesText')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
