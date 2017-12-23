class nexus {
    constructor(map, currentNexus, end, reject) {
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

            let def = new member.prop(
                member.dom,
                member.params,
                newNexus
            );

            def.then(instance => {
                member.instance = instance;
                newNexus.ready = true;
                newNexus.call();
            }).catch(error => reject);
        });
        return map;
    }
}

export default nexus;