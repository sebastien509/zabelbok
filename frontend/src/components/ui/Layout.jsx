import Sidebar from '../system/Sidebar';
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto"> {children} </main>
    </div>
  );
}