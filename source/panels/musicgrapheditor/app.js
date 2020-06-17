const html = arg => arg.join(''); // NOOP, for editor integration.

const events = [
  'node-end',
  'time-passed',
  'text-clear-none',
  'text-clear-single',
  'text-clear-double',
  'text-clear-triple',
  'text-clear-quad',
  'text-t-spin',
  'text-spike',
  /*
    Single-player mode doesn't have the b2b combo counter so there's
    no way to tell once a b2b ends, so we use a seperate event
  */
  'text-b2b',
  'text-b2b-reset', // also_failed
  'text-b2b-combo', // also, also_permanent /B2B \d+/
  'text-combo'
];

[
  "allclear","applause","boardappear","btb_1","btb_2","btb_3","btb_break",
  "clearbtb","clearline","clearquad","clearspin","clutch","combo_1_power",
  "combo_1","combo_10_power","combo_10","combo_11_power","combo_11",
  "combo_12_power","combo_12","combo_13_power","combo_13","combo_14_power",
  "combo_14","combo_15_power","combo_15","combo_16_power","combo_16",
  "combo_2_power","combo_2","combo_3_power","combo_3","combo_4_power",
  "combo_4","combo_5_power","combo_5","combo_6_power","combo_6",
  "combo_7_power","combo_7","combo_8_power","combo_8","combo_9_power",
  "combo_9","combobreak","countdown1","countdown2","countdown3","countdown4",
  "countdown5","counter","damage_alert","damage_large","damage_medium",
  "damage_small","death","detonate1","detonate2","detonated","elim","exchange",
  "failure","finessefault","finish","fire","floor","gameover",
  "garbage_in_large","garbage_in_medium","garbage_in_small","garbage_out_large",
  "garbage_out_medium","garbage_out_small","garbagerise","garbagesmash","go",
  "harddrop","hit","hold","hyperalert","i","impact","j","l","level1","level10",
  "level100","level500","levelup","losestock","maintenance","matchintro",
  "menuback","menuclick","menuconfirm","menuhit1","menuhit2","menuhit3",
  "menuhover","menutap","mission_free","mission_league","mission_versus",
  "mission","mmstart","move","no","notify","o","offset","personalbest",
  "ranklower","rankraise","ratinglower","ratingraise","ribbon_off","ribbon_on",
  "ribbon_tap","ribbon","rotate","rsg_go","rsg","s","scoreslide_in",
  "scoreslide_out","shatter","showscore","sidehit","softdrop","spin","spinend",
  "t","target","thunder1","thunder2","thunder3","thunder4","thunder5",
  "thunder6","timer1","timer2","topout","userjoin","userleave","victory",
  "warning","worldrecord","z"
].forEach(sfx => {
  events.push('sfx-' + sfx + '-player');
  events.push('sfx-' + sfx + '-enemy');
});

const eventValueStrings = {
  'time-passed': 'Seconds',
  'text-b2b-combo': 'B2Bs performed',
  'text-spike': 'Min spike',
  'text-combo': 'Combo'
};

