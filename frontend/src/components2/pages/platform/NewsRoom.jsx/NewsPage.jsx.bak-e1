import { useParams, Link } from 'react-router-dom';
import SEO from '@/components2/SEO';
import { Layout } from './Magazine';
import newsroomData from './newsroom.json'; // Import newsroom data

export default function NewsPage() {
  const { slug } = useParams();
  const newsArticles = newsroomData.newsroom; // Use imported data

  // If slug exists, show single news article
  if (slug) {
    const newsArticle = newsArticles.find(article => article.slug === slug);

    if (!newsArticle) {
      return (
        <Layout>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-2xl font-bold text-blackOlive mb-4">News Article Not Found</h1>
            <Link to="/news" className="text-brand hover:text-brand-80">
              Back to News
            </Link>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <SEO
          title={newsArticle.title}
          description={newsArticle.excerpt}
          canonical={`/news/${slug}`}
          type="article"
          publishedTime={newsArticle.date}
          author={newsArticle.author}
          tags={newsArticle.keywords}
        />
        
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link to="/news" className="text-brand hover:text-brand-80">
              Newsroom
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{newsArticle.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-heritageRed text-white px-3 py-1 rounded-full text-sm">
                {newsArticle.category}
              </span>
              <span className="text-gray-500">{newsArticle.date} • {newsArticle.read_time} min read</span>
            </div>
            <h1 className="text-4xl font-bold text-blackOlive mb-4">{newsArticle.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{newsArticle.excerpt}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {newsArticle.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-blackOlive">{newsArticle.author}</p>
                <p className="text-sm text-gray-500">{newsArticle.author.includes('Team') ? 'Press Team' : 'Contributor'}</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {newsArticle.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={newsArticle.featured_image} 
                alt={newsArticle.title}
                className="w-full h-64 object-cover"
                 data-preload="false" loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {newsArticle.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Article Footer */}
          <footer className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 mb-6">
              {newsArticle.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="bg-brand-40 text-blackOlive px-3 py-1 rounded-full text-sm"
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
                to="/news"
                className="bg-brand-80 text-white px-6 py-2 rounded-md hover:bg-brand-60 transition-colors"
              >
                Back to News
              </Link>
            </div>
          </footer>
        </article>
      </Layout>
    );
  }

  // If no slug, show news list
  return (
    <Layout>
      <SEO
        title="Newsroom - E-stratèji"
        description="Stay updated with the latest announcements, press releases, and company news from E-stratèji."
        canonical="/news"
      />
      
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
        <div className="text-center mb-12 w-full min-w-0">
          <h1 className="text-3xl font-bold text-blackOlive mb-4">Newsroom</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest announcements, press releases, and company news.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 w-full min-w-0">
          {newsArticles.map((news) => (
            <article key={news.id} className="glass p-6 rounded-lg hover:shadow-lg transition-shadow w-full min-w-0">
              <div className="flex flex-col md:flex-row md:items-start gap-6 w-full min-w-0">
                <div className="md:w-1/4 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 min-w-0">
                    <span className="bg-brand-80 text-white px-3 py-1 rounded-full text-sm w-fit">
                      {news.category}
                    </span>
                    <span className="text-gray-500 text-sm">{news.date}</span>
                  </div>
                  {news.featured_image && (
                    <img 
                      src={news.featured_image} 
                      alt={news.title}
                      className="w-full h-32 object-cover rounded-lg mt-2 md:mt-0"
                       data-preload="false" loading="lazy"
                    />
                  )}
                </div>
                
                <div className="md:w-3/4 min-w-0">
                  <h2 className="text-2xl font-semibold text-blackOlive mb-3 break-words">
                    <Link to={`/news/${news.slug}`} className="hover:text-brand transition-colors">
                      {news.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 break-words">{news.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{news.read_time} min read</span>
                    <Link 
                      to={`/news/${news.slug}`}
                      className="inline-flex items-center text-brand hover:text-brand-80 font-medium"
                    >
                      Read Full Story
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 text-center w-full min-w-0">
          <div className="brand-tint-overlay rounded-2xl p-8 w-full min-w-0">
            <h3 className="text-2xl font-bold text-blackOlive mb-4">Stay Informed</h3>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Get the latest news and updates delivered directly to your inbox.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 w-full min-w-0 px-4 sm:px-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-brand min-w-0"
              />
              <button
                type="submit"
                className="bg-lime-700/80 text-white px-6 py-2 rounded-lg hover:bg-opacity-20 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}