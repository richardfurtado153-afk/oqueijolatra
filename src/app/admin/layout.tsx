import AdminSidebar from './components/AdminSidebar'

export const metadata = { title: 'Admin — O Queijolatra' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full min-w-0">
        {children}
      </main>
    </div>
  )
}
