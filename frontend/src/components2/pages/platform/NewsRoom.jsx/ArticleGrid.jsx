import { Link } from 'react-router-dom';

export default function ArticleGrid({ articles, title }) {
  return (
    <section>
      <h2 className="text-3xl font-bold text-blackOlive mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <article key={article.id} className="glass rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="w-full h-40 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Article Image</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-40 text-blackOlive px-2 py-1 rounded text-xs">
                  {article.category}
                </span>
                <span className="text-gray-500 text-xs">{article.date}</span>
              </div>
              <h3 className="font-semibold text-blackOlive mb-2 line-clamp-2">
                <Link to={`/article/${article.slug}`} className="hover:text-brand transition-colors">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">By {article.author}</span>
                <Link 
                  to={`/article/${article.slug}`}
                  className="text-brand hover:text-brand-80 text-sm font-medium"
                >
                  Read →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}