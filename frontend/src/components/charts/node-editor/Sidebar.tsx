import { useCallback } from 'react';
import { Node, useReactFlow, useStore } from '@xyflow/react';
import { Select } from 'antd';

const transformSelector = (state: any) => state.transform;

export default ({ nodes, setNodes }: { nodes: Node[]; setNodes: any }) => {
    const transform = useStore(transformSelector);
    const { setCenter } = useReactFlow();

    const selectNode = useCallback((value: string) => {
        setNodes((nodes: Node[]) =>
            nodes.map((node) => {
                let isSelected: boolean = node.id === value;
                return {
                    ...node,
                    selected: isSelected,
                    style: {
                        ...node.style,
                        backgroundColor: isSelected ? '#eee' : '#fff',
                        border: isSelected ? '2px solid #000' : '1px solid #ddd',
                    },
                };
            }),
        );
        const nodeToFocus = nodes.find((n) => n.id === value);
        if (nodeToFocus) {
            setCenter(nodeToFocus.position.x, nodeToFocus.position.y, {
                zoom: 1.2, // adjust as needed
                duration: 800,
            });
        }

    }, [setNodes]);

    return (
        <aside>
            <div className="description">
                This is an example of how you can access the internal state outside of the ReactFlow component.
            </div>
            <Select
                showSearch
                placeholder="Select a node"
                optionFilterProp="id"
                onSelect={(value: string) => {
                    selectNode(value);
                }
                }
                filterOption={(input: string, option?: { value: string }) =>
                    (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: 200 }}
            >
                {nodes.map((node) => (
                    <Select.Option key={node.id} value={node.id}>
                        {node.id}
                    </Select.Option>
                ))}
            </Select>

            <div className="title">Zoom & pan transform</div>
            <div className="transform">
                [{transform[0].toFixed(2)}, {transform[1].toFixed(2)}, {transform[2].toFixed(2)}]
            </div>
            <div className="title">Nodes</div>
            {nodes.map((node) => (
                <div key={node.id}>
                    Node {node.id} - x: {node.position.x.toFixed(2)}, y: {node.position.y.toFixed(2)}
                </div>
            ))}

        </aside>
    );
};
