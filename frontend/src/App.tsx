import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Certificates from "./pages/Certificates";
import Domains from "./pages/Domains";
import ListeningPorts from "./pages/ListeningPorts";
import NginxConfig from "./pages/NginxConfig";
import NginxServiceSettings from "./pages/NginxServiceSettings";
import Upstreams from "./pages/Upstreams";

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
