import "./style.css";
import { createNamespace } from "@kitware/vtk-wasm/vtk";
import { buildWASMScene } from "./example";

createNamespace().then((vtk) => {
  buildWASMScene(vtk, "#app > canvas");
});
