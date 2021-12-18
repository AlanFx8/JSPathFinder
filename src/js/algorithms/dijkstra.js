export default class Dijkstra {
    ///MAIN METHODS///
    GetDijkstra(nodes, startNode, endNode){
        startNode.local_distance = 0;
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
            this._updateUnvisitedNeighbors(nearestNode);
        }
    }

    ///HELPER METHODS///
    //Get all nodes as a flattened list
    _getAllNodes = nodes => {
        const nodeList = [];
        for (const row of nodes){
            for (const node of row){
                nodeList.push(node);
            }
        }
        return nodeList;
    }

    //Sorts unvisited nodes by their distance
    //Each loop should ensure only a few have a distance that is not infinity
    //and rise them to the top
    _sortByDistance = unvisitedNodes => {
        unvisitedNodes.sort((nodeA, nodeB) => nodeA.local_distance - nodeB.local_distance);
    }

    //Neighbor methods
    _updateUnvisitedNeighbors = node => {
        const unvisitedNeighbors = this._getUnvisitedNeighbors(node);
        for (const neighbor of unvisitedNeighbors) {
            neighbor.local_distance = node.local_distance + 1;
            neighbor.previousNode = node;
        }
    }

    _getUnvisitedNeighbors = node => {
        const { neighbors } = node;
        return neighbors.filter(neighbor => !neighbor.isChecked);
    }
}