// src/framework/router.js -> road to SSR
window.App = window.App || {};
(function (App) {
  const { h, render } = App.VDOM;
  const { log } = App.Debugger;

  const Router = (() => {
    let routes = [];
    let notFound = ({pathname}) => h("div", null, `404 - Not Found: ${pathname}`);
    let mountEl = null;
    let beforeHook = null;
    let afterHook = null;
    let currentPath = "";
    let useHash = true;
    let currentRoute = null;
    let nav = null;

    function pathToRegex(path) {
      return new RegExp("^" + path.replace(/:\w+/g, "([^/]+)") + "$");
    }

    function getParams(keys, match) {
      return Object.fromEntries(keys.map((k, i) => [k, match[i + 1]]));
    }

    function getQueryParams(search) {
      return Object.fromEntries(new URLSearchParams(search));
    }

function addRoute(pathOrObj, component) {
  // ✅ API đơn giản: addRoute("/about", AboutPage)
  if (typeof pathOrObj === "string") {
    routes.push({
      path: pathOrObj,
      regex: pathToRegex(pathOrObj),
      keys: (pathOrObj.match(/:(\w+)/g) || []).map(k => k.slice(1)),
      component: component,
      loader: null,           // ✅ FIX
      children: [],
    });
    return;
  }

  // ✅ API object: addRoute({ path, component, loader, children })
  const route = pathOrObj;
  const fullPath = route.path;

  const record = {
    path: fullPath,
    regex: pathToRegex(fullPath),
    keys: (fullPath.match(/:(\w+)/g) || []).map(k => k.slice(1)),
    component: route.component || null,
    loader: route.loader || null,   // ✅ OK
    redirect: route.redirect,
    meta: route.meta || {},
    parent: route.parent || null,
    type: route.type || null,
    title: route.title || null,
    children: [],
  };

  routes.push(record);

  if (route.children) {
    route.children.forEach(child =>
      addRoute({
        ...child,
        path: (
          fullPath.replace(/\/$/, "") +
          "/" +
          String(child.path || "").replace(/^\//, "")
        ).replace(/\/+/g, "/"),
        parent: record,
      })
    );
  }
}

    function matchRoutes(pathname) {
      const matched = [];
      function recursive(list) {
        for (let r of list) {
          const match = pathname.match(r.regex);
          if (match) {
            matched.push(r);
            if (r.children && r.children.length > 0) recursive(r.children);
            break;
          }
        }
      }
      recursive(routes);
      return matched;
    }
    
    //cài đặt để gọi notFound cho nội dung của route tương ứng
    function setNotFound(component) { notFound = component; }

    function beforeEach(hook) { beforeHook = hook; }
    function afterEach(hook) { afterHook = hook; }

    // 👉 navigateTo: chỉ đổi URL, không render
async function navigateTo(url) {
  if (currentPath === url) return;

  const from = currentPath;
  const to = url;

  const proceed = async (nextUrl) => {
    if (nextUrl && nextUrl !== true) return navigateTo(nextUrl);

    if (!useHash) {
      history.pushState(null, "", url);
      currentPath = url;          // 🔥 BẮT BUỘC
      await renderRoute(from, url);
    } else {
      window.location.hash = "#" + url;
    }
  };

  if (beforeHook) beforeHook(to, from, proceed);
  else await proceed(true);
}



    function ErrorBoundary({ component: Comp, props }) {
      try { return h(Comp, props); }
      catch (err) {
        console.error("ErrorBoundary caught:", err);
        return h("div", { style: { color: "red" } }, "⚠️ Something went wrong.");
      }
    }

/*
    function renderRoute(from, to) {
      const loc = useHash
        ? window.location.hash.slice(1) || "/"
        : window.location.pathname + window.location.search;

      const [pathname, search = ""] = loc.split("?");
      const query = getQueryParams("?" + search);
      const matched = matchRoutes(pathname);

      let route = {
        path: pathname,
        component: notFound,
        props: { params: {}, query },
        node: () => notFound(),
      };

      if (matched.length) {
        const last = matched[matched.length - 1];
        const match = pathname.match(last.regex);
        const params = getParams(last.keys, match);
        const routeProps = { params, query };

        let node = () => null;
        for (let i = matched.length - 1; i >= 0; i--) {
          const r = matched[i];
          const ParentComp = r.component;
          const child = node;

          node = (p) =>
            ParentComp({
              ...p,
              outlet: (childProps = {}) => child({ ...p, ...childProps })
            });
        }

        route = { ...last, props: routeProps, component: last.component, node };

        log("🎞️Render", `Render in renderRoute ${pathname}`, "indiv");

        render(() => h(App.VDOM.Fragment, null, [
           nav ? h(nav, {key: "navbar"}) : null,
           h("div", { id:"breadcrumb", key: "breadcrumb" }, ""),
           h(ErrorBoundary, { component: node, props: routeProps })
        ]), mountEl);

      } else {
        render(()=>h(notFound, {pathname}), mountEl);
      }

      currentPath = pathname;
      currentRoute = route;
      if (afterHook) afterHook(route, from || null);
    }

*/


async function renderRoute(from, to) {
  const loc = useHash
    ? window.location.hash.slice(1) || "/"
    : window.location.pathname + window.location.search;

  const [pathname, search = ""] = loc.split("?");
  const query = getQueryParams("?" + search);
  const matched = matchRoutes(pathname);

  let route = {
    path: pathname,
    component: notFound,
    props: { params: {}, query, data: null },
    node: () => notFound(),
  };

  if (matched.length) {
    const last = matched[matched.length - 1];
    const match = pathname.match(last.regex);
    const params = getParams(last.keys, match);

    const routeProps = { params, query, data: null };

    // ✅ LOADER
    if (last.loader) {
      try {
        routeProps.data = await last.loader({
          params,
          query,
          route: last
        });
      } catch (err) {
        console.error("Route loader error:", err);
      }
    }

    let node = () => null;
    for (let i = matched.length - 1; i >= 0; i--) {
      const r = matched[i];
      const ParentComp = r.component;
      const child = node;

      node = (p) =>
        ParentComp({
          ...p,
          outlet: (childProps = {}) => child({ ...p, ...childProps })
        });
    }

    route = { ...last, props: routeProps, component: last.component, node };

    log("🎞️Render", `Render in renderRoute ${pathname}`, "indiv");

    render(() => h(App.VDOM.Fragment, null, [
      nav ? h(nav, { key: "navbar" }) : null,
      h("div", { id: "breadcrumb", key: "breadcrumb" }, ""),
      h(ErrorBoundary, { component: node, props: routeProps })
    ]), mountEl);

  } else {
    render(() => h(notFound, { pathname }), mountEl);
  }

  currentPath = pathname;
  currentRoute = route;
  if (afterHook) afterHook(route, from || null);
}


    function navbarDynamic({navbar}) {
      nav = navbar;
    }

    async function init(el, options = { hash: true }) {
      mountEl = el;
      useHash = options.hash;
      currentPath = useHash
        ? window.location.hash.slice(1) || "/"
        : window.location.pathname + window.location.search;

   //alert(currentPath)

      const popHandler = async () => {
        const from = currentPath;
        currentPath = useHash
          ? window.location.hash.slice(1) || "/"
          : window.location.pathname + window.location.search;
       await renderRoute(from, currentPath);
      };

      if (!useHash) window.addEventListener("popstate", popHandler);
      else window.addEventListener("hashchange", popHandler);

      document.body.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link || link.hasAttribute("target")) return;

        const href = link.getAttribute("href");
        if (!href) return;

        if (useHash) {
          if (href.startsWith("#/")) { e.preventDefault(); navigateTo(href.slice(1)); }
          else if (href.startsWith("/")) { e.preventDefault(); navigateTo(href); }
        } else if (href.startsWith("/")) {
          e.preventDefault();
          navigateTo(href);
        } 
        // ✅ hỗ trợ link tuyệt đối trong notPound
        else if (!useHash && href.startsWith(window.location.origin)) {
          e.preventDefault();
          navigateTo(href.replace(window.location.origin, ""));
        }
      });

      // 🔥 gọi render lần đầu qua handler, đảm bảo chỉ 1 lần
      await renderRoute(null, currentPath);
    }

async function rerender() {
  await renderRoute(null, currentPath);
}

    function Outlet(props) {
      return props?.outlet ? h(props.outlet, props) : null;
    }

    function Link({ to, replace = false, children, ...rest }) {
      function handleClick(e) {
        if (
          e.button !== 0 || 
          e.metaKey || e.altKey || e.ctrlKey || e.shiftKey
        ) return;

        e.preventDefault();
        if (replace) {
          // phát triển sau
        } else {
          Router.navigateTo(to);
        }
      }

      return h('a', { href: to, onClick: handleClick, ...rest }, children);
    }



    return { 
      addRoute, 
      setNotFound, 
      beforeEach, 
      afterEach, 
      navigateTo, 
      getQueryParams, 
      init, 
      Outlet, 
      currentRoute, 
      navbarDynamic, 
      rerender,
      Link
    };
  })();

  App.Router = Router;

})(window.App);