import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.admin.hasPermission({
    userId: "user-id",
    permission: { "project": ["create", "update"] } /* Must use this, or permissions */,
});