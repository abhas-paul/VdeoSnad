'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { signIn } from 'next-auth/react'

const Page = () => {
    return (
        <main className='flex min-h-screen bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-slate-800'>
            <section className='hidden w-1/2 bg-emerald-100 dark:bg-gray-800 lg:block'>
                <div className="relative w-full h-full min-h-screen">
                    <Image
                        src='/login-page-image.png'
                        alt='Login illustration'
                        fill
                        priority
                        className='object-cover'
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={100}
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </div>
            </section>

            <section className='flex flex-col justify-center w-full p-8 lg:w-1/2'>
                <section className='max-w-md mx-auto'>
                    <h1 className='mb-4 text-4xl text-center font-bold text-slate-800 dark:text-slate-100'>
                        Welcome to VdeoSnad
                    </h1>
                    <p className='mb-8 text-center text-slate-600 dark:text-slate-300'>
                        Connect with your team from anywhere, anytime. Secure, fast, and reliable video meetings made simple.
                    </p>

                    <section className='space-y-4'>
                        <Button
                            className='w-full cursor-pointer bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            variant='outline'
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="mr-2">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            Login with Google
                        </Button>
                    </section>

                    <section className='flex flex-col space-y-4 mt-6'>
                        <section className='flex items-center gap-4'>
                            <span className='flex-1 border-t border-slate-300 dark:border-slate-600'></span>
                            <span className='text-xs uppercase text-slate-500 dark:text-slate-400'>or</span>
                            <span className='flex-1 border-t border-slate-300 dark:border-slate-600'></span>
                        </section>

                        <Button
                            className='w-full cursor-pointer bg-slate-900 hover:text-gray-200 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 border-2 border-slate-900 dark:border-slate-200'
                            variant='ghost'
                            onClick={() => signIn("github", { callbackUrl: '/' })}
                        >
                            <Github className='w-5 h-5 mr-2' />
                            Login with Github
                        </Button>
                    </section>
                </section>
            </section>
        </main>
    )
}

export default Page
