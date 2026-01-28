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
// src/framework/useLoader.js
const { useState, useEffect } = window.App.Hooks;

function getKey(loader) {
  return loader.name || "__anonymous_loader__";
}

export function useLoader(loader) {
  if (typeof loader !== "function") {
    throw new Error("useLoader(loader) requires a function");
  }

  // 🔒 INIT GLOBAL CACHE
  if (!window.__CACHE__) {
    window.__CACHE__ = { loaders: {} };
  }

  const key = getKey(loader);

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

  // 🚀 LOAD ON MOUNT
  useEffect(() => {
    let cancelled = false;

    // đã có data → sync
    if (cache.status === "success") {
      setState({
        data: cache.data,
        status: "success",
        error: null
      });
      return;
    }

    async function run() {
      try {
        cache.status = "loading";
        setState(s => ({ ...s, status: "loading" }));

        const data = await loader();

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

    return () => {
      cancelled = true;
    };
  }, [key]);

  // 🔁 FORCE RELOAD (GIỐNG useEffect dep change)
  async function reload() {
    cache.status = "idle";
    cache.data = null;
    cache.error = null;
    cache.ts = 0;

    const data = await loader();

    cache.data = data;
    cache.status = "success";
    cache.ts = Date.now();

    setState({
      data,
      status: "success",
      error: null
    });
  }

  // 🧹 INVALIDATE CACHE ONLY
  function invalidate() {
    delete window.__CACHE__.loaders[key];
  }

  return {
    ...state,
    reload,
    invalidate
  };
}

// 🔥 GẮN VÀO GLOBAL APP
window.App = window.App || {};
window.App.useLoader = useLoader;


