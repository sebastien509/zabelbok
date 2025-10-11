import { useParams } from 'react-router-dom';
import { Layout } from './Magazine';
import SEO from '@/components2/SEO';
import { Link } from 'react-router-dom';


// Mock data for articles
const articlesData = {
  'future-sustainable-business': {
    id: 1,
    title: "The Future of Sustainable Business",
    content: `
      <p>In today's rapidly evolving business landscape, sustainability has transitioned from a nice-to-have to a strategic imperative. Companies that embrace sustainable practices are not only contributing to environmental preservation but are also discovering new avenues for growth and innovation.</p>
      
      <h2>The Business Case for Sustainability</h2>
      <p>Research consistently shows that sustainable companies often outperform their peers in the long run. They benefit from reduced operational costs, enhanced brand reputation, and increased customer loyalty.</p>
      
      <p>Moreover, investors are increasingly considering environmental, social, and governance (ESG) factors in their investment decisions, making sustainability a key driver of financial performance.</p>
      
      <h2>Innovative Approaches</h2>
      <p>Forward-thinking companies are implementing circular economy principles, reducing waste through innovative product design, and embracing renewable energy sources. These approaches not only minimize environmental impact but also create new business opportunities.</p>
      
      <blockquote>
        <p>"Sustainability is no longer an option but a necessity for long-term business success."</p>
      </blockquote>
      
      <h2>Key Trends to Watch</h2>
      <ul>
        <li>Circular economy adoption</li>
        <li>Renewable energy integration</li>
        <li>Sustainable supply chain management</li>
        <li>Green technology investments</li>
      </ul>
    `,
    image: "/images/featured-1.jpg",
    category: "Business",
    date: "2024-01-15",
    author: "Sarah Johnson",
    excerpt: "How companies are adapting to the new green economy and making sustainability profitable.",
    readTime: "5 min read",
    tags: ["Sustainability", "Business", "Innovation", "ESG"]
  },
  'tech-innovations-healthcare': {
    id: 2,
    title: "Tech Innovations Changing Healthcare",
    content: `<p>Healthcare technology content here...</p>`,
    image: "/images/featured-2.jpg",
    category: "Technology",
    date: "2024-01-14",
    author: "Mike Chen",
    excerpt: "From AI diagnostics to telemedicine, technology is revolutionizing patient care.",
    readTime: "4 min read",
    tags: ["Technology", "Healthcare", "AI", "Innovation"]
  }
};

export default function Articles() {
  const { slug } = useParams();
  const article = articlesData[slug];

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
        title={article.title}
        description={article.excerpt}
        canonical={`/article/${slug}`}
        type="article"
        publishedTime={article.date}
        author={article.author}
        tags={article.tags}
      />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/magazine" className="text-brand hover:text-brand-80">
            Magazine
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/category/${article.category.toLowerCase()}`} className="text-brand hover:text-brand-80">
            {article.category}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Article</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-brand-80 text-white px-3 py-1 rounded-full text-sm">
              {article.category}
            </span>
            <span className="text-gray-500">{article.date} • {article.readTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-blackOlive mb-4">{article.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">
                {article.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-blackOlive">{article.author}</p>
              <p className="text-sm text-gray-500">Senior Writer</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Featured Article Image</span>
          </div>
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Footer */}
        <footer className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 mb-6">
            {article.tags.map(tag => (
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