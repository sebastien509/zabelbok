import { useParams, Link } from 'react-router-dom';
import SEO from '@/components2/SEO';
import { Layout } from './Magazine';
import articlesData from './articles.json'; // Import articles data

export default function ArticlePage() {
  const { slug } = useParams();
  const articles = articlesData.articles; // Use imported data

  const article = articles.find(article => article.slug === slug);

  if (!article) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-blackOlive mb-4">Article Not Found</h1>
          <Link to="/magazine" className="text-brand hover:text-brand-80">
            Back to Magazine
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${article.title} - E-stratèji Magazine`}
        description={article.excerpt}
        canonical={`/articles/${slug}`}
        type="article"
        publishedTime={article.date}
        author={article.author}
        tags={article.keywords}
      />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/magazine" className="text-brand hover:text-brand-80">
            Magazine
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              {article.category}
            </span>
            <span className="text-gray-500">{article.date} • {article.read_time} min read</span>
          </div>
          <h1 className="text-4xl font-bold text-blackOlive mb-4">{article.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {article.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-blackOlive">{article.author}</p>
              <p className="text-sm text-gray-500">{article.position}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-8 max-h-[500px] rounded-lg overflow-hidden">
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full min-h-64 object-cover"
               data-preload="false" loading="lazy"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Article Footer */}
        <footer className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 mb-6">
            {article.keywords.map(keyword => (
              <span
                key={keyword}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
              >
                #{keyword}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
            
            <Link 
              to="/magazine"
              className="bg-brand-80 text-white px-6 py-2 rounded-md hover:bg-brand-60 transition-colors"
            >
              Back to Magazine
            </Link>
          </div>
        </footer>
      </article>
    </Layout>
  );
}