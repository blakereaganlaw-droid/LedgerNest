import { changePasswordAction } from "@/app/actions/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
  async function changePassword(formData: FormData) {
    "use server";
    await changePasswordAction({
      currentPassword: String(formData.get("current")),
      newPassword: String(formData.get("new")),
      confirmPassword: String(formData.get("confirm")),
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Security</h1>
      <form
        action={changePassword}
        className="max-w-md space-y-3 rounded-xl border border-border p-4"
      >
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" name="current" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new">New password</Label>
          <Input id="new" name="new" type="password" minLength={12} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" required />
        </div>
        <Button type="submit">Change password</Button>
      </form>
    </div>
  );
}
