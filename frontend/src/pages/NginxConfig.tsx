import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Input,
  Collapse,
  Spin,
  Alert,
  Tag,
  Space,
  Modal,
  Tooltip,
  message,
  Row,
  Col,
  List,
} from "antd";
import {
  ExpandAltOutlined,
  DownloadOutlined,
  SaveOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const API_BASE_URL = "http://localhost:3000/api/v1";

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  validatedAt: string;
}

interface ConfigVersion {
  id: number;
  config: string;
  serverId?: number;
  createdAt: string;
  isActive: boolean;
}

const NginxConfig: React.FC = () => {
  const [config, setConfig] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [selectedServerId, setSelectedServerId] = useState<string>("");

  const generateFullConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/nginx-config/full`);
      setConfig(response.data.config);
      await validateConfig(response.data.config);
      message.success("Configuration generated successfully!");
    } catch (error) {
      console.error("Error generating config:", error);
      message.error("Failed to generate configuration");
    } finally {
      setLoading(false);
    }
  };

  const generateServerConfig = async (serverId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nginx-config/server/${serverId}`
      );
      setConfig(response.data.config);
      await validateConfig(response.data.config);
      message.success(`Server configuration generated successfully!`);
    } catch (error) {
      console.error("Error generating server config:", error);
      message.error("Failed to generate server configuration");
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = async (configToValidate = config) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nginx-config/validate`);
      setValidation(response.data);
    } catch (error) {
      console.error("Error validating config:", error);
      message.error("Failed to validate configuration");
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const url = selectedServerId
        ? `${API_BASE_URL}/nginx-config/save?serverId=${selectedServerId}`
        : `${API_BASE_URL}/nginx-config/save`;

      await axios.post(url);
      await loadVersions();
      message.success("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      message.error("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const downloadConfig = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nginx-config/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `nginx-config-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.conf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Configuration downloaded successfully!");
    } catch (error) {
      console.error("Error downloading config:", error);
      message.error("Failed to download configuration");
    }
  };

  const downloadServerConfig = async (serverId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/nginx-config/download/server/${serverId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `nginx-server-${serverId}-config-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.conf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Server configuration downloaded successfully!");
    } catch (error) {
      console.error("Error downloading server config:", error);
      message.error("Failed to download server configuration");
    }
  };

  const loadVersions = async () => {
    try {
      const url = selectedServerId
        ? `${API_BASE_URL}/nginx-config/versions?serverId=${selectedServerId}`
        : `${API_BASE_URL}/nginx-config/versions`;

      const response = await axios.get(url);
      setVersions(response.data.versions);
    } catch (error) {
      console.error("Error loading versions:", error);
      message.error("Failed to load configuration versions");
    }
  };

  useEffect(() => {
    loadVersions();
  }, [selectedServerId]);

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>NGINX Configuration Generator</Title>

      {/* Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Button
              type="primary"
              icon={loading ? <Spin size="small" /> : <ReloadOutlined />}
              onClick={generateFullConfig}
              loading={loading}
            >
              Generate Full Config
            </Button>
          </Col>

          <Col>
            <Input
              placeholder="Server ID (optional)"
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              style={{ width: 150 }}
            />
          </Col>

          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                selectedServerId &&
                generateServerConfig(parseInt(selectedServerId))
              }
              disabled={loading || !selectedServerId}
            >
              Generate Server Config
            </Button>
          </Col>

          <Col>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => validateConfig()}
              disabled={loading || !config}
            >
              Validate
            </Button>
          </Col>

          <Col>
            <Button
              icon={<SaveOutlined />}
              onClick={saveConfig}
              disabled={loading || !config}
            >
              Save Version
            </Button>
          </Col>

          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadConfig}
              disabled={loading || !config}
            >
              Download
            </Button>
          </Col>

          <Col>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setPreviewOpen(true)}
              disabled={!config}
            >
              Preview
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Validation Results */}
      {validation && (
        <Card style={{ marginBottom: "24px" }}>
          <Space align="center" style={{ marginBottom: "16px" }}>
            <Title level={4} style={{ margin: 0 }}>
              Validation Results:
            </Title>
            <Tag
              icon={
                validation.valid ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
              color={validation.valid ? "success" : "error"}
            >
              {validation.valid ? "Valid" : "Invalid"}
            </Tag>
          </Space>

          {validation.errors && validation.errors.length > 0 && (
            <Space direction="vertical" style={{ width: "100%" }}>
              {validation.errors.map((error, index) => (
                <Alert key={index} message={error} type="error" showIcon />
              ))}
            </Space>
          )}
        </Card>
      )}

      {/* Configuration Display */}
      {config && (
        <Collapse defaultActiveKey={["1"]} style={{ marginBottom: "24px" }}>
          <Panel header="Generated Configuration" key="1">
            <TextArea
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              rows={20}
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
              }}
            />
          </Panel>
        </Collapse>
      )}

      {/* Configuration Versions */}
      {versions.length > 0 && (
        <Collapse style={{ marginBottom: "24px" }}>
          <Panel header={`Configuration Versions (${versions.length})`} key="1">
            <List
              dataSource={versions}
              renderItem={(version) => (
                <List.Item
                  actions={[
                    <Tooltip title="Load this version">
                      <Button
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={() => setConfig(version.config)}
                      />
                    </Tooltip>,
                    <Tooltip title="Preview this version">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setConfig(version.config);
                          setPreviewOpen(true);
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>Version #{version.id}</Text>
                        {version.isActive && <Tag color="blue">Active</Tag>}
                      </Space>
                    }
                    description={
                      <Text type="secondary">
                        Created: {new Date(version.createdAt).toLocaleString()}
                        {version.serverId &&
                          ` | Server ID: ${version.serverId}`}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      )}

      {/* Preview Modal */}
      <Modal
        title="Configuration Preview"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadConfig}
          >
            Download
          </Button>,
        ]}
      >
        <TextArea
          value={config}
          rows={25}
          readOnly
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        />
      </Modal>
    </div>
  );
};

export default NginxConfig;
