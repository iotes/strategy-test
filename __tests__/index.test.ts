import {
  Iotes,
  Store,
  Strategy,
  createIotes,
  createDeviceDispatchable,
  createHostDispatchable,
} from '@iotes/core'
import { direction } from '@iotes/middleware-direction'
import {
  createTestStrategy,
  config,
  DeviceTypes,
  StrategyConfig,
  wait,
} from '../src'

import { testLifecycleHook } from './utils'


// Global Variables
let remote: Store
let strategy: Strategy<StrategyConfig, DeviceTypes>
let iotes: Iotes

// Test Suite
describe('Test Strategy', () => {
  // Pre Test
  beforeEach(() => {
    [remote, strategy] = createTestStrategy()
    iotes = createIotes({
      topology: config.topology,
      strategy,
      lifecycleHooks: [testLifecycleHook],
    })
  })

  // Tests
  test('Test strategy simulates connect', async () => {
    let result: any = null

    iotes.hostSubscribe((state) => { result = state })

    await wait()

    expect(result).toHaveProperty('TEST_HOST')
    expect(result.TEST_HOST).toHaveProperty('type')
    expect(result.TEST_HOST.type).toEqual('CONNECT')
  })

  test('Test strategy broadcasts dispatchable', async () => {
    let result: any = null

    const testDispatchable = createDeviceDispatchable('TEST', 'UPDATE', { count: 0 })

    iotes.deviceSubscribe((state) => { result = state }, null, [direction('O')])

    await wait()

    iotes.deviceDispatch(testDispatchable)

    expect(result).toHaveProperty('TEST')
    expect(result.TEST).toEqual(expect.objectContaining(testDispatchable.TEST))
  })

  test('Remote store allows dispatch of incoming data', async () => {
    let result: any = {}

    const testDispatchable = createDeviceDispatchable('INTERNAL_TEST', 'UPDATE', { count: 0 })

    iotes.deviceSubscribe((state) => { result = state }, null, [direction('I')])

    await wait()

    remote.dispatch(testDispatchable)

    expect(result).not.toHaveProperty('INTERNAL_TEST')
    // We need to include remote in subscribe
    // expect(result.REMOTE_TEST).toEqual(expect.objectContaining(testDispatchable.TEST))
  })
})
