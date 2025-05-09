/*字典 Dictionary类*/
function Dictionary() {
    this.set = setDictionary;
    this.datastore = new Array();
    this.get = getDictionary;
    this.delect = delectDictionary;
    this.showAll = showAllDictionary;
    this.count = countDictionary;
    this.delectAll = delectAllDictionary;
}
function setDictionary(key, value) {
    this.datastore[key] = value;
}
function getDictionary(key) {
    return this.datastore[key];
}
function delectDictionary(key) {
    delete this.datastore[key];
}
function showAllDictionary() {
    var str = "";
    for(var key in this.datastore) {
        str += key + " -> " + this.datastore[key] + "; "
    }
    console.log(str);
}
function countDictionary() {
    var n = 0;
    for(var key in Object.keys(this.datastore)) {
        ++n;
    }
    console.log(n);
    return n;
}
function delectAllDictionary() {
    for(var key in this.datastore) {
        delete this.datastore[key];
    }
}