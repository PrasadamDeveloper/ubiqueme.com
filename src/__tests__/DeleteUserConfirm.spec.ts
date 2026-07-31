import { describe, it, expect } from 'vitest'

import { mount, type VueWrapper } from '@vue/test-utils'
import { Timestamp } from 'firebase/firestore'
import DeleteUserConfirm from '@/components/admin/DeleteUserConfirm.vue'
import type { IUser } from '@/interfaces/IUser'

const ts = Timestamp.now()

const baseUser = (): IUser => ({
  uid: 'uid-123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '',
  role: 'user',
  isActive: true,
  isBanned: false,
  banReason: '',
  totalQRs: 2,
  preferences: { emailNotifications: true, smsNotifications: false, whatsappNotifications: false },
  lastLoginAt: ts,
  createdAt: ts,
  trialActive: false,
  trialStartsAt: ts,
  trialEndsAt: ts,
  isTrialUsed: false,
})

const mountModal = (overrides: Record<string, unknown> = {}) =>
  mount(DeleteUserConfirm, {
    props: { isOpen: true, user: baseUser(), processing: false, ...overrides },
  })

const findDeleteButton = (wrapper: VueWrapper) => {
  const btn = wrapper.findAll('button').find((b) => b.text().includes('Eliminar'))
  expect(btn).toBeDefined()
  return btn!
}

const findCancelButton = (wrapper: VueWrapper) => {
  const btn = wrapper.findAll('button').find((b) => b.text().includes('Cancelar'))
  expect(btn).toBeDefined()
  return btn!
}

describe('DeleteUserConfirm', () => {
  it('disables the submit button until the exact string "confirmar" is typed', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('input')
    const deleteButton = findDeleteButton(wrapper)

    expect(deleteButton.attributes('disabled')).toBeDefined()

    await input.setValue('confirma')
    expect(deleteButton.attributes('disabled')).toBeDefined()

    await input.setValue('Confirmar')
    expect(deleteButton.attributes('disabled')).toBeDefined()

    await input.setValue('confirmar')
    expect(deleteButton.attributes('disabled')).toBeUndefined()
  })

  it('accepts the confirmation string with surrounding whitespace', async () => {
    const wrapper = mountModal()
    const deleteButton = findDeleteButton(wrapper)

    await wrapper.find('input').setValue('  confirmar  ')
    expect(deleteButton.attributes('disabled')).toBeUndefined()
  })

  it('emits submit when the confirmed button is clicked', async () => {
    const wrapper = mountModal()
    await wrapper.find('input').setValue('confirmar')

    await findDeleteButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('does not emit submit while processing', async () => {
    const wrapper = mountModal({ processing: true })
    const deleteButton = findDeleteButton(wrapper)

    await wrapper.find('input').setValue('confirmar')
    expect(deleteButton.attributes('disabled')).toBeDefined()

    await deleteButton.trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mountModal()
    await findCancelButton(wrapper).trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('resets the confirmation input when reopened', async () => {
    const wrapper = mountModal()
    await wrapper.find('input').setValue('confirmar')
    await wrapper.setProps({ isOpen: false })
    await wrapper.setProps({ isOpen: true })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
    expect(findDeleteButton(wrapper).attributes('disabled')).toBeDefined()
  })
})
