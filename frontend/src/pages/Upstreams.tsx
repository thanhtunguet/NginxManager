import React from "react";
import { Table, Button, Space, Tag, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../services/api";
import { Upstream } from "../types";

const Upstreams: React.FC = () => {
  const { data: upstreams = [], refetch } = useQuery<Upstream[]>({
    queryKey: ["upstreams"],
    queryFn: async () => {
      const response = await api.get("/upstreams");
      return response.data;
    },
  });

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/upstreams/${id}`);
      message.success("Upstream deleted successfully");
      refetch();
    } catch (error) {
      message.error("Failed to delete upstream");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Server",
      dataIndex: "server",
      key: "server",
    },
    {
      title: "Keep Alive",
      dataIndex: "keepAlive",
      key: "keepAlive",
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
      title: "Health Check Path",
      dataIndex: "healthCheckPath",
      key: "healthCheckPath",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Upstream) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => console.log("Edit", record.id)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
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
        <h1>Upstreams</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Upstream
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={upstreams}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  );
};

export default Upstreams;
