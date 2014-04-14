// util.js

// A set of handy array operations which will be utilized later. 

// iterate through a string character by character
String.prototype.forEach = function (call) {
    for (var i = 0; i < this.length; i++) {
        call(this[i]);
    }
};

// returns  the cross product of two sets (arrays)
Array.prototype.cross = function (B) {
    var result = [];
    this.forEach(function (a) {
        B.forEach(function (b) {
            result.push([a,b]);
        });
    });
    return result;
};

// returns the difference of two arrays
Array.prototype.diff = function (B) {
    return this.filter(function (a) { return B.indexOf(a) < 0; });
};

// returns the array as a string with set notation 
// e.g.: [1,2,3] -> {1,2,3}
Array.prototype.set = function () {
    var copy = this.slice();
    copy.sort()
    var result = "{" + copy[0];
    for (var i = 1; i < copy.length; i++)
        result += "," + copy[i];
    result += "}";
    return result;
};

// returns the array as a string with tuple notation 
// e.g: [1,2,3] -> (1,2,3)
Array.prototype.tuple = function () {
    var result = "(" + this[0];
    for (var i = 1; i < this.length; i++)
        result += "," + this[i];
    result += ")";
    return result;
};

// returns true is an array contains an element e
Array.prototype.contains = function (e) {
    return this.indexOf(e) > -1;
};
