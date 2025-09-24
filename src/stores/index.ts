import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Label {
  text: string
}

export interface Account {
  id: string
  labels: Label[]
  recordType: 'LDAP' | 'Локальная'
  login: string
  password: string | null
}

export const useAccountStore = defineStore(
  'accounts',
  () => {
    const accounts = ref<Account[]>([])

    const addAccount = (account: Omit<Account, 'id'>) => {
      const newAccount: Account = {
        ...account,
        id: Date.now().toString()
      }
      accounts.value.push(newAccount)
    }

    const updateAccount = (id: string, account: Omit<Account, 'id'>) => {
      const index = accounts.value.findIndex((acc) => acc.id === id)
      if (index !== -1) {
        accounts.value[index] = { ...account, id }
      }
    }

    const removeAccount = (id: string) => {
      accounts.value = accounts.value.filter((acc) => acc.id !== id)
    }

    return {
      accounts,
      addAccount,
      updateAccount,
      removeAccount
    }
  },
  {
    persist: true
  }
)
