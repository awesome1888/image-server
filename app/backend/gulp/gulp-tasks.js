const TaskMaker = require('../../../gulp/task-maker.js');

module.exports = class Tasks extends TaskMaker
{
    static getServiceName()
    {
        return 'backend';
    }

    static getFolder()
    {
        return `${__dirname}/../`;
    }
};
