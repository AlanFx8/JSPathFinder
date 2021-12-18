///THE NODE OBJECT///
///Holds data of each node///
export default class NodeObject {
    //Constructor
    constructor(y, x, bgx, bgy){
        this.y = y; //X and Y positions on grid - also used for IDs
        this.x = x;
        this.isWall = false;
        this.isStartNode = false;
        this.isStartNodePreview = false; //If dragged over on start-mode
        this.isEndNode = false;
        this.isEndNodePreview = false; //If dragged over on end-mode
        this.isError = false; //If a start-drag goes over the EndNode and vice-versa
        this.isChecked = false;
        this.local_distance = Infinity;
        this.global_distance = Infinity;
        this.neighbors = [];
        this.previousNode = null; //In shortest path
        this.bgx = bgx; //For grass tile backgrounds and rock tiles
        this.bgy = bgy;
        this.wall_bgx = 0;
    }

    //Methods
    StartNodeOn = () => {
        this.isWall = false;
        this.isStartNodePreview  = false;
        this.isStartNode = true;
    }

    StartNodeOff = () => this.isStartNode = false;

    StartNodePreviewOn = () => this.isStartNodePreview = true;

    StartNodePreviewOff = () => this.isStartNodePreview = false;

    EndNodeOn = () => {
        this.isWall = false;
        this.isEndNodePreview = false;
        this.isEndNode = true;
    }

    EndNodeOff = () => this.isEndNode = false;

    EndNodePreviewOn = () => this.isEndNodePreview = true;

    EndNodePreviewOff = () => this.isEndNodePreview = false;

    ErrorOn = () => this.isError = true;

    ErrorOff = () => this.isError = false;

    WallOn = () => {
        if (this.isStartNode || this.isEndNode) return;
        this.isChecked = false;
        this.wall_bgx = Math.floor((Math.random() * 4));
        this.isWall = true;
    }

    WallOff = () => this.isWall = false;

    ToggleWall = () => {
        if (!this.isWall){
            this.WallOn();
        }
        else {
            this.WallOff();
        }
    }
    
    CheckOn = () => this.isChecked = true;
}