const app = new Vue({
  template: html`
    <div>
      <button @click="save">Save changes</button>
      <span :style="{ opacity: this.saveOpacity }">Saved!</span>
      <div>
        <fieldset v-for="node of nodes" :id="'node-' + node.id">
          <legend v-if="node.type == 'root'">
            Root
          </legend>
          <legend v-else>
            <input type="text" v-model="node.name"/>
            <button @click="removeNode(node)">❌</button>
            <button @click="shiftNode(node, -1)">🔼</button>
            <button @click="shiftNode(node, 1)">🔽</button>
          </legend>

          <div class="section" v-if="node.type != 'root'">
            Select audio:
            <select v-model="node.audio">
              <option :value="null">None</option>
              <option v-for="song of music" :value="song.id">
                {{ song.filename }}
              </option>
            </select>
            <div v-if="music.length == 0">
              (Add music in the main tetrio+ menu)
            </div>
          </div>

          <div v-if="(reverseLinkLookupTable[node.id] || []).size > 0"
               class="section">
            Linked from
            <span v-for="link of reverseLinkLookupTable[node.id]" class="linkback">
              <a :href="'#node-' + nodes[link].id">{{ nodes[link].name }}</a>
            </span>
          </div>

          Triggers
          <div class="triggers section">
            <div class="trigger" v-for="trigger of node.triggers">
              <div>
                <b>Event</b>
                <select v-model="trigger.event">
                  <option v-for="evt of events" :value="evt">{{evt}}</option>
                </select>
                <button @click="removeTrigger(node, trigger)">❌</button>
              </div>
              <div v-if="eventValueStrings[trigger.event]">
                <b>{{ eventValueStrings[trigger.event] }}</b>
                <input type="number" v-model.number="trigger.value" />
              </div>
              <div>
                <b>Mode</b>
                <span v-if="node.type == 'root'">
                  Create new node
                </span>
                <select v-model="trigger.mode" v-else>
                  <option value="fork">Create new node</option>
                  <option value="goto">Go to node</option>
                  <option value="kill">Stop executing</option>
                </select>
              </div>
              <div v-if="trigger.mode != 'kill'">
                <b>Target</b>
                <select v-model="trigger.target">
                  <option :value="node.id" v-for="node of nodes">
                    {{ node.name }}
                  </option>
                </select>
                <a :href="'#node-' + trigger.target">jump</a>
              </div>
              <div v-if="trigger.mode != 'kill'">
                <input type="checkbox" v-model="trigger.preserveLocation" />
                Preserve location after jumping
              </div>
            </div>
            <div>
              <button @click="addTrigger(node)">New trigger</button>
            </div>
          </div>
        </fieldset>
      </div>
      <button @click="addNode()">Add node</button>
    </div>
  `,
  data: {
    events,
    eventValueStrings,
    music: [],
    nodes: [{
      id: 0,
      type: 'root',
      name: 'root',
      audio: null,
      triggers: []
    }],
    maxId: 0,
    saveOpacity: 0
  },
  computed: {
    reverseLinkLookupTable() {
      let links = {};

      for (let node of this.nodes) {
        for (let trigger of node.triggers) {
          if (trigger.target == node.id) continue;
          links[trigger.target] = links[trigger.target] || new Set();
          links[trigger.target].add(node.id);
        }
      }

      return links;
    }
  },
  methods: {
    addNode() {
      this.nodes.push({
        id: ++this.maxId,
        type: 'normal',
        name: 'new node ' + this.maxId,
        audio: null,
        triggers: []
      })
    },
    addTrigger(node) {
      node.triggers.push({
        mode: 'goto', // fork | goto | kill
        target: node.id, // target node
        event: 'node-end',
        preserveLocation: false,
        // seconds for time-passed, value for text-combo, text-b2b, text-spike
        value: 0
      });
    },
    shiftNode(node, dir) {
      let index = this.nodes.indexOf(node);
      this.nodes.splice(index, 1);
      this.nodes.splice(index+dir, 0, node);
    },
    removeNode(node) {
      this.nodes.splice(this.nodes.indexOf(node), 1);
    },
    removeTrigger(node, trigger) {
      node.triggers.splice(node.triggers.indexOf(trigger), 1);
    },
    save() {
      browser.storage.local.set({
        musicGraph: JSON.stringify(this.nodes)
      });
      this.saveOpacity = 1.25;
      let timeout = setInterval(() => {
        this.saveOpacity -= 0.1;
        if (this.saveOpacity <= 0)
          clearTimeout(timeout);
      }, 50);
    }
  },
  mounted() {
    browser.storage.local.get([
      'music', 'musicGraph'
    ]).then(({ music, musicGraph }) => {
      console.log("Loaded", musicGraph);
      if (!musicGraph) return;
      this.nodes = JSON.parse(musicGraph);
      this.maxId = Math.max(...this.nodes.map(node => node.id));
      this.music = music;
    });
  }
});
app.$mount('#app');