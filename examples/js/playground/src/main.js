import { createHtmlJsPlayground } from "./htmlJsPlayground.js";

const urlParams = new URLSearchParams(window.location.search);
const example = urlParams.get("example");
const { htmlCode: initialHtml, jsCode: initialJs, editorHeightPx, iframeMinHeightPx } = await (async () => {
  if (example === "observers") {
    return await import("./examples/observers.js");
  } else if (example === "objects") {
    return await import("./examples/objects.js");
  } else {
    return await import("./examples/blankSlate.js");
  }
})();

// 2. Create the playground
const playground = await createHtmlJsPlayground({
  initialHtml,
  initialJs,  
  elements: {
    editorHostHtmlId: "editor-host-html",
    editorHostJsId: "editor-host-js",
    tabHtmlId: "tab-html",
    tabJsId: "tab-js",
    panelHtmlId: "panel-html",
    panelJsId: "panel-js",
    runButtonId: "run-btn",
    resetButtonId: "reset-btn",
    consoleOutputId: "console-output",
    iframeId: "vtk-iframe",
  },
  editorHeightPx,
  iframeMinHeightPx,
});

// 3. Run the initial code
playground.run();

// 4. Clean up on unload
window.addEventListener("beforeunload", () => {
  console.log("Disposing playground...");
  playground.dispose();
});
