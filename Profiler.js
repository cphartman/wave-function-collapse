class Profiler {

    static Results = {}

    constructor(tag) {
        this.startTime = (new Date()).getTime();
        this.tag = tag;
    }

    end() {
        this.endTime = (new Date()).getTime();

        if (!Profiler.Results[this.tag]) {
            Profiler.Results[this.tag] = [];
        }

        let delta = this.endTime - this.startTime;
        if (delta < 1) delta = 1;
        Profiler.Results[this.tag].push(delta);
    }
}

module.exports = Profiler;