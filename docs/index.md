---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: VTK.wasm
  text: A simple path to go from C++ to Web
  tagline: Unleash the power of VTK onto the Web
  image:
    # src: /assets/images/tauri-wasm-widget.png
    src: /wasm-widgets.png
    title: Example of VTK.wasm using inside a trame application
    alt: Example of VTK.wasm using inside a trame application
  actions:
    - theme: brand
      text: Getting started
      link: /guide/
    - theme: alt
      text: C++
      link: /guide/cpp/
    - theme: alt
      text: JavaScript
      link: /guide/js/
    - theme: alt
      text: trame
      link: /guide/trame/

features:
  - title: VTK
    icon:
      src: /logos/vtk.svg
      alt: VTK
      width: 45
    details: The Visualization Toolkit (VTK) is open source software for manipulating and displaying scientific data.The platform is used worldwide in commercial applications, as well as in research and development.
    link: https://vtk.org/
  - title: Open Source
    icon:
      src: /logos/opensource.svg
      alt: Pure Python
      width: 28
    details: VTK is an open source project licensed under BSD 3-Clause license that enables the broadest possible audience, including commercial organizations, to use the software royalty free.
    link: https://www.kitware.com/open-source/
  - title: Support and Services
    icon:
      src: /logos/k.svg
      alt: Kitware Inc.
      width: 20
    details: Kitware can help you get started intergrating VTK.wasm into your application. Our team is here to help.  Please contact us
    link: https://www.kitware.com/support
#  - details: '<iframe src="./demo/viewer-basic.html" style="width: 100%; height: 100%; border: none"></iframe>'
#  - details: '<iframe src="./demo/viewer-porsche.html" style="width: 100%; height: 100%; border: none"></iframe>'
#  - details: '<iframe src="./demo/viewer-starfighter.html" style="width: 100%; height: 100%; border: none"></iframe>'
---
<!--
<div style="width: 100%; height: 50vh; border-radius: 12px; overflow: hidden; margin: 1rem 0;">
<iframe src="./demo/viewer-basic.html" style="width: 100%; height: 100%; border: none;">
</iframe>
</div> -->

<div class="viewers-items">
  <div class="viewers-item viewers-grid-3">
    <iframe src="./demo/viewer-porsche.html"></iframe>
  </div>
  <div class="viewers-item viewers-grid-3">
    <iframe src="./demo/viewer-basic.html"></iframe>
  </div>
  <div class="viewers-item viewers-grid-3">
    <iframe src="./demo/viewer-starfighter2.html"></iframe>
  </div>
</div>


<div class="vp-doc home-wrapper" style="margin-top: 2rem;">

# Activities

<!-- @include: ./news.md{,23} -->

---
[See all news](./news)

</div>
