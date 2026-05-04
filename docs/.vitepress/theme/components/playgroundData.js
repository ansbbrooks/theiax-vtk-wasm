export const blankSlate = {
  displayIFrame: true,
  html: `<!doctype html>
<html lang="en">
  <head>
  </head>
  <body>
  </body>
</html>`,
  js: `console.log("Hello!");`,
};
export const workingWithObjects = {
  displayIFrame: false,
  html: `<!doctype html>
<html lang="en">
  <head>
    <script
      src="https://unpkg.com/@kitware/vtk-wasm/vtk-umd.js"
      id="vtk-wasm"
      data-url="https://gitlab.kitware.com/api/v4/projects/13/packages/generic/vtk-wasm32-emscripten/9.6.20260228/vtk-9.6.20260228-wasm32-emscripten.tar.gz">
    </script>
  </head>
  <body>
  </body>
</html>`,
  js: `const vtk = await window.vtkReady;
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
/// 4. Uncomment to print a VTK object using JSON.stringify
// console.log(JSON.stringify(renderer));
/// 5. Uncomment to print a VTK object using toString (calls C++ Print() directly)
// console.log(renderer.toString());`,
};
export const observers = {
  displayIFrame: true,
  html: `<!doctype html>
<html lang="en">
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
    <script
      src="https://unpkg.com/@kitware/vtk-wasm/vtk-umd.js"
      id="vtk-wasm"
      data-url="https://gitlab.kitware.com/api/v4/projects/13/packages/generic/vtk-wasm32-emscripten/9.6.20260228/vtk-9.6.20260228-wasm32-emscripten.tar.gz"></script>
  </head>
  <body>
    <div style="min-height:300px">
      <canvas
        id="vtk-wasm-window"
        tabindex="-1"
        onclick="focus()"
        oncontextmenu="event.preventDefault()"></canvas>
    </div>
  </body>
</html>`,
  js: `function setupObservers(interactor) {
  return {
    moveTag: interactor.observe('MouseMoveEvent',
      () => { console.log("[x,y]=" + interactor.eventPosition); }),
    btnPressTag: interactor.observe('LeftButtonPressEvent',
      () => { console.log("lmb down"); }),
    keyPressTag: interactor.observe('KeyPressEvent',
      () => { console.log("keypress: " + String.fromCharCode(interactor.keyCode)); }), 
    keyReleaseTag: interactor.observe('KeyReleaseEvent',
      () => { console.log("keyrelease: " + String.fromCharCode(interactor.keyCode)); }), 
    resizeTag: interactor.observe('ConfigureEvent',
      () => { console.log("newsize=" + interactor.size); }),
  };
}
async function createScene(vtk) {
  const mesh = vtk.vtkPartitionedDataSetCollectionSource({
    numberOfShapes: 1
  });
  const mapper = vtk.vtkCompositePolyDataMapper();
  await mapper.setInputConnection(await mesh.getOutputPort());
  const actor = vtk.vtkActor({mapper})
  const renderer = vtk.vtkRenderer({background: [0.2, 0.2, 0.2]});
  renderer.addViewProp(actor);
  const canvasSelector = "#vtk-wasm-window";
  const renderWindow = vtk.vtkRenderWindow({ canvasSelector });
  await renderWindow.addRenderer(renderer);
  const interactor = vtk.vtkRenderWindowInteractor({
    canvasSelector,
    renderWindow,
  });
  await renderer.resetCamera();
  return { renderWindow, interactor };
}
const vtk = await window.vtkReady;
const { renderWindow, interactor } = await createScene(vtk);
const { moveTag, btnPressTag, keyPressTag, keyReleaseTag, resizeTag } = setupObservers(interactor);
interactor.observe('ExitEvent', () => {
  interactor.unObserve(moveTag);
  interactor.unObserve(btnPressTag);
  interactor.unObserve(keyPressTag);
  interactor.unObserve(keyReleaseTag);
  interactor.unObserve(resizeTag);
  console.log("Observers removed");
});
await interactor.interactorStyle.setCurrentStyleToTrackballCamera();
await interactor.start();`,
};
