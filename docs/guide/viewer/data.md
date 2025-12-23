# VTK.wasm viewer data format

While the viewer provides a convinient solution for sharing visualizations, it is also important to provide a simple approach for capturing such a scene into a standalone file.

The `trame.widget.vtklocal.VtkLocal` widget provides a `save(file_name)` helper method that will ease such file creation. You can even see its usage within our trame examples. Once things stabilize, we may promote such method on the vtkObjectManager directly to ease access.

::: code-group
<<< ../../../examples/trame/widget/clip.py#export{py} [Clipping (data)]
<<< ../../public/demo/viewer-starfighter.html [Clipping (html)]
<<< ../../../examples/trame/picking/pick.py#export{py} [Picking (data)]
<<< ../../public/demo/viewer-porsche.html [Picking (html)]
:::

<div style="width: 100%; height: 25vh; border-radius: 12px; overflow: hidden; margin: 1rem 0;">
<iframe src="/vtk-wasm/demo/viewer-basic.html" style="width: 100%; height: 100%; border: none;">
</iframe>
</div>

[Full Screen Viewer](../../demo/viewer-basic.html){target="_blank"}

<div style="width: 100%; height: 25vh; border-radius: 12px; overflow: hidden; margin: 1rem 0;">
<iframe src="/vtk-wasm/demo/viewer-porsche.html" style="width: 100%; height: 100%; border: none;">
</iframe>
</div>

[Full Screen Viewer](../../demo/viewer-porsche.html){target="_blank"}

<div style="width: 100%; height: 25vh; border-radius: 12px; overflow: hidden; margin: 1rem 0;">
<iframe src="/vtk-wasm/demo/viewer-starfighter.html" style="width: 100%; height: 100%; border: none;">
</iframe>
</div>

[Full Screen Viewer](../../demo/viewer-starfighter.html){target="_blank"}
