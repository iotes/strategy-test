import { TopologyMap } from '@iotes/core'
import { DeviceTypes } from './types'

const topology: TopologyMap<{}, DeviceTypes> = {
  client: { name: 'testClient' },
  hosts: [{ name: 'TEST_HOST', host: 'localhost', port: '8888' }],
  devices: [
    {
      hostName: 'TEST_HOST',
      type: 'DEVICE_ONE',
      name: 'READER/1',
      channel: 1,
    },
    {
      hostName: 'TEST_HOST',
      type: 'DEVICE_TWO',
      name: 'ENCODER/1',
      channel: 2,
    },
  ],
}

export const config = {
  topology,
}
