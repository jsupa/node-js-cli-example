const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
const os = require('os');

class _events extends events {}
const e = new _events();

const cli = {};

e.on('man', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', (str) => {
    cli.responders.exit();
});

e.on('stats', (str) => {
    cli.responders.stats();
});

cli.responders = {};

cli.responders.help = () => {
    const commands = {
        man: 'Show this help page',
        exit: 'Kill the CLI (and the rest of the application)',
        stats: 'Get statistics on the underlying operating system and resource utilization',
    };
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = `\x1b[33m${key}\x1b[0m`;
            const padding = 20 - line.length;

            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;

            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    cli.horizontalLine();
};

cli.verticalSpace = (lines) => {
    lines = typeof lines === 'number' && lines > 0 ? lines : 1;

    for (i = 0; i < lines; i++) {
        console.log('');
    }
};

cli.horizontalLine = () => {
    const width = process.stdout.columns;

    let line = '';
    for (i = 0; i < width; i++) {
        line += '-';
    }
    console.log(line);
};

cli.centered = (str) => {
    str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;
    const leftPadding = Math.floor((width - str.length) / 2);
    let line = '';

    for (i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line);
};

cli.responders.exit = () => {
    console.log('\x1b[34m%s\x1b[0m', 'Exitting CLI');
    process.exit(0);
};

cli.responders.stats = () => {
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        Uptime: os.uptime() + ' seconds',
    };

    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            const value = stats[key];
            let line = `\x1b[33m${key}\x1b[0m`;
            const padding = 40 - line.length;

            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;

            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    cli.horizontalLine();
};

cli.processInput = (str) => {
    str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        const uniqueInputs = ['man', 'help', 'exit', 'stats'];

        let matchFound = false;
        let counter = 0;

        uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            console.log(
                '\x1b[31m%s\x1b[0m',
                `Sorry, I don't understand the command: ${str}`
            );
        }
    }
};

cli.init = () => {
    console.log('\x1b[34m%s\x1b[0m', 'CLI is running');

    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '🪐 > ',
    });

    _interface.prompt();

    _interface.on('line', (str) => {
        cli.processInput(str);
        _interface.prompt();
    });

    _interface.on('close', () => {
        cli.responders.exit();
    });
};

module.exports = cli;
