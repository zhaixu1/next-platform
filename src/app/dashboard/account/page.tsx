"use client";

import { Table } from 'antd'
import { useState, useEffect } from 'react';
import { getAccountList } from '@/app/api/fetch/account'

export default function AccountPage() {
  // 添加一个状态来标记组件是否已经挂载到客户端
  const [isMounted, setIsMounted] = useState(false)

  const [dataSource, setDataSource] = useState([])
  const [columns, setColumns] = useState([])

  
  const getAccountListFunc = async () =>{
    const res = await getAccountList();
    console.log(res,'res');
  }

  // useEffect 只会在浏览器端（客户端）执行
  useEffect(() => {
    // setIsMounted(true)
    getAccountListFunc()
  }, [])


  // 如果还没挂载（即在服务端渲染阶段），返回 null 或加载动画
  if (!isMounted) {
    return null // 或者 return <div>加载中...</div>
  } 

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  )
}