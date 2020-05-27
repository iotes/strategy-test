import {
  Iotes,
  Store,
  Strategy,
  createIotes,
  createDeviceDispatchable,
} from '@iotes/core'

import {
  direction,
} from '@iotes/middleware-direction'

import {
  createTestStrategy,
  config,
  DeviceTypes,
  StrategyConfig,
  wait,
} from '../src'

import {
  testLifecycleHook,
} from '../src/lifecycleHook'

// GLOBALS
let remote: Store
let strategy: Strategy<StrategyConfig, DeviceTypes>
let iotes: Iotes

// TEST SUITE
describe('Test Strategy', () => {
  // PRE TEST
  beforeEach(() => {
    [remote, strategy] = createTestStrategy()
    iotes = createIotes({
      topology: config.topology,
      strategy,
      lifecycleHooks: [testLifecycleHook],
    })
  })

  afterEach(() => {
    iotes = null
  })

  // TESTS
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

    const testDispatchable = createDeviceDispatchable('DEVICE_ONE', 'UPDATE', { count: 0 })

    iotes.deviceSubscribe((state) => { result = state })

    await wait()

    remote.dispatch(testDispatchable)

    expect(result.DEVICE_ONE).toEqual(expect.objectContaining(testDispatchable.DEVICE_ONE))
  })

  test('Remote store allows receiving of outgoing data', async () => {
    let result: any = {}

    const testDispatchable = createDeviceDispatchable('DEVICE_ONE', 'UPDATE', { count: 0 })

    remote.subscribe((state) => { result = state })

    await wait()

    iotes.deviceDispatch(testDispatchable)

    expect(result.DEVICE_ONE).toEqual(expect.objectContaining(testDispatchable.DEVICE_ONE))
  })

  test('Pre dispatch hooks are applied', async () => {
    let result: any = {}

    const testDispatchable = createDeviceDispatchable('DEVICE_ONE', 'UPDATE', { count: 0 })

    remote.subscribe((state) => { result = state })

    await wait()

    iotes.deviceDispatch(testDispatchable)

    expect(testDispatchable.DEVICE_ONE).not.toHaveProperty('@@iotes_test')
    expect(result.DEVICE_ONE).toHaveProperty('@@iotes_test')
  })
})
