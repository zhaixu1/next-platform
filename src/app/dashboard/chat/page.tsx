import DifyChatbot from "@/components/DifyChatbot";

export default function Chat() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center gap-10 border border-gray-100">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            AI 驱动
          </div>
          <h1 className="text-3xl font-bold text-gray-900">智能助手</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            你好！我是你的专属 AI 助手。我可以帮你解答关于系统的疑问，提供操作指引，或者只是陪你聊聊天。
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">
                  点击右下角的悬浮按钮即可唤起对话窗口
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 插图区域 */}
        <div className="w-64 h-64 flex-shrink-0 relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
          <svg className="w-full h-full text-blue-600 drop-shadow-xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 机器人头部 */}
            <rect x="20" y="25" width="60" height="50" rx="10" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
            {/* 天线 */}
            <line x1="50" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="10" r="4" fill="currentColor"/>
            {/* 眼睛 */}
            <circle cx="35" cy="45" r="5" fill="currentColor"/>
            <circle cx="65" cy="45" r="5" fill="currentColor"/>
            {/* 嘴巴 */}
            <path d="M35 60C35 60 40 68 50 68C60 68 65 60 65 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            {/* 耳朵 */}
            <rect x="15" y="40" width="5" height="20" rx="2" fill="currentColor"/>
            <rect x="80" y="40" width="5" height="20" rx="2" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Dify 聊天机器人组件 */}
      <DifyChatbot 
        token="G4c7M5XbiUiMbgbp" 
        baseUrl="https://udify.app"
      />
    </div>
  );
}
