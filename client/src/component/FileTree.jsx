const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes;
    return (
        <div onClick={(e) => {
            e.stopPropagation();
            if (isDir) return;
            onSelect(path);
        }}>
            <p className={isDir ? "" : 'file-node'}>{fileName}</p>
            {nodes && fileName !== "node_modules" &&(
                <ul style={{ marginLeft: "10px" }}>
                    {Object.keys(nodes).map((child) => (
                        <li key={child}>
                            <FileTreeNode onSelect={onSelect} path={path + '/' + child} fileName={child} nodes={nodes[child]} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const File = ({ tree, onSelect }) => {
    return (
        <FileTreeNode onSelect={onSelect} fileName="/" path="" nodes={tree} />
    );
}
export default File;
