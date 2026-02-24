# Roadmap

> [!NOTE]
> This roadmap is a work in progress. The information provided here reflects the current plans and status of VTK WebAssembly features, but is subject to change based on technical considerations, user feedback, and evolving priorities.

In August 2025, [WebAssembly support for VTK](https://www.kitware.com/introducing-webassembly-support-in-vtk/) was introduced to enable capabilities from the C++ VTK library in JavaScript through WebAssembly. 

**VTK.wasm is set to become the de-facto approach for using VTK in JavaScript**. Kitware is expanding the number of C++ classes that are accessible in the JavaScript API. The table below tracks the status of features in VTK WebAssembly, categorized by version.

## Feature Status

> [!IMPORTANT]
> The "Planned in next release" section includes features that are currently being developed or are planned for the next release (9.7.0). They might be pushed to a later release based on development progress. The "Released in 9.6.0" and "Released in 9.5.0" sections list features that have been implemented and released in those respective versions.

> [!NOTE]
> Detailed information about each feature will be added soon.

<script setup>
import roadMapData from './features.json';
</script>

### Planned in next release (9.7.0)
<FeatureStatusTable version-group="planned" />

### Released in 9.6.x
<FeatureStatusTable version-group="implemented-in-9.6.x" />

### Released in 9.5.x
<FeatureStatusTable version-group="implemented-in-9.5.x" />


## Serialized Modules Coverage

These modules have been serialized for use in VTK WebAssembly. The status indicates the percentage of classes within each module that have been made available in the JavaScript API.

<ModulesCoverageTable module-group="serialized" />

## Not Serialized Modules

> [!NOTE]
> Reasons for non-serialization and potential future plans will be added soon.

These modules have not been serialized for VTK WebAssembly, and are not currently available for use in JavaScript. They may be considered for future serialization based on demand and feasibility.
This list is organized by module group, but specific reasons for non-serialization (e.g. technical challenges, low demand) are not provided here. We
simply have not found it necessary to serialize these modules yet, but that could change in the future as needs evolve.

<ModulesCoverageTable module-group="not-serialized" />