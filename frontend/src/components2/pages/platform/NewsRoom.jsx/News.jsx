import { Layout } from "./Magazine";
// Mock news data
const newsArticles = [
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

export default function News() {
  return (
    <Layout>
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
          {newsArticles.map((news, index) => (
            <article key={news.id} className="glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:w-1/4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-brand-80 text-white px-3 py-1 rounded-full text-sm">
                      {news.category}
                    </span>
                    <span className="text-gray-500 text-sm">{news.date}</span>
                  </div>
                </div>
                
                <div className="md:w-3/4">
                  <h2 className="text-2xl font-semibold text-blackOlive mb-3">
                    <a href={`/news/${news.slug}`} className="hover:text-brand transition-colors">
                      {news.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
                  <a 
                    href={`/news/${news.slug}`}
                    className="inline-flex items-center text-brand hover:text-brand-80 font-medium"
                  >
                    Read Full Story
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
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