import React, {useEffect, useState} from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined,} from "@ant-design/icons";
import axios from "axios";

const {Title} = Typography;
const {Option} = Select;

interface ListeningPort {
    id: number;
    name: string;
    port: number;
    protocol: string;
    ssl: boolean;
    http2: boolean;
}

interface ListeningPortFormData {
    name: string;
    port: number;
    protocol: string;
    ssl: boolean;
    http2: boolean;
}

const API_BASE_URL = "http://localhost:3000/api/v1";

const ListeningPorts: React.FC = () => {
    const [listeningPorts, setListeningPorts] = useState<ListeningPort[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingPort, setEditingPort] = useState<ListeningPort | null>(null);
    const [form] = Form.useForm();

    const fetchListeningPorts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/listening-ports`);
            setListeningPorts(response.data);
        } catch (error) {
            console.error("Error fetching listening ports:", error);
            message.error("Failed to fetch listening ports");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: ListeningPortFormData) => {
        try {
            await axios.post(`${API_BASE_URL}/listening-ports`, values);
            message.success("Listening port created successfully!");
            setModalVisible(false);
            form.resetFields();
            fetchListeningPorts();
        } catch (error) {
            console.error("Error creating listening port:", error);
            message.error("Failed to create listening port");
        }
    };

    const handleUpdate = async (id: number, values: ListeningPortFormData) => {
        try {
            await axios.patch(`${API_BASE_URL}/listening-ports/${id}`, values);
            message.success("Listening port updated successfully!");
            setModalVisible(false);
            setEditingPort(null);
            form.resetFields();
            fetchListeningPorts();
        } catch (error) {
            console.error("Error updating listening port:", error);
            message.error("Failed to update listening port");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/listening-ports/${id}`);
            message.success("Listening port deleted successfully!");
            fetchListeningPorts();
        } catch (error) {
            console.error("Error deleting listening port:", error);
            message.error("Failed to delete listening port");
        }
    };

    const handleEdit = (port: ListeningPort) => {
        setEditingPort(port);
        form.setFieldsValue({
            name: port.name,
            port: port.port,
            protocol: port.protocol,
            ssl: port.ssl,
            http2: port.http2,
        });
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingPort(null);
        form.resetFields();
    };

    const onFinish = (values: ListeningPortFormData) => {
        if (editingPort) {
            handleUpdate(editingPort.id, values);
        } else {
            handleCreate(values);
        }
    };

    useEffect(() => {
        fetchListeningPorts();
    }, []);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Port",
            dataIndex: "port",
            key: "port",
            render: (port: number) => <Tag color="blue">{port}</Tag>,
        },
        {
            title: "Protocol",
            dataIndex: "protocol",
            key: "protocol",
            render: (protocol: string) => (
                <Tag color={protocol === "https" ? "green" : "orange"}>
                    {protocol.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "SSL",
            dataIndex: "ssl",
            key: "ssl",
            render: (ssl: boolean) => (
                <Tag color={ssl ? "green" : "default"}>
                    {ssl ? "Enabled" : "Disabled"}
                </Tag>
            ),
        },
        {
            title: "HTTP/2",
            dataIndex: "http2",
            key: "http2",
            render: (http2: boolean) => (
                <Tag color={http2 ? "green" : "default"}>
                    {http2 ? "Enabled" : "Disabled"}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            dataIndex: "id",
            render: (_: number, record: ListeningPort) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined/>}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this listening port?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined/>}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: "24px"}}>
            <Card>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                    }}
                >
                    <Title level={2} style={{margin: 0}}>
                        Listening Ports
                    </Title>
                    <Space>
                        <Button icon={<ReloadOutlined/>} onClick={fetchListeningPorts}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModalVisible(true)}
                        >
                            Add Listening Port
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={listeningPorts}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: listeningPorts.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Card>

            <Modal
                title={editingPort ? "Edit Listening Port" : "Add Listening Port"}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        protocol: "http",
                        ssl: false,
                        http2: false,
                    }}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            {required: true, message: "Please enter a name"},
                            {min: 2, message: "Name must be at least 2 characters"},
                        ]}
                    >
                        <Input placeholder="e.g., Main HTTP Port, HTTPS Port"/>
                    </Form.Item>

                    <Form.Item
                        label="Port Number"
                        name="port"
                        rules={[
                            {required: true, message: "Please enter a port number"},
                            {
                                type: "number",
                                min: 1,
                                max: 65535,
                                message: "Port must be between 1 and 65535",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{width: "100%"}}
                            placeholder="e.g., 80, 443, 8080"
                            min={1}
                            max={65535}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Protocol"
                        name="protocol"
                        rules={[{required: true, message: "Please select a protocol"}]}
                    >
                        <Select placeholder="Select protocol">
                            <Option value="http">HTTP</Option>
                            <Option value="https">HTTPS</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="SSL/TLS" name="ssl" valuePropName="checked">
                        <Switch/>
                    </Form.Item>

                    <Form.Item label="HTTP/2" name="http2" valuePropName="checked">
                        <Switch/>
                    </Form.Item>

                    <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
                        <Space>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {editingPort ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ListeningPorts;
