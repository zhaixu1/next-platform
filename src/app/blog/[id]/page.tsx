import Link from "next/link";
import { notFound } from "next/navigation";

// 模拟数据库数据（实际项目中你会从数据库获取）
const posts = [
  { id: "1", title: "Next.js 16 发布了！", content: "Next.js 16 带来了很多新特性，包括更快的编译器和更好的 Server Actions 支持。", date: "2024-05-20" },
  { id: "2", title: "如何学习 React", content: "React 是一个用于构建用户界面的库。学习 React 的最佳方式是动手写代码。", date: "2024-05-21" },
  { id: "3", title: "Tailwind CSS 技巧", content: "Tailwind CSS 是一个功能类优先的 CSS 框架，它可以让你快速构建现代网站。", date: "2024-05-22" },
];

// 1. 定义参数类型
type Props = {
  params: Promise<{ id: string }>;
};

// 2. 动态生成 Metadata (SEO)
export async function generateMetadata({ params }: Props) {
  // 在 Next.js 15+ 中，params 是一个 Promise，必须 await
  const { id } = await params;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: `${post.title} | 我的博客`,
    description: post.content.slice(0, 100),
  };
}

// 3. 页面组件
export default async function BlogPost({ params }: Props) {
  // 等待参数解析
  const { id } = await params;
  
  // 模拟从数据库查找文章
  const post = posts.find((p) => p.id === id);

  // 如果找不到文章，显示 404 页面
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link 
        href="/blog" 
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← 返回列表
      </Link>

      <article className="prose lg:prose-xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
        <div className="text-gray-500 mb-8 text-sm">
          发布于 {post.date} • ID: {id}
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <p className="text-lg text-gray-800 leading-relaxed">
            {post.content}
          </p>
          <p className="mt-4 text-gray-800 leading-relaxed">
            (这里是文章的详细内容... 这是一个动态路由页面的示例。
            你可以看到 URL 是 /blog/{id}，而页面内容根据 ID 动态变化。)
          </p>
        </div>
      </article>
    </div>
  );
}

