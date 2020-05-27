import {
  IotesHook,
  IotesEvents,
  State,
  mapDispatchable,
} from '@iotes/core'

// TEST LIFECYCLE HOOK
// Basic preDispatch hook that adds '@@iotes_test' boolean to the dispatched state
export const testLifecycleHook: IotesHook = (): IotesEvents => {
  const preDispatch = (d: State) => mapDispatchable(d, (e: State) => ({ ...e, '@@iotes_test': true }))

  return {
    host: { preDispatch },
    device: { preDispatch },
  }
}
