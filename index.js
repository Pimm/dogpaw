#!/usr/bin/node

// Parse the arguments.
var childArguments;
const options = {
	delay: 0
};
(() => {
	// The first process argument is the interpreter ("/usr/bin/node"); the second is this script. Start at the third
	// argument and as long as the argument starts with a double dash ("--"), consume that argument and the next one as an
	// option. The arguments ["--artist", "Z-Ro"] become {artist: "Z-Ro"}.
	var processArgumentVectorIndex = 2;
	const optionArgumentMatcher = /^--([\w-]+)$/;
	var matches;
	while (process.argv.length > processArgumentVectorIndex + 1
			&& null !== (matches = optionArgumentMatcher.exec(process.argv[processArgumentVectorIndex]))) {
		options[matches[1]] = process.argv[processArgumentVectorIndex + 1];
		processArgumentVectorIndex += 2;
	}
	// All of the arguments which were not consumed as an option are saved as the child arguments.
	childArguments = process.argv.slice(processArgumentVectorIndex);
})();

// Normalise the options.
if ('string' === typeof options.delay) {
	var parsedDelay = parseInt(options.delay, 10);
	if (isNaN(parsedDelay)) {
		process.stderr.write(['Unexpected delay: ', options.delay, '\n'].join(''), 'utf8');
		process.exit(1);
	}
	options.delay = parsedDelay;
}

// Make sure there are actual child argument.
if (0 == childArguments.length) {
	process.stderr.write(['Nothing to do', '\n'].join(''), 'utf8');
	process.exit(0);
}

/**
 * Spawns a child process from the arguments that were passed to this process.
 */
const spawn = require('child_process').spawn.bind(
	undefined,
	childArguments[0],
	childArguments.slice(1),
	{
		detached: false,
		stdio: ['ignore', process.stdout, process.stderr]
	}
);

/**
 * Spawns a child process from the arguments that were passed to this process, and recursively calls this method if the
 * child process exits with a non-zero exit code.
 */
const spawnAndListen = (() => {
	function handleExit(code) {
		if (0 == code) {
			process.stdout.write(['Child process exited with code 0', '\n'].join(''), 'utf8');
		} else /* if (0 != code) */ {
			process.stdout.write(['Child process exited with code ', code, ', restarting', '\n'].join(''), 'utf8');
			const {delay} = options;
			if (0 == delay) {
				spawnAndListen();
			} else /* if (0 != delay) */ {
				setTimeout(spawnAndListen, delay);
			}
		}
	}
	return () => {
		spawn().on('exit', handleExit);
	}
})();

spawnAndListen();
