function getClassCountPerModule(headerList) {
  const classCountMap = new Map();
  for (const headerFileName of headerList) {
    if (headerFileName.trim() === "") continue;
    const moduleName = `VTK::${headerFileName.split("/").slice(0, 2).join("")}`;
    classCountMap.set(moduleName, (classCountMap.get(moduleName) || 0) + 1);
  }
  return classCountMap;
}

class ModuleCoverageStatistics {
  constructor(moduleName, autoCount, ignoreCount, manualCount) {
    this.moduleName = moduleName;
    this.autoCount = autoCount;
    this.ignoreCount = ignoreCount;
    this.manualCount = manualCount;
  }

  get totalCount() {
    return this.autoCount + this.ignoreCount + this.manualCount;
  }

  get coverage() {
    return this.totalCount > 0 ? 100.0 * (this.autoCount + this.manualCount) / this.totalCount : 0;
  }
}

async function fetchAndCount(url) {
  const response = await fetch(url);
  return getClassCountPerModule((await response.text()).split("\n"));
}

export async function getModuleCoverage() {
  const [autoMap, ignoreMap, manualMap] = await Promise.all([
    // use github because gitlab.kitware.com raw url needs cors proxy which over-complicates the code.
    fetchAndCount("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/VTK_MARSHALAUTO.txt"),
    fetchAndCount("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/ignore.txt"),
    fetchAndCount("https://raw.githubusercontent.com/Kitware/VTK/refs/heads/master/Utilities/Marshalling/VTK_MARSHALMANUAL.txt"),
  ]);

  const coverageMap = new Map();
  for (const [moduleName, autoCount] of autoMap.entries()) {
    coverageMap.set(
      moduleName,
      new ModuleCoverageStatistics(moduleName, autoCount, ignoreMap.get(moduleName) || 0, manualMap.get(moduleName) || 0)
    );
  }
  return coverageMap;
}
