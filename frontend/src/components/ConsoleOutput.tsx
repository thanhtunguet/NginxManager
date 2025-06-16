import React from "react";
import { Card, Typography, Tag, Space, Collapse } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Panel } = Collapse;

interface ConsoleOutputProps {
  logs: string;
  command: string;
  success: boolean;
  timestamp: string;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  logs,
  command,
  success,
  timestamp,
}) => {
  const formatLogs = (logText: string) => {
    if (!logText) return "No output";

    return logText.split("\n").map((line, index) => (
      <div key={index} style={{ fontFamily: "monospace", fontSize: "12px" }}>
        {line}
      </div>
    ));
  };

  const getCommandType = (cmd: string) => {
    if (cmd.includes("nginx -t")) return "Test";
    if (cmd.includes("nginx -s reload")) return "Reload";
    return "Custom";
  };

  return (
    <Card
      size="small"
      style={{
        backgroundColor: "#1e1e1e",
        border: "1px solid #333",
        marginTop: "16px",
      }}
      bodyStyle={{ padding: "12px" }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <CodeOutlined style={{ color: "#00ff00" }} />
            <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
              {getCommandType(command)} Command
            </Text>
            <Tag
              color={success ? "green" : "red"}
              icon={success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            >
              {success ? "SUCCESS" : "FAILED"}
            </Tag>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: "#888888" }} />
            <Text style={{ color: "#888888", fontSize: "12px" }}>
              {timestamp}
            </Text>
          </Space>
        </div>

        {/* Command */}
        <div
          style={{
            backgroundColor: "#2d2d2d",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <Text
            style={{
              color: "#00ff00",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            $ {command}
          </Text>
        </div>

        {/* Output */}
        <Collapse
          size="small"
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Panel
            header={
              <Text style={{ color: "#ffffff", fontSize: "12px" }}>
                View Output ({logs.split("\n").length} lines)
              </Text>
            }
            key="output"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                backgroundColor: "#000000",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #333",
              }}
            >
              <div style={{ color: "#ffffff" }}>{formatLogs(logs)}</div>
            </div>
          </Panel>
        </Collapse>
      </Space>
    </Card>
  );
};

export default ConsoleOutput;
