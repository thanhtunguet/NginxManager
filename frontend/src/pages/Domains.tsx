import React from "react";
import { Table, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import api from "../services/api";
import { Domain } from "../types";

const Domains: React.FC = () => {
  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ["domains"],
    queryFn: async () => {
      const response = await api.get("/domains");
      return response.data;
    },
  });

  const columns = [
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
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
        <h1>Domains</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Domain
        </Button>
      </div>

      <Table columns={columns} dataSource={domains} rowKey="id" />
    </div>
  );
};

export default Domains;
