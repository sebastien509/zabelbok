import { useParams, Link } from 'react-router-dom';
import SEO from '@/components2/SEO';
import { Layout } from './Magazine';
import articlesData from './articles.json';
import { useMemo } from 'react';

/** --- Simple Markdown approach (no extra installs) ---
 * We will:
 * 1) Convert your plain text to lightweight Markdown (add headings + bold list items)
 * 2) Convert that Markdown to basic HTML
 * 3) Inject it into the page
 *
 * NOTE: This is intentionally minimal and not a full Markdown engine.
 * It’s enough for headings, paragraphs, lists, bold (**text**), and blockquotes (>).
 */

// Headings we want to render larger (H2)
const SUBHEADS = new Set([
  'The Tech Gap and Weak Infrastructure',
  'Economic Reality and the Brain Drain',
  'Policies, Paperwork, and Politics',
  'Cultural and Social Factors',
  'The Path to Progress',
  'The Dream',
  'Key Takeaways',
  'What progress could look like'
]);

// List sections where following lines should become bold bullet items
const LIST_TRIGGERS = new Set([
  'The reason is simple:',
  'Here’s what progress could look like:',
  "Here's what progress could look like:",
  'Key Takeaways'
]);

function toMarkdownLoose(plain = '') {
  const lines = plain.split(/\r?\n/);
  const out = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Blank line handling ends list sections too
    if (!line) {
      if (inList) inList = false;
      out.push('');
      continue;
    }

    // If this line is exactly a known subhead -> make it Markdown H2
    if (SUBHEADS.has(line)) {
      out.push(`## ${line}`);
      continue;
    }

    // If this line is a list trigger -> keep the trigger as a paragraph and switch to list mode
    if (LIST_TRIGGERS.has(line)) {
      out.push(line);
      inList = true;
      continue;
    }

    // While in a list section: convert each non-empty line to bold bullet
    if (inList) {
      out.push(`- **${line}**`);
      continue;
    }

    // Quote lines (if user prefixed with a curly-quote line, we won't detect; use '>' if desired)
    if (line.startsWith('>')) {
      out.push(line); // already markdown quote
      continue;
    }

    // First line could be the H1 title if it reads like a title (heuristic: very short or has capitalized words)
    // We won’t force this; your page already renders the page title above.

    // Default: keep as normal paragraph text
    out.push(line);
  }

  return out.join('\n');
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Very basic Markdown -> HTML converter for the subset we generate:
 * - Headings (#, ##, ###)
 * - Bold (**bold**)
 * - Unordered lists (- item)
 * - Blockquotes (> quote)
 * - Paragraphs (by blank lines)
 */
function markdownToHtmlBasic(md = '') {
  // Escape first to avoid injecting raw HTML, then re-introduce our minimal tags
  md = escapeHtml(md);

  // Bold **text**
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const lines = md.split('\n');
  const htmlParts = [];
  let inList = false;
  let inBlockquote = false;
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length) {
      htmlParts.push(`<p>${paragraph.join(' ')}</p>`);
      paragraph = [];
    }
  }

  function endList() {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  }

  function endBlockquote() {
    if (inBlockquote) {
      htmlParts.push('</blockquote>');
      inBlockquote = false;
    }
  }

  for (let raw of lines) {
    const line = raw; // already escaped
    const trimmed = line.trim();

    // Blank line -> end paragraph/list/blockquote as needed
    if (!trimmed) {
      flushParagraph();
      endList();
      endBlockquote();
      continue;
    }

    // Headings
    if (/^###\s+/.test(trimmed)) {
      flushParagraph(); endList(); endBlockquote();
      htmlParts.push(`<h3>${trimmed.replace(/^###\s+/, '')}</h3>`);
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushParagraph(); endList(); endBlockquote();
      htmlParts.push(`<h2>${trimmed.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flushParagraph(); endList(); endBlockquote();
      htmlParts.push(`<h1>${trimmed.replace(/^#\s+/, '')}</h1>`);
      continue;
    }

    // Blockquote
    if (/^&gt;\s?/.test(trimmed)) {
      flushParagraph(); endList();
      const content = trimmed.replace(/^&gt;\s?/, '');
      if (!inBlockquote) {
        htmlParts.push('<blockquote>');
        inBlockquote = true;
      }
      htmlParts.push(`<p>${content}</p>`);
      continue;
    }

    // Unordered list item
    if (/^-\s+/.test(trimmed)) {
      flushParagraph(); endBlockquote();
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${trimmed.replace(/^-\s+/, '')}</li>`);
      continue;
    }

    // Otherwise, part of a paragraph
    paragraph.push(trimmed);
  }

  // Close any open blocks
  flushParagraph();
  endList();
  endBlockquote();

  return htmlParts.join('\n');
}

export default function ArticlePage() {
  const { slug } = useParams();
  const articles = articlesData?.articles ?? [];

  const article = useMemo(
    () => articles.find(a => a.slug === slug),
    [articles, slug]
  );

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

  // 1) Start from the raw text stored in JSON
  const rawText = article.content ?? '';

  // 2) Convert that plain text to simple markdown with our rules
  const md = useMemo(() => toMarkdownLoose(rawText), [rawText]);

  // 3) Convert markdown to minimal HTML
  const html = useMemo(() => markdownToHtmlBasic(md), [md]);

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

      {/* Small typography tweak so H2/H3 look bigger even without Tailwind Typography */}
      <style>{`
        .article-body h1 { font-size: 2rem; line-height: 1.2; font-weight: 800; margin: 1.25rem 0 .75rem; }
        .article-body h2 { font-size: 1.5rem; line-height: 1.25; font-weight: 800; margin: 1rem 0 .5rem; }
        .article-body h3 { font-size: 1.25rem; line-height: 1.3; font-weight: 700; margin: .75rem 0 .5rem; }
        .article-body p { margin: .75rem 0; color: #374151; }
        .article-body ul { list-style: disc; padding-left: 1.25rem; margin: .75rem 0; }
        .article-body li { margin: .25rem 0; font-weight: 600; } /* make items bold */
        .article-body blockquote { border-left: 4px solid #10b981; padding-left: .75rem; color: #111827; font-style: italic; margin: 1rem 0; }
      `}</style>

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
            <span className="text-gray-500">
              {article.date} • {article.read_time} min read
            </span>
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
              data-preload="false"
              loading="lazy"
            />
          </div>
        )}

        {/* Article Content (Markdown -> HTML basic) */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Article Footer */}
        <footer className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 mb-6">
            {(article.keywords ?? []).map((keyword) => (
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
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
