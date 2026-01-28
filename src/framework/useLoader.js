// src/framework/useLoader.js
/*
const { useState, useEffect } = window.App.Hooks;

export function useLoader(fetcher) {
  const route = App.Router.getCurrentRoute();
  alert(router)
  if (!route) {
    throw new Error("useLoader must be used inside a route component");
  }

  const key = route.path; // "/" | "/blog"

  // 🔥 chuẩn hoá cache
  if (!window.__CACHE__) window.__CACHE__ = {};
  if (!window.__CACHE__.loaders) window.__CACHE__.loaders = {};

  if (!window.__CACHE__.loaders[key]) {
    window.__CACHE__.loaders[key] = {
      data: null,
      status: "idle",
      error: null,
      ts: 0
    };
  }

  const cache = window.__CACHE__.loaders[key];

  const [state, setState] = useState({
    data: cache.data,
    status: cache.status,
    error: cache.error
  });
  alert(JSON.stringify(data))

  // 🔥 load khi mount / đổi route
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // đã có data → sync
      if (cache.status === "success") {
        setState({
          data: cache.data,
          status: "success",
          error: null
        });
        return;
      }

      try {
        cache.status = "loading";
        setState(s => ({ ...s, status: "loading" }));

        const data = await fetcher();

        if (cancelled) return;

        cache.data = data;
        cache.status = "success";
        cache.error = null;
        cache.ts = Date.now();

        setState({
          data,
          status: "success",
          error: null
        });
      } catch (err) {
        cache.status = "error";
        cache.error = err;

        setState({
          data: null,
          status: "error",
          error: err
        });
      }
    }

    run();
    return () => { cancelled = true; };
  }, [key]);

  // 🔁 chỉ refetch, KHÔNG rerender route
  async function reload() {
    cache.status = "idle";
    cache.data = null;
    await Promise.resolve(); // giữ async contract
    setState(s => ({ ...s, status: "idle" }));
  }

  function invalidate() {
    delete window.__CACHE__.loaders[key];
  }

  return {
    ...state,
    reload,
    invalidate
  };
}
*/

// src/framework/useLoader.js
window.App = window.App || {};
(function (App) {
  const { useState, useEffect } = App.Hooks;

  function useLoader(fetcher) {
    const route = App.Router.getCurrentRoute();
    if (!route) {
      throw new Error("useLoader must be used inside a route component");
    }

    const key = route.path;

    if (!window.__CACHE__) window.__CACHE__ = {};
    if (!window.__CACHE__.loaders) window.__CACHE__.loaders = {};

    if (!window.__CACHE__.loaders[key]) {
      window.__CACHE__.loaders[key] = {
        data: null,
        status: "idle",
        error: null,
        ts: 0
      };
    }

    const cache = window.__CACHE__.loaders[key];

    const [state, setState] = useState({
      data: cache.data,
      status: cache.status,
      error: cache.error
    });

    useEffect(() => {
      let cancelled = false;

      async function run() {
        if (cache.status === "success") {
          setState({
            data: cache.data,
            status: "success",
            error: null
          });
          return;
        }

        try {
          cache.status = "loading";
          setState(s => ({ ...s, status: "loading" }));

          const data = await fetcher();

          if (cancelled) return;

          cache.data = data;
          cache.status = "success";
          cache.error = null;
          cache.ts = Date.now();

          setState({
            data,
            status: "success",
            error: null
          });
        } catch (err) {
          cache.status = "error";
          cache.error = err;
          setState({ data: null, status: "error", error: err });
        }
      }

      run();
      return () => { cancelled = true; };
    }, [key]);

    async function reload() {
      cache.status = "idle";
      cache.data = null;
      setState(s => ({ ...s, status: "idle" }));
    }

    function invalidate() {
      delete window.__CACHE__.loaders[key];
    }

    return { ...state, reload, invalidate };
  }

  // 🔥 GẮN VÀO APP
  App.useLoader = useLoader;

})(window.App);



