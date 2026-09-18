"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
  plugins: [adminClient(), usernameClient(), passkeyClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
