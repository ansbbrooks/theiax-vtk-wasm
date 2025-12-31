# Bundler Integration

Modern web development rely on package manager to bring project dependencies. This section covers how published releases can be used within a JavaScript project.

## Project setup

In the simple example we are going to use [Vite](https://vite.dev/) with Vanilla JavaScript. The full code is available for reference [here](https://github.com/Kitware/vtk-wasm/tree/main/examples/js/simple-app).

::: code-group
<<< ../../../examples/js/simple-app/package.json
<<< ../../../examples/js/simple-app/index.html
<<< ../../../examples/js/simple-app/src/main.js [src/main.js]
<<< ../../../examples/js/simple-app/src/example.js [src/example.js]
<<< ../../../examples/js/simple-app/src/style.css [src/style.css]
```bash [Install/Build]
npm install
npm run build
```
:::

Here, the VTK.wasm bundle is downloaded in the browser directly from the Gitlab package registry. See the `src/main.js` file for the relevant code.


## Result

<iframe src="/vtk-wasm/demo/simple-app/index.html" style="width: 100%; height: 25vh; border: none;"></iframe>

[Full Screen Viewer](../../demo/simple-app/index.html){target="_blank"}
