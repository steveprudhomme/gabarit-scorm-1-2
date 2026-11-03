// [FR] Tests sans dépendance : lancer node tests/scorm.test.cjs à la racine.
// [EN] Dependency-free tests: run node tests/scorm.test.cjs from the project root.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "src", "scorm_api_wrapper.js"), "utf8");

function environment(location = { protocol: "file:", hostname: "", pathname: "/test/index.html" }) {
    const memory = new Map();
    const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
    const context = { location, localStorage: storage, console, performance: { now: () => 0 } };
    context.parent = context;
    vm.createContext(context);
    vm.runInContext(source, context);
    return { engine: context.SCORM12, context, storage, memory };
}
function clientWithMock(options = {}) {
    const env = environment();
    const api = env.engine.createMockAPI({ storage: env.storage, storageKey: "test", ...options });
    return { ...env, api, client: env.engine.createClient({ api }) };
}

test("Les huit fonctions natives et leurs chaînes / Eight native functions and string returns", () => {
    const { client: c } = clientWithMock();
    assert.equal(c.LMSGetValue("cmi.core.student_id"), "");
    assert.equal(c.LMSInitialize(""), "true");
    assert.equal(c.LMSGetValue("cmi.core.student_id"), "DEMO_001");
    assert.equal(c.LMSSetValue("cmi.core.lesson_location", "slide-2"), "true");
    assert.equal(c.LMSCommit(""), "true");
    assert.equal(c.LMSSetValue("cmi.core.student_id", "x"), "false");
    assert.equal(c.LMSGetLastError(), "403");
    assert.match(c.LMSGetErrorString("403"), /read only/);
    assert.match(c.LMSGetDiagnostic("403"), /read only/);
    assert.equal(c.LMSFinish(""), "true");
    assert.equal(c.state, "finished");
    assert.equal(c.LMSSetValue("cmi.core.lesson_location", "x"), "false");
    assert.equal(c.LMSInitialize(""), "false");
});

test("Recherche parent et opener ; cycles et origine interdite / Parent-opener search, cycles, denied origins", () => {
    const { engine, api } = clientWithMock();
    const parent = { API: api }; parent.parent = parent;
    const opener = { parent };
    const child = { opener }; child.parent = child;
    assert.equal(engine.findAPI(child).api, api);
    const denied = { opener: parent };
    Object.defineProperty(denied, "API", { get() { throw new Error("Cross origin"); } });
    Object.defineProperty(denied, "parent", { get() { throw new Error("Cross origin"); } });
    const result = engine.findAPI(denied);
    assert.equal(result.api, api);
    assert.equal(result.blocked, true);
    const a = {}; const b = { parent: a }; a.parent = b;
    assert.equal(engine.findAPI(a).inspected, 2);
    assert.equal(engine.findAPI(child, 1).api, null);
});

test("Simulation locale, aucune simulation sur un LMS qui refuse / Local mock, no fallback on LMS failure", () => {
    const { engine } = environment();
    assert.equal(engine.initialize(), true);
    assert.equal(engine.isSimulation, true);
    const env = clientWithMock();
    env.api.LMSInitialize = () => "false";
    const c = env.engine.createClient({ api: env.api, simulation: true });
    assert.equal(c.initialize(), false);
    assert.equal(c.isSimulation, false);
    assert.equal(c.state, "new");
    const remote = environment({ protocol: "https:", hostname: "formation.example", pathname: "/index.html" });
    assert.equal(remote.engine.initialize(), false);
    assert.equal(remote.engine.lastError.code, "CLIENT_NO_API");
});

test("Accès lecture/écriture, mots-clés et modèle inconnu / Access rules, keywords and unknown model", () => {
    const { api } = clientWithMock();
    assert.equal(api.LMSInitialize("bad"), "false");
    assert.equal(api.LMSGetLastError(), "201");
    assert.equal(api.LMSInitialize(""), "true");
    assert.equal(api.LMSSetValue("cmi.core._children", "x"), "false");
    assert.equal(api.LMSGetLastError(), "402");
    assert.equal(api.LMSGetValue("cmi.core.session_time"), "");
    assert.equal(api.LMSGetLastError(), "404");
    assert.equal(api.LMSGetValue("cmi.inconnu"), "");
    assert.equal(api.LMSGetLastError(), "401");
    assert.match(api.LMSGetValue("cmi.core._children"), /lesson_status/);
    assert.equal(api.LMSGetValue("cmi.core.student_id._children"), "");
    assert.equal(api.LMSGetLastError(), "202");
    assert.equal(api.LMSGetValue("cmi.core._count"), "");
    assert.equal(api.LMSGetLastError(), "203");
});

