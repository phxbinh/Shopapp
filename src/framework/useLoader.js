// src/framework/useLoader.js
const { useState, useEffect } = window.App.Hooks;

export function useLoader_() {
  const route = App.Router.getCurrentRoute();
  if (!route) {
    throw new Error("useLoader must be used inside a route");
  }

  const key = route.path;          // "/" | "/blog"
  const loader = route.loader;

  if (!window.__CACHE__) {
    window.__CACHE__ = { loaders: {} };
  }
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

  // 🔥 LOAD ON MOUNT / ROUTE CHANGE
  useEffect(() => {
    if (!loader) return;

    // đã có data → sync
    if (cache.status === "success") {
      setState({
        data: cache.data,
        status: "success",
        error: null
      });
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        cache.status = "loading";
        setState(s => ({ ...s, status: "loading" }));

        const data = await loader({
          params: route.props?.params,
          query: route.props?.query,
          route
        });

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

  // 🔁 FORCE RELOAD
  async function reload() {
    cache.status = "idle";
    cache.data = null;
    await App.Router.reload();
  }

  // 🧹 INVALIDATE ONLY
  function invalidate() {
    delete window.__CACHE__.loaders[key];
  }

  return {
    ...state,
    reload,
    invalidate
  };
}

export function useLoader(fetcher) {
  const route = App.Router.getCurrentRoute();
  if (!route) throw new Error("useLoader must be used inside a route");

  const key = route.path;

  window.__CACHE__ = window.__CACHE__ || {};
  window.__CACHE__.loaders = window.__CACHE__.loaders || {};

  const store = window.__CACHE__.loaders;

  if (!store[key]) {
    store[key] = { status: "loading", data: null, error: null };

    fetcher()
      .then(data => {
        store[key] = { status: "success", data, error: null };
        App.Router.rerender();
      })
      .catch(err => {
        store[key] = { status: "error", data: null, error: err };
        App.Router.rerender();
      });
  }

  return {
    ...store[key],
    reload() {
      delete store[key];
      App.Router.rerender();
    },
    invalidate() {
      delete store[key];
    }
  };
}

