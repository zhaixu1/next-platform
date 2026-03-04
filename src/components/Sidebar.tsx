"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const navItems = [
    { name: "概览", href: "/dashboard", icon: "📊" },
    { name: "设置", href: "/dashboard/settings", icon: "⚙️" },
    { name: '聊天', href: "/dashboard/chat", icon: "💬" },
  ];

  return (
    <aside 
      className={`bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between h-16 border-b border-gray-700">
        {!isCollapsed && <h2 className="text-xl font-bold truncate">Dashboard</h2>}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white ml-auto"
          title={isCollapsed ? "展开" : "收起"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center p-2 rounded transition-colors ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
          
          <li className="mt-8 border-t border-gray-700 pt-4">
             <Link 
                href="/" 
                className="flex items-center p-2 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <span className="text-xl">🏠</span>
                {!isCollapsed && (
                  <span className="ml-3 whitespace-nowrap">返回首页</span>
                )}
              </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

