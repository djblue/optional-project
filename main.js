#!/usr/bin/env node

var extend = require('util')._extend;
 
// create a string tupel representation of an array
var tuple = function (array) {
    var result = "(" + array[0];
    for (var i = 1; i < array.length; i++)
        result += "," + array[i];
    result += ")";
    return result;
};

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

Array.prototype.set = function () {
    var copy = this.slice();
    copy.sort()
    var result = "{" + copy[0];
    for (var i = 1; i < copy.length; i++)
        result += "," + copy[i];
    result += "}";
    return result;
};

// returns true is an array contains an element e
Array.prototype.contains = function (e) {
    return this.indexOf(e) > -1;
};

// an empty NFA
var NFA = function () {
    this.Q = [];            // set of all states for the DFA
    this.Sigma = [];        // alphabet of the DFA
    this.delta = {};        // the transition function of the DFA
    this.initial = "";      // initial state of DFA
    this.accept = [];       //set of all accept states for DFA
};

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

NFA.prototype.toString = function () {
    return JSON.stringify(this, null, 4);
};

// delta star function
NFA.prototype.deltastar = function (input) {
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
    var copy = extend({}, this);
    copy.prototype = this.prototype;
    return copy;
};

// returns a DFA from the current NFA (doesn't take into account epsilon
// transitions)
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

var DFA = function () {
    this.Q = [];            // set of all states for the DFA
    this.Sigma = [];        // alphabet of the DFA
    this.delta = {};        // the transition function of the DFA
    this.initial = "";      // initial state of DFA
    this.accept = [];       // set of all accept states for DFA
};

DFA.prototype = new NFA();
DFA.prototype.constructor = DFA;

DFA.prototype.toString = function () {
    return JSON.stringify(this, null, 4);
};

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
    rdfa.initial = tuple([this.initial, dfa.initial]);
    self.Q.cross(dfa.Q).forEach(function (c) {
        var state = tuple([c[0],c[1]]);
        rdfa.Q.push(state);
        self.Sigma.forEach (function (a) {
            rdfa.addTransition(state, a,
                tuple([ self.delta[c[0]][a], dfa.delta[c[1]][a] ]));
        });

        if (self.accept.contains(c[0])  &&  dfa.accept.contains(c[1])) {
            rdfa.accept.push(state);
        }
    });
    return rdfa;
};

DFA.prototype.searchString = function () {
    
    var example = "";
    var visited = [];

    var hasString = function (DFA, state) {
        if (DFA.accept.contains(state)) return true;

        visited.push(state);

        for (var i = 0; i < DFA.Sigma.length; i++) {
            var c = DFA.Sigma[i];
            var next = DFA.delta[state][c];
            if (!visited.contains(next) && hasString(DFA, next)) {
                example += c; 
                return true;
            }
        }
        
        return false;
    };

    if (hasString(this, this.initial)) {
        return "counterexample: " + example;
    } else {
        return "system satisfies the specification";
    }
};


// function to parse input.
var parserInput = function (input) {
    
    var lines = input.split("\n");
    var state = ""; // state of paring input

    var spec = new NFA()
      , sys  = new NFA()
      , nfa = spec;

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
                    nfa = sys;
                case 'Specification automaton states':
                    nfa.Q.push(line);
                    break;

                case 'Transition function':
                    var current = line.split(' ')[0];
                    var symbol  = line.split(' ')[1];
                    nfa.addTransition(current, symbol, lines[++i]);
                    break;

                case 'Initial state':
                    nfa.initial = line;
                    break;

                case 'Final states':
                    nfa.accept.push(line);
                    break;

                default:
                    console.log('error');
            }
        }
    }

    /*
    console.log(spec.toDFA().complement());
    console.log(sys.toDFA());
    console.log(spec.toDFA().complement().intersect(sys.toDFA()));
    */

    var M = spec.toDFA().complement().intersect(sys.toDFA());
    console.log(M.searchString());

};


require('fs').readFile('input.txt', 'utf8', function (err, input) {
    if (err) {
        console.log(err);
    } else {
        parserInput(input);
    }
});
