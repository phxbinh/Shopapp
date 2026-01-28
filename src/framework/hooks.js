
// =======================
// Hooks tối ưu cho VDOM
// =======================
import { queryClient } from './query.js';

window.App = window.App || {};

(function(App){
  const { _internal } = App.VDOM;
  const { instanceStack, cleanupMap, renderApp } = _internal;
  const { log } = App.Debugger;

  const getCurrentInstance = () =>
    instanceStack[instanceStack.length-1] || null;

  // ---------- Scheduler render ----------
  let scheduledId = null;
  function scheduleRender() {
    if (scheduledId != null) return;
    scheduledId = requestAnimationFrame(() => {
      scheduledId = null;
      try { renderApp(); } catch(e){ console.error("Error in renderApp:", e); }
    });
  }

  // ---------- Helpers ----------
  const depsChanged = (prevDeps, nextDeps) => {
    if (!prevDeps || !nextDeps) return true;
    if (prevDeps.length !== nextDeps.length) return true;
    for (let i=0;i<nextDeps.length;i++)
      if (!Object.is(prevDeps[i], nextDeps[i])) return true;
    return false;
  };

  const addCleanup = (el, cleanup) => {
    if (!cleanup) return;
    let arr = cleanupMap.get(el);
    if (!arr) cleanupMap.set(el, arr = []);
    arr.push(cleanup);
  };

  const getHook = () => {
    const inst = getCurrentInstance();
    if (!inst) throw new Error("Hooks must be called inside component");
    const i = inst.hookIndex++;
    const hooks = inst.hooks;
    return [hooks, i, hooks[i]];
  };

function useState(initialValue){
  const [hooks, i, value] = getHook();

  if(value === undefined) {
    hooks[i] = typeof initialValue === "function" ? initialValue() : initialValue;
    log(`🔹 [useState] init hook[${i}]`, hooks[i], "hooks");
  }

  const setState = (newVal) => {
    const nextVal = typeof newVal === "function" ? newVal(hooks[i]) : newVal;
    log(`⚡ [useState] setState hook[${i}]`, { prev: hooks[i], next: nextVal }, "hooks");

    if(!Object.is(hooks[i], nextVal)){
      hooks[i] = nextVal;
      log(`🎨 [useState] hook[${i}] updated → scheduleRender()`, null, "hooks");
      scheduleRender();
    } else {
      log(`✅ [useState] hook[${i}] unchanged, skip render`, null, "hooks");
    }
  };

  return [hooks[i], setState];
}



function useReducer(reducer, initialArg, init) {
  const [hooks, i, value] = getHook();
  //const { log } = App.Debugger;

  if (value === undefined) {
    hooks[i] = init ? init(initialArg) : initialArg;
    log(`🔹 [useReducer] init hook[${i}]`, hooks[i], "hooks");
  }

  const dispatch = action => {
    const prev = hooks[i];
    hooks[i] = reducer(hooks[i], action);
    log(`🔵 [useReducer] hook[${i}] updated`, { prev, action, next: hooks[i] }, "hooks");
    scheduleRender();
  };

  return [hooks[i], dispatch];
}


function useRef(initialValue) {
  const [hooks, i, value] = getHook();

  if (!hooks[i]) {
    hooks[i] = { current: initialValue };
    log(`🔹 [useRef] init hook[${i}]`, hooks[i], "hooks");
  } else {
    log(`✅ [useRef] reuse hook[${i}]`, hooks[i], "hooks");
  }

  return hooks[i];
}


function useEffect(effectFn, deps) {
  const [hooks, i, prev] = getHook();

  if (depsChanged(prev?.deps, deps)) {
    if (prev?.cleanup) {
      try {
        prev.cleanup();
        log(`♻️ [useEffect] cleanup hook[${i}]`, null, "hooks");
      } catch(e) {
        console.error(e);
      }
    }

    queueMicrotask(() => {
      const cleanup = effectFn();
      hooks[i] = { deps, cleanup };
      const inst = getCurrentInstance();
      if (inst) {
        const el = inst.vnode?._el;
        addCleanup(el, cleanup);
      }
      log(`✨ [useEffect] run hook[${i}]`, null, "hooks");
    });
  } else {
    log(`✅ [useEffect] skip hook[${i}] (deps unchanged)`, null, "hooks");
  }
}


function useLayoutEffect(effectFn, deps){
  const [hooks, i, prev] = getHook();

  const changed = depsChanged(prev?.deps, deps);
  log(`🔹 [useLayoutEffect] hook[${i}] deps changed? ${changed}`, { prevDeps: prev?.deps, nextDeps: deps }, "hooks");

  if(changed){
    if(prev?.cleanup){
      try{
        log(`⚡ [useLayoutEffect] hook[${i}] cleanup old effect`, null, "hooks");
        prev.cleanup();
      } catch(e){ console.error(e); }
    }

    const cleanup = effectFn();
    hooks[i] = { deps, cleanup };

    const inst = getCurrentInstance();
    if(inst){
      const el = inst.vnode?._el;
      if(el) addCleanup(el, cleanup);
    }

    log(`🎨 [useLayoutEffect] hook[${i}] effect applied`, null, "hooks");
  } else {
    log(`✅ [useLayoutEffect] hook[${i}] deps unchanged, skip effect`, null, "hooks");
  }
}


function useMemo(factory, deps) {
  const [hooks, i, prev] = getHook();

  if (!prev || depsChanged(prev.deps, deps)) {
    const value = factory();
    hooks[i] = { deps, value };
    log(`✨ [useMemo] compute hook[${i}]`, { value }, "hooks");
  } else {
    log(`✅ [useMemo] skip hook[${i}] (deps unchanged)`, { value: prev.value }, "hooks");
  }

  return hooks[i].value;
}

function useCallback(cb, deps) {
  const [hooks, i, prev] = getHook();

  if (!prev || depsChanged(prev.deps, deps)) {
    hooks[i] = { deps, value: cb };
    log(`✨ [useCallback] updated hook[${i}]`, { cb }, "hooks");
  } else {
    log(`✅ [useCallback] skip hook[${i}] (deps unchanged)`, null, "hooks");
  }

  return hooks[i].value;
}


  function withHooks(Component){
    return function wrappedComponent(props){
      const inst = getCurrentInstance();
      if(inst) inst.hookIndex = 0;
      return Component(props);
    };
  }

  // ---------- Reset Hooks ----------
  function resetHook(instance){
    if(!instance) instance = getCurrentInstance();
    if(instance){
      instance.hooks = [];
      instance.hookIndex = 0;
    }
  }

const useFadeIn = function(duration = 800, deps = []) {
  const ref = App.Hooks.useRef(null);

  App.Hooks.useEffect(() => {
    const el = ref.current;
    if (el) {
      // reset opacity
      el.style.transition = `opacity ${duration}ms ease-in-out`;
      el.classList.remove("show");
      requestAnimationFrame(() => {
        el.classList.add("show");
      });
    }
  }, deps); // chạy lại mỗi khi deps thay đổi

  return ref;
};


function useKeepScrollOnResize(selector = ".item") {
  const [, forceUpdate] = App.Hooks.useState(0); // dummy state để trigger re-render nếu cần

  App.Hooks.useEffect(() => {
    let anchor = null;

    const handleResize = () => {
      // tìm element ở giữa màn hình
      const midElems = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      anchor = midElems.find(el => el.matches(selector));

      requestAnimationFrame(() => {
        if (anchor) {
          anchor.scrollIntoView({ block: "center" });
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selector]);

  return null;
};


function AuseDebounce(value, delay = 300) {
  //const { useState, useEffect } = App.Hooks;
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

function useDebounce(value, delay = 300) {
  const { useState, useEffect, useRef } = App.Hooks;

  const [debounced, setDebounced] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Hủy timeout trước đó
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Tạo timeout mới
    timeoutRef.current = setTimeout(() => {
      setDebounced(value);
      timeoutRef.current = null;
    }, delay);

    // Cleanup khi unmount hoặc value/delay thay đổi
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  // Trả về cả giá trị và hàm cancel
  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setDebounced(value); // cập nhật ngay nếu muốn cancel
    }
  };

  return { value: debounced, cancel };
}

/*
function useQuery(key, fetcher) {
  const [, force] = useState(0);

  useEffect(() => {
    const unsubscribe = queryClient.subscribe(key, () => force(x => x + 1));

    // Auto fetch nếu stale hoặc chưa có
    if (!queryClient.getQueryData(key) || queryClient.getQueryData(key)?.status === 'stale') {
      queryClient.prefetch(key, fetcher).catch(console.error);
    }

    return unsubscribe;
  }, [key]);

  const data = queryClient.getQueryData(key);
  const status = data ? 'success' : 'loading';

  return { data: data || [], status };
}
*/

function useQuery(key, fetcher) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Subscribe để re-render khi cache thay đổi
    const unsubscribe = queryClient.subscribe(key, () => {
      forceUpdate(x => x + 1);
    });

    // Initial fetch hoặc refetch nếu stale
    const entry = queryClient.cache.get(key);
    if (!entry || entry.status === 'stale' || entry.status === 'idle') {
      queryClient.prefetch(key, fetcher).catch(err => {
        console.error("Query failed:", err);
        // Optional: set error vào cache
      });
    }

    return unsubscribe;
  }, [key, fetcher]); // thêm fetcher vào dep

  const entry = queryClient.cache.get(key) || { data: undefined, status: 'loading' };

  return {
    data: entry.data ?? [],           // fallback []
    status: entry.status || 'loading',
    isLoading: entry.status === 'loading',
    isError: entry.status === 'error',
    error: entry.error || null,
    isSuccess: entry.status === 'success',
  };
}










  // ---------- Export ----------
  App.Hooks = {
    useState,
    useReducer,
    useRef,
    useEffect,
    useLayoutEffect,
    useMemo,
    useCallback,
    withHooks,
    resetHook,
    useFadeIn,
    useKeepScrollOnResize,
    useDebounce,
    AuseDebounce,
    useQuery,
    _internal: {
      scheduleRender,
      get currentInstance(){ return getCurrentInstance(); }
    }
  };
})(window.App);


