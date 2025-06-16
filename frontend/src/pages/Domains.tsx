import React, {useState} from "react";
import {Button, Form, Input, message, Modal, Space, Table} from "antd";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import api from "../services/api";
import {CreateDomainRequest, Domain, UpdateDomainRequest} from "../types";

const Domains: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const {data: domains = [], isLoading} = useQuery<Domain[]>({
        queryKey: ["domains"],
        queryFn: async () => {
            const response = await api.get("/domains");
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateDomainRequest) => api.post("/domains", data),
        onSuccess: () => {
            message.success("Domain created successfully");
            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({queryKey: ["domains"]});
        },
        onError: () => {
            message.error("Failed to create domain");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: { id: string; data: UpdateDomainRequest }) =>
            api.patch(`/domains/${id}`, data),
        onSuccess: () => {
            message.success("Domain updated successfully");
            setIsModalVisible(false);
            setIsEditMode(false);
            setEditingDomain(null);
            form.resetFields();
            queryClient.invalidateQueries({queryKey: ["domains"]});
        },
        onError: () => {
            message.error("Failed to update domain");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/domains/${id}`),
        onSuccess: () => {
            message.success("Domain deleted successfully");
            queryClient.invalidateQueries({queryKey: ["domains"]});
        },
        onError: () => {
            message.error("Failed to delete domain");
        },
    });

    const handleCreate = () => {
        setIsEditMode(false);
        setEditingDomain(null);
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleEdit = (domain: Domain) => {
        setIsEditMode(true);
        setEditingDomain(domain);
        setIsModalVisible(true);
        form.setFieldsValue({
            domain: domain.domain,
        });
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            if (isEditMode && editingDomain) {
                updateMutation.mutate({id: editingDomain.id, data: values});
            } else {
                createMutation.mutate(values);
            }
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setIsEditMode(false);
        setEditingDomain(null);
        form.resetFields();
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: "Are you sure you want to delete this domain?",
            content: "This action cannot be undone.",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const columns = [
        {
            title: "Domain",
            dataIndex: "domain",
            key: "domain",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Domain) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined/>}
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
                <h1>Domains</h1>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                    Add Domain
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={domains}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />

            <Modal
                title={isEditMode ? "Edit Domain" : "Create New Domain"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                width={500}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="domain"
                        label="Domain Name"
                        rules={[
                            {required: true, message: "Please enter domain name"},
                            {
                                pattern:
                                    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
                                message: "Please enter a valid domain name",
                            },
                        ]}
                    >
                        <Input placeholder="e.g., example.com"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Domains;
