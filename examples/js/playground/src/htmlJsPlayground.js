// Reusable HTML+JS playground: CodeMirror tabs + iframe output + console bridge.
// Usage: await createHtmlJsPlayground({ initialHtml, initialJs, elements: { ...ids } })

export async function createHtmlJsPlayground(options) {
  const {
    initialHtml,
    initialJs,
    elements,
    editorHeightPx = 400,
    iframeMinHeightPx = 300,
  } = options;

  if (!initialHtml || !initialJs) {
    throw new Error("createHtmlJsPlayground requires initialHtml and initialJs");
  }

  const {
    editorHostHtmlId,
    editorHostJsId,
    tabHtmlId,
    tabJsId,
    panelHtmlId,
    panelJsId,
    runButtonId,
    resetButtonId,
    consoleOutputId,
    iframeId,
  } = elements;

  const editorHostHtml = mustGetElement(editorHostHtmlId);
  const editorHostJs = mustGetElement(editorHostJsId);
  const tabHtml = mustGetElement(tabHtmlId);
  const tabJs = mustGetElement(tabJsId);
  const panelHtml = mustGetElement(panelHtmlId);
  const panelJs = mustGetElement(panelJsId);
  const runBtn = mustGetElement(runButtonId);
  const resetBtn = mustGetElement(resetButtonId);
  const consoleOutput = mustGetElement(consoleOutputId);
  const outputIframe = mustGetElement(iframeId);

  // Keep CSS-driven sizing, but allow the caller to ensure a sane iframe height.
  outputIframe.style.height = `${iframeMinHeightPx}px`;

  // Lazy-load editor deps.
  const { EditorView, basicSetup } = await import("codemirror");
  const { EditorState } = await import("@codemirror/state");
  const { javascript } = await import("@codemirror/lang-javascript");
  const { html } = await import("@codemirror/lang-html");
  const { oneDark } = await import("@codemirror/theme-one-dark");

  // Console output helper.
  const consoleSink = createConsoleSink(consoleOutput);
  const detachConsoleBridge = attachIframeConsoleBridge({
    onMessage: (method, args) => consoleSink.append(args, method),
  });

  const customFontTheme = EditorView.theme({
    "&": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
    },
    ".cm-content": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
    },
    ".cm-gutters": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
    },
  });
  // Editor state factories (keep per-tab undo by keeping per-tab EditorState objects).
  const createHtmlState = (doc = initialHtml) =>
    EditorState.create({
      doc,
      extensions: [basicSetup, html(), oneDark, customFontTheme],
    });

  const createJsState = (doc = initialJs) =>
    EditorState.create({
      doc,
      extensions: [basicSetup, javascript(), oneDark, customFontTheme],
    });

  let htmlState = createHtmlState();
  let jsState = createJsState();
  let active = "js";

  // Ensure consistent editor height.
  // Note: Codemirror's height is driven by CSS `.cm-editor`, but this helps in case the host
  // is used elsewhere without that CSS.
  editorHostHtml.style.minHeight = `${editorHeightPx}px`;
  editorHostJs.style.minHeight = `${editorHeightPx}px`;

  const view = new EditorView({
    state: jsState,
    parent: editorHostJs,
  });

  function persistActiveState() {
    if (active === "html") htmlState = view.state;
    else jsState = view.state;
  }

  function setActiveTab(next) {
    if (next === active) return;
    persistActiveState();
    active = next;

    const isHtml = active === "html";
    tabHtml.setAttribute("aria-selected", String(isHtml));
    tabJs.setAttribute("aria-selected", String(!isHtml));
    tabHtml.tabIndex = isHtml ? 0 : -1;
    tabJs.tabIndex = isHtml ? -1 : 0;
    panelHtml.hidden = !isHtml;
    panelJs.hidden = isHtml;

    if (isHtml) {
      editorHostHtml.appendChild(view.dom);
      view.setState(htmlState);
    } else {
      editorHostJs.appendChild(view.dom);
      view.setState(jsState);
    }
  }

  // Tabs: click + minimal keyboard navigation.
  tabHtml.addEventListener("click", () => {
    setActiveTab("html");
    view.focus();
  });
  tabJs.addEventListener("click", () => {
    setActiveTab("js");
    view.focus();
  });

  function onTabKeyDown(e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") {
      return;
    }
    e.preventDefault();

    const order = [tabJs, tabHtml];
    const currentIdx = document.activeElement === tabHtml ? 1 : 0;

    let nextIdx = currentIdx;
    if (e.key === "ArrowLeft") nextIdx = (currentIdx + order.length - 1) % order.length;
    if (e.key === "ArrowRight") nextIdx = (currentIdx + 1) % order.length;
    if (e.key === "Home") nextIdx = 0;
    if (e.key === "End") nextIdx = order.length - 1;

    order[nextIdx].focus();
  }

  tabHtml.addEventListener("keydown", onTabKeyDown);
  tabJs.addEventListener("keydown", onTabKeyDown);

  // Runner
  const runner = createIframeRunner({
    iframe: outputIframe,
    iframeMinHeightPx,
  });

  runBtn.addEventListener("click", async () => {
    consoleSink.clear();
    persistActiveState();

    const htmlText = htmlState.doc.toString();
    const jsText = jsState.doc.toString();

    await runner.run({
      html: htmlText,
      js: jsText,
      consoleProxy: true,
    });
  });

  resetBtn.addEventListener("click", () => {
    htmlState = createHtmlState();
    jsState = createJsState();

    view.setState(active === "html" ? htmlState : jsState);
    consoleSink.setReady();
  });

  // Initialize tab state attributes correctly based on current `active`.
  // (Your HTML currently has tabindex flipped; this corrects it at runtime too.)
  setActiveTab(active);

  return {
    getHtml: () => (active === "html" ? view.state.doc.toString() : htmlState.doc.toString()),
    getJs: () => (active === "js" ? view.state.doc.toString() : jsState.doc.toString()),
    run: async () => {
      consoleSink.clear();
      persistActiveState();
      await runner.run({
        html: htmlState.doc.toString(),
        js: jsState.doc.toString(),
        consoleProxy: true,
      });
    },
    setHtml: (nextHtml) => {
      htmlState = createHtmlState(nextHtml);
      if (active === "html") view.setState(htmlState);
    },
    setJs: (nextJs) => {
      jsState = createJsState(nextJs);
      if (active === "js") view.setState(jsState);
    },
    dispose: () => {
      detachConsoleBridge();
      view.destroy();
    },
  };
}


function mustGetElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el;
}

function createConsoleSink(outputDiv) {
  function append(args, type) {
    const line = document.createElement("div");
    line.className = `log-line log-${type}`;

    const content = (args ?? []).map((arg) => {
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(" ");

    line.textContent = `> ${content}`;
    outputDiv.appendChild(line);
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }

  function clear() {
    outputDiv.innerHTML = "";
  }

  function setReady() {
    outputDiv.innerHTML = '<div class="log-line">> Ready.</div>';
  }

  return { append, clear, setReady };
}

function attachIframeConsoleBridge({ onMessage }) {
  function handler(event) {
    if (!event?.data || event.data.source !== "iframe-runner") return;
    const { method, args } = event.data;
    onMessage(method, args);
  }
  window.addEventListener("message", handler);
  // Return a detach function.
  return () => window.removeEventListener("message", handler);
}

function createIframeRunner({ iframe, iframeMinHeightPx }) {
  let runId = 0;

  async function run({ html, js, consoleProxy }) {
    runId += 1;
    const current = runId;
    // Assign onload before setting srcdoc to avoid races.
    iframe.onload = () => {
      if (current !== runId) return;
      try {
        const iframeDoc = iframe.contentDocument;
        // Adjust iframe height to content.
        const height = Math.max(
          iframeDoc?.documentElement?.scrollHeight ?? 0,
          iframeDoc?.body?.scrollHeight ?? 0,
          iframeMinHeightPx,
        );
        iframe.style.height = `${height}px`;

        // Inject user code as a module script.
        const script = iframeDoc.createElement("script");
        script.type = "module";
        script.textContent = buildInjectedModuleSource({
          userCode: js,
          consoleProxy,
        });
        iframeDoc.body.appendChild(script);
      } catch (e) {
        // If something goes wrong, attempt to surface it in the parent console.
        // (This runner is intended for same-origin srcdoc, but keep it resilient.)
        // eslint-disable-next-line no-console
        console.error(e);
      }
    };
    iframe.srcdoc = html;
  }
  return { run };
}

function buildInjectedModuleSource({ userCode, consoleProxy }) {
  if (!consoleProxy) return userCode;
  return `// Console proxy into parent
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

function send(method, args) {
  try {
    window.parent.postMessage({ source: "iframe-runner", method, args }, "*");
  } catch {
    // ignore
  }
}

console.log = (...args) => { send("log", args); originalConsole.log(...args); };
console.warn = (...args) => { send("warn", args); originalConsole.warn(...args); };
console.error = (...args) => { send("error", args); originalConsole.error(...args); };

// User code
${userCode}`;
}
