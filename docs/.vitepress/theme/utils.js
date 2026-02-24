function normalizeHeaderList(headerList) {
  return headerList
    .map((headerFileName) => headerFileName.trim())
    .filter((headerFileName) => headerFileName !== "" && !headerFileName.startsWith("#"));
}

function getModuleNameFromHeaderFileName(headerFileName) {
  return `VTK::${headerFileName.split("/").slice(0, 2).join("")}`;
}

function getClassNameFromHeaderFileName(headerFileName) {
  const classToken = headerFileName.split("/").at(-1) || "";
  return classToken.replace(/\.[^/.]+$/, "");
}

function getClassListPerModule(headerList) {
  const classListMap = new Map();
  for (const headerFileName of normalizeHeaderList(headerList)) {
    const moduleName = getModuleNameFromHeaderFileName(headerFileName);
    if (!classListMap.has(moduleName)) {
      classListMap.set(moduleName, []);
    }
    console.log(`Adding class ${getClassNameFromHeaderFileName(headerFileName)} to module ${moduleName}`);
    classListMap.get(moduleName).push(getClassNameFromHeaderFileName(headerFileName));
  }
  return classListMap;
}

function getClassNamesPerModule(headerList) {
  const classNamesMap = new Map();
  for (const headerFileName of normalizeHeaderList(headerList)) {
    const moduleName = getModuleNameFromHeaderFileName(headerFileName);
    if (!classNamesMap.has(moduleName)) {
      classNamesMap.set(moduleName, []);
    }
    classNamesMap.get(moduleName).push(getClassNameFromHeaderFileName(headerFileName));
  }

  for (const [moduleName, classNames] of classNamesMap.entries()) {
    const deduped = [...new Set(classNames)].sort((leftName, rightName) => leftName.localeCompare(rightName));
    classNamesMap.set(moduleName, deduped);
  }

  return classNamesMap;
}

class ModuleCoverageStatistics {
  constructor(moduleName, autoClasses, manualClasses, ignoreClasses) {
    this.moduleName = moduleName;
    this.autoClasses = autoClasses;
    this.ignoreClasses = ignoreClasses;
    this.manualClasses = manualClasses;
  }

  get completedCount() {
    return this.autoClasses.length + this.manualClasses.length;
  }

  get totalCount() {
    return this.autoClasses.length + this.ignoreClasses.length + this.manualClasses.length;
  }

  get coveragePercent() {
    return this.totalCount > 0 ? 100.0 * (this.autoClasses.length + this.manualClasses.length) / this.totalCount : 0;
  }
}

async function fetchHeaderList(url) {
  const response = await fetch(url);
  return normalizeHeaderList((await response.text()).split("\n"));
}

export async function getModuleCoverage() {
  const [autoHeaderList, ignoreHeaderList, manualHeaderList] = await Promise.all([
    // use github because gitlab.kitware.com raw url needs cors proxy which over-complicates the code.
    fetchHeaderList("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/VTK_MARSHALAUTO.txt"),
    fetchHeaderList("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/ignore.txt"),
    fetchHeaderList("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/VTK_MARSHALMANUAL.txt"),
  ]);

  const autoMap = getClassListPerModule(autoHeaderList);
  const ignoreMap = getClassListPerModule(ignoreHeaderList);
  const manualMap = getClassListPerModule(manualHeaderList);

  const allModules = new Set([...autoMap.keys(), ...ignoreMap.keys(), ...manualMap.keys()]);

  const coverageMap = new Map();
  for (const moduleName of allModules.values()) {
    coverageMap.set(
      moduleName,
      new ModuleCoverageStatistics(
        moduleName,
        autoMap.get(moduleName) || [],
        manualMap.get(moduleName) || [],
        ignoreMap.get(moduleName) || []
      )
    );
  }
  return coverageMap;
}
