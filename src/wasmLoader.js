import untar from "js-untar";

const LOADED_URLS = [];
const PROMISES = {};
let WASM_FILE_OBJECT = null;

/**
 * Create a future that returns
 * @returns { promise, resolve, reject }
 */
export function createFuture() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function convertToObj(state) {
  if (state?.Id) {
    return state;
  }
  return JSON.parse(state);
}

function convertToStr(state) {
  if (state?.Id) {
    return JSON.stringify(state);
  }
  return state;
}

function isSameConfig(a, b) {
  return a.rendering === b.rendering && a.exec === b.exec;
}

export function generateWasmConfig(config) {
  return {
    locateFile: (fileName) => {
      if (WASM_FILE_OBJECT && fileName == WASM_FILE_OBJECT.name) {
        return URL.createObjectURL(WASM_FILE_OBJECT);
      }
      return new URL(fileName, import.meta.url).href;
    },
    onRuntimeInitialized: (module) => {
      if (WASM_FILE_OBJECT) {
        URL.revokeObjectURL(WASM_FILE_OBJECT);
      }
    },
    preRun: config?.rendering === "webgpu" ? [(module) => {
      module.ENV.VTK_GRAPHICS_BACKEND = "WEBGPU";
    }] : [],
  }
}

/**
 * Add script tag with provided URL with type="module"
 *
 * @param {string} url
 * @return {Promise<void>} to know when the script is ready
 */
export function loadScriptAsModule(url) {
  if (PROMISES[url]) {
    return PROMISES[url];
  }

  PROMISES[url] = new Promise(function (resolve, reject) {
    if (LOADED_URLS.indexOf(url) === -1) {
      LOADED_URLS.push(url);
      var newScriptTag = document.createElement("script");
      newScriptTag.type = "module";
      newScriptTag.src = url;
      newScriptTag.onload = resolve;
      newScriptTag.onerror = reject;
      document.body.appendChild(newScriptTag);
    } else {
      resolve(false);
    }
  });

  return PROMISES[url];
}

/**
 * VtkWASMLoader type definition
 *
 * @typedef {Object} VtkWASMLoader
 * @property {Boolean} loaded
 */
export class VtkWASMLoader {
  constructor() {
    this.loaded = false;
    this.loadingPending = null;
    this.wasm = null;
    this.config = {};
    this.runtimes = [];
  }

