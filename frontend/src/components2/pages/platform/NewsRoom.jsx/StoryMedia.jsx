import {
  useEffect,
  useState,
} from "react";

export default function StoryMedia({
  story,
  className = "",
  imageClassName = "",
  compact = false,
}) {
  const [
    failed,
    setFailed,
  ] = useState(false);

  const src =
    story?.featured_image ||
    story?.image ||
    "";

  useEffect(() => {
    setFailed(false);
  }, [
    src,
  ]);

  if (
    src &&
    !failed
  ) {
    return (
      <div
        className={`
          relative
          overflow-hidden
          bg-gray-100
          ${className}
        `}
      >
        <img
          src={src}
          alt={
            story?.image_alt ||
            story?.title ||
            ""
          }
          onError={() =>
            setFailed(true)
          }
          loading="lazy"
          data-preload="false"
          className={`
            h-full
            w-full
            object-cover
            ${imageClassName}
          `}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        relative
        isolate
        flex
        min-h-[180px]
        overflow-hidden
        bg-[#172018]
        text-white
        ${className}
      `}
    >
      {/* subtle Caribbean/E-strateji field */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-50
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(141,182,0,.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(141,182,0,.08) 1px,
              transparent 1px
            )
          `,

          backgroundSize:
            "34px 34px",
        }}
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -right-20
          -top-24
          h-72
          w-72
          rounded-full
          bg-[#8DB600]/20
          blur-[80px]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-24
          -left-20
          h-64
          w-64
          rounded-full
          bg-[#C1272D]/15
          blur-[80px]
        "
      />

      <div
        className={`
          relative
          z-10
          flex
          w-full
          flex-col
          justify-between
          ${
            compact
              ? "p-5"
              : "p-7 md:p-8"
          }
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <span
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#b7d45c]
            "
          >
            {
              story?.category ||
              "E-strateji"
            }
          </span>

          <span
            className="
              text-[8px]
              uppercase
              tracking-[0.12em]
              text-white/30
            "
          >
            E-strateji
          </span>
        </div>

        <div
          className="
            mt-10
            max-w-[90%]
          "
        >
          <h3
            className={`
              font-semibold
              tracking-[-0.035em]
              ${
                compact
                  ? "text-[20px] leading-[1.08]"
                  : "text-[28px] leading-[1.04] md:text-[34px]"
              }
            `}
          >
            {
              story?.title ||
              "Story"
            }
          </h3>

          {(
            story?.key_sentence ||
            story?.excerpt
          ) && (
            <p
              className="
                mt-4
                max-w-[52ch]
                text-[11px]
                leading-5
                text-white/55
              "
            >
              {
                story.key_sentence ||
                story.excerpt
              }
            </p>
          )}

          <div
            className="
              mt-6
              flex
              gap-1
            "
          >
            <span className="h-[2px] w-7 bg-[#8DB600]" />
            <span className="h-[2px] w-3 bg-[#C1272D]" />
          </div>
        </div>
      </div>
    </div>
  );
}
