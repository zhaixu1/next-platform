"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // 将路径分割成数组，过滤掉空字符串
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-gray-500">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          // 构建当前片段的完整路径
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          
          // 将首字母大写
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);
          
          // 判断是否是最后一个片段（当前页面）
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="hover:text-blue-600 transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

