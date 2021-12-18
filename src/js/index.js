//CLASS IMPORTS//
import NodeObject from './node-object.js';
import NodeController from './node-controller.js';
import { DIJKSTRA, A_STAR } from './types/algorithms-types.js';
import { MANHATTAN_DISTANCE } from './types/heuristic-types.js';

import Dijkstra from './algorithms/dijkstra.js';
import AStar from './algorithms/astar.js';

//THE ROOT CLASS//
class Root {
    //#region DECLARATIONS
    nodes = [];
    nodeController = new NodeController();

    //Grid, mouse drag, and animating
    showGrid = true; //We need to keep track of this for the NodeController
    isDraggingMouse = false;
    isAnimatingPath = false;

    //Start and End node-related
    startNode = null;
    endNode = null;
    isDragingStartNode = false;
    isDragingEndNode = false;

    //Algorithm and heuristic-related
    algorithmType = DIJKSTRA;
    heuristicType = MANHATTAN_DISTANCE;
    //#endregion

    //#region CONSTRUCTION
    constructor(){
        //First loop - create all the nodes
        const ROW_COUNT = 24;
        const COL_COUNT = 36;

        //const ROW_COUNT = 12;
        //const COL_COUNT = 18;

        for (let rowCount = 0; rowCount < ROW_COUNT; rowCount++){
            const newRow = [];
            for (let colCount = 0; colCount < COL_COUNT; colCount++){
                const bgx = Math.floor((Math.random() * 4)) * 16;
                const bgy = Math.floor((Math.random() * 4)) * 16;
                newRow.push(new NodeObject(rowCount, colCount, bgx, bgy));
            }
            this.nodes.push(newRow);
        }

        //Second loop - set neighbors since they never change
        for (let y = 0; y < ROW_COUNT; y++){
            for (let x = 0; x < COL_COUNT; x++){
                const node = this.nodes[y][x];                
                if (y > 0) node.neighbors.push(this.nodes[y - 1][x]); //North
                if (y < ROW_COUNT - 1) node.neighbors.push(this.nodes[y + 1][x]); //South
                if (x > 0)  node.neighbors.push(this.nodes[y][x - 1]); //West
                if (x < COL_COUNT - 1) node.neighbors.push(this.nodes[y][x + 1]); //East
            }
        }

        //Set start and end nodes
        this.nodes[1][1].StartNodeOn();
        this.startNode = this.nodes[1][1];

        this.nodes[ROW_COUNT-2][COL_COUNT-2].EndNodeOn();
        this.endNode = this.nodes[ROW_COUNT-2][COL_COUNT-2];

        //Build the Node Elements
        const main = document.getElementById("main-content");
        const grid = document.createElement("div");
        grid.id = "grid";        
        this._buildNodeMap(grid, this.nodes, this.showGrid);
        main.appendChild(grid);

        //Set Select Dropdown Events
        document.getElementById("algorithm-dropdown")
        .addEventListener("change", this.SetAlgorithmType, false);

        document.getElementById("heuristic-dropdown")
        .addEventListener("change", this.SetHeuristicType, false);

        //We need to reset Dropdowns to their default states
        document.getElementById("algorithm-dropdown").selectedIndex = 0;
        document.getElementById("heuristic-dropdown").selectedIndex = 1;

        //Set Events to Buttons
        document.getElementById("toggle-nodes-button")
        .addEventListener("click", this.ToggleGrid, false);

        document.getElementById("remove-walls-button")
        .addEventListener("click", this.RemoveWalls, false);

        document.getElementById("clear-nodes-button")
        .addEventListener("click", this.ClearCheckedNodes, false);

        document.getElementById("animate-path-button")
        .addEventListener("click", this.AnimatePath, false);

        //Set the Bee to the StartNode pos
        this._setBeeToStartNode();
    }
    //#endregion

    //#region MAIN_METHODS
    ToggleGrid = () => {
        if (this.isAnimatingPath)
            return;
        
        this.showGrid = !this.showGrid;
        const nodeElements = document.getElementsByClassName("node");
        for (let node of nodeElements){
            node.classList.toggle("grid", this.showGrid);
        }
    }

    RemoveWalls = () => {
        if (this.isAnimatingPath)
            return;
        this.nodeController.ResetWalls(this.nodes, this._setClass, this.showGrid);
    }

