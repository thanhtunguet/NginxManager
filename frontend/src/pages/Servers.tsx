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
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../services/api";
import {
  HttpServer,
  CreateHttpServerRequest,
  UpdateHttpServerRequest,
  ListeningPort,
  Upstream,
  Certificate,
} from "../types";

const { Option } = Select;
const { TextArea } = Input;

const Servers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingServer, setEditingServer] = useState<HttpServer | null>(null);
  const [showCertificateField, setShowCertificateField] = useState(false);
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

  const { data: upstreams = [] } = useQuery<Upstream[]>({
    queryKey: ["upstreams"],
    queryFn: async () => {
      const response = await api.get("/upstreams");
      return response.data;
    },
  });

  const { data: certificates = [] } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await api.get("/certificates");
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHttpServerRequest }) =>
      api.patch(`/servers/${id}`, data),
    onSuccess: () => {
      message.success("Server updated successfully");
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingServer(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onError: () => {
      message.error("Failed to update server");
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
    setIsEditMode(false);
    setEditingServer(null);
    setShowCertificateField(false);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      logLevel: "info",
      locations: [
        { path: "/", upstreamId: undefined, clientMaxBodySize: "1m" },
      ],
    });
  };

  const handleEdit = (server: HttpServer) => {
    setIsEditMode(true);
    setEditingServer(server);
    setIsModalVisible(true);

    // Check if the selected port is HTTPS to show certificate field
    const selectedPort = listeningPorts.find(
      (port) => port.id === server.listeningPortId
    );
    setShowCertificateField(selectedPort?.ssl === true);

    form.setFieldsValue({
      listeningPortId: server.listeningPortId,
      name: server.name,
      logLevel: server.logLevel,
      accessLogPath: server.accessLogPath,
      errorLogPath: server.errorLogPath,
      additionalConfig: server.additionalConfig,
      certificateId: server.certificateId,
      locations:
        server.locations?.map((location) => ({
          upstreamId: location.upstreamId,
          path: location.path,
          additionalConfig: location.additionalConfig,
          clientMaxBodySize: location.clientMaxBodySize,
        })) || [],
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Ensure listeningPortId is a number and upstreamId in locations are numbers
      const formData = {
        ...values,
        listeningPortId: Number(values.listeningPortId),
        locations:
          values.locations?.map((location: any) => ({
            ...location,
            upstreamId: Number(location.upstreamId),
          })) || [],
      };

      if (isEditMode && editingServer) {
        updateMutation.mutate({ id: editingServer.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setEditingServer(null);
    setShowCertificateField(false);
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
            onClick={() => handleEdit(record)}
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
        title={isEditMode ? "Edit Server" : "Create New Server"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            logLevel: "info",
            locations: [
              { path: "/", upstreamId: undefined, clientMaxBodySize: "1m" },
            ],
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Server Name"
                rules={[
                  { required: true, message: "Please enter server name" },
                ]}
              >
                <Input placeholder="Enter server name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="listeningPortId"
                label="Listening Port"
                rules={[
                  { required: true, message: "Please select a listening port" },
                ]}
              >
                <Select
                  placeholder="Select a listening port"
                  showSearch
                  onChange={(value) => {
                    const selectedPort = listeningPorts.find(
                      (port) => Number(port.id) === value
                    );
                    const isHttps = selectedPort?.ssl === true;
                    setShowCertificateField(isHttps);
                    if (!isHttps) {
                      form.setFieldValue("certificateId", undefined);
                    }
                  }}
                >
                  {listeningPorts.map((port) => (
                    <Option key={port.id} value={Number(port.id)}>
                      {port.name} - Port {port.port} (
                      {port.protocol.toUpperCase()}){port.ssl && " SSL"}
                      {port.http2 && " HTTP/2"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {showCertificateField && (
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  name="certificateId"
                  label="SSL Certificate"
                  rules={[
                    {
                      required: true,
                      message: "Please select an SSL certificate",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select SSL certificate"
                    showSearch
                    allowClear
                  >
                    {certificates.map((cert) => (
                      <Option key={cert.id} value={Number(cert.id)}>
                        {cert.name} (Expires:{" "}
                        {new Date(cert.expiresAt).toLocaleDateString()})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="logLevel" label="Log Level">
                <Select>
                  <Option value="debug">Debug</Option>
                  <Option value="info">Info</Option>
                  <Option value="warn">Warn</Option>
                  <Option value="error">Error</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="accessLogPath" label="Access Log Path">
                <Input placeholder="e.g., /var/log/nginx/access.log" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="errorLogPath" label="Error Log Path">
                <Input placeholder="e.g., /var/log/nginx/error.log" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="additionalConfig" label="Additional Configuration">
            <TextArea
              rows={4}
              placeholder="Additional NGINX configuration..."
            />
          </Form.Item>

          <Divider>Location Blocks</Divider>

          <Form.List
            name="locations"
            initialValue={[
              { path: "/", upstreamId: undefined, clientMaxBodySize: "1m" },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    title={`Location Block ${name + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button type="link" danger onClick={() => remove(name)}>
                          Remove
                        </Button>
                      )
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "path"]}
                          label="Path"
                          rules={[
                            {
                              required: true,
                              message: "Please enter location path",
                            },
                          ]}
                        >
                          <Input placeholder="e.g., /, /api, /static" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "upstreamId"]}
                          label="Upstream"
                          rules={[
                            {
                              required: true,
                              message: "Please select an upstream",
                            },
                          ]}
                        >
                          <Select placeholder="Select upstream">
                            {upstreams.map((upstream) => (
                              <Option key={upstream.id} value={upstream.id}>
                                {upstream.name} ({upstream.server})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "clientMaxBodySize"]}
                          label="Max Body Size"
                        >
                          <Input placeholder="e.g., 1m, 10m, 100m" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, "additionalConfig"]}
                      label="Additional Location Config"
                    >
                      <TextArea
                        rows={2}
                        placeholder="Additional NGINX location configuration..."
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Location Block
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Servers;
