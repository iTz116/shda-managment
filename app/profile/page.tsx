import { authClient } from "@/lib/auth-client";

const { data: session } = await authClient.getSession();

export default function ProfilePage() {
  if (session?.user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Name</h2>
            <p>{session.user.name}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Email</h2>
            <p>{session.user.email}</p>
          </div>
        </div>
      </div>
    )
  }
}