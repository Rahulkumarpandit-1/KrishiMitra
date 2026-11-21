import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { knowledgeApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { Plus, Trash2, BookOpen, X } from 'lucide-react';
import type { KnowledgeArticle } from '../../lib/types';

export default function ManageKnowledge() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', title_hi: '', content: '', content_hi: '', category: 'Crops', source: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await knowledgeApi.list();
      setArticles(res.data.articles || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await knowledgeApi.create(form);
      setShowAdd(false);
      setForm({ title: '', title_hi: '', content: '', content_hi: '', category: 'Crops', source: '' });
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin_delete_confirm'))) return;
    try {
      await knowledgeApi.delete(id);
      setArticles(articles.filter((a) => a.id !== id));
    } catch {
      setError(t('common_error'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && articles.length === 0) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('admin_manage_knowledge')}</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> {t('admin_add_article')}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

      {articles.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-16 h-16" />} title={t('admin_no_articles')} />
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="card flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{language === 'hi' && a.title_hi ? a.title_hi : a.title}</p>
                <p className="text-xs text-gray-500">{a.category}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('admin_add_article')}</h2>
              <button onClick={() => setShowAdd(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (English)" className="input-field" />
            <input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} placeholder="Title (Hindi)" className="input-field" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="Crops">Crops</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Pest Management">Pest Management</option>
              <option value="Government Schemes">Government Schemes</option>
              <option value="FAQ">FAQ</option>
            </select>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content (English)" rows={4} className="input-field" />
            <textarea value={form.content_hi} onChange={(e) => setForm({ ...form, content_hi: e.target.value })} placeholder="Content (Hindi)" rows={4} className="input-field" />
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source" className="input-field" />
            <button onClick={handleAdd} disabled={saving || !form.title} className="btn-primary w-full">
              {saving ? t('common_loading') : t('admin_save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
