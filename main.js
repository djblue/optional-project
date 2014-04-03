#!/usr/bin/env node


var extend = require('util')._extend;

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

// returns true is an array contains an element e
Array.prototype.contains = function (e) {
    return this.indexOf(e) > -1;
};

// an empty NFA
var NFA = function () {

    this.state = "";

    this.Q = [];            // set of all states for the DFA
    this.Sigma = [];        // alphabet of the DFA
    this.delta = {};        // the transition function of the DFA
    this.initial = "";      // initial state of DFA
    this.accept = [];       //set of all accept states for DFA
};

var DFA = function () {
    
};

DFA.prototype = new NFA();
DFA.prototype.constructor = DFA;

// delta star function
NFA.prototype.deltastar = function(input) {
    var self = this;
    input.forEach(function (c) {
        self.state = self.delta[self.state+' '+c];
    });
};

// returns true if the current state is one of the accept states
NFA.prototype.accept = function () {
    return (this.accept.indexOf(state) > -1)? true : false;
};

// returns true if the current state is not one of the accept states
NFA.prototype.reject = function () {
    return !this.accept();
};

// returns the clone of the current NFA
NFA.prototype.clone = function () {
    var copy =  extend({}, this);
    copy.prototype = this.prototype;
    return copy;
};

NFA.prototype.getString = function () {
     
};

// returns a DFA from the current NFA
NFA.prototype.toDFA = function () {
    var dfa = extend(new DFA(), this);
    dfa.Q.cross(dfa.Sigma).forEach(function (pair) {
        pair = pair[0] + ' ' + pair[1];
        dfa.delta[pair] = (!!dfa.delta[pair])? dfa.delta[pair] : "trap";
    });
    return dfa;
};


// returns the complement of the current DFA
DFA.prototype.complement = function () {
    var copy = this.clone();
    copy.accept = copy.Q.diff(copy.accept);
    return copy;
};
 
var tuple = function () {
    var r = "(" + arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        r += "," + arguments[i];
    }
    r += ")";
    return r;
};

// return the intersection of two DFA's
DFA.prototype.intersect = function (dfa) {
    var self = this, rdfa = new NFA(); // the new dfa to return
    rdfa.Sigma = this.Sigma;
    rdfa.initial = tuple(this.initial, dfa.initial);
    self.Q.cross(dfa.Q).forEach(function (c) {
        var state = tuple(c[0],c[1]);
        rdfa.Q.push(state);
        self.Sigma.forEach (function (a) {
            rdfa.delta[state+" "+a] = 
                tuple(self.delta[c[0]+" "+a], dfa.delta[c[1]+" "+a]);
        });

        if (self.accept.contains(c[0])  &&  dfa.accept.contains(c[1])) {
            rdfa.accept.push(state);
        }
    });
    return rdfa;
};

// returns the clone of the current DFA
DFA.prototype.clone = function () {
    return Object.create(this);
};

// function to parse input.
var parserInput = function (input) {
    
    var lines = input.split("\n");
    var state = ""; // state of paring input

    var spec = new NFA()
      , sys  = new NFA()
      , dfa = spec;

    spec.Q.push('1');
    sys.Q.push('1');
    
    for (var i = 0; i < lines.length - 1; i++) {

        var line = lines[i];

        if (line[0] == '%') {
            state = line.substr(2); // remove '% '
        } else {
            switch (state) {

                case 'Input alphabet':
                    spec.Sigma.push(line);
                    sys.Sigma.push(line);
                    break;

                case 'System automaton states':
                    dfa = sys;
                case 'Specification automaton states':
                    dfa.Q.push(line);
                    break;

                case 'Transition function':
                    dfa.delta[line] = lines[++i];
                    break;

                case 'Initial state':
                    dfa.initial = line;
                    break;

                case 'Final states':
                    dfa.accept.push(line);
                    break;

                default:
                    console.log('error');
            }
        }
    }

    var M = spec.toDFA().complement().intersect(sys.toDFA());
    console.log(M);
};


require('fs').readFile('input.txt', 'utf8', function (err, input) {
    if (err) {
        console.log(err);
    } else {
        parserInput(input);
    }
});
