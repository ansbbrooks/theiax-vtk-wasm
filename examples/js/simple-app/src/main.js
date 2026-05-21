import "./style.css";
import { VtkWASMLoader } from "@kitware/vtk-wasm/vtk";
import { buildWASMScene } from "./example";

const loader = new VtkWASMLoader();
await loader.load("https://gitlab.kitware.com/api/v4/projects/13/packages/generic/vtk-wasm32-emscripten/9.5.20251215/vtk-9.5.20251215-wasm32-emscripten.tar.gz");
const vtk = loader.createNamespace();
buildWASMScene(vtk, "#app > canvas", "This scene passes the VTK.wasm bundle from GitLab registry to createNamespace()");
