import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Switch,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest } from "../types";

const { TextArea } = Input;

const Certificates: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await api.get("/certificates");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCertificateRequest) =>
      api.post("/certificates", data),
    onSuccess: () => {
      message.success("Certificate created successfully");
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: () => {
      message.error("Failed to create certificate");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCertificateRequest }) =>
      api.patch(`/certificates/${id}`, data),
    onSuccess: () => {
      message.success("Certificate updated successfully");
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingCertificate(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: () => {
      message.error("Failed to update certificate");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/certificates/${id}`),
    onSuccess: () => {
      message.success("Certificate deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: () => {
      message.error("Failed to delete certificate");
    },
  });

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingCertificate(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (certificate: Certificate) => {
    setIsEditMode(true);
    setEditingCertificate(certificate);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: certificate.name,
      certificate: certificate.certificate,
      privateKey: certificate.privateKey,
      expiresAt: certificate.expiresAt ? dayjs(certificate.expiresAt) : null,
      issuer: certificate.issuer,
      autoRenew: certificate.autoRenew,
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const formData = {
        name: values.name,
        certificate: values.certificate,
        privateKey: values.privateKey,
        expiresAt: values.expiresAt
          ? values.expiresAt.toISOString()
          : undefined,
        issuer: values.issuer,
        autoRenew: values.autoRenew,
      };
      
      if (isEditMode && editingCertificate) {
        updateMutation.mutate({ id: editingCertificate.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setEditingCertificate(null);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this certificate?",
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
      title: "Issuer",
      dataIndex: "issuer",
      key: "issuer",
    },
    {
      title: "Expires At",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date: string) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch (error) {
          return 'Invalid Date';
        }
      },
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Certificate) => (
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
        <h1>Certificates</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Certificate
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={certificates}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title={isEditMode ? "Edit Certificate" : "Create New Certificate"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            autoRenew: false,
          }}
        >
          <Form.Item
            name="name"
            label="Certificate Name"
            rules={[
              { required: true, message: "Please enter certificate name" },
            ]}
          >
            <Input placeholder="Enter certificate name" />
          </Form.Item>

          <Form.Item
            name="issuer"
            label="Issuer"
            rules={[{ required: true, message: "Please enter issuer" }]}
          >
            <Input placeholder="e.g., Let's Encrypt, DigiCert" />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="Expiry Date"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select expiry date"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="certificate"
            label="Certificate Content"
            rules={[
              { required: true, message: "Please enter certificate content" },
            ]}
          >
            <TextArea
              rows={8}
              placeholder="Paste your certificate content here (PEM format)"
            />
          </Form.Item>

          <Form.Item
            name="privateKey"
            label="Private Key"
            rules={[{ required: true, message: "Please enter private key" }]}
          >
            <TextArea
              rows={8}
              placeholder="Paste your private key here (PEM format)"
            />
          </Form.Item>

          <Form.Item
            name="autoRenew"
            label="Auto Renew"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Certificates;
