import {
  Link,
  useParams,
} from "react-router-dom";

import SEO from "@/components2/SEO";

import useNewsroomContent from "@/hook/useNewsroomContent";

import {
  Layout,
} from "./Magazine";

import News from "./News";
import StoryMedia from "./StoryMedia";

export default function NewsPage() {
  const {
    slug,
  } =
    useParams();

  /*
   * Preserve current route behavior if NewsPage is also mounted
   * at /news without a slug.
   */
  if (!slug) {
    return <News />;
  }

  const {
    news,
    loading,
  } =
    useNewsroomContent();

  const article =
    news.find(
      (item) =>
        item.slug ===
        slug
    );

  if (
    loading &&
    !article
  ) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
          Loading story…
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-blackOlive">
            News Article Not Found
          </h1>

          <Link
            to="/news"
            className="text-brand hover:text-brand-80"
          >
            Back to News
          </Link>
        </div>
      </Layout>
    );
  }

  const paragraphs =
    typeof article.content ===
      "string"
      ? article.content
          .split(
            /\n\s*\n/
          )
          .filter(Boolean)
      : [];

  const initials =
    String(
      article.author ||
      "E-strateji"
    )
      .split(
        /\s+/
      )
      .filter(Boolean)
      .slice(
        0,
        2
      )
      .map(
        (name) =>
          name[0]
      )
      .join("")
      .toUpperCase();

  return (
    <Layout>
      <SEO
        title={
          article.title
        }
        description={
          article.excerpt
        }
        canonical={`/news/${slug}`}
        type="article"
        publishedTime={
          article.date
        }
        author={
          article.author
        }
        tags={
          article.keywords
        }
      />

      <article className="mx-auto min-w-0 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm">
          <Link
            to="/news"
            className="text-brand hover:text-brand-80"
          >
            Newsroom
          </Link>

          <span className="mx-2 text-gray-400">
            /
          </span>

          <span className="text-gray-600">
            {
              article.title
            }
          </span>
        </nav>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-heritageRed px-3 py-1 text-sm text-white">
              {
                article.category
              }
            </span>

            <span className="text-sm text-gray-500">
              {
                article.date
              }

              {article.read_time
                ? ` • ${article.read_time} min read`
                : ""}
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight text-blackOlive sm:text-4xl">
            {
              article.title
            }
          </h1>

          <p className="mb-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
            {
              article.excerpt
            }
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <span className="text-sm font-medium text-gray-600">
                {
                  initials
                }
              </span>
            </div>

            <div>
              <p className="font-medium text-blackOlive">
                {
                  article.author
                }
              </p>

              <p className="text-sm text-gray-500">
                {
                  article.position ||
                  "Contributor"
                }
              </p>
            </div>
          </div>
        </header>

        <StoryMedia
          story={
            article
          }
          className="mb-8 aspect-[16/9] rounded-xl"
        />

        <div className="prose prose-lg mb-8 max-w-none">
          {paragraphs.map(
            (
              paragraph,
              index
            ) => (
              <p
                key={
                  index
                }
                className="mb-4 leading-relaxed text-gray-700"
              >
                {
                  paragraph
                }
              </p>
            )
          )}
        </div>

        <footer className="border-t border-gray-200 pt-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {(
              article.keywords ||
              []
            ).map(
              (keyword) => (
                <span
                  key={
                    keyword
                  }
                  className="rounded-full bg-brand-40 px-3 py-1 text-sm text-blackOlive"
                >
                  #
                  {
                    keyword
                  }
                </span>
              )
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/news"
              className="rounded-md bg-brand-80 px-6 py-2 text-white transition-colors hover:bg-brand-60"
            >
              Back to News
            </Link>
          </div>
        </footer>
      </article>
    </Layout>
  );
}
