import React from 'react';

interface RelatedLesson {
  title: string;
  slug: string;
}

interface GlossaryTermProps {
  term: string;
  termEn?: string;
  definition: string;
  example?: string;
  relatedLessons?: RelatedLesson[];
  basePath?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  termEn,
  definition,
  example,
  relatedLessons = [],
  basePath = '/',
}) => {
  return (
    <div className="glass-card p-6 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-100 m-0">
            {term}
          </h3>
          {termEn && (
            <span className="text-sm text-gray-400 font-mono">
              {termEn}
            </span>
          )}
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Термин
        </span>
      </div>

      <p className="text-gray-300 mb-4 leading-relaxed">
        {definition}
      </p>

      {example && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-400 mb-2">Пример:</div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
            <code className="text-sm text-gray-200 whitespace-pre-wrap">
              {example}
            </code>
          </div>
        </div>
      )}

      {relatedLessons.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-400 mb-2">Подробнее в уроках:</div>
          <div className="flex flex-wrap gap-2">
            {relatedLessons.map((lesson, index) => (
              <a
                key={index}
                href={`${basePath}course/${lesson.slug}`}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg
                         bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200
                         border border-white/10 hover:border-white/20
                         transition-all duration-200"
              >
                <span className="mr-1.5">📖</span>
                {lesson.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlossaryTerm;
