import { Link } from 'react-router-dom';
import { Layout } from "./Magazine";
import newsroomData from './newsroom.json'; // Import newsroom data

export default function News() {
  const newsArticles = newsroomData.newsroom;
  
  // Get the latest news article for the hero section
  const latestNews = newsArticles[0];
  // Get remaining news articles for the grid
  const remainingNews = newsArticles.slice(1);

  return (
    <Layout>
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
        
        {/* Hero Section - Latest News */}
        <div className="mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hero Image */}
              <div className="md:order-2">
                {latestNews.featured_image && (
                  <img 
                    src={latestNews.featured_image} 
                    alt={latestNews.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                )}
              </div>
              
              {/* Hero Content */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {latestNews.category}
                  </span>
                  <span className="text-gray-500 text-sm">{latestNews.date}</span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{latestNews.read_time} min read</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-blackOlive mb-4">
                  <Link to={`/news/${latestNews.slug}`} className="hover:text-brand transition-colors">
                    {latestNews.title}
                  </Link>
                </h1>
                
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {latestNews.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {latestNews.author}</span>
                  <Link 
                    to={`/news/${latestNews.slug}`}
                    className="bg-brand-80 text-white px-6 py-2 rounded-lg hover:bg-brand-60 transition-colors font-medium"
                  >
                    Read Full Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12 w-full min-w-0">
          <h1 className="text-3xl font-bold text-blackOlive mb-4">Newsroom</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest announcements, press releases, and company news.
          </p>
        </div>

        {/* News Grid - Remaining Articles */}
        <div className="grid gap-6 w-full min-w-0">
          {remainingNews.map((news) => (
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