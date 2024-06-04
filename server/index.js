const http = require('http');
const express = require('express');
const os = require('os');
const pty = require('node-pty');
const path = require('path');
const fs = require('fs').promises;
const { Server: socketServer } = require('socket.io');
const cors = require('cors');
const chokidar = require('chokidar');
const app = express();
app.use(cors());




const server = http.createServer(app);
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const userDir = path.join(__dirname, 'user');
const mkdirp = require('mkdirp');

// Ensure the directory exists or create it
mkdirp.sync(userDir);

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: userDir,
    env: process.env
});
const io = new socketServer({
    cors: '*'
});
io.attach(server);

ptyProcess.onData((data) => io.emit('terminal:data', data));

io.on('connection', (socket) => {
    console.log(`socket connected `, socket.id);

    socket.emit('file:refresh');

    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    });

    socket.on('file:change', async ({ path, content }) => {
        await fs.writeFile(`./user${path}`, content)
    })

});
// route to fetch the content for file
app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, 'utf-8');
    return res.json({ content });
})

// route to display the files
app.get('/files', async (req, res) => {
    const fileTree = await generateFileTree(userDir);
    return res.json({ tree: fileTree });
});

// Monitoring whenever the file changes in the user directiory
chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path)
});



// function to build the files structure(Tree Like structure)
async function generateFileTree(directory) {
    const tree = {};
    async function buildTree(currDir, currentTree) {
        const files = await fs.readdir(currDir);

        for (const file of files) {
            const filePath = path.join(currDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                currentTree[file] = null;
            }
        }
    }
    await buildTree(directory, tree);
    return tree;
}

server.listen(9000, () => console.log(`🐋 docker server listening on 9000`));
