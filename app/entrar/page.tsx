import { Suspense } from 'react'
import { ThemeToggle } from '@/components/account/theme-toggle'
import { SignInForm } from '@/components/auth/sign-in-form'

export default function EntrarPage() {
  return (
    <main className="fixed inset-0 z-40 overflow-y-auto bg-[#f3ead8] dark:bg-[#08160f]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/login-art-light.jpg?v=3"
          alt=""
          className="h-full w-full object-cover object-left dark:hidden"
        />
        <img
          src="/login-art.jpg"
          alt=""
          className="hidden h-full w-full object-cover object-left dark:block"
        />
      </div>
      <ThemeToggle compact className="fixed top-4 right-4 z-50" />
      <div className="relative flex min-h-full items-center justify-center px-4 py-6 md:absolute md:top-1/2 md:left-[max(1rem,min(calc(58%-1rem),calc(100%-27.5rem)))] md:w-[min(26.25rem,calc(100%-2rem))] md:-translate-y-1/2 md:justify-start md:px-0">
        <div className="w-full">
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
