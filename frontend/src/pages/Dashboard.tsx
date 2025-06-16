import React from "react";
import {Card, Col, Row, Statistic, Table, Tag} from "antd";
import {useQuery} from "@tanstack/react-query";
import {CloudServerOutlined, GlobalOutlined, SafetyCertificateOutlined, SettingOutlined,} from "@ant-design/icons";
import api from "../services/api";
import {Certificate, Domain, HttpServer, Upstream} from "../types";

const Dashboard: React.FC = () => {
    const {data: upstreams = []} = useQuery<Upstream[]>({
        queryKey: ["upstreams"],
        queryFn: async () => {
            const response = await api.get("/upstreams");
            return response.data;
        },
    });

    const {data: servers = []} = useQuery<HttpServer[]>({
        queryKey: ["servers"],
        queryFn: async () => {
            const response = await api.get("/servers");
            return response.data;
        },
    });

    const {data: domains = []} = useQuery<Domain[]>({
        queryKey: ["domains"],
        queryFn: async () => {
            const response = await api.get("/domains");
            return response.data;
        },
    });

    const {data: certificates = []} = useQuery<Certificate[]>({
        queryKey: ["certificates"],
        queryFn: async () => {
            const response = await api.get("/certificates");
            return response.data;
        },
    });

    const activeUpstreams = upstreams.filter((u) => u.status === "active").length;
    const activeServers = servers.filter((s) => s.status === "active").length;
    const expiringCertificates = certificates.filter((c) => {
        const expiryDate = new Date(c.expiresAt);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
    }).length;

    const recentUpstreams = upstreams.slice(0, 5);
    const recentServers = servers.slice(0, 5);

    return (
        <div>
            <h1>Dashboard</h1>

            <Row gutter={16} style={{marginBottom: 24}}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Active Upstreams"
                            value={activeUpstreams}
                            prefix={<CloudServerOutlined/>}
                            valueStyle={{color: "#3f8600"}}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Active Servers"
                            value={activeServers}
                            prefix={<SettingOutlined/>}
                            valueStyle={{color: "#1890ff"}}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Domains"
                            value={domains.length}
                            prefix={<GlobalOutlined/>}
                            valueStyle={{color: "#722ed1"}}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Expiring Certificates"
                            value={expiringCertificates}
                            prefix={<SafetyCertificateOutlined/>}
                            valueStyle={{
                                color: expiringCertificates > 0 ? "#cf1322" : "#3f8600",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Recent Upstreams" style={{marginBottom: 16}}>
                        <Table
                            rowKey={(record) => record.id}
                            dataSource={recentUpstreams}
                            columns={[
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
                                    title: "Status",
                                    dataIndex: "status",
                                    key: "status",
                                    render: (status: string) => (
                                        <Tag color={status === "active" ? "green" : "red"}>
                                            {status}
                                        </Tag>
                                    ),
                                },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Recent Servers" style={{marginBottom: 16}}>
                        <Table
                            rowKey={(record) => record.id}
                            dataSource={recentServers}
                            columns={[
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
                                        <Tag color={status === "active" ? "green" : "red"}>
                                            {status}
                                        </Tag>
                                    ),
                                },
                                {
                                    title: "Log Level",
                                    dataIndex: "logLevel",
                                    key: "logLevel",
                                },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
