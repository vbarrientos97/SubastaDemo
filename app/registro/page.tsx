import { Suspense } from 'react'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default function RegistroPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md items-center px-4 py-10">
      <div className="w-full">
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </main>
  )
}
