import DOMPurify from "dompurify";

function inlineMarkup(value = "") {
  const escaped = String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  const linked = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
    '<a href="$2" class="text-brand underline underline-offset-2 hover:text-brand-80">$1</a>'
  );

  const strong = linked.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  const emphasis = strong.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    "<em>$1</em>"
  );

  const code = emphasis.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-gray-100 px-1.5 py-0.5 text-[0.92em]">$1</code>'
  );

  return DOMPurify.sanitize(code, {
    ALLOWED_TAGS: ["a", "strong", "em", "code"],
    ALLOWED_ATTR: ["href", "class", "target", "rel"],
  });
}

function Inline({ children }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: inlineMarkup(children),
      }}
    />
  );
}

export default function MarkdownBody({ content = "" }) {
  const lines = String(content)
    .replace(/\r\n/g, "\n")
    .split("\n");

  const nodes = [];
  let paragraph = [];
  let list = [];
  let listType = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;

    const text = paragraph.join(" ").trim();

    if (text) {
      nodes.push(
        <p
          key={`p-${nodes.length}`}
          className="mb-5 leading-8 text-gray-700"
        >
          <Inline>{text}</Inline>
        </p>
      );
    }

    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;

    const Tag = listType === "ol" ? "ol" : "ul";

    nodes.push(
      <Tag
        key={`list-${nodes.length}`}
        className={
          listType === "ol"
            ? "mb-6 ml-6 list-decimal space-y-2 text-gray-700"
            : "mb-6 ml-6 list-disc space-y-2 text-gray-700"
        }
      >
        {list.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="leading-7"
          >
            <Inline>{item}</Inline>
          </li>
        ))}
      </Tag>
    );

    list = [];
    listType = null;
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();

      const level = heading[1].length;
      const classes =
        level === 1
          ? "mb-4 mt-10 text-3xl font-bold leading-tight text-blackOlive"
          : level === 2
            ? "mb-4 mt-9 text-2xl font-bold leading-tight text-blackOlive"
            : "mb-3 mt-7 text-xl font-semibold leading-tight text-blackOlive";

      const HeadingTag =
        level === 1
          ? "h1"
          : level === 2
            ? "h2"
            : level === 3
              ? "h3"
              : "h4";

      nodes.push(
        <HeadingTag
          key={`h-${index}`}
          className={classes}
        >
          <Inline>{heading[2]}</Inline>
        </HeadingTag>
      );

      return;
    }

    const quote = line.match(/^>\s?(.*)$/);

    if (quote) {
      flushParagraph();
      flushList();

      nodes.push(
        <blockquote
          key={`q-${index}`}
          className="my-7 border-l-4 border-brand pl-5 text-lg italic leading-8 text-gray-700"
        >
          <Inline>{quote[1]}</Inline>
        </blockquote>
      );

      return;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);

    if (unordered) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      list.push(unordered[1]);
      return;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);

    if (ordered) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      list.push(ordered[1]);
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return <div className="article-markdown">{nodes}</div>;
}
