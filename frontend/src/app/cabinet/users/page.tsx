/**
 * System Users Page
 * 
 * Page for managing system staff (SuperAdmins).
 * Allows viewing, creating, editing, and deleting system users.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// User type
interface SystemUser {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
  updatedAt: string
}

// Role colors
const ROLE_COLORS: Record<string, string> = {
  creator: "bg-red-100 text-red-800",
  admin: "bg-blue-100 text-blue-800",
  operator: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
}

// Role labels
const ROLE_LABELS: Record<string, string> = {
  creator: "Creator",
  admin: "Admin",
  operator: "Operator",
  viewer: "Ko'ruvchi",
}

// Role icons
const ROLE_ICONS: Record<string, typeof Shield> = {
  creator: ShieldAlert,
  admin: ShieldCheck,
  operator: Shield,
  viewer: Shield,
}

export default function UsersPage() {
  const { token, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      // Wait for auth to finish loading
      if (authLoading) return
      
      if (!token) {
        setLoading(false)
        setError('Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.')
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          setUsers(data)
          setError(null)
        } else if (response.status === 401) {
          setError('Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.')
        } else {
          setError('Foydalanuvchilarni yuklashda xatolik')
        }
      } catch (err) {
        console.error('Fetch users error:', err)
        setError('Tarmoq xatosi')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token, authLoading])

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!confirm('Rostdan ham bu foydalanuvchini o\'chirmoqchimisiz?')) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        alert('O\'chirishda xatolik')
      }
    } catch (err) {
      alert('Tarmoq xatosi')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tizim xodimlari</h1>
            <p className="text-muted-foreground">
              Tizim administratorlari va xodimlarini boshqarish
            </p>
          </div>
          <Button onClick={() => {
            setEditingUser(null)
            setIsModalOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi xodim qo'shish
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jami xodimlar</p>
                  <p className="text-xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creator</p>
                  <p className="text-xl font-bold text-red-600">
                    {users.filter(u => u.role === 'creator').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin</p>
                  <p className="text-xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operator</p>
                  <p className="text-xl font-bold text-green-600">
                    {users.filter(u => u.role === 'operator').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ism yoki email bo'yicha qidirish..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xodimlar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>F.I.O.</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead className="w-[100px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Xodimlar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const RoleIcon = ROLE_ICONS[user.role] || Shield
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.fullName}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[user.role] || 'bg-gray-100'}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                        </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1">
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => {
                                 setEditingUser(user)
                                 setIsModalOpen(true)
                               }}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             {user.role !== 'creator' && (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-red-600"
                                 onClick={() => handleDelete(user.id)}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                           </div>
                         </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        token={token}
        user={editingUser}
        onSuccess={() => {
          setIsModalOpen(false)
          setEditingUser(null)
          // Refresh users
          window.location.reload()
        }}
      />
    </>
  )
}

/**
 * User Modal Component
 */
interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  token: string | null
  user: SystemUser | null
  onSuccess: () => void
}

function UserModal({ isOpen, onClose, token, user, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          fullName: user.fullName,
          email: user.email,
          password: '',
          role: user.role,
        })
      } else {
        setFormData({
          fullName: '',
          email: '',
          password: '',
          role: 'admin',
        })
      }
      setError(null)
    }
  }, [isOpen, user])

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const url = user
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users`

      const body: Record<string, string> = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      }

      // Only include password if provided
      if (formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method: user ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.message || 'Xatolik yuz berdi')
      }
    } catch (err) {
      setError('Tarmoq xatosi')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{user ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">F.I.O.</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="To'liq ism"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Parol {user && '(bo\'sh qoldiring o\'zgartirmaslik uchun)'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required={!user}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={user?.role === 'creator'}
              >
                {/* Only show Creator option when editing an existing Creator */}
                {user?.role === 'creator' && (
                  <option value="creator">Creator</option>
                )}
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="viewer">Ko'ruvchi</option>
              </select>
              {user?.role === 'creator' && (
                <p className="text-xs text-muted-foreground">Creator rolini o'zgartirish mumkin emas</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  user ? 'Saqlash' : 'Qo\'shish'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
