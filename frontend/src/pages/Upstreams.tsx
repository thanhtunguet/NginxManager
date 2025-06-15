import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../services/api";
import { Upstream, CreateUpstreamRequest } from "../types";

const { Option } = Select;

const Upstreams: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: upstreams = [], isLoading } = useQuery<Upstream[]>({
    queryKey: ["upstreams"],
    queryFn: async () => {
      const response = await api.get("/upstreams");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUpstreamRequest) => api.post("/upstreams", data),
    onSuccess: () => {
      message.success("Upstream created successfully");
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["upstreams"] });
    },
    onError: () => {
      message.error("Failed to create upstream");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/upstreams/${id}`),
    onSuccess: () => {
      message.success("Upstream deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["upstreams"] });
    },
    onError: () => {
      message.error("Failed to delete upstream");
    },
  });

  const handleCreate = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      createMutation.mutate(values);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this upstream?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteMutation.mutate(id),
    });
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Upstream
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={upstreams}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title="Create New Upstream"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            keepAlive: 32,
            healthCheckInterval: 30,
            maxFails: 3,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter upstream name" }]}
          >
            <Input placeholder="Enter upstream name" />
          </Form.Item>

          <Form.Item
            name="server"
            label="Server"
            rules={[{ required: true, message: "Please enter server address" }]}
          >
            <Input placeholder="e.g., 192.168.1.100:8080" />
          </Form.Item>

          <Form.Item
            name="keepAlive"
            label="Keep Alive Connections"
            rules={[
              { required: true, message: "Please enter keep alive value" },
            ]}
          >
            <InputNumber min={1} max={1000} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="healthCheckPath"
            label="Health Check Path"
            rules={[
              { required: true, message: "Please enter health check path" },
            ]}
          >
            <Input placeholder="e.g., /health" />
          </Form.Item>

          <Form.Item
            name="healthCheckInterval"
            label="Health Check Interval (seconds)"
          >
            <InputNumber min={1} max={300} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="maxFails" label="Max Fails">
            <InputNumber min={1} max={10} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Upstreams;
