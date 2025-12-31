# VTK.wasm from JavaScript

This guide focuses on using the VTK WASM bundle from plain JavaScript, requiring no prior C++ knowledge.

## Overview
Most C++ classes from the [VTK C++ Documentation](https://vtk.org/doc/nightly/html/) are available through a single JavaScript object, which we refer to as the **vtk** namespace.

Once you have access to the **vtk** namespace (see [Bundler Integration](./bundler.md)), you can interact with VTK classes using standard JavaScript.

## The Why

VTK is a powerful library with a somewhat steep learning curve, but VTK.wasm allows you to use VTK without needing to learn C++. This can be particularly beneficial for web developers who are already familiar with JavaScript and want to integrate advanced visualization capabilities into their web applications.

The following sections will guide you through the essential aspects of using VTK.wasm with JavaScript:

- [Working With Objects](./objects.md)
- [Observers](./observers.md)
- [HTML Script Tag](./plain.md)
- [Bundler Integration](./bundler.md)
