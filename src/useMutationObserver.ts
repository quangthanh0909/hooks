import useCustomEffect from './useCustomEffect'
import { dequal } from 'dequal'
import useImmediateUpdateEffect from './useImmediateUpdateEffect'
import useEventCallback from './useEventCallback'

type Deps = [Element | null | undefined, MutationObserverInit]

function isDepsEqual(
  [nextElement, nextConfig]: Deps,
  [prevElement, prevConfig]: Deps,
) {
  return nextElement === prevElement && dequal(nextConfig, prevConfig)
}

/**
 * Observe mutations on a DOM node or tree of DOM nodes.
 * Depends on the `MutationObserver` api.
 *
 * ```ts
 * const [element, attachRef] = useCallbackRef(null);
 *
 * useMutationObserver(element, { subtree: true }, (records) => {
 *
 * });
 *
 * return (
 *   <div ref={attachRef} />
 * )
 * ```
 *
 * @param element The DOM element to observe
 * @param config The observer configuration
 * @param callback A callback fired when a mutation occurs
 */
function useMutationObserver(
  element: Element | null | undefined,
  config: MutationObserverInit,
  callback: MutationCallback,
): void {
  const fn = useEventCallback(callback)

  useCustomEffect(
    () => {
      if (!element) return

      // The behavior around reusing mutation observers is confusing
      // observing again _should_ disable the last listener but doesn't
      // seem to always be the case, maybe just in JSDOM? In any case the cost
      // to redeclaring it is gonna be fairly low anyway, so make it simple
      const observer = new MutationObserver(fn)

      observer.observe(element, config)

      return () => {
        observer.disconnect()
      }
    },
    [element, config],
    {
      isEqual: isDepsEqual,
      // Intentionally done in render, otherwise observer will miss any
      // changes made to the DOM during this update
      effectHook: useImmediateUpdateEffect,
    },
  )
}

export default useMutationObserver
