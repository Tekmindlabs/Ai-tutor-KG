// app/dashboard/page.tsx
import { ServerAuthCheck } from "@/components/auth/server-auth-check";
import { UserProfile } from "@/components/auth/user-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  return (
    <ServerAuthCheck>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <UserProfile />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your learning progress will appear here</p>
            </CardContent>
          </Card>
          
          {/* Add more cards for dashboard content */}
        </div>
      </div>
    </ServerAuthCheck>
  );
}