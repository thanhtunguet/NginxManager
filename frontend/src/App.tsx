import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import NginxConfig from "./pages/NginxConfig";
import Upstreams from "./pages/Upstreams";
import Domains from "./pages/Domains";
import Certificates from "./pages/Certificates";
import ListeningPorts from "./pages/ListeningPorts";
import NginxServiceSettings from "./pages/NginxServiceSettings";
import "./App.css";

const { Content } = Layout;

function App() {
  return (
    <Layout className="nginx-manager-layout">
      <Sidebar />
      <Layout>
        <Content className="nginx-manager-content">
          <Routes>
            <Route path="/" element={<NginxConfig />} />
            <Route path="/upstreams" element={<Upstreams />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/listening-ports" element={<ListeningPorts />} />
            <Route path="/nginx-config" element={<NginxConfig />} />
            <Route path="/nginx-settings" element={<NginxServiceSettings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
