import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import * as z from 'zod'
import crypto from 'crypto'
import { signIn } from 'next-auth/react'


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'defaultkey'
const API_KEY = process.env.API_KEY || '1ab2c3d4e5f61ab2c3d4e5f6'


const encryptPayload = (email: string, password: string) => {
    const cipher = crypto.createCipheriv(
        'aes-256-ecb',
        Buffer.from(ENCRYPTION_KEY),
        null
    )
    let encryptedEmail = cipher.update(email, 'utf-8', 'hex')
    encryptedEmail += cipher.final('hex')
    let encryptedPassword = cipher.update(password, 'utf-8', 'hex')
    encryptedPassword += cipher.final('hex')
    return {
        username: encryptedEmail,
        password: encryptedPassword,
    }


}

const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
})

interface LoginForm {
    email: string
    password: string


}

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        // Retrieve user credentials from the request body
        const { email, password } = req.body;

        // Encrypt the user credentials using your encryption logic
        const encryptedPayload = encryptPayload(email, password)


        // Make a request to the session API with the encrypted credentials
        const sessionApiResponse = await axios.post('https://dev.api.uphires.com/api/session', {
            email: encryptedPayload.email,
            password: encryptedPayload.password,
        });

        // Handle the response from the session API
        const { data } = sessionApiResponse;

        // Return the response from the session API as the API response
        res.status(sessionApiResponse.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
// export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         res.status(405).json({ message: 'Method Not Allowed' });
//         return;
//     }

//     try {
//         // Retrieve user credentials from the request body
//         const { email, password } = req.body;

//         // Encrypt the user credentials using your encryption logic
//         const encryptedPayload = encryptPayload(email, password)
//         // Make a request to the session API with the encrypted credentials
//         const sessionApiResponse = await axios.post('https://dev.api.uphires.com/api/session', {
//             email: email,
//             password: password,
//         });

//         // Handle the response from the session API
//         const { data } = sessionApiResponse;

//         // Return the response from the session API as the API response
//         res.status(sessionApiResponse.status).json(data);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }

// export default async function loginHandler(data: LoginForm, req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         res.status(405).json({ message: 'Method Not Allowed' });
//         return;
//     }
//     try {
//         // Validate form data
//         schema.parse(data)
//         //     // Retrieve user credentials from the request body
//         //     const { email, password } = req.body;

//         //     // Encrypt the user credentials using your encryption logic
//         //     const encryptedEmail = encryptPayload(email);
//         //     const encryptedPassword = encryptPayload(password);

//         //     // Make a request to the session API with the encrypted credentials
//         //     const sessionApiResponse = await axios.post(
//         //         'https://dev.api.uphires.com/api/session',
//         //         {
//         //             email: encryptedEmail,
//         //             password: encryptedPassword,
//         //         }
//         //     );

//         //     // Handle the response from the session API
//         //     const { data } = sessionApiResponse;

//         //     // Return the response from the session API as the API response
//         //     res.status(sessionApiResponse.status).json(data);

//         const encryptedPayload = encryptPayload(data.email, data.password)

//         const result = await signIn('credentials', {
//             redirect: false,
//             email: encryptedPayload.email,
//             password: encryptedPayload.password,
//         })

//         if (result?.error) {
//             console.error(result.error)
//             // handle error
//         } else {
//             // redirect to home page or the page the user was trying to access before authentication
//         }
//     } catch (error) {
//         console.error(error)
//         // handle validation error
//     }

//     // try {
//     //     // Retrieve user credentials from the request body
//     //     const { email, password } = req.body;

//     //     // Encrypt the user credentials using your encryption logic
//     //     const encryptedEmail = encryptPayload(email);
//     //     const encryptedPassword = encryptPayload(password);

//     //     // Make a request to the session API with the encrypted credentials
//     //     const sessionApiResponse = await axios.post(
//     //         'https://dev.api.uphires.com/api/session',
//     //         {
//     //             email: encryptedEmail,
//     //             password: encryptedPassword,
//     //         }
//     //     );

//     //     // Handle the response from the session API
//     //     const { data } = sessionApiResponse;

//     //     // Return the response from the session API as the API response
//     //     res.status(sessionApiResponse.status).json(data);
//     // } catch (error) {
//     //     console.error(error);
//     //     res.status(500).json({ message: 'Internal Server Error' });
//     // }
// }

// In this code, the API route handler `loginHandler` is defined. It checks if the HTTP method is `POST` and proceeds with the login logic. The user credentials are retrieved from the request body (`req.body`), and then encrypted using your encryption logic. The encrypted credentials are sent in a POST request to the session API endpoint (`https://dev.api.uphires.com/api/session`). The response from the session API is then returned as the API response.

// Note that you need to replace the `encrypt` function with your actual encryption logic.