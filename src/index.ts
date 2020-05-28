import {
  DeviceFactory,
  HostConfig,
  Strategy,
  ClientConfig,
  DeviceConfig,
  createHostDispatchable,
  Store,
  maybePipe,
  DeviceDispatchable,
} from '@iotes/core'
import { direction } from '@iotes/middleware-direction'
import { createStore } from '@iotes/core/build/store'
import { DeviceTypes, StrategyConfig } from './types'
import { config } from './config'

// GLOBALS

// Remote is a store that acts as a simulated host
// which can be used in the test suite
// e.g remote.dispatch from the test will send an incoming
// message to this strategy
const remote: Store = createStore({ channel: 'TEST' })
const connectTime = 1

// STRATEGY
const strategy: Strategy<StrategyConfig, DeviceTypes> = ({
  hostDispatch,
  deviceDispatch,
  hostSubscribe,
  deviceSubscribe,
}, hooks) => async (
  hostConfig: HostConfig<StrategyConfig>,
  clientConfig: ClientConfig,
): Promise<DeviceFactory<DeviceTypes>> => {
  // DISPATCH INCOMING CONNECTIONS
  hostSubscribe((state: any) => { remote.dispatch(state) }, null, [direction('O')])

  // SIMULATE ASYNC CONNECTION
  await new Promise((resolve) => {
    setTimeout(() => {
      hostDispatch(createHostDispatchable(hostConfig.name, 'CONNECT', {}))
      resolve()
    }, connectTime)
  })

  const deviceFactory = (): DeviceFactory<DeviceTypes> => {
    // INIT HOOKS
    const applyPreDispatchHook = maybePipe(...hooks.device.preDispatchHooks)

    // CREATE TEST DEVICE
    const createTestDevice = <T extends string>(deviceName: string) => (
      async (deviceConfig: DeviceConfig<T>) => {
        deviceSubscribe((state) => {
          remote.dispatch(applyPreDispatchHook(state))
        }, [deviceName], [direction('O')])

        remote.subscribe((state: DeviceDispatchable<any>) => {
          deviceDispatch(state)
        }, [deviceName])

        return deviceConfig
      }
    )

    // DEVICE FACTORIES
    const createDeviceOne = createTestDevice<'DEVICE_TYPE_ONE'>('DEVICE_ONE')
    const createDeviceTwo = createTestDevice<'DEVICE_TYPE_TWO'>('DEVICE_TWO')

    // DICTIONARY OF DEVICE FACTORIES
    return {
      DEVICE_TYPE_ONE: createDeviceOne,
      DEVICE_TYPE_TWO: createDeviceTwo,
    }
  }

  return deviceFactory()
}

// UTILS
const createTestStrategy = (): [Store, Strategy<{}, DeviceTypes>] => [remote, strategy]

const wait = (time = connectTime) => new Promise(
  (resolve, _) => { setTimeout(() => resolve(), time) },
)

// EXPORTS
export {
  createTestStrategy,
  config,
  wait,
}

// EXPORT TYPES
export { DeviceTypes, StrategyConfig }
