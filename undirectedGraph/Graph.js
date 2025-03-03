//定义个无向图
function Graph() {
    //创建一个数组用来存放图中的所有顶点
    this.vertices = [];
    //创建一个字典来存储邻接表
    this.adjList = new Dictionary();

    this.edges = [];

    //向图中添加一个新的节点
    this.addVertex = function (v) {
        if (Array.isArray(v)) {
            this.vertices.push(...v);
            v.forEach((item)=>{
                this.adjList.set(item, []);
            });
        } else {
            this.vertices.push(v);
            this.adjList.set(v, []);//设置顶点v作为键对应的字典值为一个空数组
        }
    }

    
    //向图中添加顶点之间的边
    this.addEdge = function (v,w,weight) {
        this.adjList.get(v).push({pathTo:w,weight:weight});//将w加入到v的邻接表中
        this.edges.push({from:v,to:w,weight:weight});
        this.adjList.get(w).push({pathTo:v,weight:weight});//由于是无向图，所以也要反过来添加
        this.edges.push({from:w,to:v,weight:weight});
    }

    //输出图
    this.toString = function () {
        var s = '';
        for (var i = 0; i < this.vertices.length; i++){
            s += this.vertices[i] + '->';//将顶点数组依次加入到字符串
            var neighbors = this.adjList.get(this.vertices[i]);//取得每个顶点的邻接表
            for (var j = 0; j < neighbors.length; j++){
                //迭代的将邻接表中的相邻节点加入到字符串中
                s += neighbors[j].pathTo+ ' weight:' + neighbors[j].weight + ' ';
            }
            s += '\n';//每输出一个定点的邻接表，加一个换行
        }
        return s;
    }

    this.getPointPath = function (point) {
        return this.adjList.get(point);
    }

    this.getDistance = function (start, end) {
        const startPath = this.adjList.get(start);
        if (startPath.find((v)=>{return v.pathTo === end})) {
            return startPath.find((v)=>{return v.pathTo === end}).weight;
        } else {
            return Number.POSITIVE_INFINITY;
        }
    }

    this.getShortestPath = bellmanFord;
}
/* bellman-ford 最短路径算法 
* @params {Object} graph 图信息
* @params {String} start 起点名/起点ID
* @params {String} end 终点名/终点ID
* @return 无
* @author myf 2022-11-02
*/
function bellmanFord (start, end) {
    const distant = {}; // distant[i]表示从start点到i点的距离
    const resPoints = [];
    const path = {};
    let res = [];
    this.getPointPath(start).forEach((v)=>{
        distant[v.pathTo] = v.weight;
    });
    this.vertices.forEach((v)=>{
        if (!distant[v]) distant[v] = Number.POSITIVE_INFINITY;
    });
    distant[start] = 0;
    for (let i = 0; i < this.vertices.length - 1; i++) {
        for (let j = 0; j < this.edges.length; j++) {
            if (distant[this.edges[j].from] + this.edges[j].weight < distant[this.edges[j].to]){
                distant[this.edges[j].to] = distant[this.edges[j].from] + this.edges[j].weight;
                path[this.edges[j].to] = this.edges[j].from;
            }
        }
    }
    // path[start] = start;
    resPoints.unshift(end);
    let p = path[end];
    while (p !== start) {
        resPoints.unshift(p);
        p = path[p] || start;
    }
    resPoints.unshift(start);
    for (let i = 0; i < resPoints.length - 1; i++) {
        res.push({path:'->' + resPoints[i + 1],weight: this.getDistance(resPoints[i],resPoints[i + 1]),point:resPoints[i + 1]});
    }
    return {path:res,sumWeight:distant[end]};
}