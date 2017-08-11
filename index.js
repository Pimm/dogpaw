#!/usr/bin/node

if (process.argv.length <= 2) {
	process.exit(0);
}

/**
 * Spawns a child process from the arguments that were passed to this process.
 */
const spawn = require('child_process').spawn.bind(
	undefined,
	process.argv[2],
	process.argv.slice(3),
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
			spawnAndListen();
		}
	}
	return () => {
		spawn().on('exit', handleExit);
	}
})();

spawnAndListen();
