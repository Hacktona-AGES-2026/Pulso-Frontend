import { createContext, useContext, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface Sessao {
  nome: string
  funcao: string
}

interface Auth {
  sessao: Sessao | null
  entrar: (identificacao: string, senha: string) => Promise<void>
  sair: () => void
}

const CHAVE = 'pulso:sessao'
const Contexto = createContext<Auth | null>(null)

function lerSessao(): Sessao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Sessao) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao)

  const entrar = (identificacao: string, senha: string) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (identificacao.trim().length < 4 || senha.length < 4) return reject(new Error('credenciais'))
        const s = { nome: 'Dr. Rafael Mendes', funcao: 'Regulação' }
        try {
          sessionStorage.setItem(CHAVE, JSON.stringify(s))
        } catch {
          /* sessão só em memória */
        }
        setSessao(s)
        resolve()
      }, 700)
    })

  const sair = () => {
    try {
      sessionStorage.removeItem(CHAVE)
    } catch {
      /* nada a limpar */
    }
    setSessao(null)
  }

  return <Contexto.Provider value={{ sessao, entrar, sair }}>{children}</Contexto.Provider>
}

export function useAuth() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { sessao } = useAuth()
  const local = useLocation()
  if (!sessao) return <Navigate to="/profissional/entrar" replace state={{ de: local.pathname }} />
  return <>{children}</>
}
