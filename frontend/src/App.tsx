import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upstreams from "./pages/Upstreams";
import Servers from "./pages/Servers";
import Domains from "./pages/Domains";
import Certificates from "./pages/Certificates";
import "./App.css";

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Content
          style={{ margin: "24px 16px", padding: 24, background: "#fff" }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upstreams" element={<Upstreams />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
