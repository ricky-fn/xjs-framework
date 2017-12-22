class nexus {
    constructor(map, currentNexus, end) {
        let newNexus = {
            members: [],
            ready: false,
            call: function() {
                if (currentNexus.call == null) {
                    return end();
                }
                let finished = true;
                currentNexus.members.forEach(member => {
                    if (member.ready == false) {
                        finished == false;
                    }
                });
                if (finished) {
                    end();
                }
            }
        };

        currentNexus.members.push(newNexus);

        map.forEach(member => {
            new member.prop(member.dom, () => {
                newNexus.ready = true;
                newNexus.call();
            }, member.params, newNexus);
        })
    }
}

export default nexus;