/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * make hooked methods "native"
 */
export const makeNative = (() => {
  const l: Set<Function> = new Set()

  hookNative(Function.prototype, 'toString', (_toString) => {
    return function () {
      if (l.has(this)) {
        // "function () {\n    [native code]\n}"
        return _toString.call(parseInt) as string
      }
      return _toString.call(this) as string
    }
  })

  return (fn: Function) => {
    l.add(fn)
  }
})()

export function hookNative<T extends object, M extends (keyof T)> (
  target: T,
  method: M,
  hook: (originalFn: T[M], detach: () => void) => T[M],
): void {
  // reserve for future hook update
  const _fn = target[method]
  const detach = () => {
    target[method] = _fn // detach
  }

  // This script can run before anything on the page,  
  // so setting this function to be non-configurable and non-writable is no use.
  const hookedFn = hook(_fn, detach)
  target[method] = hookedFn

  setTimeout(() => {
    makeNative(hookedFn as any)
  })
}
