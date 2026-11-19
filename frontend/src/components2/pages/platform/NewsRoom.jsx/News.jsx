import {
  Link,
} from "react-router-dom";

import SEO from "@/components2/SEO";

import useNewsroomContent from "@/hook/useNewsroomContent";

import {
  Layout,
} from "./Magazine";

import StoryMedia from "./StoryMedia";

export default function News() {
  const {
    news,
    loading,
  } =
    useNewsroomContent();

  const latestNews =
    news[0] ||
    null;

  const remainingNews =
    news.slice(1);

  return (
    <Layout>
      <SEO
        title="Newsroom - E-stratèji"
        description="Stay updated with the latest announcements, reporting and company news from E-stratèji."
        canonical="/news"
      />

      <div className="mx-auto min-w-0 w-full max-w-full px-4 py-8 sm:max-w-2xl sm:px-6 md:max-w-3xl lg:max-w-4xl lg:px-8 xl:max-w-5xl">
        {loading &&
        !latestNews ? (
          <div className="py-20 text-center text-gray-500">
            Loading newsroom…
          </div>
        ) : null}

        {latestNews && (
          <div className="mb-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="md:order-2">
                  <StoryMedia
                    story={
                      latestNews
                    }
                    className="h-64 md:h-full md:min-h-[380px]"
                  />
                </div>

                <div className="flex flex-col justify-center p-6 md:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                      {
                        latestNews.category
                      }
                    </span>

                    <span className="text-sm text-gray-500">
                      {
                        latestNews.date
                      }
                    </span>

                    {latestNews.read_time && (
                      <span className="text-sm text-gray-500">
                        •{" "}
                        {
                          latestNews.read_time
                        }{" "}
                        min read
                      </span>
                    )}
                  </div>

                  <h1 className="mb-4 text-2xl font-bold leading-tight text-blackOlive md:text-3xl">
                    <Link
                      to={`/news/${latestNews.slug}`}
                      className="transition-colors hover:text-brand"
                    >
                      {
                        latestNews.title
                      }
                    </Link>
                  </h1>

                  <p className="mb-6 text-base leading-relaxed text-gray-600 md:text-lg">
                    {
                      latestNews.excerpt
                    }
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500">
                      By{" "}
                      {
                        latestNews.author
                      }
                    </span>

                    <Link
                      to={`/news/${latestNews.slug}`}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-80 px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-60"
                    >
                      Read Full Story
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 w-full min-w-0 text-center">
          <h1 className="mb-3 text-3xl font-bold text-blackOlive">
            Newsroom
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Reporting, announcements and developments from E-strateji and across the Caribbean education ecosystem.
          </p>
        </div>

        <div className="grid w-full min-w-0 gap-6">
          {remainingNews.map(
            (item) => (
              <article
                key={
                  item.id
                }
                className="glass w-full min-w-0 rounded-lg p-5 transition-shadow hover:shadow-lg sm:p-6"
              >
                <div className="flex w-full min-w-0 flex-col gap-6 md:flex-row md:items-start">
                  <div className="min-w-0 md:w-1/4">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="w-fit rounded-full bg-brand-80 px-3 py-1 text-sm text-white">
                        {
                          item.category
                        }
                      </span>

                      <span className="text-sm text-gray-500">
                        {
                          item.date
                        }
                      </span>
                    </div>

                    <StoryMedia
                      story={
                        item
                      }
                      compact
                      className="h-32 rounded-lg"
                    />
                  </div>

                  <div className="min-w-0 md:w-3/4">
                    <h2 className="mb-3 break-words text-xl font-semibold text-blackOlive sm:text-2xl">
                      <Link
                        to={`/news/${item.slug}`}
                        className="transition-colors hover:text-brand"
                      >
                        {
                          item.title
                        }
                      </Link>
                    </h2>

                    <p className="mb-4 break-words text-gray-600">
                      {
                        item.excerpt
                      }
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        {item.read_time
                          ? `${item.read_time} min read`
                          : ""}
                      </span>

                      <Link
                        to={`/news/${item.slug}`}
                        className="inline-flex items-center font-medium text-brand hover:text-brand-80"
                      >
                        Read Full Story
                        <span className="ml-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          )}
        </div>

        <div className="mt-16 w-full min-w-0 text-center">
          <div className="brand-tint-overlay w-full min-w-0 rounded-2xl p-6 sm:p-8">
            <h3 className="mb-3 text-2xl font-bold text-blackOlive">
              Stay Informed
            </h3>

            <p className="mx-auto mb-6 max-w-md text-gray-700">
              Get the latest news and updates delivered directly to your inbox.
            </p>

            <form className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-lg border border-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />

              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-lime-700/80 px-6 py-2 text-white transition-colors hover:bg-opacity-100"
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
