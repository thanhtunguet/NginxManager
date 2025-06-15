import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/upstreams",
      icon: <CloudServerOutlined />,
      label: "Upstreams",
    },
    {
      key: "/servers",
      icon: <SettingOutlined />,
      label: "Servers",
    },
    {
      key: "/domains",
      icon: <GlobalOutlined />,
      label: "Domains",
    },
    {
      key: "/certificates",
      icon: <SafetyCertificateOutlined />,
      label: "Certificates",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      width={200}
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <div style={{ padding: "16px", textAlign: "center" }}>
        <h2 style={{ margin: 0, color: "#1890ff" }}>NGINX Manager</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
