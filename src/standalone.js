export { VtkWASMLoader } from "./wasmLoader";
import { createFuture } from "./core/future";

/**
 * Create a VTK namespace for handling vtk object creation.
 *
 * @param {String} url - Optional directory to where VTK.wasm is getting served from.
 *                  If vtkWebAssemblyInterface.mjs is already loaded as a script,
 *                  this will be ignored.
 * @param {Object} config
 *
 * @returns the vtk namespace for creating VTK objects.
 */
export async function createNamespace(url, config = {}, wasmBaseName = "vtk") {
  const loader = new VtkWASMLoader();
  await loader.load(url || "loaded-module", config, wasmBaseName);
  return loader.createNamespace();
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
if (typeof window !== "undefined") {
  const script = document.querySelector("#vtk-wasm");
  if (script) {
    const { promise, resolve, reject } = createFuture();
    const url = script.dataset.url || ".";
    const config = JSON.parse(script.dataset.config || "{}");
    window.vtkReady = promise;
    createNamespace(url, config)
      .then((vtk) => {
        window.vtk = vtk;
        resolve(vtk);
      })
      .catch(reject);
  }
}
