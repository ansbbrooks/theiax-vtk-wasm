# VTK.wasm for C++ developers

This guide shows you how to compile VTK for WebAssembly, extend the functionality of VTK with your own C++ code and ultimately leverage your
extensions to build 3D web visualization apps.

## Usage patterns

Writing parts of your application in C/C++ allows you to optimize data processing, IO, and rendering. In addition, you can integrate highly
efficient third-party C++ libraries that were traditionally used only outside the browser. Read [__Embind__](./embind.md) to learn how
to connect C++ to JavaScript.
