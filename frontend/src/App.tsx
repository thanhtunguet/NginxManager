import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upstreams from "./pages/Upstreams";
import Servers from "./pages/Servers";
import Domains from "./pages/Domains";
import Certificates from "./pages/Certificates";
import NginxConfig from "./pages/NginxConfig";
import "./App.css";

const { Content } = Layout;

function App() {
  return (
    <Layout className="nginx-manager-layout">
      <Sidebar />
      <Layout>
        <Content className="nginx-manager-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upstreams" element={<Upstreams />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/nginx-config" element={<NginxConfig />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
