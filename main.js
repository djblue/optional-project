#!/usr/bin/env node

var fa      = require('./fa.js')
  , NFA     = fa.NFA
  , DFA     = fa.DFA;

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

    var M = spec.toDFA().complement().intersect(sys.toDFA());
    var search = M.searchString();

    // only program output
    if (search != null) {
        console.log('counterexample: "' + search +'"');
    } else {
        console.log('system satisfies the specification');
    }

};

if (!process.argv[2]) {
    console.log('USAGE: '+process.argv[0]+' [input]');
} else {
    // read the input file and parse the input
    require('fs').readFile(process.argv[2], 'utf8', function (err, input) {
        if (err) {
            console.log(err);
        } else {
            parserInput(input);
        }
    });
}
