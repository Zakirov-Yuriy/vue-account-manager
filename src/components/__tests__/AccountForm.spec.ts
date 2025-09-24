import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AccountForm from '../AccountForm.vue'
import { useAccountStore } from '@/stores/index'

describe('AccountForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render add button', () => {
    const wrapper = mount(AccountForm)
    expect(wrapper.text()).toContain('Добавить')
  })

  it('should add new account on button click and save on blur', async () => {
    const wrapper = mount(AccountForm)
    const store = useAccountStore()

    const addButton = wrapper.find('button')
    await addButton.trigger('click')

    // Найти input логина внутри n-input
    const loginInput = wrapper.find('[data-testid="login-input"] input')
    await loginInput.setValue('testuser')
    await loginInput.trigger('blur')

    expect(store.accounts).toHaveLength(1)
    expect(store.accounts[0].login).toBe('testuser')
  })

  it('should validate login field', async () => {
    const wrapper = mount(AccountForm)
    const store = useAccountStore()

    const addButton = wrapper.find('button')
    await addButton.trigger('click')

    const loginInput = wrapper.find('[data-testid="login-input"] input')
    await loginInput.setValue('') // Пустой логин
    await loginInput.trigger('blur')

    // Проверить, что ошибка отображается
    expect(wrapper.text()).toContain('Логин обязателен')
    expect(store.accounts).toHaveLength(0)
  })

  it('should hide password field for LDAP', async () => {
    const wrapper = mount(AccountForm)
    const store = useAccountStore()

    const addButton = wrapper.find('button')
    await addButton.trigger('click')

    const passwordInput = wrapper.find('input[type="password"]')
    expect(passwordInput.exists()).toBe(false)
  })

  it('should integrate full workflow: add, fill, save account', async () => {
    const wrapper = mount(AccountForm)
    const store = useAccountStore()

    const addButton = wrapper.find('button')
    await addButton.trigger('click')

    const loginInput = wrapper.find('[data-testid="login-input"] input')
    await loginInput.setValue('integrationtest')
    await loginInput.trigger('blur')

    expect(store.accounts).toHaveLength(1)
    expect(store.accounts[0].login).toBe('integrationtest')
  })

})
