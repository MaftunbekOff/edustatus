<script lang="ts">
  import Modal from './modal.svelte'
  import ModalFooter from './modal-footer.svelte'
  import Button from './button.svelte'
  import Input from './input.svelte'
  import Select from './select.svelte'

  interface Student {
    id: string
    fullName: string
    contractNumber: string
  }

  interface Props {
    isOpen: boolean
    onClose: () => void
    students?: Student[]
    onSuccess?: () => void
  }

  const mockStudents: Student[] = [
    { id: '1', fullName: 'Aliyev Anvar Abdullaevich',    contractNumber: 'CT-2024-00123' },
    { id: '2', fullName: 'Valiyeva Dilnoza Karimovna',   contractNumber: 'CT-2024-00145' },
    { id: '3', fullName: 'Karimov Bobur Rahimovich',     contractNumber: 'CT-2024-00098' },
    { id: '4', fullName: 'Najimova Nigora Bahodirovna',  contractNumber: 'CT-2024-00167' },
    { id: '5', fullName: 'Rahimov Jahongir Toshmatovich',contractNumber: 'CT-2024-00189' },
  ]

  const paymentMethods = [
    { value: 'bank',  label: 'Bank orqali' },
    { value: 'cash',  label: 'Naqd pul' },
    { value: 'click', label: 'Click' },
    { value: 'payme', label: 'Payme' },
    { value: 'other', label: 'Boshqa' },
  ]

  let {
    isOpen,
    onClose,
    students = mockStudents,
    onSuccess,
  }: Props = $props()

  let studentId    = $state('')
  let amount       = $state('')
  let method       = $state('bank')
  let paymentDate  = $state(new Date().toISOString().split('T')[0])
  let description  = $state('')
  let searchQuery  = $state('')
  let showList     = $state(false)
  let isLoading    = $state(false)

  const filteredStudents = $derived(
    students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )
  const selectedStudent = $derived(students.find((s) => s.id === studentId))

  function selectStudent(s: Student) {
    studentId = s.id
    searchQuery = s.fullName
    showList = false
  }

  function clearStudent() {
    studentId = ''
    searchQuery = ''
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    isLoading = true
    await new Promise((r) => setTimeout(r, 1000))
    isLoading = false
    onSuccess?.()
    onClose()
    studentId = ''; amount = ''; method = 'bank'
    paymentDate = new Date().toISOString().split('T')[0]
    description = ''; searchQuery = ''
  }
</script>

<Modal {isOpen} {onClose} title="Yangi to'lov qo'shish" description="To'lov ma'lumotlarini kiriting" size="lg">
  <form onsubmit={handleSubmit} class="space-y-4">
    <!-- Talaba tanlash -->
    <div class="space-y-2">
      <label class="text-sm font-medium" for="student-search">
        Talaba <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <Input
          id="student-search"
          placeholder="Talaba ismi yoki shartnoma raqami..."
          bind:value={searchQuery}
          oninput={() => (showList = true)}
          onfocus={() => (showList = true)}
        />
        {#if showList && searchQuery && !selectedStudent}
          <div class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
            {#if filteredStudents.length > 0}
              {#each filteredStudents as s}
                <button
                  type="button"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onclick={() => selectStudent(s)}
                >
                  <div class="font-medium">{s.fullName}</div>
                  <div class="text-xs text-muted-foreground">{s.contractNumber}</div>
                </button>
              {/each}
            {:else}
              <div class="px-3 py-2 text-sm text-muted-foreground">Talaba topilmadi</div>
            {/if}
          </div>
        {/if}
      </div>
      {#if selectedStudent}
        <div class="flex items-center justify-between rounded-lg border p-2">
          <div>
            <p class="text-sm font-medium">{selectedStudent.fullName}</p>
            <p class="text-xs text-muted-foreground">{selectedStudent.contractNumber}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onclick={clearStudent}>O'zgartirish</Button>
        </div>
      {/if}
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="amount">
          To'lov summasi <span class="text-red-500">*</span>
        </label>
        <Input id="amount" type="number" placeholder="1000000" bind:value={amount} required />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="method">
          To'lov usuli <span class="text-red-500">*</span>
        </label>
        <Select id="method" options={paymentMethods} bind:value={method} required />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="pay-date">
          To'lov sanasi <span class="text-red-500">*</span>
        </label>
        <Input id="pay-date" type="date" bind:value={paymentDate} required />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="desc">Izoh</label>
        <Input id="desc" placeholder="Qo'shimcha ma'lumot..." bind:value={description} />
      </div>
    </div>

    <ModalFooter>
      <Button type="button" variant="outline" onclick={onClose}>Bekor qilish</Button>
      <Button type="submit" disabled={isLoading || !studentId}>
        {isLoading ? 'Saqlanmoqda...' : "Qo'shish"}
      </Button>
    </ModalFooter>
  </form>
</Modal>
