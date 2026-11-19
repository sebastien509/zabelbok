import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getNewsroomContent,
} from "@/services/newsroom";

export default function useNewsroomContent() {
  const [
    state,
    setState,
  ] = useState({
    articles: [],
    news: [],
    loading: true,
    error: null,
    source: null,
  });

  const refresh =
    useCallback(
      async () => {
        setState(
          (current) => ({
            ...current,
            loading: true,
            error: null,
          })
        );

        try {
          const result =
            await getNewsroomContent();

          setState({
            articles:
              result.articles ||
              [],

            news:
              result.news ||
              [],

            loading:
              false,

            error:
              null,

            source:
              result.source,
          });
        } catch (error) {
          setState({
            articles: [],
            news: [],
            loading:
              false,
            error,
            source:
              null,
          });
        }
      },
      []
    );

  useEffect(() => {
    refresh();
  }, [
    refresh,
  ]);

  return {
    ...state,
    refresh,
  };
}
