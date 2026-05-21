import { VtkWASMLoader } from "./wasmLoader";
import { createFuture } from "./core/future";
import { createInstantiatorProxy } from "./core/proxy";

/**
 * Create a VTK namespace for handling vtk object creation.
 *
 * @param {String} url - Optional directory to where VTK.wasm is getting served from.
 *                  If vtkWebAssemblyInterface.mjs is already loaded as a script,
 *                  this will be ignored.
 * @param {Object} config
 * @param {string} [wasmBaseName] - (default is `"vtk"`) base name of the wasm bundle to load. e.g., `"vtk"` or `"addon"` will
 *                             look for vtkWebAssembly.mjs or addonWebAssembly.mjs in the wasmBaseURL.
 * @param {boolean} [urlIsGzipBundle] - (default is `true`) specifies whether the resource at `wasmBaseURL` is a Gzip archive.
 *
 * @returns the vtk namespace for creating VTK objects.
 */
export async function createNamespace(
    url,
    config = {},
    wasmBaseName = "vtk",
    urlIsGzipBundle = true,
) {
  const vtkProxyCache = new WeakMap();
  const idToRef = new Map();

  const loader = new VtkWASMLoader();
  await loader.load(url || "loaded-module", config, wasmBaseName, urlIsGzipBundle);
  const wasm = loader.createStandaloneSession();

  return createInstantiatorProxy(wasm, vtkProxyCache, idToRef);
}

/**
 * If the script is tagged with id="vtk-wasm", a global "vtk" namespace
 * will be created automatically. Since the namespace creation is asynchronous,
 * a global "vtkReady" promise will be provided to enable code synchronization.
 *
 * Possible data attributes:
 *  - data-url="url to load VTK.wasm from" only needed if VTK.wasm is not already loaded.
 *  - data-config="{ rendering: 'webgl|webgpu', exec: 'sync|async' }" json config for
 *    WASM module configuration.
 */
const { promise, resolve, reject } = createFuture();
const script = document.querySelector("#vtk-wasm");
if (script) {
  const url = script.dataset.url || ".";
  const config = JSON.parse(script.dataset.config || "{}");
  window.vtkReady = promise;
  createNamespace(url, config)
    .then((vtk) => {
      window.vtk = vtk;
      resolve(vtk);
    })
    .catch(reject);
} else {
  reject("Automatic VTK namespace initialization is disabled because no <script id=\"vtk-wasm\"> tag was found. See https://kitware.github.io/vtk-wasm/guide/js/plain.html#defer-wasm-loading-with-annotation'");
}
