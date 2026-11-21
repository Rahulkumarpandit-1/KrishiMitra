import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { knowledgeApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import type { KnowledgeArticle } from '../lib/types';

const CATEGORIES = ['all', 'Crops', 'Fertilizers', 'Irrigation', 'Pest Management', 'Government Schemes', 'FAQ'];
const CAT_KEYS: Record<string, string> = {
  all: 'knowledge_all',
  Crops: 'knowledge_categories_crops',
  Fertilizers: 'knowledge_categories_fertilizers',
  Irrigation: 'knowledge_categories_irrigation',
  'Pest Management': 'knowledge_categories_pest',
  'Government Schemes': 'knowledge_categories_schemes',
  FAQ: 'knowledge_categories_faq',
};

export default function KnowledgeCentre() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await knowledgeApi.list({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
      });
      setArticles(res.data.articles || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t, category, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('knowledge_title')}</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('knowledge_search')}
          className="input-field pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              category === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(CAT_KEYS[cat] as any)}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}
      {loading ? <LoadingSpinner /> : articles.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-16 h-16" />} title={t('knowledge_no_articles')} />
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/knowledge/${a.id}`)}
              className="card w-full text-left hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {language === 'hi' && a.title_hi ? a.title_hi : a.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{a.category}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {(language === 'hi' && a.content_hi ? a.content_hi : a.content)?.slice(0, 100)}...
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
