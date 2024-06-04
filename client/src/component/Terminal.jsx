import { Terminal as XTerminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import socket from "../socket";
import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
    const terminalRef = useRef();
    const isRendered = useRef(false);

    useEffect(() => {
        if (isRendered.current) return;
        isRendered.current = true;

        const term = new XTerminal({
            rows: 10,
        });
        term.open(terminalRef.current);

        // Send the data to the backend with socket
        term.onData((data) => socket.emit('terminal:write', data));

        // Receive the data through backend
        socket.on('terminal:data', (data) => term.write(data));
    }, []);

    return (
        <div id="terminal" ref={terminalRef} />
    );
};

export default Terminal;
