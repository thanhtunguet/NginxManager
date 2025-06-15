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
  Select,
  InputNumber,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../services/api";
import { HttpServer, CreateHttpServerRequest, ListeningPort } from "../types";

const { Option } = Select;
const { TextArea } = Input;

const Servers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: servers = [], isLoading } = useQuery<HttpServer[]>({
    queryKey: ["servers"],
    queryFn: async () => {
      const response = await api.get("/servers");
      return response.data;
    },
  });

  const { data: listeningPorts = [] } = useQuery<ListeningPort[]>({
    queryKey: ["listening-ports"],
    queryFn: async () => {
      const response = await api.get("/listening-ports");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHttpServerRequest) => api.post("/servers", data),
    onSuccess: () => {
      message.success("Server created successfully");
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onError: () => {
      message.error("Failed to create server");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/servers/${id}`),
    onSuccess: () => {
      message.success("Server deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onError: () => {
      message.error("Failed to delete server");
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
      title: "Are you sure you want to delete this server?",
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: HttpServer) => (
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
        <h1>Servers</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Server
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={servers}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title="Create New Server"
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
            logLevel: "info",
          }}
        >
          <Form.Item
            name="listeningPortId"
            label="Listening Port"
            rules={[
              { required: true, message: "Please select a listening port" },
            ]}
          >
            <Select placeholder="Select a listening port">
              {listeningPorts.map((port) => (
                <Option key={port.id} value={port.id}>
                  {port.name} (Port {port.port})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Server Name"
            rules={[{ required: true, message: "Please enter server name" }]}
          >
            <Input placeholder="Enter server name" />
          </Form.Item>

          <Form.Item name="logLevel" label="Log Level">
            <Select>
              <Option value="debug">Debug</Option>
              <Option value="info">Info</Option>
              <Option value="warn">Warn</Option>
              <Option value="error">Error</Option>
            </Select>
          </Form.Item>

          <Form.Item name="accessLogPath" label="Access Log Path">
            <Input placeholder="e.g., /var/log/nginx/access.log" />
          </Form.Item>

          <Form.Item name="errorLogPath" label="Error Log Path">
            <Input placeholder="e.g., /var/log/nginx/error.log" />
          </Form.Item>

          <Form.Item name="additionalConfig" label="Additional Configuration">
            <TextArea
              rows={4}
              placeholder="Additional NGINX configuration..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Servers;
