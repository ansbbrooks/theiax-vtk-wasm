# VTK.wasm in Python with trame

While VTK is a C++ library, it is available in Python on PyPI and Conda which make it simple to install and use it within any Python environment.

For making a web UI in plain Python with VTK, there is nothing better than [__trame__](https://kitware.github.io/trame/) for getting the best of your data processing and visualization.

VTK.wasm is naturally integrated into trame as a widget to perform the 3D rendering using the browser capability.

For those not familiar with trame, trame allow to define an interactive application in plain Python using a web user interface. Trame abstract the client/server architecture by making the binding of events or state with the graphical interface transparent in a way that it feels like everything is local. Also when defining the graphical interface, the user use widgets to compose the content of the display.

## Getting started

With trame or any Python project it is best to start with an isolated virtual environment. In the code below we will be using __uv__ as a unified way of setting such environment across platforms.

::: code-group
```sh [macOS and Linux]
# you can choose any Python version where VTK is supported
# So far [3.8 to 3.13]
uv venv -p 3.10
source .venv/bin/activate

# install dependencies
uv pip install "vtk>=9.6" --index-url https://wheels.vtk.org --prerelease=allow
uv pip install "trame>=3.12"          # Install recent trame
uv pip install trame-vuetify          # - add some nice GUI widget for trame
uv pip install "trame-vtklocal>=0.16" # - add VTK.wasm widget for trame
```
```sh [Windows]
# you can choose any Python version where VTK is supported
# So far [3.8 to 3.13]
uv venv -p 3.10
.venv\Scripts\activate

# install dependencies
uv pip install "vtk>=9.6" --index-url https://wheels.vtk.org --prerelease=allow
uv pip install "trame>=3.12"            # Install recent trame
uv pip install trame-vuetify            # - add some nice GUI widget for trame
uv pip install "trame-vtklocal>=0.16" # - add VTK.wasm widget for trame
```
:::

Once your working environment is ready you can try the following code example that just setup a cone and let you edit its resolution and opacity.

![Cone app](/assets/images/trame/cone.png)

::: code-group
<<< ../../../examples/trame/simple/cone.py#widget{py:line-numbers=74} [Trame Widget]
<<< ../../../examples/trame/simple/cone.py#vtk{py:line-numbers=19} [VTK setup]
<<< ../../../examples/trame/simple/cone.py{py:line-numbers} [Full code (cone.py)]
<<< ../../../examples/trame/simple/requirements.txt
:::

The key take away is that the `vtkRenderWindow` instance needs to be pass to the `vtklocal.LocalView` widget. The widget itself provide a set of helper methods but the most relevant ones are:
- __`update(push_camera=False)`__: synchronize the current state of the vtkRenderWindow to the client right away.
- __`update_throttle(push_camera=False)`__: synchronize the current state of the vtkRenderWindow to the client but no more than the provided rate (`view.update_throttle.rate = 15` or in widget constructor `throttle_rate=20`)
- __`reset_camera(renderer_or_render_window=None)`__: reset the camera by asking the client (JavaScript) to do it.

The [__full working code__](https://github.com/Kitware/vtk-wasm/tree/main/examples/trame/simple) is also available.
