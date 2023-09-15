import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { AiFillApple } from 'react-icons/ai'
import { useState } from 'react'
import * as z from 'zod'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'

const LoginComponent = () => {
    const [passwordShown, setPasswordShown] = useState(false)

    const togglePasswordShown = () => {
        setPasswordShown(!passwordShown)
    }

    interface LoginForm {
        email: string
        password: string
    }
    const [isLoading, setIsLoading] = useState(false)

    const loginFormSchema = z.object({
        email: z.string().email({ message: 'Invalid email address' }),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(100, 'Password is too long'),
    })

    type LoginFormSchemaType = z.infer<typeof loginFormSchema>

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormSchemaType>({
        resolver: zodResolver(loginFormSchema),
    })
    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true)
        try {
            // Validate form data
            const validData = loginFormSchema.parse(data)

            await signIn('credentials', {
                redirect: false, // You can adjust where the user should be redirected upon successful login.
                username: validData.email, // Match these with data your credential provider expects.
                password: validData.password,
                callbackUrl: `${window.location.origin}/https://dev.api.uphires.com/users/my-details`,
            })
        } catch (error) {
            setError('email', {
                type: 'manual',
                message: 'Invalid credentials',
            })
            setError('password', {
                type: 'manual',
                message: 'Invalid credentials',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        signIn('google')
    }
    return (
        <div className="min-h-screen flex justify-center items-center  max-w-lg mx-auto">
            <div className="border border-[#D5D6D8] rounded-lg px-12 py-6 flex flex-col w-[768px]">
                <h2 className="text-center font-bold text-4xl  mb-5">
                    Login to uphire
                </h2>

                <div className="flex gap-4 flex-col">
                    <button
                        onClick={handleGoogleLogin}
                        className="flex gap-2 bg-blue-500 pl-1 pr-4 py-1 w-full rounded-full items-center text-white"
                    >
                        <span className="w-8 h-8 bg-white rounded-full flex justify-center items-center text-blue-500">
                            <FcGoogle />
                        </span>
                        <span className="flex-1">Continue with Google</span>
                    </button>
                    <button className="flex gap-2 border-2 border-[#747474] bg-white-500 pl-1 pr-4 py-1 w-full rounded-full items-center text-white">
                        <span className="w-8 h-8 bg-white rounded-full flex justify-center items-center text-blue-500">
                            <AiFillApple className="fill-black" />
                        </span>
                        <span className="flex-1 text-black">
                            Continue with Apple
                        </span>
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full max-w-md"
                >
                    <div className="flex gap-2 items-center my-8">
                        <hr className="flex-grow border-gray-300" />
                        <span className="text-gray-500">or</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <div className="relative flex items-center space-x-4 mb-4">
                        <FiMail className="absolute text-gray-400 left-5" />
                        <input
                            type="email"
                            id="email"
                            placeholder="Email or username"
                            className="flex-grow border border-gray-300 p-2 bg-white-500 rounded-md pl-8"
                            {...register('email')}
                        />
                    </div>

                    <div className="relative flex items-center space-x-4">
                        <FiLock className="absolute text-gray-400 left-5" />
                        <input
                            type={passwordShown ? 'text' : 'password'}
                            id="password"
                            placeholder="Password"
                            className="flex-grow border border-gray-300 bg-white p-2 rounded-md pl-8"
                            {...register('password')}
                        />
                        <button
                            onClick={togglePasswordShown}
                            type="button"
                            className="absolute text-gray-400 right-2 top-1/2 transform -translate-y-1/2"
                        >
                            {passwordShown ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-orange-500  text-white w-full py-2 rounded-md mt-5"
                    >
                        Continue with Email
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginComponent
