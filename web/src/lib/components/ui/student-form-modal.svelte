<script lang="ts">
  import Modal from './modal.svelte'
  import ModalFooter from './modal-footer.svelte'
  import Button from './button.svelte'
  import Input from './input.svelte'
  import Select from './select.svelte'

  interface StudentData {
    id?: string
    fullName?: string
    pinfl?: string
    contractNumber?: string
    groupId?: string
    phone?: string
    email?: string
    totalAmount?: number
  }

  interface Props {
    isOpen: boolean
    onClose: () => void
    student?: StudentData
    onSuccess?: () => void
  }

  const groups = [
    { value: '1', label: '101-A - Hamshiralik ishi' },
    { value: '2', label: '102-B - Akkushelik ishi' },
    { value: '3', label: '103-V - Farmatsiya' },
    { value: '4', label: '201-A - Hamshiralik ishi (2-kurs)' },
    { value: '5', label: '202-B - Akkushelik ishi (2-kurs)' },
  ]

  let { isOpen, onClose, student, onSuccess }: Props = $props()

  let fullName       = $state(student?.fullName || '')
  let pinfl          = $state(student?.pinfl || '')
  let contractNumber = $state(student?.contractNumber || '')
  let groupId        = $state(student?.groupId || '')
  let totalAmount    = $state(String(student?.totalAmount ?? 5000000))
  let phone          = $state(student?.phone || '')
  let email          = $state(student?.email || '')
  let isLoading      = $state(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    isLoading = true
    await new Promise((r) => setTimeout(r, 1000))
    isLoading = false
    onSuccess?.()
    onClose()
  }
</script>

<Modal
  {isOpen}
  {onClose}
  title={student?.id ? 'Talabani tahrirlash' : "Yangi talaba qo'shish"}
  description="Talaba ma'lumotlarini kiriting"
  size="lg"
>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <label class="text-sm font-medium" for="fullName">
          F.I.O <span class="text-red-500">*</span>
        </label>
        <Input id="fullName" placeholder="Aliyev Anvar Abdullaevich" bind:value={fullName} required />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="pinfl">
          PINFL (JSHSHIR) <span class="text-red-500">*</span>
        </label>
        <Input id="pinfl" placeholder="14 raqamli PINFL" bind:value={pinfl} maxlength={14} required />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="contractNumber">
          Shartnoma raqami <span class="text-red-500">*</span>
        </label>
        <Input id="contractNumber" placeholder="CT-2024-XXXXX" bind:value={contractNumber} required />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="groupId">
          Guruh <span class="text-red-500">*</span>
        </label>
        <Select id="groupId" options={groups} placeholder="Guruhni tanlang" bind:value={groupId} required />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="totalAmount">
          Kontrakt summasi <span class="text-red-500">*</span>
        </label>
        <Input id="totalAmount" type="number" placeholder="5000000" bind:value={totalAmount} required />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="phone">Telefon</label>
        <Input id="phone" type="tel" placeholder="+998 90 123 45 67" bind:value={phone} />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="email">Email</label>
        <Input id="email" type="email" placeholder="email@example.com" bind:value={email} />
      </div>
    </div>

    <ModalFooter>
      <Button type="button" variant="outline" onclick={onClose}>Bekor qilish</Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saqlanmoqda...' : student?.id ? 'Saqlash' : "Qo'shish"}
      </Button>
    </ModalFooter>
  </form>
</Modal>
