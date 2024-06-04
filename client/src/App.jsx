import { useCallback, useEffect, useState } from "react";
import Terminal from "./component/Terminal";
import File from "./component/FileTree";
import socket from "./socket";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "./App.css";

function App() {
  const [tree, setFileTree] = useState({});
  const [selectedPath, setSelectedPath] = useState('');
  const [code, setCode] = useState('');
  const [content, setContent] = useState('');

  const fetchFile = useCallback(async () => {
    const response = await fetch('http://localhost:9000/files');
    const data = await response.json();
    setFileTree(data.tree);
  }, []);

  const getFileContent = useCallback(async () => {
    if (!selectedPath) return;
    const response = await fetch(`http://localhost:9000/files/content?path=${selectedPath}`);
    const result = await response.json();
    setContent(result.content);
  }, [selectedPath]);

  useEffect(() => {
    setCode("");
  }, [selectedPath]);

  useEffect(() => {
    if (selectedPath) getFileContent();
  }, [selectedPath, getFileContent]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  useEffect(() => {
    if (selectedPath && content) {
      setCode(content);
    }
  }, [selectedPath, content]);

  useEffect(() => {
    socket.on('file:refresh', fetchFile);
    return () => {
      socket.off('file:refresh', fetchFile);
    };
  }, [fetchFile]);

  useEffect(() => {
    if (code && content !== code) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedPath,
          content: code,
        });
        setContent(code); 
      }, 3000);

      return () => { clearTimeout(timer); };
    }
  }, [code, selectedPath, content]);

  const isSaved = content === code;

  return (
    <div className="playground-container">
      <div className="editor-container">
        <div className="file-container">
          <File tree={tree} onSelect={(path) => setSelectedPath(path)} />
        </div>
        <div className="ide-container">
          {selectedPath && (
            <p>{selectedPath.replaceAll("/", "> ")} {isSaved ? "saved" : "unsaved"}</p>
          )}
          <AceEditor
            mode="javascript"
            theme="github"
            value={code}
            onChange={(newCode) => setCode(newCode)}
            name="ace-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="100%"
          />
        </div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
