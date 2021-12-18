import { RETURN_ONE, MANHATTAN_DISTANCE, EUCLIDEAN_DISTANCE } from '../types/heuristic-types.js';

export default class AStar {
    GetAStar = (nodes, startNode, endNode, type) => {
        //Prepare the start node
        startNode.local_distance = 0;
        startNode.global_distance = this.heuristic(startNode, endNode);

        //Get unvisited and visited lists
        const unvisitedNodes = this._getAllNodes(nodes);
        const visitedNodes = [];

        while (!!unvisitedNodes.length) {
            this._sortByDistance(unvisitedNodes);
            const nearestNode = unvisitedNodes.shift();

            if (nearestNode.isWall) continue;
            if (nearestNode.local_distance === Infinity) return visitedNodes;
            nearestNode.isChecked = true;
            visitedNodes.push(nearestNode);
            if (nearestNode === endNode) return visitedNodes;

            const { neighbors } = nearestNode;

            for (let x = 0; x < neighbors.length; x++){
                const neighbor = neighbors[x];
                const value = nearestNode.local_distance + this.heuristic(nearestNode, neighbor, type);
                if (value < neighbor.local_distance){
                    neighbor.previousNode = nearestNode;
                    neighbor.local_distance = value;
                    neighbor.global_distance =
                    neighbor.local_distance + this.heuristic(neighbor, endNode, type);
                }
            }
        }

        return visitedNodes;
    }

    //Heruristic - returns a distance
    heuristic = (nodeA, nodeB, type) => {
        switch (type){
            case MANHATTAN_DISTANCE:
            default:
                return this.manhattanDistance(nodeA, nodeB);
            case EUCLIDEAN_DISTANCE:
                return this.euclideanDistance(nodeA, nodeB);
            case RETURN_ONE:
                return 1;
        }
    }

    //DISTANCE METHODS
    //Euclidean distance
    euclideanDistance = (nodeA, nodeB) => {
        return Math.sqrt(
            (nodeA.x - nodeB.x)*(nodeA.x - nodeB.x) +
            (nodeA.y - nodeB.y)*(nodeA.y - nodeB.y)
        );
    };

    //Manhattan distance
    manhattanDistance = (nodeA, nodeB) => {
        const D = 1;
        return D * Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
    };

    //Diagonal distance
    diagonalDistance = (nodeA, nodeB) => {
        const D = 1;
        return D * (Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y)) + ((D * 2) - 2 * D) * Math.min(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
    };

    //HELPER METHODS
    _getAllNodes = nodes => {
        const nodeList = [];
        for (const row of nodes){
            for (const node of row){
                nodeList.push(node);
            }
        }
        return nodeList;
    }

    _sortByDistance = unvisitedNodes => {
        unvisitedNodes.sort((nodeA, nodeB) => nodeA.global_distance - nodeB.global_distance);
    }
}