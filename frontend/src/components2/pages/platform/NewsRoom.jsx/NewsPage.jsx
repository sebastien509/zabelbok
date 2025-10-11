import { useParams } from 'react-router-dom';
import { Layout } from './Magazine';
import SEO from '@/components2/SEO';
import { Link } from 'react-router-dom';

// Mock data for news articles
const newsArticles = {
  'company-sustainability-initiative': {
    id: 1,
    title: "Company Announces New Sustainability Initiative",
    content: `
      <p>In a groundbreaking move towards environmental stewardship, our company has unveiled an ambitious new sustainability initiative aimed at achieving carbon neutrality by 2030.</p>
      
      <h2>Commitment to Carbon Neutrality</h2>
      <p>The comprehensive plan includes transitioning to 100% renewable energy sources across all operations, implementing circular economy principles in our supply chain, and investing in carbon offset projects.</p>
      
      <p>"This initiative represents our commitment to not just being a business leader, but an environmental leader," said CEO Jane Smith. "We believe that sustainable practices are essential for long-term success and planetary health."</p>
      
      <h2>Key Initiatives</h2>
      <ul>
        <li>Transition to renewable energy by 2026</li>
        <li>Reduce waste by 75% through circular practices</li>
        <li>Invest $50M in carbon capture technology</li>
        <li>Partner with local communities for reforestation</li>
      </ul>
    `,
    excerpt: "Major corporation commits to carbon neutrality by 2030 with ambitious new environmental program.",
    date: "2024-01-15",
    category: "Press Release",
    author: "Corporate Communications",
    readTime: "4 min read",
    tags: ["Sustainability", "Corporate", "Environment", "Innovation"]
  },
  'industry-conference-innovation': {
    id: 2,
    title: "Industry Conference Highlights Innovation Trends",
    content: `<p>Conference content here...</p>`,
    excerpt: "Annual tech conference showcases groundbreaking innovations in sustainable technology.",
    date: "2024-01-14",
    category: "Event",
    author: "Events Team",
    readTime: "3 min read",
    tags: ["Conference", "Technology", "Innovation"]
  }
};

// Mock data for news list
const newsList = [
  {
    id: 1,
    title: "Company Announces New Sustainability Initiative",
    excerpt: "Major corporation commits to carbon neutrality by 2030 with ambitious new environmental program.",
    date: "2024-01-15",
    category: "Press Release",
    slug: "company-sustainability-initiative"
  },
  {
    id: 2,
    title: "Industry Conference Highlights Innovation Trends",
    excerpt: "Annual tech conference showcases groundbreaking innovations in sustainable technology.",
    date: "2024-01-14",
    category: "Event",
    slug: "industry-conference-innovation"
  },
  {
    id: 3,
    title: "New Research Study Published",
    excerpt: "Groundbreaking study reveals significant findings about consumer behavior and sustainability.",
    date: "2024-01-13",
    category: "Research",
    slug: "new-research-study-published"
  },
  {
    id: 4,
    title: "Partnership Announcement: Collaborative Project Launch",
    excerpt: "Leading organizations join forces to address global challenges through innovative solutions.",
    date: "2024-01-12",
    category: "Partnership",
    slug: "partnership-announcement"
  }
];

export default function NewsPage() {
  const { slug } = useParams();

  // If slug exists, show single news article
  if (slug) {
    const newsArticle = newsArticles[slug];

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
          tags={newsArticle.tags}
        />
        
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <span className="text-gray-500">{newsArticle.date} • {newsArticle.readTime}</span>
            </div>
            <h1 className="text-4xl font-bold text-blackOlive mb-4">{newsArticle.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{newsArticle.excerpt}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">CC</span>
              </div>
              <div>
                <p className="font-medium text-blackOlive">{newsArticle.author}</p>
                <p className="text-sm text-gray-500">Press Team</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8 rounded-lg overflow-hidden">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">News Article Image</span>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: newsArticle.content }}
          />

          {/* Article Footer */}
          <footer className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 mb-6">
              {newsArticle.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/tag/${tag.toLowerCase()}`}
                  className="bg-brand-40 text-blackOlive px-3 py-1 rounded-full text-sm hover:bg-brand-60 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-brand">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-brand">
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
        title="Newsroom"
        description="Stay updated with the latest announcements, press releases, and company news."
        canonical="/news"
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blackOlive mb-4">Newsroom</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest announcements, press releases, and company news.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid gap-6">
          {newsList.map((news) => (
            <article key={news.id} className="glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:w-1/4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-heritageRed text-white px-3 py-1 rounded-full text-sm">
                      {news.category}
                    </span>
                    <span className="text-gray-500 text-sm">{news.date}</span>
                  </div>
                </div>
                
                <div className="md:w-3/4">
                  <h2 className="text-2xl font-semibold text-blackOlive mb-3">
                    <Link to={`/news/${news.slug}`} className="hover:text-brand transition-colors">
                      {news.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
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
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 text-center">
          <div className="brand-tint-overlay rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-blackOlive mb-4">Stay Informed</h3>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Get the latest news and updates delivered directly to your inbox.
            </p>
            <form className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="submit"
                className="bg-blackOlive text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
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