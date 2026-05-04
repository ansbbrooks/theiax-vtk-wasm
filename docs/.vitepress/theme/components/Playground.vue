<script setup>

import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { blankSlate, workingWithObjects, observers } from "./playgroundData"

const props = defineProps({
  exampleName: {
    type: String,
    default: 'blankSlate',
  },
})

let playground = null;
const activeTab = ref("js");
const isHtmlTab = computed(() => activeTab.value === "html");

const outputIframeRef = ref(null);
const editorHostHtmlRef = ref(null);
const editorHostJsRef = ref(null);
const consoleOutputRef = ref(null);
const tabJsRef = ref(null);
const tabHtmlRef = ref(null);

function requireElement(name, element) {
  if (!element) throw new Error(`Missing required element ref: ${name}`);
  return element;
}

function setActiveTab(next) {
  activeTab.value = next;
  playground?.setActiveTab(next);
}

function onTabClick(next) {
  setActiveTab(next);
  playground?.focus();
}

function onTabKeyDown(e) {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") {
    return;
  }
  e.preventDefault();

  const order = ["js", "html"];
  const currentIdx = activeTab.value === "html" ? 1 : 0;

  let nextIdx = currentIdx;
  if (e.key === "ArrowLeft") nextIdx = (currentIdx + order.length - 1) % order.length;
  if (e.key === "ArrowRight") nextIdx = (currentIdx + 1) % order.length;
  if (e.key === "Home") nextIdx = 0;
  if (e.key === "End") nextIdx = order.length - 1;

  const nextTab = order[nextIdx];
  setActiveTab(nextTab);
  if (nextTab === "html") tabHtmlRef.value?.focus();
  else tabJsRef.value?.focus();
}

function onRun() {
  playground?.run();
}

function onReset() {
  playground?.reset();
}

