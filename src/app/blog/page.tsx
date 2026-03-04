import Link from "next/link";

// 模拟数据库数据
const posts = [
  { id: 1, title: "Next.js 16 发布了！", content: "Next.js 16 带来了很多新特性..." },
  { id: 2, title: "如何学习 React", content: "React 是一个用于构建用户界面的库..." },
  { id: 3, title: "Tailwind CSS 技巧", content: "Tailwind CSS 是一个功能类优先的 CSS 框架..." },
];

export default function BlogList() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">博客文章列表</h1>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.id}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 line-clamp-2">{post.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