  /**
   * Load VTK WASM library using the base url provided
   *
   * If you want to pipe std::cout and std::cerr to the console,
   * you can provide a config like so:
   *
   *   config = {
   *     print: console.info,
   *     printErr: console.error,
   *     rendering: "webgl", // or "webgpu"
   *     exec: "sync", // or "async"
   *   }
   *
   * @param {str} wasmBaseURL
   * @param {object} config - for WASM runtime creation.
   * @param {str} wasmBaseName - (default is "vtk") base name of the wasm bundle to load. e.g., "vtk" or "addon" will
   *                             look for vtkWebAssembly.mjs or addonWebAssembly.mjs in the wasmBaseURL.
   */
  async load(
    wasmBaseURL,
    config = { rendering: "webgl", exec: "sync" },
    wasmBaseName = "vtk",
  ) {
    this.config = config;
    if (this.loaded) {
      return;
    }

    if (!this.loadingPending) {
      const { promise, resolve } = createFuture();
      this.loadingPending = promise;

      // WebGPU only works in async mode
      if (this.config?.rendering === "webgpu") {
        this.config.exec = "async";
      }

      // wait for wasm script to load if any
      if (!window.createVTKWASM) {
        let scriptLoaded = null;
        document.querySelectorAll("script").forEach((script) => {
          if (script.src.includes(`${wasmBaseName}WebAssembly`)) {
            const { promise, resolve } = createFuture();
            script.onload = resolve;
            scriptLoaded = promise;
          }
        });
        if (scriptLoaded) {
          await scriptLoaded;
        }
      }

      if (!window.createVTKWASM) {
        // Check which wasm bundle we have
        let url = null;
        let jsModuleURL = null;

        // Try newest version first
        let newModuleResponse = null;
        if (wasmBaseURL.startsWith("http") && wasmBaseURL.endsWith(".gz")) {
          // Absolute URL pointing to a GZIP file.
          newModuleResponse = await fetch(wasmBaseURL);
          const ds = new DecompressionStream("gzip");
          const decompressedStream = newModuleResponse.body.pipeThrough(ds);
          const blob = await new Response(decompressedStream).blob();
          const arrayBuffer = await blob.arrayBuffer();
          const files = await untar(arrayBuffer);
          files.forEach((file) => {
            file.name = file.name.replace("./", "");
            if (file.name === `${wasmBaseName}WebAssembly${this.config?.exec === "async" ? "Async" : ""}.mjs`) {
              jsModuleURL = URL.createObjectURL(new File([file.buffer], file.name, { type: "text/javascript" }));
            } else if (file.name === `${wasmBaseName}WebAssembly${this.config?.exec === "async" ? "Async" : ""}.wasm`) {
              // Create a file URL for the wasm file so it can be loaded
              WASM_FILE_OBJECT = new File([file.buffer], file.name, { type: "application/wasm" });
            }
          });
        } else {
          url = `${wasmBaseURL}/${wasmBaseName}WebAssembly${this.config?.exec === "async" ? "Async" : ""}.mjs`;
          newModuleResponse = await fetch(url);
          if (newModuleResponse.ok) {
            // In docker we serve the index.html when file don't exist
            const content = await newModuleResponse.text();
            if (content[0] !== "<") {
              // Not html content
              jsModuleURL = url;
            }
          }
        }

        // Try older version
        if (!jsModuleURL) {
          url = `${wasmBaseURL}/vtkWasmSceneManager.mjs`;
          const oldModuleResponse = await fetch(url);
          if (oldModuleResponse.ok) {
            // In docker we serve the index.html when file don't exist
            const content = await oldModuleResponse.text();
            if (content[0] !== "<") {
              // Not html content
              jsModuleURL = url;
            }
          }
        }

        // Not sure what to do
        if (!jsModuleURL) {
          throw new Error(`Could not fetch wasm bundle from ${wasmBaseURL}`);
        }

        // Load JS
        console.log("WASM use", jsModuleURL);
        await loadScriptAsModule(jsModuleURL);
        // Cleanup object URL corresponding to the JavaScript module.
        if (jsModuleURL.startsWith("blob:")) {
          URL.revokeObjectURL(jsModuleURL);
        }
      }

      // Load WASM
      if (window.createVTKWASM) {
        this.wasm = await window.createVTKWASM(generateWasmConfig(this.config));
      }

      // Capture objects
      this.loaded = true;
      resolve();
    } else {
      await this.loadingPending;
    }
  }

  /**
   * Create a new remote session and return it regardless of WASM version.
   *
   * @returns
   */
  async createRemoteSession(config) {
    if (this.wasm) {
      // New API
      if (this.wasm?.isAsync && this.wasm.isAsync()) {
        if (!config || isSameConfig(this.config, config)) {
          // Reuse the same runtime
          console.log("(Main runtime in async)");
          return new this.wasm.vtkRemoteSession();
        } else {
          console.log("(New in async)");
          const newWASMRuntime = await window.createVTKWASM(
            generateWasmConfig(config || this.config),
          );
          return new newWASMRuntime.vtkRemoteSession();
        }
      } else {
        console.log("(New in sync)");
        const newWASMRuntime = await window.createVTKWASM(
          generateWasmConfig(config || this.config),
        );
        return new newWASMRuntime.vtkRemoteSession();
      }
    }

    // Old API
    const remoteSession = await window.createVTKWasmSceneManager();
    remoteSession.initialize();
    return remoteSession;
  }

  /**
   * Create a new standalone session. Only works with new WASM bundle.
   *
   * @returns
   */
  createStandaloneSession() {
    if (!this.wasm) {
      throw new Error("Current WASM version does not support standalone mode");
    }
    return new this.wasm.vtkStandaloneSession();
  }

  /** Helper for handling API change */
  createStateDecorator() {
    if (this.wasm) {
      return convertToObj;
    }
    return convertToStr;
  }
}
