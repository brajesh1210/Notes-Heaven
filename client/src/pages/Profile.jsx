import { useRef, useState } from 'react';
import { Camera, KeyRound, ShieldAlert, Trash2, Undo2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../lib/api.js';

/**
 * Profile page - personal info (avatar, name, email), password change
 * and the danger zone (account deletion).
 */
const Profile = () => {
  const { user, updateProfile, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [infoError, setInfoError] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passErrors, setPassErrors] = useState({});
  const [savingPass, setSavingPass] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileRef = useRef(null);
  const isGoogleUser = user?.provider === 'google';

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error('Images must be smaller than 8 MB');
    setUploading(true);
    try {
      const { data } = await api.upload(file);
      setAvatar(data.image.url);
      toast.success('Photo uploaded - press Save changes to apply');
    } catch (err) {
      toast.error(err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    setInfoError('');
    if (!name.trim()) return setInfoError('Please enter your name');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setInfoError('Please enter a valid email address');
    setSavingInfo(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim().toLowerCase(), avatar });
    } catch (err) {
      setInfoError(err.message || 'Could not save changes');
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isGoogleUser && !currentPassword) errs.current = 'Enter your current password';
    if (newPassword.length < 6) errs.next = 'At least 6 characters';
    if (newPassword !== confirmPassword) errs.confirm = 'Passwords do not match';
    setPassErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPass(true);
    try {
      const payload = { newPassword };
      if (!isGoogleUser) payload.currentPassword = currentPassword;
      const { message } = await api.put('/auth/change-password', payload);
      toast.success(message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassErrors({ current: err.message || 'Could not update password' });
    } finally {
      setSavingPass(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      localStorage.removeItem('nh_token');
      setUser(null);
      setConfirmDelete(false);
      toast.info('Your account and all data have been deleted');
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message || 'Could not delete the account');
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <PageHeader title="Profile" subtitle="Manage your account details, password and privacy." />

      <div className="space-y-5">
        {/* ------------ personal info ------------ */}
        <section className="card p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-ink">Personal information</h2>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Avatar user={{ name, avatar }} size={64} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" icon={Camera} loading={uploading} onClick={() => fileRef.current?.click()}>
                  Change photo
                </Button>
                {avatar && avatar !== user?.avatar && (
                  <Button variant="ghost" size="sm" icon={Undo2} onClick={() => setAvatar(user?.avatar || null)}>
                    Revert
                  </Button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG or WEBP - up to 8 MB.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
          </div>

          <form onSubmit={saveInfo} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {infoError && <p className="field-error sm:col-span-2">{infoError}</p>}
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" loading={savingInfo}>
                Save changes
              </Button>
            </div>
          </form>
        </section>

        {/* ------------ password ------------ */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-brand-700" />
            <h2 className="text-[15px] font-bold text-ink">Password</h2>
          </div>
          {isGoogleUser && (
            <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-[12.5px] leading-relaxed text-blue-800">
              You sign in with Google. Setting a password also lets you log in with your email.
            </p>
          )}
          <form onSubmit={savePassword} className="mt-4 grid gap-4 sm:grid-cols-3">
            {!isGoogleUser && (
              <Input
                label="Current password"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passErrors.current}
              />
            )}
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passErrors.next}
              hint="At least 6 characters"
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passErrors.confirm}
            />
            <div className="flex justify-end sm:col-span-3">
              <Button type="submit" loading={savingPass}>
                Update password
              </Button>
            </div>
          </form>
        </section>

        {/* ------------ danger zone ------------ */}
        <section className="card border-red-200 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-600" />
            <h2 className="text-[15px] font-bold text-ink">Danger zone</h2>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-relaxed text-ink-muted">
              Deleting your account removes every note, folder and tag permanently. This cannot be undone.
            </p>
            <Button variant="danger" icon={Trash2} className="shrink-0" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
        loading={deleting}
        title="Delete your account?"
        description="All notes, folders and tags will be permanently deleted, and you will be logged out. This action cannot be undone."
        confirmLabel="Delete forever"
      />
    </div>
  );
};

export default Profile;