async function createHtmlJsPlayground(options) {
  const {
    initialHtml,
    initialJs,
    elements,
    displayIFrame = false,
  } = options;

  if (!initialHtml || !initialJs) {
    throw new Error("createHtmlJsPlayground requires initialHtml and initialJs");
  }

  const {
    editorHostHtml,
    editorHostJs,
    consoleOutput,
    outputIframe,
  } = elements;

  if (!displayIFrame) {
    outputIframe.style.display = "none";
  }

  // Lazy-load editor deps.
  const { EditorView, basicSetup } = await import("codemirror");
  const { EditorState } = await import("@codemirror/state");
  const { HighlightStyle, syntaxHighlighting } = await import("@codemirror/language");
  const { tags } = await import("@lezer/highlight");
  const { javascript } = await import("@codemirror/lang-javascript");
  const { html } = await import("@codemirror/lang-html");

  // Console output helper.
  const consoleSink = createConsoleSink(consoleOutput);
  const detachConsoleBridge = attachIframeConsoleBridge({
    onMessage: (method, args) => consoleSink.append(args, method),
  });

  const customFontTheme = EditorView.theme({
    "&": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
      backgroundColor: "var(--vp-c-bg)",
      color: "var(--vp-c-text-1)",
    },
    ".cm-content": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
    },
    ".cm-gutters": {
      fontFamily: "'Lucida Console', 'Monaco', monospace",
      backgroundColor: "var(--vp-c-bg)",
      color: "var(--vp-c-text-2)",
      borderRight: "1px solid var(--vp-c-divider)",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--vp-c-bg-soft)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--vp-c-bg-soft)",
    },
    ".cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--vp-c-brand-1)",
    },
  });

  const vpSyntaxTheme = HighlightStyle.define([
    { tag: tags.keyword, color: "var(--vp-c-brand-1)" },
    { tag: [tags.name, tags.variableName], color: "var(--vp-c-text-1)" },
    { tag: [tags.function(tags.variableName), tags.labelName], color: "var(--vp-c-brand-2)" },
    { tag: [tags.propertyName, tags.attributeName], color: "var(--vp-c-text-1)" },
    { tag: [tags.typeName, tags.className], color: "var(--vp-c-tip-1)" },
    { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "var(--vp-c-warning-1)" },
    { tag: [tags.string, tags.special(tags.string)], color: "var(--vp-c-tip-1)" },
    { tag: [tags.comment, tags.quote], color: "var(--vp-c-text-3)", fontStyle: "italic" },
    { tag: [tags.operator, tags.punctuation], color: "var(--vp-c-text-2)" },
    { tag: [tags.meta, tags.escape, tags.regexp], color: "var(--vp-c-brand-2)" },
    { tag: tags.invalid, color: "var(--vp-c-danger-1)" },
  ]);

  const vpEditorExtensions = [
    customFontTheme,
    syntaxHighlighting(vpSyntaxTheme),
  ];
  // Editor state factories (keep per-tab undo by keeping per-tab EditorState objects).
  const createHtmlState = (doc = initialHtml) =>
    EditorState.create({
      doc,
      extensions: [basicSetup, html(), ...vpEditorExtensions],
    });

  const createJsState = (doc = initialJs) =>
    EditorState.create({
      doc,
      extensions: [basicSetup, javascript(), ...vpEditorExtensions],
    });

  let htmlState = createHtmlState();
  let jsState = createJsState();
  let active = "js";

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
    if (isHtml) {
      editorHostHtml.appendChild(view.dom);
      view.setState(htmlState);
    } else {
      editorHostJs.appendChild(view.dom);
      view.setState(jsState);
    }
  }

  // Runner
  const runner = createIframeRunner({
    iframe: outputIframe,
  });

  return {
    getHtml: () => (active === "html" ? view.state.doc.toString() : htmlState.doc.toString()),
    getJs: () => (active === "js" ? view.state.doc.toString() : jsState.doc.toString()),
    focus: () => {
      view.focus();
    },
    setActiveTab,
    run: async () => {
      consoleSink.clear();
      persistActiveState();
      await runner.run({
        html: htmlState.doc.toString(),
        js: jsState.doc.toString(),
        consoleProxy: true,
      });
    },
    reset: () => {
      htmlState = createHtmlState();
      jsState = createJsState();
      view.setState(active === "html" ? htmlState : jsState);
      consoleSink.setReady();
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

function createIframeRunner({ iframe }) {
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

onMounted(async () => {
  const { displayIFrame, html, js } = (() => {
    if (props.exampleName === "objects") {
      return workingWithObjects;
    } else if (props.exampleName === "observers") {
      return observers;
    } else {
      return blankSlate;
    }
  })();
  playground = await createHtmlJsPlayground({
    initialHtml: html,
    initialJs: js,
    elements: {
      editorHostHtml: requireElement("editorHostHtml", editorHostHtmlRef.value),
      editorHostJs: requireElement("editorHostJs", editorHostJsRef.value),
      consoleOutput: requireElement("consoleOutput", consoleOutputRef.value),
      outputIframe: requireElement("outputIframe", outputIframeRef.value),
    },
    displayIFrame,
  });

  playground.setActiveTab(activeTab.value);

  playground.run();
});

onBeforeUnmount(() => {
  if (playground) playground.dispose();
});

</script>

<template>
  <div class="playground">
    <iframe ref="outputIframeRef" id="vtk-iframe" src="about:blank" scrolling="no"></iframe>

    <div class="tabs" role="tablist" aria-label="Code tabs">
      <button ref="tabJsRef" class="tab" id="tab-js" type="button" role="tab" :aria-selected="String(!isHtmlTab)"
        aria-controls="panel-js" :tabindex="!isHtmlTab ? 0 : -1" @click="onTabClick('js')"
        @keydown="onTabKeyDown">JS</button>
      <button ref="tabHtmlRef" class="tab" id="tab-html" type="button" role="tab" :aria-selected="String(isHtmlTab)"
        aria-controls="panel-html" :tabindex="isHtmlTab ? 0 : -1" @click="onTabClick('html')"
        @keydown="onTabKeyDown">HTML</button>
    </div>

    <div id="panel-html" class="tabpanel" role="tabpanel" aria-labelledby="tab-html" :hidden="!isHtmlTab">
      <div ref="editorHostHtmlRef" id="editor-host-html"></div>
    </div>
    <div id="panel-js" class="tabpanel" role="tabpanel" aria-labelledby="tab-js" :hidden="isHtmlTab">
      <div ref="editorHostJsRef" id="editor-host-js"></div>
    </div>

    <div class="toolbar">
      <button id="run-btn" @click="onRun">Run</button>
      <button id="reset-btn" @click="onReset">Reset</button>
    </div>
    <div ref="consoleOutputRef" id="console-output" class="console">
      <div class="log-line">> Ready.</div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Lucida Console', 'Monaco', monospace;
}

.playground {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  gap: 10px;
  background: var(--vp-c-bg-soft);
}

button {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: var(--vp-c-bg-mute);
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.tab {
  appearance: none;
  background: transparent;
  border: none;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.tab:last-child {
  border-right: none;
}

.tab[aria-selected="true"] {
  border-bottom: 2px solid var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.tab:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.tab:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

/* Editor area */
.cm-editor {
  height: var(--playground-editor-height, 400px);
  font-size: 14px;
}

/* Console Output */
.console {
  height: 150px;
  overflow-y: auto;
  padding: 10px;
  font-family: 'Lucida Console', 'Monaco', monospace;
  font-size: 13px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.log-line {
  padding: 2px 0;
}

.log-error {
  color: var(--vp-c-danger-1);
}

.log-warn {
  color: var(--vp-c-warning-1);
}

.log-log {
  color: var(--vp-c-text-1);
}

iframe {
  width: 100%;
  border: none;
  display: block;
}
</style>
