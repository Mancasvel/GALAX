'use client'

import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
  Chip
} from '@heroui/react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { AuthModal } from './AuthModal'

interface NavbarComponentProps {
  onNewConversation?: () => void
}

export function NavbarComponent({ onNewConversation }: NavbarComponentProps) {
  const { user, logout, loading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const handleLogin = () => {
    setAuthModalMode('login')
    setIsAuthModalOpen(true)
  }

  const handleRegister = () => {
    setAuthModalMode('register')
    setIsAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <Navbar 
        className="bg-white/95 backdrop-blur-md border-b border-slate-200"
        classNames={{
          wrapper: "max-w-6xl px-4 sm:px-6 lg:px-8",
        }}
        height="72px"
        maxWidth="full"
      >
        {/* Logo y Nombre */}
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900">
                Unsent
              </span>
              <span className="text-xs text-slate-500 -mt-1">Process emotions through writing</span>
            </div>
          </Link>
        </NavbarBrand>

        {/* Contenido central - navegación */}
        <NavbarContent className="hidden lg:flex gap-1" justify="center">
          <NavbarItem>
            <Link href="/conversations">
              <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                Conversations
              </span>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/people">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                People
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/echoes">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Echoes
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/demo-conversation">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Demo
              </Button>
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Contenido derecho */}
        <NavbarContent justify="end" className="gap-3">
          {user ? (
            // Usuario autenticado
            <>
              {/* Botón de nueva conversación */}
              <NavbarItem className="hidden sm:flex">
                <Link href="/new-conversation">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    New Message
                  </Button>
                </Link>
              </NavbarItem>

              {/* Dropdown de usuario */}
              <NavbarItem>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button variant="light" className="p-1 min-w-0 h-auto">
                      <Avatar
                        size="sm"
                        name={getUserInitials(user.name || user.email || 'Usuario')}
                        classNames={{
                          base: "bg-slate-100 text-slate-700",
                          name: "font-medium text-sm"
                        }}
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu" className="w-56">
                    <DropdownItem key="profile" textValue="profile" className="h-12 gap-3">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="divider" textValue="divider">
                      <div className="w-full h-px bg-slate-200" />
                    </DropdownItem>
                    <DropdownItem 
                      key="conversations" 
                      startContent={<span className="text-slate-400">💌</span>} 
                      textValue="conversations" 
                      href="/conversations"
                      className="text-slate-700"
                    >
                      My Conversations
                    </DropdownItem>
                    <DropdownItem 
                      key="people" 
                      startContent={<span className="text-slate-400">👤</span>} 
                      textValue="people"
                      href="/people"
                      className="text-slate-700"
                    >
                      My People
                    </DropdownItem>
                    <DropdownItem 
                      key="echoes" 
                      startContent={<span className="text-slate-400">🌙</span>} 
                      textValue="echoes"
                      href="/echoes"
                      className="text-slate-700"
                    >
                      Echoes
                    </DropdownItem>
                    <DropdownItem 
                      key="settings" 
                      startContent={<span className="text-slate-400">⚙️</span>} 
                      textValue="settings"
                      className="text-slate-700"
                    >
                      Settings
                    </DropdownItem>
                    <DropdownItem 
                      key="upgrade" 
                      startContent={<span className="text-slate-400">✨</span>} 
                      textValue="upgrade"
                      className="text-slate-700"
                    >
                      Upgrade to Premium
                    </DropdownItem>
                    <DropdownItem key="divider2" textValue="divider2">
                      <div className="w-full h-px bg-slate-200" />
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      onClick={handleLogout}
                      className="text-red-600"
                      textValue="logout"
                    >
                      Sign Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            </>
          ) : (
            // Usuario no autenticado
            <>
              <NavbarItem className="hidden sm:flex">
                <Button
                  variant="light"
                  onPress={handleLogin}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Sign In
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  color="primary"
                  onPress={handleRegister}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Get Started
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  )
} 