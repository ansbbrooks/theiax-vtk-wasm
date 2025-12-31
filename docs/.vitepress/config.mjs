import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/vtk-wasm",
  title: "VTK.wasm",
  description: "Guides and documentation around VTK.wasm",
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "196x196",
        href: "/vtk-wasm/logos/favicon-196x196.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: "/vtk-wasm/logos/favicon-32x32.png",
      },
    ],
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-LLSX9WG6YK",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-LLSX9WG6YK');`,
    ],
    // [
    //   'script',
    //   { defer: '', src: 'js/hero.js' }
    // ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    siteTitle: false,
    nav: [
      { text: "Home", link: "/" },
      { text: "News", link: "/news" },
      { text: "Guides", link: "/guide/" },
      // { text: 'Use Cases', link: '/usecase/' },
      {
        text: "Resources",
        items: [
          // { text: 'Documentation', link: 'https://docs.paraview.org/en/latest/Catalyst/index.html' },
          { text: "Blogs", link: "https://www.kitware.com/blog/" },
          // { text: 'Discussions', link: 'https://discourse.paraview.org/c/in-situ-support' },
          {
            text: "Issue Tracker",
            link: "https://gitlab.kitware.com/groups/vtk/-/issues",
          },
          { text: "Webinars", link: "https://www.kitware.com/webinars/" },
          { text: "Services", link: "https://www.kitware.com/support" },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [{ text: "Getting started", link: "/guide/" }],
        },
        {
          text: "For C++ developers",
          items: [
            { text: "Getting started", link: "/guide/cpp/" },
            { text: "Building VTK", link: "/guide/cpp/setup" },
            { text: "Embind", link: "/guide/cpp/embind" },
          ],
        },
        {
          text: "For JavaScript developers",
          items: [
            { text: "Getting started", link: "/guide/js/" },
            { text: "Working With Objects", link: "/guide/js/objects" },
            { text: "Observers", link: "/guide/js/observers" },
            { text: "HTML Script Tag", link: "/guide/js/plain" },
            { text: "Bundler Integration", link: "/guide/js/bundler" },
          ],
        },
        {
          text: "For trame users",
          items: [
            { text: "Getting started", link: "/guide/trame/" },
            { text: "3D Widgets", link: "/guide/trame/widget" },
            { text: "Method call", link: "/guide/trame/picking" },
          ],
        },
        {
          text: "As a data viewer",
          items: [
            { text: "Getting started", link: "/guide/viewer/" },
            { text: "Generating data", link: "/guide/viewer/data" },
          ],
        },
      ],
      "/usecase/": [{ text: "Examples", link: "/usecase/index" }],
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/Kitware/vtk-wasm' }
    // ]
  },
});
