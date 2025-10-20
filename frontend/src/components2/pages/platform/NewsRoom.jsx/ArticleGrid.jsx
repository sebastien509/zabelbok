import { Link } from "react-router-dom";

export default function ArticleGrid({ articles }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <div key={article.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div 
            className="h-40 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.featured_image})` }}
          />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                {article.category}
              </span>
              <span className="text-gray-500 text-xs">{article.date}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              <Link to={`/article/${article.slug}`} className="hover:text-blue-600 transition-colors">
                {article.title}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{article.read_time} min read</span>
              <Link 
                to={`/article/${article.slug}`}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}