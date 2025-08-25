## 9.5.20250823 is now available!

__August 23, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250823.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250823-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5674/download)
2. [vtk-9.5.20250823-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5673/download)

## 9.5.20250809 is now available!

__August 9, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250809.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250809-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5613/download)
2. [vtk-9.5.20250809-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5614/download)

## 9.5.20250802 is now available!

__August 2, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250802.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250802-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5576/download)
2. [vtk-9.5.20250802-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5577/download)

## 9.5.20250726 is now available!

__July 26, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250726.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250726-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5534/download)
2. [vtk-9.5.20250726-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5533/download)

## Support clip planes in webgpu polydata mapper

__July 23, 2025__

Support clipping in vtkWebGPUPolyDataMapper

## 9.5.20250719 is now available!

__July 19, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250719.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250719-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5502/download)
2. [vtk-9.5.20250719-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5503/download)

## 9.5.20250712 is now available!

__July 12, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250712.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250712-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5444/download)
2. [vtk-9.5.20250712-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5445/download)

## Fix interactor event loop error in wasm64 bundle

__July 10, 2025__

[vtk/vtk!12278](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12278) fixed a runtime error when the interactor event loop was started in wasm64 bundle.

## Invalidate shader when clipping planes are updated

__July 9, 2025__

[vtk/vtk!12271](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12271) fixed a bug where the mapper clip planes were not applied when developers used Add/RemoveClippingPlane API after initial render.

## 9.5.20250628 is now available!

__June 28, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250628.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250628-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5389/download)
2. [vtk-9.5.20250628-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5388/download)

## VTK 9.5 is out

__June 24, 2025__

