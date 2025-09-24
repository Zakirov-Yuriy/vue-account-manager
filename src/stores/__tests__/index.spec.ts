import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAccountStore } from '../index'

describe('useAccountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('should add account', () => {
    const store = useAccountStore()
    const account = {
      labels: [{ text: 'test' }],
      recordType: 'LDAP' as const,
      login: 'user',
      password: null
    }

    store.addAccount(account)

    expect(store.accounts).toHaveLength(1)
    expect(store.accounts[0]).toMatchObject(account)
    expect(store.accounts[0].id).toBeDefined()
  })

  it('should update account', () => {
    const store = useAccountStore()
    const account = {
      labels: [{ text: 'test' }],
      recordType: 'LDAP' as const,
      login: 'user',
      password: null
    }
    store.addAccount(account)
    const id = store.accounts[0].id

    const updatedAccount = {
      labels: [{ text: 'updated' }],
      recordType: 'Локальная' as const,
      login: 'user2',
      password: 'pass'
    }

    store.updateAccount(id, updatedAccount)

    expect(store.accounts[0]).toMatchObject(updatedAccount)
    expect(store.accounts[0].id).toBe(id)
  })

  it('should remove account', () => {
    const store = useAccountStore()
    const account = {
      labels: [{ text: 'test' }],
      recordType: 'LDAP' as const,
      login: 'user',
      password: null
    }
    store.addAccount(account)
    const id = store.accounts[0].id

    store.removeAccount(id)

    expect(store.accounts).toHaveLength(0)
  })

  it('should persist accounts in localStorage', () => {
    const store1 = useAccountStore()
    const account = {
      labels: [{ text: 'persistent' }],
      recordType: 'Локальная' as const,
      login: 'persist',
      password: 'secret'
    }
    store1.addAccount(account)

    const store2 = useAccountStore()
    expect(store2.accounts).toHaveLength(1)
    expect(store2.accounts[0]).toMatchObject(account)
  })

  it('should validate account data', () => {
    const store = useAccountStore()

    const invalidAccount = {
      labels: [],
      recordType: 'LDAP' as const,
      login: '',
      password: null
    }

    store.addAccount(invalidAccount)
    expect(store.accounts).toHaveLength(1)
  })
})
