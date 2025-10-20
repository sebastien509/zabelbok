import { Link } from "react-router-dom";

export default function FeaturedSection({ articles }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {articles.map((article) => (
        <div key={article.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div 
            className="h-52 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.featured_image})` }}
          />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {article.category}
              </span>
              <span className="text-gray-500 text-sm">{article.date}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              <Link to={`/article/${article.slug}`} className="hover:text-green-600 transition-colors">
                {article.title}
              </Link>
            </h3>
            <p className="text-gray-600 mb-4">{article.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">By {article.author}</span>
              <Link 
                to={`/article/${article.slug}`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Read Story →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}