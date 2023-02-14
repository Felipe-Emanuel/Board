import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import firebase from "@/services/direbaseConnection";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET!,
    }),
  ],
  baseUrl: process.env.NEXTAUTH_URL,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({session, token}: any){
      try{

        const lastDonate = await firebase.firestore().collection('users')
        .doc(String(token.sub))
        .get()
        .then((snapshot) => {
          if(snapshot.exists){
            return snapshot.data()?.lastDonate.toDate();
          }else{
            return null // Que esse user nao é apoiador
          }
        })

        return{
          ...session,
          id: token.sub,
          vip: lastDonate ? true : false,
          lastDonate: lastDonate
        }

      }catch{
        return{
          ...session,
          id: null,
          vip: false,
          lastDonate: null
        }
      }

    },
    async signIn() {
      try {
        return true;
      } catch (erro) {
        console.log("DEU ERRO", erro);
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);
