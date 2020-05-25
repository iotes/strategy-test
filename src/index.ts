import {
  DeviceFactory,
  HostConfig,
  Strategy,
  ClientConfig,
  DeviceConfig,
  createHostDispatchable,
  Store,
} from '@iotes/core'
import { direction } from '@iotes/middleware-direction'
import { createStore } from '@iotes/core/build/store'
import { DeviceTypes, StrategyConfig } from './types'

const res: Store = createStore({ channel: 'TEST' })

const strategy: Strategy<StrategyConfig, DeviceTypes> = ({
  hostDispatch,
  deviceDispatch,
  hostSubscribe,
  deviceSubscribe,
}) => async (
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
    }, 10)
  })

  const deviceFactory = (): DeviceFactory<DeviceTypes> => {
    // DEVICE FACTORIES

    const createDeviceOne = async (deviceConfig: DeviceConfig<'DEVICE_ONE'>) => {
      // Do device set up here
      deviceSubscribe((state) => { res.dispatch(state) }, ['DEVICE_ONE'])

      return deviceConfig
    }

    const createDeviceTwo = async (deviceConfig: DeviceConfig<'DEVICE_TWO'>) => {
      // Do device set up here
      deviceSubscribe((state) => { res.dispatch(state) }, ['DEVICE_ONE'])

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

export const createTestStrategy = () => [res, strategy]

// Export types
export { DeviceTypes, StrategyConfig }
