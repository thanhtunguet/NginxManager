import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Input,
  Form,
  Space,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import NginxConfigEditor from "../components/NginxConfigEditor";
import ConsoleOutput from "../components/ConsoleOutput";

const { Title, Text } = Typography;

const API_BASE_URL = "http://localhost:3000/api/v1";

interface NginxServiceSettings {
  configPath: string;
  testCommand: string;
  reloadCommand: string;
}

interface CommandResult {
  success: boolean;
  logs: string;
  command: string;
  timestamp: string;
}

const NginxServiceSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<NginxServiceSettings>({
    configPath: "/etc/nginx/nginx.conf",
    testCommand: "#!/bin/bash\nnginx -t",
    reloadCommand: "#!/bin/bash\nnginx -s reload",
  });
  const [lastTestResult, setLastTestResult] = useState<CommandResult | null>(
    null
  );
  const [lastReloadResult, setLastReloadResult] =
    useState<CommandResult | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/nginx-settings`);
      setSettings(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error("Error loading settings:", error);
      // Use default settings if API fails
      form.setFieldsValue(settings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (values: NginxServiceSettings) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/nginx-settings`, values);
      setSettings(values);
      message.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      await saveSettings(values);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const testNginxConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/nginx-settings/test`);
      const result: CommandResult = {
        success: response.data.success,
        logs: response.data.logs || "",
        command: response.data.command || "",
        timestamp: new Date().toLocaleString(),
      };
      setLastTestResult(result);

      if (response.data.success) {
        message.success("NGINX configuration test passed!");
      } else {
        message.error("NGINX configuration test failed!");
      }
    } catch (error) {
      console.error("Error testing nginx config:", error);
      message.error("Failed to test NGINX configuration");
      setLastTestResult({
        success: false,
        logs: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        command: "Command execution failed",
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const reloadNginxService = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/nginx-settings/reload`
      );
      const result: CommandResult = {
        success: response.data.success,
        logs: response.data.logs || "",
        command: response.data.command || "",
        timestamp: new Date().toLocaleString(),
      };
      setLastReloadResult(result);

      if (response.data.success) {
        message.success("NGINX service reloaded successfully!");
      } else {
        message.error("Failed to reload NGINX service!");
      }
    } catch (error) {
      console.error("Error reloading nginx service:", error);
      message.error("Failed to reload NGINX service");
      setLastReloadResult({
        success: false,
        logs: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        command: "Command execution failed",
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleFormChange = (
    _changedValues: any,
    allValues: NginxServiceSettings
  ) => {
    setSettings(allValues);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>NGINX Service Settings</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={saveSettings}
        onValuesChange={handleFormChange}
        initialValues={settings}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Configuration Path" style={{ marginBottom: "24px" }}>
              <Form.Item
                name="configPath"
                label="Path to save NGINX configuration"
                rules={[
                  {
                    required: true,
                    message: "Please enter the configuration path",
                  },
                ]}
              >
                <Input
                  placeholder="/etc/nginx/nginx.conf"
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>
              <Text type="secondary">
                This is the path where generated NGINX configurations will be
                saved.
              </Text>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Test Command" style={{ marginBottom: "24px" }}>
              <Form.Item
                name="testCommand"
                label="Command to test NGINX configuration"
                rules={[
                  { required: true, message: "Please enter the test command" },
                ]}
              >
                <NginxConfigEditor
                  value={settings.testCommand}
                  height="200px"
                  readOnly={false}
                  onChange={(value) => {
                    form.setFieldValue("testCommand", value || "");
                    setSettings((prev) => ({
                      ...prev,
                      testCommand: value || "",
                    }));
                  }}
                />
              </Form.Item>
              <Text type="secondary">
                This command will be executed to validate NGINX configuration
                syntax.
              </Text>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Reload Command" style={{ marginBottom: "24px" }}>
              <Form.Item
                name="reloadCommand"
                label="Command to apply/reload NGINX service"
                rules={[
                  {
                    required: true,
                    message: "Please enter the reload command",
                  },
                ]}
              >
                <NginxConfigEditor
                  value={settings.reloadCommand}
                  height="200px"
                  readOnly={false}
                  onChange={(value) => {
                    form.setFieldValue("reloadCommand", value || "");
                    setSettings((prev) => ({
                      ...prev,
                      reloadCommand: value || "",
                    }));
                  }}
                />
              </Form.Item>
              <Text type="secondary">
                This command will be executed to reload NGINX with the new
                configuration.
              </Text>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Space size="large">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSettings}
            loading={loading}
          >
            Save Settings
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={loadSettings}
            loading={loading}
          >
            Reload Settings
          </Button>

          <Button
            icon={<ExperimentOutlined />}
            onClick={testNginxConfig}
            loading={loading}
          >
            Test Configuration
          </Button>

          <Button
            icon={<PlayCircleOutlined />}
            onClick={reloadNginxService}
            loading={loading}
            danger
          >
            Reload NGINX Service
          </Button>
        </Space>

        {/* Console Output Section */}
        {(lastTestResult || lastReloadResult) && (
          <>
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                Command Execution Logs
              </Title>
              <Button
                size="small"
                onClick={() => {
                  setLastTestResult(null);
                  setLastReloadResult(null);
                }}
              >
                Clear Logs
              </Button>
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              {lastTestResult && (
                <ConsoleOutput
                  logs={lastTestResult.logs}
                  command={lastTestResult.command}
                  success={lastTestResult.success}
                  timestamp={lastTestResult.timestamp}
                />
              )}

              {lastReloadResult && (
                <ConsoleOutput
                  logs={lastReloadResult.logs}
                  command={lastReloadResult.command}
                  success={lastReloadResult.success}
                  timestamp={lastReloadResult.timestamp}
                />
              )}
            </Space>
          </>
        )}
      </Form>
    </div>
  );
};

export default NginxServiceSettings;
