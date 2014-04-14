// fa.js

// This file contains a class definition of a NFA and a DFA

require('./util.js');

var extend = require('util')._extend;

// define the non-deterministic finite automota
var NFA = exports.NFA = function () {
    this.Q = [];            // set of all states for the DFA
    this.Sigma = [];        // alphabet of the DFA
    this.delta = {};        // the transition function of the DFA
    this.initial = "";      // initial state of DFA
    this.accept = [];       //set of all accept states for DFA
};

// add a transition to the nfa.
NFA.prototype.addTransition = function (current, symbol, next) {
    if (this.delta[current] == undefined) {
        this.delta[current] = {};
    }
    if (this.delta[current][symbol] == undefined) {
        this.delta[current][symbol] = [];
    }
    // add next to set of states
    this.delta[current][symbol].push(next);
};

// returns the clone of the current NFA (not too sure if this works yet)
NFA.prototype.clone = function () {
    var copy = extend({}, this);
    copy.prototype = this.prototype;
    return copy;
};

// returns a DFA from the current NFA (doesn't take into account epsilon
// transitions, although could add with an epsilon-closure function).
NFA.prototype.toDFA = function () {

    var self = this;
    var dfa = new DFA(); // the new DFA that will be returned

    // only item than can be copied directly
    dfa.initial = [this.initial].set(); 
    dfa.Sigma   = this.Sigma;

    dfa.Q.push("trap");
    this.Sigma.forEach(function (c) {
        dfa.addTransition("trap", c, "trap");
    });

    var queue = [ [this.initial] ]; // queue of unprocessed sets of states
    var processed = [];

    // while the queue is not empty (BFS)
    while (queue.length != 0) {

        var current = queue.shift(); // current set states

        dfa.Q.push(current.set());
        processed.push(current.set());

        this.Sigma.forEach(function (c) {

            var next = []; // next set of states for input c

            // compute the next state given symbol c
            current.forEach(function (state) {
                var q = self.delta[state][c];
                if (q instanceof Array && q.length > 0) {
                    q.forEach(function (s) {
                        if (!next.contains(s)) {
                            next.push(s);
                        }
                    });
                } 
            });

            if (next.length > 0) {

                dfa.addTransition(current.set(), c, next.set());

                // add next state to queue if it hasn't already been processed
                if (!processed.contains(next.set())) {
                    queue.push(next);
                }

            // doesn't go anywhere, send to trap state
            } else {
                dfa.addTransition(current.set(), c, "trap");
            }

        });

        // determine if the current sets of states have an accept state,
        // if so add the current set of states to the accept states of the
        // new DFA.
        for (var i = 0; i < current.length; i++) {
            if (this.accept.contains(current[i])) {
                dfa.accept.push(current.set());
                break;
            }
        }
    }

    return dfa; // and then there was a DFA
};


// define the deterministic finite automota
var DFA = exports.DFA = function () {
    this.Q = [];            // set of all states for the DFA
    this.Sigma = [];        // alphabet of the DFA
    this.delta = {};        // the transition function of the DFA
    this.initial = "";      // initial state of DFA
    this.accept = [];       // set of all accept states for DFA
};

DFA.prototype = new NFA();
DFA.prototype.constructor = DFA;

// add a transition to the dfa.
DFA.prototype.addTransition = function (current, symbol, next) {
    if (this.delta[current] == undefined) {
        this.delta[current] = {};
    }
    // set next state
    this.delta[current][symbol] = next;
};

// returns the complement of the current DFA
DFA.prototype.complement = function () {
    var copy = new DFA();
    copy = extend(copy, this);
    copy.accept = copy.Q.diff(copy.accept);
    return copy;
};

// return the intersection of two DFA's
DFA.prototype.intersect = function (dfa) {
    var self = this, rdfa = new DFA(); // the new dfa to return
    rdfa.Sigma = this.Sigma;
    rdfa.initial = [this.initial, dfa.initial].tuple();
    self.Q.cross(dfa.Q).forEach(function (c) {
        var state = [c[0],c[1]].tuple();
        rdfa.Q.push(state);
        self.Sigma.forEach (function (a) {
            rdfa.addTransition(state, a,
                [ self.delta[c[0]][a], dfa.delta[c[1]][a] ].tuple());
        });

        if (self.accept.contains(c[0])  &&  dfa.accept.contains(c[1])) {
            rdfa.accept.push(state);
        }
    });
    return rdfa;
};

// search through the dfa for any string (DFS search to accepting node).
DFA.prototype.searchString = function () {
    
    // book keeping variables
    var example = "";
    var visited = [];

    // method that recursively defines the search algorithm
    var hasString = function (DFA, state) {
        if (DFA.accept.contains(state)) return true;

        visited.push(state); // always mark visited states

        // check all symbols from current state
        for (var i = 0; i < DFA.Sigma.length; i++) {
            var c = DFA.Sigma[i];

            // calculate next state given the transition function
            var next = DFA.delta[state][c];

            if (!visited.contains(next) && hasString(DFA, next)) {
                example += c;
                return true;
            }
        }
        
        return false;
    };

    // return example if one is found, else return null
    if (hasString(this, this.initial)) {
        return example;
    } else {
        return null;
    }
};
