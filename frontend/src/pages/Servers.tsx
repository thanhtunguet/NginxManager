import React from "react";
import { Table, Button, Space, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import api from "../services/api";
import { HttpServer } from "../types";

const Servers: React.FC = () => {
  const { data: servers = [] } = useQuery<HttpServer[]>({
    queryKey: ["servers"],
    queryFn: async () => {
      const response = await api.get("/servers");
      return response.data;
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Log Level",
      dataIndex: "logLevel",
      key: "logLevel",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>Servers</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Server
        </Button>
      </div>

      <Table columns={columns} dataSource={servers} rowKey="id" />
    </div>
  );
};

export default Servers;
