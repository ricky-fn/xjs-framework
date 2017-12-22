class nexus {
    constructor(map, currentNexus, end) {
        map.forEach(member => {
            let newNexus = {
                members: [],
                ready: false,
                call: function() {
                    try {
                        currentNexus.members.forEach(member => {
                            if (member.ready == false) {
                                throw false;
                            }
                        });
                    } catch (e) {
                        return e;
                    }
                    end && end();
                }
            };

            currentNexus.members.push(newNexus);

            let instance = new member.prop(member.dom, member.params, newNexus);
            instance.then(() => {
                newNexus.ready = true;
                newNexus.call();
            });
        })
    }
}

export default nexus;