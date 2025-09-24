<template>
  <div class="account-form">
    <div class="toolbar">
      <h2>Учетные записи</h2>
      <n-button type="primary" @click="addNewAccount" :loading="isAdding">
        <template #icon><n-icon><PlusOutlined /></n-icon></template>
        Добавить
      </n-button>
    </div>

    <!-- Подсказка под шапкой -->
    <n-alert type="info" class="hint" :bordered="false">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель <b>;</b>
    </n-alert>

    <!-- Шапка колонок -->
    <div class="accounts-grid header">
      <div class="cell cell--head">Метки</div>
      <div class="cell cell--head">Тип записи</div>
      <div class="cell cell--head">Логин</div>
      <div class="cell cell--head">Пароль</div>
      <div class="cell cell--head cell--actions"></div>
    </div>

    <!-- Строки -->
    <div class="accounts-list">
      <div
        v-for="account in accounts"
        :key="account.id || account.login"
        class="accounts-grid row"
      >
        <!-- Метки -->
        <div class="cell">
          <n-input
            v-model:value="account.labelsInput"
            placeholder="XXX; YYYYYYYYYY; ..."
            @blur="handleLabelsBlur(account)"
            :status="account.labelsError ? 'error' : undefined"
          />
          <div v-if="account.labelsError" class="error-text">{{ account.labelsError }}</div>
        </div>

        <!-- Тип записи -->
        <div class="cell">
          <n-select
            v-model:value="account.recordType"
            :options="recordTypeOptions"
            @update:value="handleRecordTypeChange(account)"
          />
        </div>

        <!-- Логин -->
        <div class="cell">
          <n-input
            data-testid="login-input"
            v-model:value="account.login"
            placeholder="Значение"
            @blur="validateField(account, 'login')"
            :status="account.loginError ? 'error' : undefined"
          />
          <div v-if="account.loginError" class="error-text">{{ account.loginError }}</div>
        </div>

        <!-- Пароль (только для Локальная) -->
        <div class="cell">
          <n-input
            v-if="account.recordType === 'Локальная'"
            v-model:value="account.password"
            type="password"
            show-password-on="click"
            placeholder="●●●●●●●"
            @blur="validateField(account, 'password')"
            :status="account.passwordError ? 'error' : undefined"
          />
          <div v-else class="placeholder">&mdash;</div>
          <div v-if="account.passwordError" class="error-text">{{ account.passwordError }}</div>
        </div>

        <!-- Действия -->
        <div class="cell cell--actions">
          <n-button
            quaternary
            type="error"
            @click="confirmRemove(account.id)"
            :loading="isRemoving === account.id"
            aria-label="Удалить запись"
          >
            <template #icon><n-icon><DeleteOutlined /></n-icon></template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- Модал подтверждения -->
    <n-modal v-model:show="showConfirm" preset="card" title="Подтверждение" size="small">
      <p>Вы уверены, что хотите удалить эту учетную запись?</p>
      <n-space justify="end">
        <n-button @click="showConfirm = false">Отмена</n-button>
        <n-button type="error" @click="doRemove">Удалить</n-button>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NButton, NAlert, NIcon, NModal, NInput, NSelect, NSpace
} from 'naive-ui'
import { PlusOutlined, DeleteOutlined } from '@vicons/antd'
import { useAccountStore, type Account } from '@/stores/index'

interface AccountForm extends Account {
  labelsInput: string
  labelsError?: string
  loginError?: string
  passwordError?: string
}

const accountStore = useAccountStore()

const accounts = ref<AccountForm[]>([])
const isAdding = ref(false)
const isRemoving = ref<string | null>(null)
const showConfirm = ref(false)
const accountToRemove = ref<string>('')

const recordTypeOptions = [
  { label: 'LDAP', value: 'LDAP' },
  { label: 'Локальная', value: 'Локальная' }
]


const addNewAccount = async () => {
  isAdding.value = true
  const newAccount: AccountForm = {
    id: '',
    labels: [],
    labelsInput: '',
    recordType: 'LDAP',
    login: '',
    password: null,
    labelsError: '',
    loginError: '',
    passwordError: ''
  }
  accounts.value.push(newAccount)
  isAdding.value = false
}

