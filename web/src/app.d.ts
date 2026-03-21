declare global {
  namespace App {
    interface Locals {
      user: {
        id: string
        email: string
        fullName: string
        role: string
        organizationId?: string
      } | null
    }
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
}

export {}
