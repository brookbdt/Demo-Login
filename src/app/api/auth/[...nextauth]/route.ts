
import { options } from './options';
import NextAuth, { User, Session } from 'next-auth';


const handler = NextAuth(options)

export { handler as GET, handler as POST }