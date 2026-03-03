import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">欢迎来到 Next.js 学习平台</h1>
      <p className="text-xl mb-8">这是一个手动搭建的 Next.js 项目。</p>
      
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          去控制台 (Dashboard)
        </Link>
      </div>
    </main>
  );
}