test("Limites exactes 255 et JSON ASCII 4096 / Exact 255 and ASCII JSON 4096 boundaries", () => {
    const { client: c } = clientWithMock(); c.initialize();
    assert.equal(c.setBookmark("x".repeat(255)), true);
    assert.equal(c.setBookmark("x".repeat(256)), false);
    assert.equal(c.setBookmark("écran"), false);
    assert.equal(c.saveState({ a: "x".repeat(4088) }), true);
    assert.equal(c.get("cmi.suspend_data").length, 4096);
    assert.equal(c.saveState({ a: "x".repeat(4089) }), false);
    assert.equal(c.get("cmi.suspend_data").length, 4096);
    assert.equal(c.saveState({ note: "été 😀", nested: { answers: [1, 2] } }), true);
    assert.equal(c.loadState().note, "été 😀");
    assert.match(c.get("cmi.suspend_data"), /\\u00e9/);
    const cyclic = {}; cyclic.self = cyclic;
    assert.equal(c.saveState(cyclic), false);
    assert.equal(c.set("cmi.suspend_data", "{broken"), true);
    assert.equal(c.loadState(null), null);
    assert.equal(c.lastError.code, "CLIENT_JSON");
});

test("Statuts, score et préférences / Status, score and preferences", () => {
    const { client: c } = clientWithMock(); c.initialize();
    for (const status of ["passed", "completed", "failed", "incomplete", "browsed"]) assert.equal(c.setStatus(status), true);
    assert.equal(c.setStatus("not attempted"), false);
    assert.equal(c.setStatus("unknown"), false);
    assert.equal(c.setScore(75.5, 0, 100).ok, true);
    assert.equal(c.getScore().values.raw, "75.5");
    assert.equal(c.setScore(101, 0, 100).ok, false);
    assert.equal(c.setScore(-1, -10, 100).ok, false);
    assert.equal(c.setScore(80, 0, 200).ok, false);
    assert.equal(c.setScore(5, 10, 0).ok, false);
    assert.equal(c.setPreferences({ audio: -1, language: "fr", speed: -100, text: 1 }).ok, true);
    assert.equal(c.setPreferences({ audio: 101 }).ok, false);
    assert.equal(c.setPreferences({ speed: -101 }).ok, false);
    assert.equal(c.setPreferences({ text: 2 }).ok, false);
});

test("Toutes les familles d'interactions et liens objectifs / Every interaction family and objective links", () => {
    const { client: c } = clientWithMock(); c.initialize();
    const cases = [["true-false", "f"], ["choice", "{a,b}"], ["fill-in", "suspend_data"], ["matching", "{1.a,2.b}"],
        ["performance", "step=1"], ["sequencing", "b,c,a"], ["likert", "3"], ["numeric", "8.5"]];
    cases.forEach(([type, response], index) => {
        const report = c.recordInteraction({ id: "q_" + index, type, objectiveIds: ["objectif_1", "objectif_2"],
            correctResponses: [response], studentResponse: response, result: type === "likert" ? "neutral" : "correct",
            time: "23:59:59.99", weighting: 1.5, latency: "0000:00:04.25" });
        assert.equal(report.ok, true, JSON.stringify(report));
        assert.equal(report.index, index);
    });
    assert.equal(c.get("cmi.interactions._count"), "8");
    assert.equal(c.get("cmi.interactions.0.objectives._count"), "2");
    assert.equal(c.get("cmi.interactions.0.correct_responses._count"), "1");
    const result = c.read("cmi.interactions.0.student_response");
    assert.equal(result.ok, false); assert.equal(result.code, "404");
    assert.equal(c.recordInteraction({ id: "bad", type: "choice", studentResponse: "answerLong" }).ok, false);
    assert.equal(c.recordInteraction({ id: "bad", type: "matching", studentResponse: "a[.]b" }).ok, false);
    assert.equal(c.recordInteraction({ id: "bad", type: "numeric", studentResponse: "2:4" }).ok, false);
    assert.equal(c.recordInteraction({ id: "bad", type: "true-false", studentResponse: "true" }).ok, false);
    assert.equal(c.get("cmi.interactions._count"), "8");
});

test("Objectifs modifiés sans doublon et tous leurs champs / Objectives update without duplicates", () => {
    const { client: c } = clientWithMock(); c.initialize();
    assert.equal(c.setObjective({ id: "obj_1", raw: 75, min: 0, max: 100, status: "incomplete" }).ok, true);
    assert.equal(c.setObjective({ id: "OBJ_1", raw: 100, status: "passed" }).ok, true);
    assert.equal(c.get("cmi.objectives._count"), "1");
    assert.equal(c.getObjective(0).values.status, "passed");
    assert.equal(c.getObjective(0).values.min, "0");
    assert.equal(c.setObjective({ id: "obj_2", status: "not attempted" }).ok, true);
    assert.equal(c.setObjective({ id: "obj_3", raw: 200 }).ok, false);
    assert.equal(c.get("cmi.objectives._count"), "2");
    assert.equal(c.set("cmi.objectives.5.id", "gap"), false);
    assert.equal(c.set("cmi.objectives.n.id", "placeholder"), false);
});

