import {
  DeviceFactory,
  HostConfig,
  Strategy,
  ClientConfig,
  DeviceConfig,
} from '@iotes/core'
import { DeviceTypes, StrategyConfig } from './types'

export const xStrategy: Strategy<StrategyConfig, DeviceTypes> = ({
  hostDispatch,
  deviceDispatch,
  hostSubscribe,
  deviceSubscribe,
}) => async (
  hostConfig: HostConfig<StrategyConfig>,
  clientConfig: ClientConfig,
): Promise<DeviceFactory<DeviceTypes>> => {
  // HOST FACTORY
  // Do host set up here

  const deviceFactory = (): DeviceFactory<DeviceTypes> => {
    // DEVICE FACTORIES

    const createDevice = async (
      deviceConfig: DeviceConfig<'DEVICE_TYPE'>,
    ) => {
      // Do device set up here
      const deviceSetUp = () => {}

      deviceSetUp()

      return deviceConfig
    }

    // Return dictionary of device factories
    return {
      DEVICE_TYPE: createDevice,
    }
  }

  return deviceFactory()
}

// Export types
export { DeviceTypes, StrategyConfig }
