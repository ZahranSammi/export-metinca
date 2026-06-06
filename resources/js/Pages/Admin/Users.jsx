import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import TopBanner from '../../Components/Layout/TopBanner';
import Sidebar from '../../Components/Layout/Sidebar';

export default function Users({ auth, users = [], unreadNotifications = [] }) {
  const [editingUser, setEditingUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    email: '',
    role: 'sales',
    password: '',
    is_active: 1,
  });

  const handleOpenCreate = () => {
    reset();
    setEditingUser(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active ? 1 : 0,
      password: '', // blank by default
    });
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      put(`/admin/users/${editingUser.id}`, {
        onSuccess: () => {
          setShowFormModal(false);
          reset();
        }
      });
    } else {
      post('/admin/users', {
        onSuccess: () => {
          setShowFormModal(false);
          reset();
        }
      });
    }
  };

  const handleToggleActive = (userId) => {
    if (confirm('Apakah Anda yakin ingin mengubah status aktif user ini?')) {
      router.post(`/admin/users/${userId}/toggle-active`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)] text-xs">
      <Head title="Manajemen User - PT Metinca" />

      <TopBanner auth={auth} unreadNotifications={unreadNotifications} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" selectedShipment={null} setSelectedShipment={() => {}} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Manajemen Pengguna</h2>
              <p className="text-xs text-[var(--text-muted)]">Tambah, ubah, atau nonaktifkan aktor sistem.</p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-bold px-4 py-2 rounded border-0 cursor-pointer"
            >
              + Tambah User
            </button>
          </div>

          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 text-[10px] uppercase font-mono bg-[var(--surface-elevated)]">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-xs">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--surface-elevated)] transition-all">
                      <td className="p-3 font-bold text-[var(--text-main)]">{u.name}</td>
                      <td className="p-3 font-mono">{u.email}</td>
                      <td className="p-3 uppercase tracking-wider font-mono text-[10px] text-[var(--primary-color)]">
                        {u.role.replace('_', ' ')}
                      </td>
                      <td className="p-3">
                        {u.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800">AKTIF</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-100 text-rose-800">NONAKTIF</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="text-xs text-[var(--primary-color)] hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          Ubah
                        </button>
                        {u.id !== auth.user.id && (
                          <button 
                            onClick={() => handleToggleActive(u.id)}
                            className={`text-xs hover:underline bg-transparent border-0 cursor-pointer ${u.is_active ? 'text-rose-600' : 'text-emerald-600'}`}
                          >
                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
              <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
                {editingUser ? 'Ubah User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
                {errors.name && <span className="text-[var(--error-color)] text-[10px]">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Alamat Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. user@metinca.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
                {errors.email && <span className="text-[var(--error-color)] text-[10px]">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Role Akses</label>
                <select
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)]"
                >
                  <option value="admin">System Admin</option>
                  <option value="sales">Sales</option>
                  <option value="export_staff">Export Staff</option>
                  <option value="export_manager">Export Manager</option>
                  <option value="finance">Finance Controller</option>
                  <option value="forwarder">Internal Forwarder</option>
                </select>
                {errors.role && <span className="text-[var(--error-color)] text-[10px]">{errors.role}</span>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  Kata Sandi {editingUser && '(Kosongkan jika tidak ingin diubah)'}
                </label>
                <input 
                  type="password" 
                  required={!editingUser}
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
                {errors.password && <span className="text-[var(--error-color)] text-[10px]">{errors.password}</span>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Status Keaktifan</label>
                <select
                  value={data.is_active}
                  onChange={(e) => setData('is_active', parseInt(e.target.value))}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)]"
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={processing}
                  className="bg-[var(--primary-color)] text-white font-bold px-4 py-2 rounded cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
