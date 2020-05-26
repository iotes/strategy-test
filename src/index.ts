import {
  DeviceFactory,
  HostConfig,
  Strategy,
  ClientConfig,
  DeviceConfig,
  createHostDispatchable,
  Store,
  maybePipe,
} from '@iotes/core'
import { direction } from '@iotes/middleware-direction'
import { createStore } from '@iotes/core/build/store'
import { DeviceTypes, StrategyConfig } from './types'
import { config } from './config'

// Globals
const res: Store = createStore({ channel: 'TEST' })
const connectTime = 1

// Strategy
const strategy: Strategy<StrategyConfig, DeviceTypes> = ({
  hostDispatch,
  deviceDispatch,
  hostSubscribe,
  deviceSubscribe,
}, hooks) => async (
  hostConfig: HostConfig<StrategyConfig>,
  clientConfig: ClientConfig,
): Promise<DeviceFactory<DeviceTypes>> => {
  // send any messages coming in to host subscribe on res
  hostSubscribe((state: any) => { res.dispatch(state) }, null, [direction('O')])

  // Simulate async connection
  await new Promise((resolve) => {
    setTimeout(() => {
      hostDispatch(createHostDispatchable(hostConfig.name, 'CONNECT', {}))
      resolve()
    }, connectTime)
  })

  const deviceFactory = (): DeviceFactory<DeviceTypes> => {
    const applyPreDispatchHook = maybePipe(...hooks.device.preDispatchHooks)

    // DEVICE FACTORIES
    const createDeviceOne = async (deviceConfig: DeviceConfig<'DEVICE_ONE'>) => {
      deviceSubscribe((state) => {
        res.dispatch(applyPreDispatchHook(state))
      }, ['DEVICE_ONE'])

      return deviceConfig
    }

    const createDeviceTwo = async (deviceConfig: DeviceConfig<'DEVICE_TWO'>) => {
      // Do device set up here
      deviceSubscribe((state) => {
        res.dispatch(applyPreDispatchHook(state))
      }, ['DEVICE_TWO'])

      return deviceConfig
    }

    // Return dictionary of device factories
    return {
      DEVICE_ONE: createDeviceOne,
      DEVICE_TWO: createDeviceTwo,
    }
  }

  return deviceFactory()
}

// Exports
const createTestStrategy = (): [Store, Strategy<{}, DeviceTypes>] => [res, strategy]

const wait = (time = connectTime) => new Promise(
  (resolve, _) => { setTimeout(() => resolve(), time) },
)

export {
  createTestStrategy,
  config,
  wait,
}

// Export types
export { DeviceTypes, StrategyConfig }
