const htmlCode = `<!doctype html>
<html lang="en">
  <head>
    <script
      src="https://unpkg.com/@kitware/vtk-wasm/vtk-umd.js"
      id="vtk-wasm"
      data-url="https://gitlab.kitware.com/api/v4/projects/13/packages/generic/vtk-wasm32-emscripten/9.5.20250913/vtk-9.5.20250913-wasm32-emscripten.tar.gz"></script>
  </head>
  <body>
  </body>
</html>`;
const jsCode = `const vtk = await window.vtkReady;
/// 1. Create an object.
///    Under the covers, this is a C++ vtkCamera instance.
const camera = vtk.vtkCamera()
/// 2. Interact with an object.
///    Properties can be read and modified using the dot ('.') notation.
///    Note that the property name starts with lower case alphabet.
console.log("Initial position: ", camera.position);
///    Call a function on the object. Every method is asynchronous.
///    The parameters are passed through to the underlying C++ method.
///    Note that the first letter is lower case.
await camera.azimuth(10.0);
console.log("After azimuth: ", camera.position);
/// 3. Pass an object to another object.
const renderer = vtk.vtkRenderer();
console.log("Old active camera at: ", renderer.activeCamera.position)
renderer.activeCamera = camera;
// await renderer.setActiveCamera(camera); // same as above
console.log("New active camera at: ", renderer.activeCamera.position)
/// 4. Print a VTK object using JSON.stringify
console.log(JSON.stringify(renderer));
/// 5. Print a VTK object using toString (calls C++ Print() directly)
console.log(renderer.toString());
const editorHeightPx = 400;
const iframeMinHeightPx = 0;
export { htmlCode, jsCode, editorHeightPx, iframeMinHeightPx };
