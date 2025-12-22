/**
 * Convert state to object
 * @param {string|object} state 
 * @returns {object}
 */
export function convertToObj(state) {
  if (state?.Id) {
    return state;
  }
  return JSON.parse(state);
}

/**
 * Convert state to string
 * @param {string|object} state 
 * @returns {string}
 */
export function convertToStr(state) {
  if (state?.Id) {
    return JSON.stringify(state);
  }
  return state;
}
