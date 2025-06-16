import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card } from "antd";
import {
  nginxLanguageDefinition,
  nginxLanguageConfig,
} from "../config/monaco-nginx";

interface NginxConfigEditorProps {
  value: string;
  height?: string;
  readOnly?: boolean;
  onChange?: (value: string | undefined) => void;
}

const NginxConfigEditor: React.FC<NginxConfigEditorProps> = ({
  value,
  height = "400px",
  readOnly = true,
  onChange,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Register NGINX language
    monaco.languages.register({ id: "nginx" });
    monaco.languages.setMonarchTokensProvider("nginx", nginxLanguageDefinition);
    monaco.languages.setLanguageConfiguration("nginx", nginxLanguageConfig);

    // Set NGINX-specific theme colors
    monaco.editor.defineTheme("nginx-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "string", foreground: "CE9178" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "number", foreground: "B5CEA8" },
        { token: "delimiter.bracket", foreground: "D4D4D4" },
        { token: "delimiter", foreground: "D4D4D4" },
        { token: "identifier", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editor.lineHighlightBackground": "#2A2D2E",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    });

    monaco.editor.setTheme("nginx-dark");
  };

  return (
    <Card style={{ marginBottom: "16px" }}>
      <Editor
        height={height}
        language="nginx"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "always",
          renderLineHighlight: "all",
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: "line",
          glyphMargin: true,
          useTabStops: false,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </Card>
  );
};

export default NginxConfigEditor;