const handleLabelsBlur = (account: AccountForm) => {
  if (account.labelsInput.length > 50) {
    account.labelsError = 'Метка не должна превышать 50 символов'
  } else {
    account.labelsError = ''
    account.labels = account.labelsInput
      .split(';')
      .filter(label => label.trim())
      .map(label => ({ text: label.trim() }))
    saveAccount(account)
  }
}

const handleRecordTypeChange = (account: AccountForm) => {
  if (account.recordType === 'LDAP') account.password = null
  saveAccount(account)
}

const validateField = (account: AccountForm, field: 'login' | 'password') => {
  if (field === 'login') {
    if (!account.login.trim()) account.loginError = 'Логин обязателен'
    else if (account.login.length > 100) account.loginError = 'Логин не должен превышать 100 символов'
    else account.loginError = ''
  } else {
    if (account.recordType === 'Локальная' && (!account.password || !account.password.trim()))
      account.passwordError = 'Пароль обязателен для локальной записи'
    else if (account.password && account.password.length > 100)
      account.passwordError = 'Пароль не должен превышать 100 символов'
    else account.passwordError = ''
  }
  if (!account.loginError && !account.passwordError) saveAccount(account)
}

const saveAccount = (account: AccountForm) => {
  if (account.id) {
    accountStore.updateAccount(account.id, {
      labels: account.labels,
      recordType: account.recordType,
      login: account.login,
      password: account.password
    })
  } else {
    accountStore.addAccount({
      labels: account.labels,
      recordType: account.recordType,
      login: account.login,
      password: account.password
    })
    account.id = accountStore.accounts[accountStore.accounts.length - 1].id
  }
}

const confirmRemove = (id: string) => {
  accountToRemove.value = id
  showConfirm.value = true
}

const doRemove = async () => {
  isRemoving.value = accountToRemove.value
  accountStore.removeAccount(accountToRemove.value)
  accounts.value = accounts.value.filter(acc => acc.id !== accountToRemove.value)
  showConfirm.value = false
  isRemoving.value = null
}

onMounted(() => {
  accounts.value = accountStore.accounts.map(acc => ({
    ...acc,
    labelsInput: acc.labels.map(l => l.text).join('; '),
    labelsError: '',
    loginError: '',
    passwordError: ''
  }))
})
</script>

<style scoped>
.account-form { padding: 20px; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.hint { margin: 8px 0 12px; }

.accounts-grid {
  display: grid;
  grid-template-columns: 2fr 1.1fr 1.6fr 1.6fr 56px;
  gap: 12px;
  align-items: start;
}

.accounts-grid.header {
  margin-bottom: 6px;
}

.cell--head {
  font-size: 12px;
  font-weight: 600;
  color: var(--n-text-color-3, #6b7280);
  text-transform: none;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

/* Ряд с тонкой рамкой как на скрине */
.accounts-grid.row {
  padding: 10px 12px;
  border: 1px solid var(--n-border-color, #e5e7eb);
  border-radius: 10px;
  background: var(--n-color, #fff);
}

.cell--actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  height: 34px;   display: flex;
  align-items: center;
  color: #9ca3af;
  padding-left: 10px;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}
:deep(.n-base-selection .n-base-suffix .n-base-suffix__arrow) {
  color: #9ca3af;   pointer-events: none;
}
.account-form { color: #000; }

.cell--head { color: #000 !important; }

:deep(.n-input),
:deep(.n-input__input-el),
:deep(.n-base-selection),
:deep(.n-base-selection-label),
:deep(.n-base-selection-input),
:deep(.n-form-item-label__text),
:deep(.n-alert__content),
:deep(.n-alert__title) {
  color: #000 !important;
}

:deep(.n-input input::placeholder) {
  color: #000 !important;
  opacity: 1; /* чтобы не бледнел */
}

:deep(.n-base-selection-placeholder) {
  color: #000 !important;
}


.accounts-grid.row {
  padding: 10px 12px;
  border: none;
  border-radius: 0;
  background: var(--n-color, #fff);
}

.accounts-grid.row .cell:first-child,    /* Метки */
.accounts-grid.row .cell:nth-child(2),  /* Тип записи */
.accounts-grid.row .cell:nth-child(3),  /* Логин */
.accounts-grid.row .cell:nth-child(4) { /* Пароль */
  border: 1px solid var(--n-border-color, #e5e7eb);
  border-radius: 8px;
  padding: 4px 6px;
  background: #fff;
}

.accounts-grid.row .cell:nth-child(5) {
  border: none;
  padding: 0;
}



</style>
