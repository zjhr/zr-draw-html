const trim = str =>
  str && !(str instanceof Object) ?
  String(str).replace(/(^\s+)|(\s+$)/g, '') :
  str
const isEmpty = value =>
  !value ||
  value === undefined ||
  trim(value) === '' ||
  trim(value) === 'null' ||
  value === '' ||
  value.length === 0
export default {
  deepClone(source, ignoreKeys) {
    if (Array.isArray(source)) {
      let sourceCopy = source instanceof Array ? [] : {};
      for (let item in source) {
        if (typeof source[item] === "object") {
          sourceCopy[item] = this.deepClone(source[item]);
        } else {
          sourceCopy[item] = source[item];
        }
      }
      return sourceCopy;
    } else {
      if (!source && typeof source !== "object") {
        throw new Error("error arguments", "shallowClone");
      }
      ignoreKeys = Array.isArray(ignoreKeys) ? ignoreKeys : [];
      const targetObj = source.constructor === Array ? [] : {};
      for (const keys in source) {
        if (source.hasOwnProperty(keys) && !ignoreKeys.includes(keys)) {
          if (source[keys] && typeof source[keys] === "object") {
            targetObj[keys] = source[keys].constructor === Array ? [] : {};
            targetObj[keys] = this.deepClone(source[keys]);
          } else {
            targetObj[keys] = source[keys];
          }
        }
      }
      return targetObj;
    }
  },
  forEach: (arr, func) => {
    if (isEmpty(arr) || !func) {
      return
    }
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        let ret = func(arr[i], i) // 回调函数
        if (typeof ret !== 'undefined' && (ret === null || ret === false)) {
          break
        }
      }
    } else {
      // eslint-disable-next-line guard-for-in
      for (let item in arr) {
        let ret = func(arr[item], item) // 回调函数
        if (typeof ret !== 'undefined' && (ret === null || ret === false)) {
          break
        }
      }
    }
  }
}