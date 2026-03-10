"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { post } from "@/lib/request";

type LoginFormValues = {
  username: string;
  password: string;
};

export default function Login() {
  const [form] = Form.useForm<LoginFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const result = await post<{
        message: string;
        data: {
          username: string;
          email: string;
        };
      }, LoginFormValues>("/api/login", values);

      messageApi.success(result.message || "登录成功");
      form.resetFields();
      router.push("/dashboard");
    } catch {
      messageApi.error("登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6 bg-gray-50">
      {contextHolder}
      <Card className="w-full max-w-md shadow-sm" styles={{ body: { padding: 24 } }}>
        <div className="mb-6">
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            登录
          </Typography.Title>
          <Typography.Text type="secondary">
            请输入账号与密码完成登录
          </Typography.Text>
        </div>

        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          requiredMark="optional"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[
              { required: true, message: "请输入账号" },
              { min: 3, message: "账号至少 3 个字符" },
            ]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={submitting}
          >
            登录
          </Button>

          <div className="mt-4 text-center">
            <Typography.Text type="secondary" className="text-xs">
              提示：当前页面已接入 `post` 请求封装与 `/api/login`
            </Typography.Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}