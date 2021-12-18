///THE NODE CONTROLLER///
export default class NodeController {
    //#region PUBLIC
    ResetWalls = (nodes, classSetter, showGrid) => {
        for (let row of nodes){
            for (let node of row){
                node.WallOff();

                const newClass = classSetter(node, showGrid);
                const { y, x } = node;
                document.getElementById(`node-${y}-${x}`).className = newClass;
            }
        }
        return nodes;
    }

    ClearCheckedNodes = (nodes, classSetter, showGrid) => {
        for (let row of nodes){
            for (let node of row){
                //Reset distances
                node.local_distance = Infinity;
                node.global_distance = Infinity;

                //Reset checked flag and reset previousNode
                node.isChecked = false;
                node.previousNode = null;

                //Reset the class and re-draw the node
                const newClass = classSetter(node, showGrid);
                const { y, x } = node;
                document.getElementById(`node-${y}-${x}`).className = newClass;
            }
        }

        return nodes;
    }

    AnimatePathBasic = (visitedList, shortList, showGrid, callback) => {
        for (let x = 0; x <= visitedList.length; x++){
            //Check if we have reached visitedLost.length
            //If so, trigger the callback method and return to avoid an out-of-bounds exception
            if (x === visitedList.length){
                setTimeout(() => {
                    //callback();
                    this._animateShortestPathBasic(shortList, showGrid, callback);
                  }, 10 * x);
                return;
            }

            //If we have not reached visitedLost.length, animate the nodes
            const node = visitedList[x];
            if (node.isStartNode || node.isEndNode) continue;
            let clsName = showGrid?'node visited grid':'node visited';
            setTimeout(() => {
                document.getElementById(`node-${node.y}-${node.x}`).className =
               clsName;
            }, 10 * x);
        }
    }

    AnimatePath = (visitedList, shortestPath, showGrid, callback) => {
        for (let x = 0; x <= visitedList.length; x++){
            if (x === visitedList.length){
                setTimeout(() => {
                    this._animateShortestPath(shortestPath, 0, showGrid, callback);
                  }, 10 * x);
                return;
            }

            const node = visitedList[x];
            if (node.isStartNode || node.isEndNode) continue;
            let clsName = showGrid?'node visited grid':'node visited';
            setTimeout(() => {
                document.getElementById(`node-${node.y}-${node.x}`).className =
               clsName;
            }, 10 * x);
        }
    }
    //#endregion

    //#region PRIVATE
    _animateShortestPathBasic = (list, showGrid, callback) => {
        for (let x = 0; x <= list.length; x++) {
            if (x === list.length){
                callback(); //To re-enable controls
                return;; //To avoid out-of-bounds exception
            }

            const node = list[x];
            if (node.isStartNode || node.isEndNode) continue;
            let clsName = showGrid?'node shortest grid':'node shortest';
            setTimeout(() => {
                document.getElementById(`node-${node.y}-${node.x}`).className =
               clsName;
            }, 10 * x);
        }
    }

    _animateShortestPath = (path, index, showGrid, callback) => {
        var pathAnimWrapper;
        var pathAnim = () => {
            const node = document.getElementById(`node-${path[index].y}-${path[index].x}`);
            const speed = 6;

            if (bee.offsetTop !== node.offsetTop || bee.offsetLeft !== node.offsetLeft){                
                if (bee.offsetTop !== node.offsetTop){
                    let pos = bee.offsetTop;
                    if (node.offsetTop > pos){
                        bee.className = "down";
                        pos += speed;
                        if (node.offsetTop < pos){
                            pos = node.offsetTop;
                        }
                    }
                    else {
                        bee.className = "up";
                        pos -= speed;
                        if (node.offsetTop > pos){
                            pos = node.offsetTop;
                        }
                    }
                    bee.style.top = pos+"px";
                }
                if (bee.offsetLeft !== node.offsetLeft){
                    let pos = bee.offsetLeft;
                    if (node.offsetLeft > pos){
                        pos += speed;
                        bee.className = "right";
                        if (node.offsetLeft < pos){
                            pos = node.offsetLeft;
                        }
                    }
                    else {
                        bee.className = "left";
                        pos -= speed;
                        if (node.offsetLeft > pos){
                            pos = node.offsetLeft;
                        }
                    }
                    bee.style.left = pos+"px";
                }

                pathAnimWrapper = requestAnimationFrame(pathAnim);
            }
            else {
                if (path[index].isEndNode){
                    bee.className = "idle";
                    bee.style.left = bee.offsetLeft-2 + "px";
                    bee.style.top = bee.offsetTop-2 + "px";
                    cancelAnimationFrame(pathAnimWrapper);
                    callback();
                }
                else {
                    if (!path[index].isStartNode){
                        let clsName = showGrid?'node shortest grid':'node shortest';
                        document.getElementById(`node-${path[index].y}-${path[index].x}`).className =
                        clsName;
                    }
                    index++;
                    pathAnimWrapper = requestAnimationFrame(pathAnim);
                }
            }
        }
        pathAnimWrapper = requestAnimationFrame(pathAnim);
    }
    //#endregion
}