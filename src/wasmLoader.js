import { extractFilesFromGzipBundle, fetchGzipBundle, isGzipBundle } from "./core/gzipBundle";
import { createEmscriptenConfig, normalizeConfig, validateConfig } from "./core/configManager";
import { DEFAULT_CONFIG, MIME_TYPES } from "./core/constants";
import { createScriptURL, loadWebAssemblyModuleFromExistingScript, loadWebAssemblyModuleFromScript } from "./core/scriptLoader";
import { createRemoteSession } from "./core/sessionFactory";
import { createFuture } from "./core/future";
import { createBlobURL, disposeBlobURL } from "./core/blobURL";
import { convertToObj, convertToStr } from "./core/stateDecorators";

/**
 * VtkWASMLoader type definition
 *
 * @typedef {Object} VtkWASMLoader
 * @property {Boolean} loaded
 */
export class VtkWASMLoader {
  #config = null;
  #loaded = false;
  #pendingLoad = null;
  #wasmInstance = null;

  constructor() {
    this.#config = {};
    this.#loaded = false;
    this.#pendingLoad = null;
    this.#wasmInstance = null;
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
   * @param {string} wasmBaseURL
   * @param {object} config - for WASM runtime creation.
   * @param {string} wasmBaseName - (default is "vtk") base name of the wasm bundle to load. e.g., "vtk" or "addon" will
   *                             look for vtkWebAssembly.mjs or addonWebAssembly.mjs in the wasmBaseURL.
   */
  async load(
    wasmBaseURL,
    config = DEFAULT_CONFIG,
    wasmBaseName = "vtk",
  ) {
    if (this.#loaded) {
      return;
    }
    validateConfig(config);
    this.#config = normalizeConfig(config);

    if (!this.#pendingLoad) {
      const { promise, resolve, reject } = createFuture();
      this.#pendingLoad = promise;

      // wait for wasm script to load if any (first priority)
      if (!window.createVTKWASM) {
        await loadWebAssemblyModuleFromExistingScript(wasmBaseName);
      }

      let wasmFile = null;
      if (!window.createVTKWASM) {
        if (isGzipBundle(wasmBaseURL)) {
          let gzipArrayBuffer;
          let javaScriptBlobURL = null;
          try {
            gzipArrayBuffer = await fetchGzipBundle(wasmBaseURL);
          } catch (e) {
            reject(e);
            this.#pendingLoad = null;
            return;
          }
          try {
            const result = await extractFilesFromGzipBundle(
              gzipArrayBuffer,
              this.#config,
              wasmBaseName,
            );
            wasmFile = result.wasm;
            javaScriptBlobURL = createBlobURL(result.js.buffer, MIME_TYPES.JAVASCRIPT);
            await loadWebAssemblyModuleFromScript(javaScriptBlobURL);
          } catch (e) {
            reject(e);
            this.#pendingLoad = null;
            return;
          }
          finally {
            if (javaScriptBlobURL !== null) {
              disposeBlobURL(javaScriptBlobURL);
            }
          }
        } else {
          try {
            const scriptURL = await createScriptURL(wasmBaseURL, wasmBaseName, this.#config);
            await loadWebAssemblyModuleFromScript(scriptURL);
            // if window.createVTKWASM is still not defined, try legacy loader
            if (!window.createVTKWASM) {
              const legacyScriptURL = await createScriptURL(wasmBaseURL, null, null, true);
              await loadWebAssemblyModuleFromScript(legacyScriptURL);
            }
          } catch (e) {
            reject(e);
            this.#pendingLoad = null;
            return;
          }
        }
      }

      // Load WASM
      if (window.createVTKWASM) {
        try {
          this.#wasmInstance = await window.createVTKWASM(createEmscriptenConfig(this.#config, wasmFile));
        } catch (e) {
          reject(e);
          this.#pendingLoad = null;
          return;
        }
        this.#loaded = true;
        resolve();
        this.#pendingLoad = null;
      } else {
        const errorMessage = [
          "Could not load WebAssembly module: window.createVTKWASM is not available after loading scripts.",
          "Possible causes include:",
          `  - Incorrect or unreachable 'wasmBaseURL' ("${wasmBaseURL}")`,
          `  - Wrong 'wasmBaseName' ("${wasmBaseName}") or missing/misnamed .mjs/.wasm files in the bundle`,
          "  - Network or script loading failures (e.g., 404/500 responses)",
          "  - Content Security Policy (CSP) blocking script execution",
          "",
          "Next steps:",
          "  - Verify that the expected .mjs and .wasm files are present and accessible under 'wasmBaseURL'",
          "  - Check the browser's Network/Console tabs for failed script requests or CSP errors.",
        ].join("\n");
        reject(new Error(errorMessage));
        this.#pendingLoad = null;
      }
    } else {
      await this.#pendingLoad;
    }
  }

  /**
   * Create a new remote session and return it regardless of WASM version.
   *
   * @returns {Promise<vtkRemoteSession>}
   */
  async createRemoteSession(config) {
    if (!this.#loaded) {
      throw new Error("WASM module is not loaded yet. Call load() first.");
    }
    const remoteSession = await createRemoteSession(config, this.#config, this.#wasmInstance);
    return remoteSession;
  }

  /**
   * Create a new standalone session. Only works with new WASM bundle.
   *
   * @returns {vtkStandaloneSession}
   */
  createStandaloneSession() {
    if (!this.#loaded) {
      throw new Error("WASM module is not loaded yet. Call load() first.");
    }
    if (this.#wasmInstance === null) {
      throw new Error("The currently loaded VTK.wasm version does not support standalone mode");
    }
    return new this.#wasmInstance.vtkStandaloneSession();
  }

  /** Helper for handling API change */
  createStateDecorator() {
    if (!this.#loaded) {
      throw new Error("WASM module is not loaded yet. Call load() first.");
    }
    if (this.#wasmInstance !== null) {
      return convertToObj;
    }
    return convertToStr;
  }
}