The [9.5.0 release](https://www.kitware.com/vtk-9-5-0/) includes many improvments regarding the integration of WASM. In addition to observing VTK objects on the client side, you can also invoke methods on VTK objects. This enables us to implement client/server calls for handling picking with client side objects. The other hidden improvement is related to the increased number of vtk objects available in WASM which should help in reproducing more complex VTK scene more accurately.

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.0"
```

The WASM bundle is available here: [vtk-9.5.0-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5327/download)

## Fix serialization for RenderingAnnotation module

__June 23, 2025__

See [vtk/vtk!12192](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12192)
- vtkScalarBarActor: update reference coordinates when setting position coordinate.
- Fix deserialization of `vtkAlgorithm` inputs
- Fix serialization of `vtkDataSetMapper` inputs
- Enables (de)serialization of necessary indexed properties in _RenderingAnnotation_
- Fix (de)serialization of `vtkLabelPlacementMapper` and `vtkLabelHierarchy`

## Add serialization for vtkGraph and ViewsInfovis module

__June 23, 2025__

See [vtk/vtk!12199](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12199)

- Added manual (de)serialization helper for `vtkGraph`
- Enable auto serialization for subclasses of `vtkGraph`
- Enable serialization in _ViewsInfovis_
    - Expose relevant properties, exclude redundant ones
- Serialize child items in vtkContextTransform
    - Cannot do this in `vtkAbstractContextItem` since some subclasses (like `vtkDendrogramItem`) add items to themselves, leading to extra child items after deserialization and errors when rendering those child items.
- A few unrelated serialization fixes (`vtkFramebufferPass`, `vtkMapperCollection`)

## 9.5.20250621 is now available!

__June 21, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250621.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250621-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5329/download)
2. [vtk-9.5.20250621-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5328/download)

## 9.5.20250614 is now available!
__June 14, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250614.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250614-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5323/download)
2. [vtk-9.5.20250614-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5322/download)

## 9.5.20250607 is now available!
__June 7, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250607.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250607-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5261/download)
2. [vtk-9.5.20250607-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5262/download)

## Clipping planes in WASM/WebGL

__June 6, 2025__

Clipping planes on mapper is now supported by [vtk/vtk!12176](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12176). This allow us to implement the TIE fighter clip plane demo in client side. 

<iframe src="/vtk-wasm/demo/viewer-starfighter2.html" height="592" width="100%" frameborder="0" allowfullscreen="" title="Rendering clipping"></iframe>

## Fix serialization for 3D widgets

__June 5, 2025__

- [vtk/vtk!12162](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12162) fixes serialization errors of classes
in the _InteractionWidgets_ module.
- Enable auto serialization for `vtkResliceCursorRepresentation`, `vtkDistanceRepresentation`, `vtkTextRepresentation`, and related classes.

## Fix serialization of various classes

__June 4, 2025__

- [vtk/vtk!12167](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12167) fixed serialization for various classes and enables serialization for more classes in the _ImagingCore_, _ImagingColor_, _RenderingGridAxes_, and the _RenderingImage_ modules.
- The `vtkSignedCharArray` class now has serialization enabled.
- The redundant width/height properties of vtkActor2D are now excluded from (de)serialization.

## 9.5.20250531 is now available!

__May 31, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==9.5.20250531.dev0" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here:
1. [vtk-9.5.20250531-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5198/download)
2. [vtk-9.5.20250531-wasm64-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5197/download)


## Add get/set functions in vtkRemoteSession

__May 27, 2025__

`vtkRemoteSession::getState` is deprecated in favor of `vtkRemoteSession::get`. The new `vtkRemoteSession::set` lets you
apply properties from JSON in bulk on a VTK object. See [vtrk/vtk!12155](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12155)

## Add runtime support for WebGL2 and WebGPU

__May 24, 2025__

You can now choose the backend to use for rendering your VTK scene. The WebGPU is still work in progress but is now available for testing via runtime configuration option.

WebGPU classes in VTK are now serialized and available in the vtkWebAssemblyAsync.{mjs,wasm} files. Subsequent packages will distribute both vtkWebAssemblyAsync.{mjs,wasm} and vtkWebAssembly.{mjs,wasm} files. The async package will only work in browsers that enable JavaScript Promise Integration ([JSPI](https://github.com/WebAssembly/js-promise-integration)). See [vtk/vtk!12143](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12143)

## Fix serialization for RenderingVolume module

__May 27, 2025__

[vtk/vtk!12142](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12142) fixes serialization errors that arise when serializing classes in the _RenderingVolume_ module.

## Add standalone and remote session API

__May 19, 2025__

The `vtkWebAssembly.mjs` library now provides two new classes `vtkRemoteSession` and `vtkStandaloneSession`.
- Remote session API is concerned with use cases where a "server" creates VTK
 objects and sends the state to a WASM "client" that deserializes the state
 into objects to mimic the visualization pipeline on the "server".
 This API does not allow creating objects in the WASM world. It is possible,
 although very difficult and prone to bugs.

- Standalone API is important when one wants to directly create and manipulate objects
 in the local context in the absence of a server. 

See [vtk/vtk!12110](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12110)

## Fix vtkFieldData deserialization when no. of arrays is the same but some or all individual arrays have changed

__May 19, 2025__

[vtk/vtk!12129](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12129) fixed a bug where the arrays had their values updated only when the total number of arrays in the vtkFieldData changed between deserializations. Now, it always update the array list because even though the number of arrays remain the same, the arrays themselves might be different.

## Add support for 32 and 64 bits WASM bundle

__May 14, 2025__

Build and distribute artifacts for wasm64. This package allows rendering large meshes bigger than 4GB. It requires a web browser that supports 64-bit wasm memories.

## 9.5.20250513 is now available!
__May 13, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==-9.5.20250513-wa" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here: [vtk-9.5.20250513-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5101/download)

## 9.5.20250510 is now available!
__May 10, 2025__

You can install the equivalent python wheel with the command

```sh
pip install "vtk==-9.5.20250510-wa" --extra-index-url https://wheels.vtk.org
```

The WASM bundle is available here: [vtk-9.5.20250510-wasm32-emscripten.tar.gz](https://gitlab.kitware.com/vtk/vtk/-/package_files/5067/download)

## Add serialization for pickers

__May 5, 2025__

[vtk/vtk!12095](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12095) enables auto serialization for pickers in the _RenderingCore_ module, as well as `vtkAssemblyNode`, `vtkAssemblyPath`, and `vtkProp3DCollection` for properties of certain pickers. 

## Fix serialization of VTK classes

__April 25, 2025__

Many serialization issues were fixed in [vtk/vtk!12012](https://gitlab.kitware.com/vtk/vtk/-/merge_requests/12012). Serialization capability was also added to some classes. Here's a list of classes
that were affected:

- vtkActor2D
- vtkBitArray
- vtkDataArray
- vtkDiscretizableColorTransferFunction
- vtkFieldData
- vtkInformation
- vtkLabeledContourMapper
- vtkLogLookupTable
- vtkMultiBlockDataSet
- vtkOpenGLLabeledContourMapper
- vtkPolyDataMapper2D
- vtkProp3DFollower
- vtkProperty
- vtkRenderWindow
- vtkScalarsToColors
- vtkShaderProperty
- vtkStructuredGrid
- vtkTextPropertyCollection
- vtkTexture
- vtkVariant
- vtkVariantArray
- vtkWindow

## Helper JavaScript library

__October 7, 2024__

A new JavaScript library is available under `@kitware/trame-vtklocal` which delivers a set of helper tools for VTK.wasm and JavaScript.
This include a standalone viewer for a VTK scene dump, a wrapper for pure JavaScript usage and some core handler when creating a widget (i.e. React, Svelt, Angular...) for interating with a trame-vtklocal server implementation.
