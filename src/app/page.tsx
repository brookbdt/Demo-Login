'use client'
import { useState } from 'react'
import { options } from './api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth/next'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import crypto from 'crypto'
import * as z from 'zod'
import loginHandler from './api/login/route'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import axios from 'axios'
import LoginComponent from '../../components/Login'

interface LoginForm {
    email: string
    password: string
}

export default function LoginPage() {
    const { data: session, status } = useSession()

    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default key'
    const API_KEY = process.env.API_KEY || '1ab2c3d4e5f61ab2c3d4e5f6'
    // Fetch user's detail data upon successful login
    useEffect(() => {
        console.log({ session })
        if (session) {
            let config = {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }

            axios
                .get('https://dev.api.uphires.com/users/my-details', config)
                .then((response) => {
                    console.log(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        }
        return () => console.log('cleanup') // Cleanup function
    }, [session]) // Dependency array
    const [isLoading, setIsLoading] = useState(false)
    const loginFormSchema = z.object({
        email: z.string().email({ message: 'Invalid email address' }),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(100, 'Password is too long'),
    })

    return <LoginComponent />
}
