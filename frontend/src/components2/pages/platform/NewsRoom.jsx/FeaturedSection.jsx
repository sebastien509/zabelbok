import { Link } from "react-router-dom";

export default function FeaturedSection({ articles }) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-blackOlive mb-8">Featured Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map(article => (
          <article key={article.id} className="glass overflow-hidden rounded-lg">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Featured Image</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="bg-brand-80 text-white px-3 py-1 rounded-full text-sm">
                  {article.category}
                </span>
                <span className="text-gray-500 text-sm">{article.date}</span>
              </div>
              <h3 className="text-xl font-semibold text-blackOlive mb-3">
                <Link to={`/article/${article.slug}`} className="hover:text-brand transition-colors">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By {article.author}</span>
                <Link 
                  to={`/article/${article.slug}`}
                  className="text-brand hover:text-brand-80 font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}