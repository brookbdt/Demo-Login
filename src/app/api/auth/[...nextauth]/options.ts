import type { NextAuthOptions, User } from "next-auth";
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';
import { JWT } from "next-auth/jwt";

interface EncryptedPayload {
    email: string;
    password: string;
}
interface UserWithTokens extends User {
    accessToken?: string;
    refreshToken?: string;
}


const credentialsSchema = z.object({
    email: z.string(),
    password: z.string(),
});

const encryptPayload = (email: string, password: string): EncryptedPayload => {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default key'
    const encryptedEmail = encrypt(email, ENCRYPTION_KEY);
    const encryptedPassword = encrypt(password, ENCRYPTION_KEY);
    return {
        email: encryptedEmail,
        password: encryptedPassword,
    };
};


const encrypt = (text: string, key: string): string => {
    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null);
    let encryptedText = cipher.update(text, 'utf-8', 'hex');
    encryptedText += cipher.final('hex');
    return encryptedText;
};


const validateCredentials = (credentials: { username: string; password: string }): boolean => {
    try {
        credentialsSchema.parse(credentials);

        return true; // Return true if credentials are valid
    } catch (error) {
        return false; // Return false if credentials are invalid
    }
};


const yourCredentialLoginApi = async (encryptedPayload: EncryptedPayload): Promise<any> => {
    const credentialsApiUrl = 'https://dev.api.uphires.com/sessions';

    try {
        console.log({ encryptedPayload })
        let response = await axios({
            method: 'post',
            url: credentialsApiUrl,
            data: encryptedPayload,
            headers: {
                'X-API-KEY': process.env.X_API_KEY,
                'Content-Type': 'application/json'
            },
        });
        console.log({ rd: response.data });
        return response.data;
    } catch (error) {
        console.error({ error: JSON.stringify(error) })
    }
};


const authorize = async (credentials: { username: string; password: string } | undefined): Promise<User | null> => {

    // check if credentials are provided
    if (!credentials) {
        return null;
    }


    // generate encryptedPayload
    const encryptedPayload = encryptPayload(credentials.username, credentials.password);
    console.log({ encryptedPayload })
    // Call yourCredentialLoginApi to get user data and tokens
    const response = await yourCredentialLoginApi(encryptedPayload);


    if (response) {
        const { accessToken, refreshToken } = response;
        // depending on your response structure, you might need to access user data as response.user.<property>,
        const user: UserWithTokens = {
            id: "1",
            accessToken: accessToken,
            refreshToken: refreshToken,
        };


        return user;
    }

    // If extraction of user data and tokens fails, return null for authorization failure
    return null;
};

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username:", placeholder: 'Enter your username', type: "text" },
                password: { label: "Password:", placeholder: "Enter your password", type: "password" }
            },
            authorize: authorize,

        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {

            // console.log({ user })
            if (user) {
                console.log({ tokenn: 'the initial token is', token })

                if (!(user as UserWithTokens).accessToken) {
                    const credentialsApiUrl = 'https://dev.api.uphires.com/sessions/social-login';
                    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default key'
                    const encryptedEmail = encrypt(user.email || '', ENCRYPTION_KEY)
                    console.log({ encryptedEmail })

                    try {
                        let response = await axios({
                            method: 'post',
                            url: credentialsApiUrl,
                            data: {
                                email: encryptedEmail,
                            },
                            headers: {
                                'X-API-KEY': process.env.X_API_KEY,
                                'Content-Type': 'application/json'
                            },
                        });
                        console.log({ rd2: response.data });

                        (user as UserWithTokens).accessToken = response.data.accessToken;
                        (user as UserWithTokens).refreshToken = response.data.refreshToken;
                    } catch (error) {
                        console.error({ error: JSON.stringify(error, null, 2) })
                    }
                }

                // User's accessToken and refreshToken are saved in the token when user sign in.
                token.accessToken = (user as UserWithTokens).accessToken;
                token.refreshToken = (user as UserWithTokens).refreshToken;
                token['X-API-KEY'] = process.env.X_API_KEY;
            }


            return token;
        },

        session: async ({ session, token }) => {
            session.user = token as any;
            session.accessToken = token.accessToken as any
            return session;
        }
    },





    // pages: {
    //     signIn: '/signin'
    // }
}
