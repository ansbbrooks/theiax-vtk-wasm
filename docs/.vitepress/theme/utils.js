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

function getClassCountPerModule(headerList) {
  const classCountMap = new Map();
  for (const headerFileName of normalizeHeaderList(headerList)) {
    const moduleName = getModuleNameFromHeaderFileName(headerFileName);
    classCountMap.set(moduleName, (classCountMap.get(moduleName) || 0) + 1);
  }
  return classCountMap;
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
  constructor(moduleName, autoCount, ignoreCount, manualCount, missingClasses = []) {
    this.moduleName = moduleName;
    this.autoCount = autoCount;
    this.ignoreCount = ignoreCount;
    this.manualCount = manualCount;
    this.missingClasses = missingClasses;
  }

  get totalCount() {
    return this.autoCount + this.ignoreCount + this.manualCount;
  }

  get coverage() {
    return this.totalCount > 0 ? 100.0 * (this.autoCount + this.manualCount) / this.totalCount : 0;
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

  const autoMap = getClassCountPerModule(autoHeaderList);
  const ignoreMap = getClassCountPerModule(ignoreHeaderList);
  const manualMap = getClassCountPerModule(manualHeaderList);
  const missingClassesMap = getClassNamesPerModule(ignoreHeaderList);

  const allModules = new Set([...autoMap.keys(), ...ignoreMap.keys(), ...manualMap.keys()]);

  const coverageMap = new Map();
  for (const moduleName of allModules.values()) {
    coverageMap.set(
      moduleName,
      new ModuleCoverageStatistics(
        moduleName,
        autoMap.get(moduleName) || 0,
        ignoreMap.get(moduleName) || 0,
        manualMap.get(moduleName) || 0,
        missingClassesMap.get(moduleName) || []
      )
    );
  }
  return coverageMap;
}