test("Commentaires concaténés et capacité cumulée / Concatenated comments and total capacity", () => {
    const { client: c } = clientWithMock(); c.initialize();
    assert.equal(c.setComments("Premier.\n"), true);
    assert.equal(c.setComments("Deuxieme.\n"), true);
    assert.equal(c.getComments().values.learner, "Premier.\nDeuxieme.\n");
    assert.equal(c.setComments("x".repeat(4096)), false);
    assert.equal(c.saveState("not an object"), false);
});

test("Éléments optionnels : succès partiels visibles / Optional elements: visible partial success", () => {
    const { client: c } = clientWithMock({ unsupported: ["cmi.interactions", "cmi.core.score.min", "cmi.comments"] }); c.initialize();
    const score = c.setScore(80, 0, 100);
    assert.equal(score.ok, false);
    assert.equal(score.fields[0].ok, true);
    assert.equal(score.fields[1].code, "401");
    assert.equal(c.get("cmi.core.score.raw"), "80");
    assert.equal(c.recordInteraction({ id: "q", type: "numeric", studentResponse: "8" }).ok, false);
    assert.equal(c.getComments().fields.learner.code, "401");
    assert.equal(c.commit(), true);
});

test("Durées : format, écrasement et cumul entre sessions / Times: format, replacement and cumulative sessions", () => {
    const env = environment();
    assert.equal(env.engine.formatTime(3600000 + 61230), "0001:01:01.23");
    assert.equal(env.engine.parseTime("0012:30:00.50"), 45000500);
    assert.ok(Number.isNaN(env.engine.parseTime("00:60:00")));
    assert.throws(() => env.engine.formatTime(36000000000), /range/);
    let now = 1000;
    const api = env.engine.createMockAPI({ storage: env.storage, storageKey: "time" });
    const c = env.engine.createClient({ api, now: () => now }); c.initialize();
    now = 6000; assert.equal(c.commit(), true);
    now = 11000; assert.equal(c.commit(), true);
    assert.equal(c.get("cmi.core.total_time"), "0000:00:00.00");
    assert.equal(c.finish("suspend"), true);
    now = 12000; assert.equal(c.elapsedMilliseconds, 10000);
    now = 11000;
    const nextAPI = env.engine.createMockAPI({ storage: env.storage, storageKey: "time" });
    const next = env.engine.createClient({ api: nextAPI, now: () => now }); next.initialize();
    assert.equal(next.get("cmi.core.entry"), "resume");
    assert.equal(next.get("cmi.core.total_time"), "0000:00:10.00");
    now = 16000; assert.equal(next.finish(""), true);
    const third = env.engine.createClient({ api: env.engine.createMockAPI({ storage: env.storage, storageKey: "time" }) }); third.initialize();
    assert.equal(third.get("cmi.core.total_time"), "0000:00:15.00");
    assert.equal(third.get("cmi.core.entry"), "");
});

test("Reprise JSON et fermeture idempotente / JSON resume and idempotent finish", () => {
    const env = clientWithMock(); const c = env.client; c.initialize();
    c.setBookmark("slide-3"); c.saveState({ version: 1, reflection: "réponse" });
    assert.equal(c.finish("suspend"), true);
    assert.equal(c.finish("suspend"), true);
    const next = env.engine.createClient({ api: env.engine.createMockAPI({ storage: env.storage, storageKey: "test" }) });
    next.initialize();
    assert.equal(next.getBookmark(), "slide-3");
    assert.equal(next.loadState().reflection, "réponse");
});

test("Commit refusé : garder la session ouverte / Failed commit: keep the session open", () => {
    const { client: c, api } = clientWithMock(); c.initialize();
    api.LMSCommit = () => "false";
    assert.equal(c.finish("suspend"), false);
    assert.equal(c.state, "active");
    assert.equal(c.lastError.code, "CLIENT_FALSE_RETURN");
});

test("Stockage refusé et exceptions LMS / Denied storage and LMS exceptions", () => {
    const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
    const { engine } = environment();
    const mock = engine.createMockAPI({ storage: broken });
    const c = engine.createClient({ api: mock });
    assert.equal(c.initialize(), true);
    assert.equal(c.commit(), false);
    assert.equal(c.lastError.code, "101");
    assert.equal(mock.persistent, false);
    mock.LMSGetValue = () => { throw new Error("Disconnected LMS"); };
    assert.equal(c.read("cmi.core.student_name").code, "CLIENT_EXCEPTION");
});
