import {
  useMemo,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import SEO from "@/components2/SEO";

import useNewsroomContent from "@/hook/useNewsroomContent";

import {
  Layout,
} from "./Magazine";

import StoryMedia from "./StoryMedia";
import MarkdownBody from "./MarkdownBody";

/* ============================================================
   CONTENT
============================================================ */

function inlineMarkup(
  value = ""
) {
  return String(
    value
  ).replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );
}

function ContentBlock({
  block,
}) {
  if (
    typeof block ===
    "string"
  ) {
    return (
      <p
        dangerouslySetInnerHTML={{
          __html:
            inlineMarkup(
              block
            ),
        }}
      />
    );
  }

  if (!block) {
    return null;
  }

  switch (
    block.type
  ) {
    case "list":
      return (
        <ul className="my-4 space-y-2">
          {(
            block.items ||
            []
          ).map(
            (
              item,
              index
            ) => (
              <li
                key={
                  index
                }
                className="flex items-start"
              >
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />

                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      inlineMarkup(
                        item
                      ),
                  }}
                />
              </li>
            )
          )}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="my-6 border-l-4 border-brand pl-4 text-lg italic text-gray-700">
          {
            block.content
          }
        </blockquote>
      );

    case "emphasis":
      return (
        <p
          className="my-4 text-lg font-semibold text-blackOlive"
          dangerouslySetInnerHTML={{
            __html:
              inlineMarkup(
                block.content
              ),
          }}
        />
      );

    default:
      return null;
  }
}

function ArticleSection({
  section,
}) {
  if (!section) {
    return null;
  }

  return (
    <section className="my-8">
      {section.title && (
        <h2 className="mb-4 text-2xl font-bold text-blackOlive">
          {
            section.title
          }
        </h2>
      )}

      <div className="space-y-4">
        {(
          section.content ||
          []
        ).map(
          (
            block,
            index
          ) => (
            <ContentBlock
              key={
                index
              }
              block={
                block
              }
            />
          )
        )}
      </div>
    </section>
  );
}

function ArticleBody({
  article,
}) {
  const content =
    article?.content;

  /*
   * Existing E-strateji structured articles.
   */
  if (
    content &&
    typeof content ===
      "object"
  ) {
    return (
      <>
        <div className="mb-8 space-y-4">
          {(
            content.introduction ||
            []
          ).map(
            (
              block,
              index
            ) => (
              <ContentBlock
                key={
                  index
                }
                block={
                  block
                }
              />
            )
          )}
        </div>

        {(
          content.sections ||
          []
        ).map(
          (
            section,
            index
          ) => (
            <ArticleSection
              key={
                index
              }
              section={
                section
              }
            />
          )
        )}
      </>
    );
  }

  /*
   * InthraCore / API body.
   */
  if (
    typeof content ===
    "string"
  ) {
    return (
      <MarkdownBody
        content={
          content
        }
      />
    );
  }

  return null;
}

/* ============================================================
   ARTICLE
============================================================ */

export default function ArticlePage() {
  const {
    slug,
  } =
    useParams();

  const {
    articles,
    loading,
  } =
    useNewsroomContent();

  const article =
    useMemo(
      () =>
        articles.find(
          (item) =>
            item.slug ===
            slug
        ),
      [
        articles,
        slug,
      ]
    );

  if (
    loading &&
    !article
  ) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
          Loading article…
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-blackOlive">
            Article Not Found
          </h1>

          <Link
            to="/magazine"
            className="text-brand hover:text-brand-80"
          >
            Back to Magazine
          </Link>
        </div>
      </Layout>
    );
  }

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
        title={`${article.title} - E-stratèji Magazine`}
        description={
          article.excerpt
        }
        canonical={`/articles/${slug}`}
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
            to="/magazine"
            className="text-brand hover:text-brand-80"
          >
            Magazine
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
            <span className="rounded-full bg-green-600 px-3 py-1 text-sm text-white">
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

              {article.position && (
                <p className="text-sm text-gray-500">
                  {
                    article.position
                  }
                </p>
              )}
            </div>
          </div>
        </header>

        <StoryMedia
          story={
            article
          }
          className="mb-8 aspect-[16/9] rounded-xl"
        />

        <div className="article-content mb-10">
          <ArticleBody
            article={
              article
            }
          />
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
                  className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                >
                  #
                  {
                    keyword
                  }
                </span>
              )
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              {article.source ===
              "inthracore"
                ? "Published via InthraCore"
                : "E-strateji Magazine"}
            </div>

            <Link
              to="/magazine"
              className="inline-flex items-center justify-center rounded-md bg-brand-80 px-6 py-2 text-white transition-colors hover:bg-brand-60"
            >
              Back to Magazine
            </Link>
          </div>
        </footer>
      </article>
    </Layout>
  );
}
