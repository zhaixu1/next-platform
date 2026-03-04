"use client";

import Script from "next/script";

interface DifyChatbotConfig {
  token: string;
  baseUrl?: string;
  inputs?: Record<string, string>;
  systemVariables?: Record<string, string>;
  userVariables?: Record<string, string>;
}

declare global {
  interface Window {
    difyChatbotConfig: DifyChatbotConfig;
  }
}

interface DifyChatbotProps {
  token: string;
  baseUrl?: string;
}

export default function DifyChatbot({ token, baseUrl = "https://udify.app" }: DifyChatbotProps) {
  return (
    <>
      {/* 1. 先注入配置 */}
      <Script id="dify-chatbot-config" strategy="afterInteractive">
        {`
          window.difyChatbotConfig = {
            token: "${token}",
            baseUrl: "${baseUrl}"
          };
        `}
      </Script>

      {/* 2. 再加载脚本 */}
      <Script
        src={`${baseUrl}/embed.min.js`}
        id={token}
        strategy="afterInteractive"
      />

      {/* 3. 样式覆盖 */}
      <style jsx global>{`
        #dify-chatbot-bubble-button {
          background-color: #1C64F2 !important;
          z-index: 9999 !important; /* 确保按钮在最上层 */
          bottom: 2rem !important;
          right: 2rem !important;
        }
        #dify-chatbot-bubble-window {
          margin-bottom: 4rem !important;
          width: 24rem !important;
          height: 40rem !important;
          z-index: 10000 !important;
        }
      `}</style>
    </>
  );
}
