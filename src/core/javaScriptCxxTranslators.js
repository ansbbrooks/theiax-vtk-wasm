/**
 * Converts a C++ style name (PascalCase) to a JavaScript style name (camelCase).
 * @param {string} cxxName 
 * @returns {string}
 */
export function toJsName(cxxName) {
  const jsName = `${cxxName.charAt(0).toLowerCase()}${cxxName.slice(1)}`;
  // console.log("c2j", cxxName, "=>", jsName);
  return jsName;
}

/**
 * Converts a JavaScript style name (camelCase) to a C++ style name (PascalCase).
 * @param {string} jsName 
 * @returns {string}
 */
export function toCxxName(jsName) {
  const cxxName = `${jsName.charAt(0).toUpperCase()}${jsName.slice(1)}`;
  // console.log("j2c", jsName, "=>", cxxName);
  return cxxName;
}

/**
 * Convert JS-style keyword arguments to C++-style keyword arguments.
 * @param {object} kwArgs 
 * @returns {object}
 */
export function toCxxKeys(kwArgs) {
  const wrapped = {};
  Object.entries(kwArgs).forEach(([k, v]) => {
    wrapped[toCxxName(k)] = v;
  });
  return wrapped;
}

/**
 * Convert C++-style keyword arguments to JS-style keyword arguments.
 * @param {object} kwArgs 
 * @returns {object}
 */
export function toJsKeys(kwArgs) {
  const wrapped = {};
  Object.entries(kwArgs).forEach(([k, v]) => {
    wrapped[toJsName(k)] = v;
  });
  return wrapped;
}
