import { createEmscriptenConfig, isSameConfig } from "./configManager.js";

/**
 * Create a vtkRemoteSession, reusing existing wasmInstance if possible
 * @param {object} config 
 * @param {object} currentConfig 
 * @param {*} wasmInstance 
 * @returns {vtkRemoteSession}
 */
export async function createRemoteSession(config, currentConfig, wasmInstance) {
  if (wasmInstance) {
    // New API
    if (wasmInstance?.isAsync && wasmInstance.isAsync()) {
      if (!config || isSameConfig(currentConfig, config)) {
        // Reuse the same runtime
        console.debug("Reusing existing async WASM runtime for remote session");
        return new wasmInstance.vtkRemoteSession();
      } else {
        console.debug("Creating new async WASM runtime for remote session");
        const newWASMRuntime = await window.createVTKWASM(
          createEmscriptenConfig(config || currentConfig),
        );
        return new newWASMRuntime.vtkRemoteSession();
      }
    } else {
      if (!config || isSameConfig(currentConfig, config)) {
        // Reuse the same runtime
        console.debug("Reusing existing sync WASM runtime for remote session");
        return new wasmInstance.vtkRemoteSession();
      } else {
        console.debug("Creating new sync WASM runtime for remote session");
        const newWASMRuntime = await window.createVTKWASM(
          createEmscriptenConfig(config || currentConfig),
        );
        return new newWASMRuntime.vtkRemoteSession();
      }
    }
  }

  // Old API
  const remoteSession = await window.createVTKWasmSceneManager();
  remoteSession.initialize();
  return remoteSession;
}
