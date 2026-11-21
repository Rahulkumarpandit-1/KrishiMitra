import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { knowledgeApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { KnowledgeArticle } from '../lib/types';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await knowledgeApi.get(parseInt(id));
      setArticle(res.data.article);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error || !article) return <ErrorMessage message={error} onRetry={load} />;

  const title = language === 'hi' && article.title_hi ? article.title_hi : article.title;
  const content = language === 'hi' && article.content_hi ? article.content_hi : article.content;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-400">{article.category}</p>
        </div>
      </div>

      <div className="card">
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {content}
        </div>
        {article.source && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">{t('knowledge_source')}: {article.source}</p>
          </div>
        )}
      </div>
    </div>
  );
}