    ClearCheckedNodes = () => {
        if (this.isAnimatingPath)
            return;
        this.nodeController.ClearCheckedNodes(this.nodes, this._setClass, this.showGrid);
    }

    SetAlgorithmType = e => {
        const { target } = e;
        const value = target.options[target.selectedIndex].value;
        this.algorithmType = value;
    }

    SetHeuristicType = e => {
        const { target } = e;
        const value = target.options[target.selectedIndex].value;
        this.heuristicType = value; 
    }

    AnimatePath = () => {
        if (this.isAnimatingPath)
            return;

        //Clear checked nodes, then set animating
        this.ClearCheckedNodes();
        this._setBeeToStartNode();
        this.isAnimatingPath = true;

        //Set the Path
        switch(this.algorithmType){
            case DIJKSTRA:
                this._animateDijkstra();
                break;
            case A_STAR:
                this._animateAStar();
                break;
        }
    }
    //#endregion

    //#region MOUSE_EVENTS
    //Mouse Down
    OnMouseDown = (y, x) => {
        if (this.isAnimatingPath)
            return;
        
        //Stop dragging the grid
        window.event.preventDefault();

        //Dragging StartNode
        if (this.nodes[y][x].isStartNode){           
            this.nodes[y][x].StartNodeOff();
            this.nodes[y][x].StartNodePreviewOn();
            this._getNodeElement(y, x).classList.replace("start", "start-hover");            
            this.startNode = null;
            this.isDragingStartNode = true;
            return;
        }

        //Dragging EndNode
        if (this.nodes[y][x].isEndNode){           
            this.nodes[y][x].EndNodeOff();
            this.nodes[y][x].EndNodePreviewOn();
            this._getNodeElement(y, x).classList.replace("end", "end-hover");            
            this.endNode = null;
            this.isDragingEndNode = true;
            return;
        }

        //Normal DragMode
        this._toggleWall(y, x);
        this.isDraggingMouse = true; //We're on wall mode
    }

    //Mouse Enter
    OnMouseEnter = (y, x) => {
        //Dragging StartNode
        if (this.isDragingStartNode){
            //If we over the end-node, show an error
            if (this.nodes[y][x].isEndNode){
                this.nodes[y][x].ErrorOn();
                this._getNodeElement(y, x).classList.add("error");
            }
            else { //Set node as new preview
                this.nodes[y][x].StartNodePreviewOn();
                const el = this._getNodeElement(y, x);
                el.classList.remove("wall");
                el.classList.add("start-hover");
            }
            return;
        }

        //Dragging EndNode
        if (this.isDragingEndNode){
            //If we over the start-node, show an error
            if (this.nodes[y][x].isStartNode){
                this.nodes[y][x].ErrorOn();
                this._getNodeElement(y, x).classList.add("error");
            }
            else { //Set node as new preview
                this.nodes[y][x].EndNodePreviewOn();
                const el = this._getNodeElement(y, x);
                el.classList.remove("wall");
                el.classList.add("end-hover");
            }
            return;
        }

        //Normal DragMode
        if (this.isDraggingMouse){
            this._toggleWall(y, x);
        }
    }

    //Mouse Leave
    OnMouseLeave = (y, x) => {
        //Dragging StartNode
        if (this.isDragingStartNode){
            if (this.nodes[y][x].isError){
                this.nodes[y][x].ErrorOff();
                this._getNodeElement(y, x).classList.remove("error");
            }
            else {
                this.nodes[y][x].StartNodePreviewOff();
                this._getNodeElement(y, x).classList.remove("start-hover");
            }
        }

        //Dragging EndNode
        if (this.isDragingEndNode){
            if (this.nodes[y][x].isError){
                this.nodes[y][x].ErrorOff();
                this._getNodeElement(y, x).classList.remove("error");
            }
            else {
                this.nodes[y][x].EndNodePreviewOff();
                this._getNodeElement(y, x).classList.remove("end-hover");
            }
        }
    }

