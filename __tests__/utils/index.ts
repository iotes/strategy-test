import {
  IotesHook,
  IotesEvents,
  State,
} from '@iotes/core'

export const testLifecycleHook: IotesHook = (): IotesEvents => {
  const preDispatch = (d: State) => ({ ...d, TEST_HOOK: { '@@iotes_test': true } })

  return {
    host: { preDispatch },
    device: { preDispatch },
  }
}

const wait = (time = 0) => new Promise((resolve, _) => { setTimeout(() => resolve(), time) })
