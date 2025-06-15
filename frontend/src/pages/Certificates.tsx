import React from "react";
import { Table, Button, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import api from "../services/api";
import { Certificate } from "../types";

const Certificates: React.FC = () => {
  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await api.get("/certificates");
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
      title: "Issuer",
      dataIndex: "issuer",
      key: "issuer",
    },
    {
      title: "Expires At",
      dataIndex: "expiredAt",
      key: "expiredAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Auto Renew",
      dataIndex: "autoRenew",
      key: "autoRenew",
      render: (autoRenew: boolean) => (
        <Tag color={autoRenew ? "green" : "red"}>
          {autoRenew ? "Yes" : "No"}
        </Tag>
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
        <h1>Certificates</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Certificate
        </Button>
      </div>

      <Table columns={columns} dataSource={certificates} rowKey="id" />
    </div>
  );
};

export default Certificates;
