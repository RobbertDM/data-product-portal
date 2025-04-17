import '@xyflow/react/dist/style.css';

import type { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowProps } from '@xyflow/react';
import { Background, ConnectionLineType, Controls, ReactFlow, ReactFlowProvider, useNodesState } from '@xyflow/react';
import { Typography } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { edgeTypes, nodeTypes } from '@/components/charts/node-editor/node-types.ts';
import { defaultFitViewOptions } from '@/utils/node-editor.helper.ts';
import Sidebar from './Sidebar';

import styles from './node-editor.module.scss';
import { DataProductNode } from '../custom-nodes/data-product-node/data-product-node';
import { getDataProductTypeIcon } from '@/utils/data-product-type-icon.helper';

type Props = {
    nodes: Node[];
    edges: Edge[];
    onConnect: (connection: Connection) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    editorProps?: Omit<ReactFlowProps, 'nodes' | 'edges' | 'onConnect' | 'onNodesChange' | 'onEdgesChange'>;
    debug?: boolean;
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

// Changed this
const initialNodes: Node[] = [
    {
        id: 'node-1',
        type: 'input',
        data: { label: 'Node 1' },
        position: { x: 250, y: 5 },
    },
    { id: 'node-2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
    { id: 'node-3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
    { id: 'node-4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } },


];

export function NodeEditor({
    nodes = initialNodes,
    edges = [],
    onConnect,
    onNodesChange,
    onEdgesChange,
    debug,
    editorProps,
}: Props) {
    const { t } = useTranslation();
    // const memoizedNodes = useMemo(() => nodes, [nodes]); // we don't memoize nodes because we're gonna modify them on the fly (e.g. selecting them)
    const [realNodes, setRealNodes, _onRealNodesChange] = useNodesState(initialNodes); // TODO: we don't pass nodes here :/
    const memoizedEdges = useMemo(() => edges, [edges]);
    return (
        <>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={realNodes}
                    edges={memoizedEdges}
                    onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    onInit={(instance) => instance.fitView(defaultFitViewOptions)}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    zoomOnPinch
                    zoomOnDoubleClick
                    connectionLineType={ConnectionLineType.SmoothStep}
                    fitViewOptions={defaultFitViewOptions}
                    className={styles.nodeEditor}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    elevateNodesOnSelect
                    nodesFocusable
                    attributionPosition={'bottom-left'}
                    {...editorProps}
                >
                    <Background />
                    <Controls
                        position={'top-right'}
                        showInteractive={false}
                        fitViewOptions={{ ...defaultFitViewOptions, duration: 500 }}
                    />
                </ReactFlow>
                <Sidebar nodes={realNodes} setNodes={setRealNodes} />
            </ReactFlowProvider>
            {debug && (
                <>
                    <Typography.Text strong>{t('Nodes')}</Typography.Text>
                    {nodes.map((node) => (
                        <div key={node.id}>
                            Node {node.id} - x: {node.position.x.toFixed(2)}, y: {node.position.y.toFixed(2)}
                        </div>
                    ))}
                </>
            )}
        </>
    );
}