    //Mouse Up
    OnMouseUp = (y, x) => {
        //Dragging StartNode
        if (this.isDragingStartNode){
            if (this.nodes[y][x].isError)
                return;

            this.nodes[y][x].StartNodeOn();
            this.startNode = this.nodes[y][x];
            this._getNodeElement(y, x).classList.replace("start-hover", "start");
            this.isDragingStartNode = false;
            //TODO: Set Bee object to StartNode position
            return;
        }

        //Dragging EndNode
        if (this.isDragingEndNode){
            if (this.nodes[y][x].isError)
                return;

            this.nodes[y][x].EndNodeOn();
            this.endNode = this.nodes[y][x];
            this._getNodeElement(y, x).classList.replace("end-hover", "end");
            this.isDragingEndNode = false;
            return;
        }

        //Normal DragMode
        this.isDraggingMouse = false;
    }
    //#endregion

    //#region PATHFINDER_METHODS
    _animateDijkstra = () => {
        let _dijkstra = new Dijkstra();
        let _pathNodes = _dijkstra.GetDijkstra(this.nodes, this.startNode, this.endNode);
        let _shortPathNodes = this._getShortestPath(this.endNode);

        //Animate path
        this.nodeController.AnimatePath(
            _pathNodes,
            _shortPathNodes,
            this.showGrid,
            () => { this.isAnimatingPath = false; }
        );
    }

    _animateAStar = () => {
        let _aStar = new AStar();
        let _pathNodes = _aStar.GetAStar(this.nodes, this.startNode, this.endNode, this.heuristicType);
        let _shortPathNodes = this._getShortestPath(this.endNode);

        //Animate path
        this.nodeController.AnimatePath(
            _pathNodes,
            _shortPathNodes,
            this.showGrid,
            () => { this.isAnimatingPath = false; }
        );
    }
    //#endregion

    //#region HELPER_METHODS
    _buildNodeMap = (container, nodes, showGrid) => {
        nodes.map(row => {
            //Create a row-divider
            const newRow = document.createElement("div");
            newRow.className = "row-divider";

            //Add nodes to rows
            row.map(node => {
                //Get node data
                const {y, x, bgx, bgy} = node;

                //Set node className
                const clsName = this._setClass(node, showGrid);

                //Build node
                const newNode = document.createElement("div"); //The DIV
                newNode.id = `node-${y}-${x}`;
                newNode.className = clsName;
                newNode.style = `background-position: ${bgx}px ${bgy}px`;

                //Add Mouse Events
                newNode.addEventListener("mousedown", () => this.OnMouseDown(y, x), false);
                newNode.addEventListener("mouseenter", () => this.OnMouseEnter(y, x), false);
                newNode.addEventListener("mouseleave", () => this.OnMouseLeave(y, x), false);
                newNode.addEventListener("mouseup", () => this.OnMouseUp(y, x), false);

                //Add node to row
                newRow.appendChild(newNode);
            });

            //Add row to grid
            container.appendChild(newRow);
        });
    }

    _setClass = (node, showGrid) => {
        const { isStartNode, isStartNodePreview, isEndNode, isEndNodePreview,
            isError, isWall, wall_bgx } = node;

        let string = `node`;

        if (isError){
            string += ' error';
        }
        else if (isStartNode){
            string += ' start';
        }
        else if (isStartNodePreview){
            string += ' start-hover'
        }
        else if (isEndNode){
            string += ' end';
        }
        else if (isEndNodePreview){
            string += ' end-hover';
        }
        else if (isWall) {
            string += ` wall wall${wall_bgx}`;
        }
        
        if (showGrid){
            string += ` grid`;
        }

        return string;
    }

    _toggleWall = (y, x) => { //Use by the Mouse Down and Enter events
        const node = this.nodes[y][x];
        node.ToggleWall();
        const newClass = this._setClass(node, this.showGrid);
        this._getNodeElement(y, x).className = newClass;
    }

    _getShortestPath = endNode => {
        const nodes = [];
        let currentNode = endNode;
        while (currentNode !== null){
            nodes.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        return nodes;
    }

    _getNodeElement = (y, x) => {
        return document.getElementById(`node-${y}-${x}`);
    }

    _setBeeToStartNode = () => {
        const bee = document.getElementById("bee");
        const {y, x} = this.startNode;
        const startNodeEl = document.getElementById(`node-${y}-${x}`);
        bee.style.top = startNodeEl.offsetTop + "px";
        bee.style.left = startNodeEl.offsetLeft + "px";
    }
    //#endregion
}

//INITIALIZE THE ROOT//
new Root();