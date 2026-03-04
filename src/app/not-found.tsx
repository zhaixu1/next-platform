import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">页面未找到</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        抱歉，你访问的页面不存在。可能是链接输入错误，或者该页面已被移除。
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        返回首页
      </Link>
    </div>
  );
}

