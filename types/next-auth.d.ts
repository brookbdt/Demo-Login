// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth"
declare module 'next-auth' {
    interface Session {
        accessToken: string  // The prop you want to extend.

        user: {
            /** The user's postal address. */
            address: string
        } & DefaultSession["user"]
    }
}