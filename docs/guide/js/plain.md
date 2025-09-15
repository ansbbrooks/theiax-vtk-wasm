# Plain JavaScript

The following examples rely on loading the `vtk.umd.js` bundle from a CDN. Also to mainly focus on the initialization part, we've externalized the JS/WASM code since that part does not change.

<iframe src="/vtk-wasm/demo/plain-javascript.html" style="width: 100%; height: 40vh; border: none;"></iframe>

## Load WASM as module

In this example we pre-load the WASM module and therefore we don't need to provide any URL for loading it when creating the __vtk__ namespace.

::: code-group
<<< ../../public/demo/plain-javascript-preload.html
<<< ../../public/demo/example.js
:::

## Defer WASM loading

In this example, since we didn't load the WASM module, we need to specify from where it should be loaded.


In this context we provide the URL where the WASM bundle can be found and used from.

::: code-group
<<< ../../public/demo/plain-javascript.html
<<< ../../public/demo/example.js
:::

## Defer WASM loading with annotation

In this example we tag the script to autoload WASM and create a global vtk namespace.

::: code-group
<<< ../../public/demo/plain-javascript-annotation.html
<<< ../../public/demo/example.js
:::

In this example we tag the script to autoload WASM directly from the VTK repository's package registry and create a global vtk namespace. You can customize the wasm architecture and version by changing the data-url.

::: code-group
<<< ../../public/demo/plain-javascript-annotation-wasm-registry.html
<<< ../../public/demo/example.js
:::

## Configuration options

The method `createNamespace(url, config)` takes two arguments. The first one is used to specify the base directory where the wasm file from VTK will be find. When the module is loaded, the __url__ parameter could be skipped. For the __config__ it is aimed to tune how you would like your WASM environement to behave. The following sections cover the various options and what it means.

- `{ rendering: 'webgl', mode: 'sync' }`
  - Using WebGL2 for rendering.
  - Using synchronous method execution.
- `{ rendering: 'webgl', mode: 'async' }`
  - Using WebGL2 for rendering.
  - Using asynchronous method execution.
  - This require WebAssembly JavaScript Promise Integration (JSPI) support in your browser
- `{ rendering: 'webgpu' }`
  - Using WebGPU for rendering.
  - WebGPU only works with the asynchronous implementation of method execution.
  - This require WebAssembly JavaScript Promise Integration (JSPI) support in your browser

For the __annotation__ usecase you can add `data-config="{'rendering': 'webgpu'}"` attribute in your HTML to adjust the config setting.
