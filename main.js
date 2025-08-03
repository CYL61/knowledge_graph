import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

class KnowledgeGraphApp {
    constructor() {
        this.network = null;
        this.nodes = new DataSet([]);
        this.edges = new DataSet([]);
        this.currentData = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeNetwork();
        this.updateStatus('应用已初始化，请选择数据源');
    }

    setupEventListeners() {
        // 数据加载
        document.getElementById('loadData').addEventListener('click', () => {
            this.loadGraphData();
        });

        // 图谱控制
        document.getElementById('nodeSize').addEventListener('input', (e) => {
            document.getElementById('nodeSizeValue').textContent = e.target.value;
            this.updateNodeSize(parseInt(e.target.value));
        });

        document.getElementById('edgeWidth').addEventListener('input', (e) => {
            document.getElementById('edgeWidthValue').textContent = e.target.value;
            this.updateEdgeWidth(parseInt(e.target.value));
        });

        document.getElementById('showLabels').addEventListener('change', (e) => {
            this.toggleLabels(e.target.checked);
        });

        // 搜索功能
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchNode();
        });

        document.getElementById('searchNode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchNode();
            }
        });

        // 图谱操作
        document.getElementById('fitGraph').addEventListener('click', () => {
            if (this.network) {
                this.network.fit();
            }
        });

        document.getElementById('resetZoom').addEventListener('click', () => {
            if (this.network) {
                this.network.moveTo({ scale: 1.0 });
            }
        });

        document.getElementById('exportGraph').addEventListener('click', () => {
            this.exportGraph();
        });

        document.getElementById('applyLayout').addEventListener('click', () => {
            this.applyLayout();
        });
    }

    initializeNetwork() {
        const container = document.getElementById('network');
        const data = {
            nodes: this.nodes,
            edges: this.edges
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: {
                    size: 14,
                    color: '#333333'
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 3,
                color: { inherit: 'from' },
                smooth: {
                    type: 'continuous'
                },
                shadow: true
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                maxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };

        this.network = new Network(container, data, options);

        // 网络事件监听
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                this.showNodeInfo(params.nodes[0]);
            } else {
                this.hideNodeInfo();
            }
        });

        this.network.on('hoverNode', (params) => {
            this.highlightNode(params.node);
        });

        this.network.on('blurNode', () => {
            this.resetHighlight();
        });
    }

    async loadGraphData() {
        const dataSource = document.getElementById('dataSource').value;
        this.showLoading(true);
        this.updateStatus(`正在加载 ${dataSource} 数据...`);

        try {
            // 模拟加载数据 - 在实际应用中，这里会从CSV文件加载数据
            const sampleData = this.generateSampleData(dataSource);
            
            this.nodes.clear();
            this.edges.clear();
            
            this.nodes.add(sampleData.nodes);
            this.edges.add(sampleData.edges);
            
            this.updateGraphInfo(sampleData.nodes.length, sampleData.edges.length);
            this.updateStatus(`成功加载 ${sampleData.nodes.length} 个节点和 ${sampleData.edges.length} 条边`);
            
            // 适应视图
            setTimeout(() => {
                this.network.fit();
            }, 1000);
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.updateStatus('数据加载失败，请检查数据文件');
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleData(dataSource) {
        // 根据数据源生成示例数据
        if (dataSource === 'cureus') {
            return this.generateMedicalData();
        } else {
            return this.generateTechData();
        }
    }

    generateMedicalData() {
        const nodes = [
            { id: 1, label: '印度医疗系统', color: '#ff6b6b', size: 40, group: 1 },
            { id: 2, label: '公共卫生', color: '#4ecdc4', size: 35, group: 1 },
            { id: 3, label: '私人医疗', color: '#45b7d1', size: 30, group: 2 },
            { id: 4, label: '医疗旅游', color: '#96ceb4', size: 25, group: 2 },
            { id: 5, label: '医学教育', color: '#ffeaa7', size: 30, group: 3 },
            { id: 6, label: '医疗保险', color: '#dda0dd', size: 25, group: 3 },
            { id: 7, label: '数字医疗', color: '#98d8c8', size: 35, group: 4 },
            { id: 8, label: '远程医疗', color: '#f7dc6f', size: 20, group: 4 },
            { id: 9, label: '人工智能', color: '#bb8fce', size: 25, group: 4 },
            { id: 10, label: '医疗政策', color: '#85c1e9', size: 30, group: 1 }
        ];

        const edges = [
            { from: 1, to: 2, label: '包含', width: 4 },
            { from: 1, to: 3, label: '对比', width: 3 },
            { from: 3, to: 4, label: '促进', width: 2 },
            { from: 1, to: 5, label: '影响', width: 3 },
            { from: 5, to: 6, label: '相关', width: 2 },
            { from: 1, to: 7, label: '采用', width: 4 },
            { from: 7, to: 8, label: '包含', width: 3 },
            { from: 7, to: 9, label: '集成', width: 2 },
            { from: 1, to: 10, label: '受制于', width: 3 },
            { from: 10, to: 2, label: '指导', width: 2 }
        ];

        return { nodes, edges };
    }

    generateTechData() {
        const nodes = [
            { id: 1, label: '数据互操作性', color: '#ff6b6b', size: 40, group: 1 },
            { id: 2, label: '健康信息系统', color: '#4ecdc4', size: 35, group: 1 },
            { id: 3, label: 'FHIR标准', color: '#45b7d1', size: 30, group: 2 },
            { id: 4, label: 'HL7协议', color: '#96ceb4', size: 25, group: 2 },
            { id: 5, label: '电子病历', color: '#ffeaa7', size: 30, group: 3 },
            { id: 6, label: '医院管理系统', color: '#dda0dd', size: 25, group: 3 },
            { id: 7, label: '数据安全', color: '#98d8c8', size: 35, group: 4 },
            { id: 8, label: '用户同意', color: '#f7dc6f', size: 20, group: 4 },
            { id: 9, label: 'API接口', color: '#bb8fce', size: 25, group: 2 },
            { id: 10, label: '云计算', color: '#85c1e9', size: 30, group: 4 }
        ];

        const edges = [
            { from: 1, to: 2, label: '实现', width: 4 },
            { from: 2, to: 3, label: '使用', width: 3 },
            { from: 3, to: 4, label: '基于', width: 2 },
            { from: 2, to: 5, label: '管理', width: 3 },
            { from: 5, to: 6, label: '集成', width: 2 },
            { from: 1, to: 7, label: '需要', width: 4 },
            { from: 7, to: 8, label: '要求', width: 3 },
            { from: 3, to: 9, label: '提供', width: 2 },
            { from: 2, to: 10, label: '部署在', width: 3 },
            { from: 10, to: 7, label: '提供', width: 2 }
        ];

        return { nodes, edges };
    }

    updateNodeSize(size) {
        const updateArray = this.nodes.map(node => ({
            ...node,
            size: size + (node.size - 25) // 保持相对大小差异
        }));
        this.nodes.update(updateArray);
    }

    updateEdgeWidth(width) {
        const updateArray = this.edges.map(edge => ({
            ...edge,
            width: width
        }));
        this.edges.update(updateArray);
    }

    toggleLabels(show) {
        const options = {
            nodes: {
                font: {
                    size: show ? 14 : 0
                }
            }
        };
        this.network.setOptions(options);
    }

    searchNode() {
        const searchTerm = document.getElementById('searchNode').value.toLowerCase();
        if (!searchTerm) return;

        const foundNodes = this.nodes.get().filter(node => 
            node.label.toLowerCase().includes(searchTerm)
        );

        if (foundNodes.length > 0) {
            const nodeIds = foundNodes.map(node => node.id);
            this.network.selectNodes(nodeIds);
            this.network.focus(nodeIds[0], {
                scale: 1.5,
                animation: true
            });
            this.updateStatus(`找到 ${foundNodes.length} 个匹配的节点`);
        } else {
            this.updateStatus('未找到匹配的节点');
        }
    }

    showNodeInfo(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        const connectedEdges = this.network.getConnectedEdges(nodeId);
        const connectedNodes = this.network.getConnectedNodes(nodeId);

        const nodeInfo = document.getElementById('nodeInfo');
        const nodeDetails = document.getElementById('nodeDetails');
        
        nodeDetails.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
                <strong>节点名称:</strong> ${node.label}
            </div>
            <div style="margin-bottom: 0.75rem;">
                <strong>节点ID:</strong> ${node.id}
            </div>
            <div style="margin-bottom: 0.75rem;">
                <strong>连接数:</strong> ${connectedNodes.length}
            </div>
            <div style="margin-bottom: 0.75rem;">
                <strong>社区:</strong> ${node.group || '未分组'}
            </div>
            <div>
                <strong>连接的节点:</strong><br>
                ${connectedNodes.slice(0, 5).map(id => {
                    const connectedNode = this.nodes.get(id);
                    return `• ${connectedNode.label}`;
                }).join('<br>')}
                ${connectedNodes.length > 5 ? '<br>...' : ''}
            </div>
        `;
        
        nodeInfo.style.display = 'block';
    }

    hideNodeInfo() {
        document.getElementById('nodeInfo').style.display = 'none';
    }

    highlightNode(nodeId) {
        const connectedNodes = this.network.getConnectedNodes(nodeId);
        const connectedEdges = this.network.getConnectedEdges(nodeId);
        
        const allNodes = this.nodes.get();
        const allEdges = this.edges.get();
        
        // 高亮连接的节点和边
        const updateNodes = allNodes.map(node => ({
            ...node,
            color: connectedNodes.includes(node.id) || node.id === nodeId 
                ? node.color 
                : { ...node.color, opacity: 0.3 }
        }));
        
        const updateEdges = allEdges.map(edge => ({
            ...edge,
            color: connectedEdges.includes(edge.id) 
                ? edge.color 
                : { ...edge.color, opacity: 0.3 }
        }));
        
        this.nodes.update(updateNodes);
        this.edges.update(updateEdges);
    }

    resetHighlight() {
        const allNodes = this.nodes.get();
        const allEdges = this.edges.get();
        
        const updateNodes = allNodes.map(node => ({
            ...node,
            color: { ...node.color, opacity: 1.0 }
        }));
        
        const updateEdges = allEdges.map(edge => ({
            ...edge,
            color: { ...edge.color, opacity: 1.0 }
        }));
        
        this.nodes.update(updateNodes);
        this.edges.update(updateEdges);
    }

    applyLayout() {
        const algorithm = document.getElementById('layoutAlgorithm').value;
        let options = {};

        switch (algorithm) {
            case 'forceAtlas2Based':
                options = {
                    physics: {
                        solver: 'forceAtlas2Based',
                        forceAtlas2Based: {
                            gravitationalConstant: -26,
                            centralGravity: 0.005,
                            springLength: 230,
                            springConstant: 0.18
                        }
                    }
                };
                break;
            case 'barnesHut':
                options = {
                    physics: {
                        solver: 'barnesHut',
                        barnesHut: {
                            gravitationalConstant: -2000,
                            centralGravity: 0.3,
                            springLength: 95,
                            springConstant: 0.04
                        }
                    }
                };
                break;
            case 'repulsion':
                options = {
                    physics: {
                        solver: 'repulsion',
                        repulsion: {
                            centralGravity: 0.2,
                            springLength: 200,
                            springConstant: 0.05,
                            nodeDistance: 100
                        }
                    }
                };
                break;
            case 'hierarchical':
                options = {
                    layout: {
                        hierarchical: {
                            direction: 'UD',
                            sortMethod: 'directed'
                        }
                    },
                    physics: false
                };
                break;
        }

        this.network.setOptions(options);
        this.updateStatus(`已应用 ${algorithm} 布局算法`);
    }

    exportGraph() {
        // 简单的导出功能 - 在实际应用中可以实现更复杂的导出
        const canvas = document.querySelector('#network canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'knowledge-graph.png';
            link.href = canvas.toDataURL();
            link.click();
            this.updateStatus('图谱已导出为PNG文件');
        }
    }

    updateGraphInfo(nodeCount, edgeCount) {
        document.getElementById('nodeCount').textContent = nodeCount;
        document.getElementById('edgeCount').textContent = edgeCount;
        
        // 计算社区数量（简化版本）
        const groups = new Set(this.nodes.get().map(node => node.group));
        document.getElementById('communityCount').textContent = groups.size;
    }

    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeGraphApp();
});