'use client'
import { useAuthActions } from '@convex-dev/auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function SignInForm() {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className='w-full'>
      <form
        className='flex flex-col gap-4'
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitting(true)
          const formData = new FormData(e.target as HTMLFormElement)
          formData.set('flow', flow)
          void signIn('password', formData).catch((error) => {
            if (error.message?.includes('InvalidSecret')) {
              toast.error('비밀번호가 틀렸습니다.')
            } else if (error.message?.includes('No account found')) {
              toast.error('아이디가 존재하지 않습니다.')
            } else {
              const toastTitle =
                flow === 'signIn'
                  ? '로그인에 실패했습니다. 다시 시도해 주세요.'
                  : '회원가입에 실패했습니다. 다시 시도해 주세요.'
              toast.error(toastTitle)
            }
            setSubmitting(false)
          })
        }}
      >
        <input
          className='input-field'
          type='email'
          name='email'
          placeholder='Email'
          required
        />
        <input
          className='input-field'
          type='password'
          name='password'
          placeholder='Password'
          required
        />
        <button className='auth-button' type='submit' disabled={submitting}>
          {flow === 'signIn' ? 'Sign in' : 'Sign up'}
        </button>
        <div className='text-center text-sm text-slate-600'>
          <span>
            {flow === 'signIn'
              ? "Don't have an account? "
              : 'Already have an account? '}
          </span>
          <button
            type='button'
            className='text-blue-500 cursor-pointer'
            onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
          >
            {flow === 'signIn' ? 'Sign up instead' : 'Sign in instead'}
          </button>
        </div>
      </form>
      <div className='flex items-center justify-center my-3'>
        <hr className='my-4 grow' />
        <span className='mx-4 text-slate-400 '>or</span>
        <hr className='my-4 grow' />
      </div>
      <button className='auth-button' onClick={() => void signIn('anonymous')}>
        Sign in anonymously
      </button>
    </div>
  )
}
