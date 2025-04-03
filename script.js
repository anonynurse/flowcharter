let nodeCount = 0;
let savedCharts = {};

jsPlumb.ready(() => {
    const instance = jsPlumb.getInstance({
        Container: "canvas",
        PaintStyle: { stroke: "#666", strokeWidth: 2 },
        Endpoint: ["Dot", { radius: 4 }],
        Connector: "Bezier"
    });

    // Make nodes draggable
    instance.draggable(".node", {
        stop: function(params) {
            const node = params.el;
            node.dataset.x = params.pos[0];
            node.dataset.y = params.pos[1];
        }
    });

    window.addNode = function() {
        const id = `node-${nodeCount++}`;
        const node = document.createElement("div");
        node.className = "node";
        node.id = id;
        node.dataset.x = 100 + (nodeCount * 20);
        node.dataset.y = 100 + (nodeCount * 20);
        node.style.left = node.dataset.x + "px";
        node.style.top = node.dataset.y + "px";
        
        node.innerHTML = `
            <div class="node-title" contenteditable="true">Node ${nodeCount}</div>
            <div class="node-notes" contenteditable="true">Notes here</div>
        `;
        
        document.getElementById("canvas").appendChild(node);
        
        // Add endpoints for connections
        instance.addEndpoint(id, { 
            anchor: "Top",
            isSource: true,
            isTarget: false
        });
        instance.addEndpoint(id, { 
            anchor: "Bottom",
            isSource: false,
            isTarget: true
        });

        // Make connections by dragging
        instance.draggable(id);
    };

    window.saveFlowchart = function() {
        const name = prompt("Enter flowchart name:");
        if (!name) return;

        const nodes = Array.from(document.getElementsByClassName("node")).map(node => ({
            id: node.id,
            x: node.dataset.x,
            y: node.dataset.y,
            title: node.querySelector(".node-title").textContent,
            notes: node.querySelector(".node-notes").textContent
        }));

        const connections = instance.getConnections().map(conn => ({
            source: conn.sourceId,
            target: conn.targetId
        }));

        savedCharts[name] = { nodes, connections };
        updateDropdown();
    };

    window.loadFlowchart = function() {
        const select = document.getElementById("savedFlowcharts");
        const name = select.value;
        if (!name || !savedCharts[name]) return;

        // Clear current flowchart
        instance.deleteEveryEndpoint();
        document.getElementById("canvas").innerHTML = "";

        // Load nodes
        savedCharts[name].nodes.forEach(nodeData => {
            const node = document.createElement("div");
            node.className = "node";
            node.id = nodeData.id;
            node.dataset.x = nodeData.x;
            node.dataset.y = nodeData.y;
            node.style.left = nodeData.x + "px";
            node.style.top = nodeData.y + "px";
            node.innerHTML = `
                <div class="node-title" contenteditable="true">${nodeData.title}</div>
                <div class="node-notes" contenteditable="true">${nodeData.notes}</div>
            `;
            document.getElementById("canvas").appendChild(node);
            
            instance.addEndpoint(nodeData.id, { anchor: "Top", isSource: true });
            instance.addEndpoint(nodeData.id, { anchor: "Bottom", isTarget: true });
            instance.draggable(nodeData.id);
        });

        // Load connections
        savedCharts[name].connections.forEach(conn => {
            instance.connect({ source: conn.source, target: conn.target });
        });
    };

    function updateDropdown() {
        const select = document.getElementById("savedFlowcharts");
        select.innerHTML = '<option value="">Select a flowchart</option>';
        Object.keys(savedCharts).forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }
});
