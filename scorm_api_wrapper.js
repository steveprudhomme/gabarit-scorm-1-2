// [FR] Gabarit SCORM 1.2 : interprète entre votre capsule et le LMS. Voir docs/SOURCES.md.
// [EN] SCORM 1.2 template: interpreter between your lesson and the LMS. See docs/SOURCES.md.
(function (root) {
    "use strict";

    // [FR] Les huit noms officiels ; la valeur de retour SCORM est toujours une chaîne.
    // [EN] The eight official names; a SCORM return value is always a string.
    const METHODS = ["LMSInitialize", "LMSFinish", "LMSGetValue", "LMSSetValue", "LMSCommit", "LMSGetLastError", "LMSGetErrorString", "LMSGetDiagnostic"];
    const STATUS = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted"];
    const TYPES = ["true-false", "choice", "fill-in", "matching", "performance", "sequencing", "likert", "numeric"];
    const EXITS = ["suspend", "logout", "time-out", ""];
    const ERRORS = {
        "0": "No error", "101": "General exception", "201": "Invalid argument error",
        "202": "Element cannot have children", "203": "Element not an array - cannot have count",
        "301": "Not initialized", "401": "Not implemented error",
        "402": "Invalid set value, element is a keyword", "403": "Element is read only",
        "404": "Element is write only", "405": "Incorrect Data Type"
    };

    // [FR] Description complète des feuilles cmi : accès R, W ou RW ; M = LMS obligatoire.
    // [EN] Complete cmi leaf descriptions: access R, W or RW; M = mandatory for the LMS.
    const MODEL = {
        "cmi.core.student_id": ["R", "identifier", true, "DEMO_001"],
        "cmi.core.student_name": ["R", "string255", true, "Apprenant, Camille"],
        "cmi.core.lesson_location": ["RW", "string255", true, ""],
        "cmi.core.credit": ["R", ["credit", "no-credit"], true, "credit"],
        "cmi.core.lesson_status": ["RW", STATUS, true, "not attempted"],
        "cmi.core.entry": ["R", ["ab-initio", "resume", ""], true, "ab-initio"],
        "cmi.core.score.raw": ["RW", "score", true, ""],
        "cmi.core.score.min": ["RW", "score", false, ""],
        "cmi.core.score.max": ["RW", "score", false, ""],
        "cmi.core.total_time": ["R", "timespan", true, "0000:00:00.00"],
        "cmi.core.lesson_mode": ["R", ["normal", "review", "browse"], false, "normal"],
        "cmi.core.exit": ["W", EXITS, true, ""],
        "cmi.core.session_time": ["W", "timespan", true, "0000:00:00.00"],
        "cmi.suspend_data": ["RW", "string4096", true, ""],
        "cmi.launch_data": ["R", "string4096", true, "theme=scorm12&version=1"],
        "cmi.comments": ["RW", "string4096", false, ""],
        "cmi.comments_from_lms": ["R", "string4096", false, "Bienvenue dans le simulateur local."],
        "cmi.objectives.n.id": ["RW", "identifier", false, ""],
        "cmi.objectives.n.score.raw": ["RW", "score", false, ""],
        "cmi.objectives.n.score.min": ["RW", "score", false, ""],
        "cmi.objectives.n.score.max": ["RW", "score", false, ""],
        "cmi.objectives.n.status": ["RW", STATUS, false, "not attempted"],
        "cmi.student_data.mastery_score": ["R", "decimalBlank", false, "80"],
        "cmi.student_data.max_time_allowed": ["R", "timespan", false, "0000:30:00.00"],
        "cmi.student_data.time_limit_action": ["R", ["exit,message", "exit,no message", "continue,message", "continue,no message"], false, "continue,message"],
        "cmi.student_preference.audio": ["RW", "audio", false, "0"],
        "cmi.student_preference.language": ["RW", "string255", false, ""],
        "cmi.student_preference.speed": ["RW", "speed", false, "0"],
        "cmi.student_preference.text": ["RW", ["-1", "0", "1"], false, "0"],
        "cmi.interactions.n.id": ["W", "identifier", false, ""],
        "cmi.interactions.n.objectives.n.id": ["W", "identifier", false, ""],
        "cmi.interactions.n.time": ["W", "time", false, ""],
        "cmi.interactions.n.type": ["W", TYPES, false, ""],
        "cmi.interactions.n.correct_responses.n.pattern": ["W", "feedback", false, ""],
        "cmi.interactions.n.weighting": ["W", "decimal", false, ""],
        "cmi.interactions.n.student_response": ["W", "feedback", false, ""],
        "cmi.interactions.n.result": ["W", "result", false, ""],
        "cmi.interactions.n.latency": ["W", "timespan", false, ""]
    };
    const CHILDREN = {
        "cmi.core": "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time",
        "cmi.core.score": "raw,min,max", "cmi.objectives": "id,score,status",
        "cmi.objectives.n.score": "raw,min,max",
        "cmi.student_data": "mastery_score,max_time_allowed,time_limit_action",
        "cmi.student_preference": "audio,language,speed,text",
        "cmi.interactions": "id,objectives,time,type,correct_responses,weighting,student_response,result,latency"
    };

    // [FR] Les index numériques sont remplacés par n pour consulter la description commune.
    // [EN] Numeric indexes become n when looking up their shared description.
    const normalize = path => String(path).replace(/\.\d+(?=\.|$)/g, ".n");
    const ascii = value => !/[^\x00-\x7f]/.test(value);
    const decimal = value => /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) && Number.isFinite(Number(value));
    const spanValid = value => /^\d{2,4}:[0-5]\d:[0-5]\d(?:\.\d{1,2})?$/.test(value);
    const clockValid = value => /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,2})?$/.test(value);

    // [FR] On émet quatre chiffres d'heures, bien que la norme accepte de deux à quatre.
    // [EN] We emit four hour digits, although the standard accepts two through four.
    function formatTime(milliseconds) {
        // [FR] Refuser une durée négative ou trop grande plutôt que produire un texte SCORM invalide.
        // [EN] Reject negative or oversized durations rather than emit an invalid SCORM string.
        if (!Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds >= 36000000000) {
            throw new RangeError("Durée hors plage / Duration out of range (0–9999 h).");
        }
        // [FR] Un centième de seconde vaut 10 ms ; l'arrondi inférieur évite tout report incohérent.
        // [EN] One hundredth of a second is 10 ms; flooring prevents inconsistent carry-over.
        const cs = Math.floor(milliseconds / 10);
        return String(Math.floor(cs / 360000)).padStart(4, "0") + ":" +
            String(Math.floor(cs / 6000) % 60).padStart(2, "0") + ":" +
            String(Math.floor(cs / 100) % 60).padStart(2, "0") + "." + String(cs % 100).padStart(2, "0");
    }
    function parseTime(value) {
        // [FR] Une valeur non conforme devient NaN : l'appelant doit prévoir son repli.
        // [EN] An invalid value becomes NaN: the caller must supply a fallback.
        if (!spanValid(value)) return NaN;
        const parts = value.split(":").map(Number);
        return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    function clockTime(date = new Date()) {
        // [FR] Une heure de réponse n'est pas une durée : elle utilise l'horloge locale sur 24 h.
        // [EN] A response timestamp is not a duration: it uses the local 24-hour clock.
        return [date.getHours(), date.getMinutes(), date.getSeconds()].map(n => String(n).padStart(2, "0")).join(":") +
            "." + String(Math.floor(date.getMilliseconds() / 10)).padStart(2, "0");
    }

    // [FR] JSON ASCII : un accent devient \uXXXX ; compter APRÈS cet encodage, jamais tronquer.
    // [EN] ASCII JSON: an accent becomes \uXXXX; count AFTER encoding, never truncate.
    function encodeJSON(object) {
        // [FR] Accepter un objet de progression, pas une valeur scalaire que loadState ne pourrait restaurer.
        // [EN] Accept a progress object, not a scalar that loadState could not restore.
        if (!object || typeof object !== "object" || Array.isArray(object)) throw new TypeError("Objet JSON attendu / JSON object expected.");
        const json = JSON.stringify(object);
        // [FR] JSON.stringify peut échouer, par exemple avec une référence circulaire ; saveState intercepte cela.
        // [EN] JSON.stringify may fail, for instance on a circular reference; saveState catches that failure.
        if (typeof json !== "string") throw new TypeError("Objet JSON attendu / JSON object expected.");
        const encoded = json.replace(/[\u007f-\uffff]/g, char => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"));
        if (encoded.length > 4096) throw new RangeError("suspend_data : " + encoded.length + " / 4096 caractères ASCII / ASCII characters.");
        return encoded;
    }

    // [FR] Les formats ci-dessous sont SCORM 1.2 : lettres simples, virgules, points et accolades.
    // [EN] These are SCORM 1.2 formats: single letters, commas, periods and curly braces.
    function feedbackValid(type, value) {
        // [FR] La chaîne envoyée n'est pas le libellé affiché : limiter sa taille et son alphabet.
        // [EN] The transmitted string is not the display label: constrain its length and alphabet.
        if (!ascii(value) || value.length > 255) return false;
        const list = "[a-z0-9](?:,[a-z0-9])*";
        const pairs = "[a-z0-9]\\.[a-z0-9](?:,[a-z0-9]\\.[a-z0-9])*";
        switch (type) {
        case "true-false": return /^[01tf]$/.test(value);
        case "choice": return new RegExp("^(?:" + list + "|\\{" + list + "\\})$").test(value);
        case "matching": return new RegExp("^(?:" + pairs + "|\\{" + pairs + "\\})$").test(value);
        case "sequencing": return new RegExp("^" + list + "$").test(value);
        case "numeric": return decimal(value);
        case "likert": return value === "" || /^[a-z0-9]$/.test(value);
        case "fill-in": case "performance": return true;
        default: return false;
        }
    }
    function valid(type, value, interactionType) {
        // [FR] Un tableau définit un vocabulaire fermé : respecter chaque espace et chaque tiret.
        // [EN] An array defines a closed vocabulary: preserve every space and hyphen.
        if (Array.isArray(type)) return type.includes(value);
        if (type === "identifier") return /^[\x21-\x7e]{1,255}$/.test(value);
        if (type === "string255") return ascii(value) && value.length <= 255;
        if (type === "string4096") return ascii(value) && value.length <= 4096;
        if (type === "decimalBlank") return value === "" || decimal(value);
        if (type === "score") return value === "" || (decimal(value) && Number(value) >= 0 && Number(value) <= 100);
        if (type === "decimal") return decimal(value);
        if (type === "time") return clockValid(value);
        if (type === "timespan") return spanValid(value);
        if (type === "audio") return /^-?\d+$/.test(value) && Number(value) >= -1 && Number(value) <= 100;
        if (type === "speed") return /^-?\d+$/.test(value) && Number(value) >= -100 && Number(value) <= 100;
        if (type === "result") return ["correct", "wrong", "unanticipated", "neutral"].includes(value) || decimal(value);
        if (type === "feedback") return feedbackValid(interactionType, value);
        return false;
    }

    // [FR] Recherche bornée dans les parents puis les fenêtres ouvrantes ; aucune référence à SCORM 2004.
    // [EN] Bounded search through parents, then opener windows; no reference to SCORM 2004.
    function findAPI(start = root, limit = 500) {
        // [FR] Mémoriser les fenêtres évite les boucles si plusieurs chemins mènent au même parent.
        // [EN] Remember windows to avoid loops when multiple paths reach the same parent.
        const seen = new Set();
        const openers = [];
        let blocked = false;
        function parents(win) {
            while (win && !seen.has(win) && seen.size < limit) {
                seen.add(win);
                try {
                    // [FR] Le nom exact est API ; vérifier ses méthodes avant d'adopter l'objet trouvé.
                    // [EN] The exact name is API; verify its methods before adopting the discovered object.
                    const api = win.API;
                    if (api && METHODS.every(name => typeof api[name] === "function")) return api;
                } catch (error) { blocked = true; }
                // [FR] Un opener peut exister sur le sommet de la chaîne ; le conserver pour la seconde recherche.
                // [EN] An opener may exist at the top of the chain; retain it for the second search.
                try { if (win.opener && !seen.has(win.opener)) openers.push(win.opener); } catch (error) { blocked = true; }
                try {
                    if (!win.parent || win.parent === win) break;
                    win = win.parent;
                } catch (error) { blocked = true; break; }
            }
            return null;
        }
        let api = parents(start);
        while (!api && openers.length && seen.size < limit) api = parents(openers.shift());
        return { api, blocked, inspected: seen.size };
    }

    // [FR] Simulateur pédagogique : respecte les accès, les vocabulaires et les index ; sans certification.
    // [EN] Teaching simulator: enforces access, vocabularies and indexes; it is not certified.
    function createMockAPI(options = {}) {
        let state = "new";
        let error = "0";
        let diagnostic = "";
        let data = {};
        let baseTotal = 0;
        const key = options.storageKey || "gabarit-scorm12-v1:" + (root.location ? root.location.pathname + (root.location.search || "") : "demo");
        const unsupported = options.unsupported || [];
        let storage = options.storage;
        let persistent = true;
        // [FR] Même lire localStorage peut être interdit ; un double-clic doit malgré tout pouvoir démarrer.
        // [EN] Even reading localStorage can be denied; opening a local file should still be able to start.
        try { if (storage === undefined) storage = root.localStorage; } catch (exception) { persistent = false; }
        function fail(code, detail) { error = code; diagnostic = detail || ERRORS[code]; return "false"; }
        function success(value = "true") { error = "0"; diagnostic = ""; return value; }
        function supported(path) { return !unsupported.some(prefix => path === prefix || path.startsWith(prefix + ".")); }
        function count(prefix) {
            // [FR] _count renvoie une quantité ; le plus grand index occupé vaut quantité moins un.
            // [EN] _count returns a quantity; the largest occupied index is quantity minus one.
            const indexes = Object.keys(data).filter(path => path.startsWith(prefix + "."))
                .map(path => path.slice(prefix.length + 1).split(".")[0]).filter(part => /^\d+$/.test(part)).map(Number);
            return indexes.length ? Math.max(...indexes) + 1 : 0;
        }
        function save() {
            // [FR] La sauvegarde locale est synchrone, mais peut échouer si le navigateur refuse son tiroir.
            // [EN] Local persistence is synchronous but can fail if the browser denies its storage drawer.
            try {
                if (!storage) { persistent = false; return success(); }
                storage.setItem(key, JSON.stringify({ version: 1, data }));
                persistent = true;
                return success();
            } catch (exception) {
                persistent = false;
                return fail("101", "Stockage local refusé ; mémoire seulement / Local storage denied; memory only.");
            }
        }
        function arrayParentExists(path) {
            // [FR] Créer l'identifiant du record avant ses champs et ne jamais sauter un numéro.
            // [EN] Create the record identifier before its fields and never skip an index.
            const parts = path.split(".");
            for (let i = 0; i < parts.length; i += 1) {
                if (/^\d+$/.test(parts[i])) {
                    const prefix = parts.slice(0, i).join(".");
                    const index = Number(parts[i]);
                    if (index > count(prefix)) return false;
                    if (i === 2 && path !== prefix + "." + index + ".id" && !data[prefix + "." + index + ".id"]) return false;
                }
            }
            return true;
        }
        const api = {
            LMSInitialize(argument) {
                // [FR] Une chaîne vide est le paramètre imposé ; une session ne s'ouvre qu'une fois.
                // [EN] The required argument is an empty string; a session opens only once.
                if (argument !== "") return fail("201");
                if (state !== "new") return fail("101", "Session déjà ouverte ou fermée / Session already opened or closed.");
                // [FR] Initialiser les feuilles simples ; les tableaux naissent lors de l'enregistrement d'un id.
                // [EN] Initialize scalar leaves; array records are created when an id is recorded.
                Object.entries(MODEL).filter(([path]) => !path.includes(".n.")).forEach(([path, definition]) => { data[path] = definition[3]; });
                try {
                    // [FR] Ne restaurer que les clés du modèle ; ne jamais exécuter une donnée enregistrée.
                    // [EN] Restore only model keys; never execute stored data.
                    const saved = storage && JSON.parse(storage.getItem(key) || "null");
                    if (saved && saved.version === 1 && saved.data && typeof saved.data === "object") {
                        Object.entries(saved.data).forEach(([path, value]) => {
                            if (MODEL[normalize(path)] && typeof value === "string") data[path] = value;
                        });
                        data["cmi.core.entry"] = saved.data["cmi.core.exit"] === "suspend" ? "resume" : "";
                    }
                } catch (exception) { persistent = false; }
                baseTotal = parseTime(data["cmi.core.total_time"]) || 0;
                data["cmi.core.session_time"] = "0000:00:00.00";
                data["cmi.core.exit"] = "";
                state = "active";
                return success();
            },
            LMSFinish(argument) {
                // [FR] Additionner la dernière durée de session une seule fois au cumul antérieur.
                // [EN] Add the last session duration to the previous total exactly once.
                if (argument !== "") return fail("201");
                if (state !== "active") return fail("301");
                const total = Math.min(35999999990, baseTotal + (parseTime(data["cmi.core.session_time"]) || 0));
                data["cmi.core.total_time"] = formatTime(total);
                if (save() !== "true") return "false";
                state = "finished";
                return success();
            },
            LMSGetValue(path) {
                // [FR] Les détails d'interaction sont interdits en lecture ; une chaîne vide peut porter une erreur.
                // [EN] Interaction details cannot be read; an empty string may carry an error.
                if (state !== "active") { fail("301"); return ""; }
                if (typeof path !== "string") { fail("201"); return ""; }
                if (!supported(path)) { fail("401"); return ""; }
                const normalized = normalize(path);
                if (path.endsWith("._children")) {
                    const parent = normalized.slice(0, -10);
                    if (!CHILDREN[parent]) { fail("202"); return ""; }
                    return success(CHILDREN[parent].split(",").filter(child => supported(path.slice(0, -10) + "." + child)).join(","));
                }
                if (path.endsWith("._count")) {
                    if (!/^cmi\.(objectives|interactions)(?:\.\d+\.(?:objectives|correct_responses))?\._count$/.test(path)) { fail("203"); return ""; }
                    return success(String(count(path.slice(0, -7))));
                }
                const definition = path.includes(".n.") ? undefined : MODEL[normalized];
                if (!definition) { fail("401"); return ""; }
                if (definition[0] === "W") { fail("404"); return ""; }
                return success(data[path] === undefined ? definition[3] : data[path]);
            },
            LMSSetValue(path, value) {
                // [FR] Ordre des contrôles : session, arguments, support, accès, format puis index.
                // [EN] Check session, arguments, support, access, format and indexes in that order.
                if (state !== "active") return fail("301");
                if (typeof path !== "string" || typeof value !== "string") return fail("201");
                if (!supported(path)) return fail("401");
                if (/\._(?:count|children)$/.test(path)) return fail("402");
                const definition = path.includes(".n.") ? undefined : MODEL[normalize(path)];
                if (!definition) return fail("401");
                if (definition[0] === "R") return fail("403");
                const interaction = /^cmi\.interactions\.\d+/.exec(path);
                const type = interaction ? data[interaction[0] + ".type"] : undefined;
                if (!valid(definition[1], value, type)) return fail("405", "Valeur ou format refusé / Value or format rejected: " + path);
                if (!arrayParentExists(path)) return fail("201", "Créer id en premier, sans saut d'index / Create id first without index gaps.");
                // [FR] Le RTE 1.2 demande la concaténation des commentaires, contrairement au signet.
                // [EN] The 1.2 RTE requires concatenating comments, unlike the bookmark.
                const storedValue = path === "cmi.comments" ? (data[path] || "") + value : value;
                if (path === "cmi.comments" && storedValue.length > 4096) return fail("405", "Commentaires cumulés trop longs / Accumulated comments too long.");
                data[path] = storedValue;
                return success();
            },
            LMSCommit(argument) {
                // [FR] Commit sauvegarde sans fermer et sans ajouter la durée au cumul.
                // [EN] Commit persists without closing and without adding session time to the total.
                if (argument !== "") return fail("201");
                if (state !== "active") return fail("301");
                return save();
            },
            LMSGetLastError() { return error; },
            LMSGetErrorString(code) { return ERRORS[String(code)] || "Unknown error"; },
            LMSGetDiagnostic(code) { return diagnostic || ERRORS[String(code || error)] || "Unknown error"; },
            // [FR] Ces deux propriétés sont des aides de simulation, jamais des méthodes SCORM.
            // [EN] These two properties are simulation aids, never SCORM methods.
            get persistent() { return persistent; },
            get storageKey() { return key; }
        };
        return api;
    }

    // [FR] Un client représente une seule session ; createClient sert aussi aux tests isolés.
    // [EN] One client represents one session; createClient also enables isolated tests.
    function createClient(options = {}) {
        let api = options.api || null;
        let state = "new";
        let simulation = false;
        let startedAt = 0;
        let stoppedAt = 0;
        let last = { ok: true, code: "0", message: "", diagnostic: "" };
        const now = options.now || (() => root.performance ? root.performance.now() : Date.now());
        const history = [];
        function emit(name, detail) {
            if (root.dispatchEvent && root.CustomEvent) root.dispatchEvent(new root.CustomEvent(name, { detail }));
        }
        function record(result) {
            // [FR] Une copie de l'erreur et un journal borné rendent un refus visible après les appels suivants.
            // [EN] A saved error and bounded history keep a rejection inspectable after later calls.
            last = result;
            history.push(result);
            if (history.length > 200) history.shift();
            emit("scorm:log", result);
            if (!result.ok) emit("scorm:error", result);
            if ((options.debug || simulation) && root.console) root.console[result.ok ? "info" : "warn"]("[SCORM 1.2]", result.method, result.element || "", result.code);
            return result;
        }
        function clientError(message, code = "CLIENT_VALIDATION") {
            return record({ ok: false, code, message, diagnostic: message, method: "client", value: "" });
        }
        function chooseAPI() {
            // [FR] Une vraie API a toujours priorité ; ne pas basculer en local après son refus.
            // [EN] A real API always takes priority; never switch to local mode after its rejection.
            if (api) return true;
            const found = findAPI(options.window || root);
            api = found.api;
            if (api) return true;
            const location = root.location || {};
            const local = location.protocol === "file:" || ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
            // [FR] La simulation forcée est une option de développement explicite, pas le réglage du cours livré.
            // [EN] Forced simulation is an explicit development option, not the shipped course setting.
            const allow = options.simulation === true || (options.simulation !== false && local && !found.blocked);
            if (!allow) {
                clientError("API SCORM 1.2 introuvable ou inaccessible. Relancer depuis le LMS / SCORM 1.2 API missing or inaccessible. Launch from the LMS.", "CLIENT_NO_API");
                return false;
            }
            api = createMockAPI(options.mock || {});
            simulation = true;
            return true;
        }
        function invoke(method, ...args) {
            // [FR] Centraliser tous les échanges évite d'oublier le contrôle d'erreur sur un seul bouton.
            // [EN] Centralizing communication prevents forgetting error checks on an individual button.
            if (!api) return clientError("API absente / API missing.", "CLIENT_NO_API");
            try {
                const value = String(api[method](...args));
                // [FR] Lire l'erreur immédiatement : l'appel suivant pourrait l'effacer.
                // [EN] Read the error immediately: the next call might clear it.
                const code = String(api.LMSGetLastError());
                const ok = code === "0" && (method === "LMSGetValue" || value === "true");
                return record({ ok, value, code: ok ? "0" : (code === "0" ? "CLIENT_FALSE_RETURN" : code),
                    message: ok ? "" : String(api.LMSGetErrorString(code)),
                    diagnostic: ok ? "" : String(api.LMSGetDiagnostic(code)), method, element: args[0] });
            } catch (exception) {
                return clientError("Communication interrompue / Communication interrupted: " + exception.message, "CLIENT_EXCEPTION");
            }
        }
        function ready() {
            if (state === "active") return true;
            clientError("La session doit être ouverte / The session must be open.", "CLIENT_SESSION");
            return false;
        }
        const client = {
            // [FR] Les huit façades portent les noms natifs et renvoient des chaînes, pas des booléens.
            // [EN] These eight facades use native names and return strings rather than booleans.
            LMSInitialize(argument) {
                // [FR] L'utilitaire initialize appelle cette façade avec le paramètre vide correct.
                // [EN] The initialize helper calls this facade with the correct empty argument.
                if (argument !== "") { clientError("LMSInitialize attend une chaîne vide / LMSInitialize expects an empty string."); return "false"; }
                if (state !== "new") { clientError("Une seule initialisation par session / Only initialize once per session.", "CLIENT_SESSION"); return "false"; }
                if (!chooseAPI()) return "false";
                const result = invoke("LMSInitialize", argument);
                if (result.ok) { state = "active"; startedAt = now(); }
                return result.ok ? "true" : "false";
            },
            LMSFinish(argument) {
                if (!ready()) return "false";
                const result = invoke("LMSFinish", argument);
                if (result.ok) { stoppedAt = now(); state = "finished"; }
                return result.ok ? "true" : "false";
            },
            LMSGetValue(element) { return ready() ? invoke("LMSGetValue", element).value : ""; },
            LMSSetValue(element, value) { return ready() && invoke("LMSSetValue", element, String(value)).ok ? "true" : "false"; },
            LMSCommit(argument) { return ready() && invoke("LMSCommit", argument).ok ? "true" : "false"; },
            LMSGetLastError() { return String(last.code); },
            LMSGetErrorString(code) {
                if (String(code).startsWith("CLIENT_")) return last.message;
                try { return api ? String(api.LMSGetErrorString(String(code))) : ERRORS[String(code)] || "Unknown error"; }
                catch (exception) { return exception.message; }
            },
            LMSGetDiagnostic(code) {
                if (String(code).startsWith("CLIENT_")) return last.diagnostic;
                try { return api ? String(api.LMSGetDiagnostic(String(code))) : last.diagnostic; }
                catch (exception) { return exception.message; }
            },
            initialize() { return client.LMSInitialize("") === "true"; },
            read(element) {
                if (!ready()) return { ...last };
                return { ...invoke("LMSGetValue", element) };
            },
            get(element, fallback = "") { const result = client.read(element); return result.ok ? result.value : fallback; },
            set(element, value) { return client.LMSSetValue(element, value) === "true"; },
            get lastError() { return { ...last }; },
            get history() { return history.slice(); },
            get state() { return state; },
            get isSimulation() { return simulation; },
            get persistent() { return simulation ? api.persistent : null; },
            get elapsedMilliseconds() { return state === "new" ? 0 : Math.max(0, (state === "finished" ? stoppedAt : now()) - startedAt); },
            get mode() { return client.get("cmi.core.lesson_mode", "normal"); },
            getIdentity() {
                // [FR] Lecture groupée avec un résultat par champ : lesson_mode peut être absent même si le nom existe.
                // [EN] Grouped reads keep one result per field: lesson_mode may be missing even when the name exists.
                return readGroup({ id: "cmi.core.student_id", name: "cmi.core.student_name", credit: "cmi.core.credit",
                    mode: "cmi.core.lesson_mode", entry: "cmi.core.entry", launchData: "cmi.launch_data" });
            },
            getBookmark() { return client.get("cmi.core.lesson_location"); },
            setBookmark(value) {
                if (typeof value !== "string" || value.length > 255 || !ascii(value)) return invalid("Marque-page : au plus 255 caractères ASCII / Bookmark: at most 255 ASCII characters.");
                return client.set("cmi.core.lesson_location", value);
            },
            getStatus() { return client.get("cmi.core.lesson_status"); },
            setStatus(value) {
                // [FR] not attempted appartient au vocabulaire, mais son initialisation revient au LMS.
                // [EN] not attempted belongs to the vocabulary, but the LMS initializes it.
                if (!STATUS.includes(value) || value === "not attempted") return invalid("Statut de leçon invalide / Invalid lesson status.");
                return client.set("cmi.core.lesson_status", value);
            },
            getScore() { return readGroup({ raw: "cmi.core.score.raw", min: "cmi.core.score.min", max: "cmi.core.score.max" }); },
            setScore(raw, min = 0, max = 100) {
                // [FR] ADL 1.2 demande des scores normalisés ; le helper contrôle aussi la cohérence min/raw/max.
                // [EN] ADL 1.2 requires normalized scores; this helper also checks min/raw/max consistency.
                if (![raw, min, max].every(n => decimal(String(n)) && Number(n) >= 0 && Number(n) <= 100) || Number(min) > Number(max) || Number(raw) < Number(min) || Number(raw) > Number(max)) {
                    return badReport("Score normalisé : 0 ≤ min ≤ raw ≤ max ≤ 100 / Normalized score: 0 ≤ min ≤ raw ≤ max ≤ 100.");
                }
                return writeFields([["cmi.core.score.raw", raw], ["cmi.core.score.min", min], ["cmi.core.score.max", max]]);
            },
            saveSessionTime() {
                // [FR] Envoyer le total écoulé depuis Initialize, jamais un incrément depuis le dernier Commit.
                // [EN] Send total elapsed time since Initialize, never an increment since the last Commit.
                try { return client.set("cmi.core.session_time", formatTime(client.elapsedMilliseconds)); }
                catch (exception) { return invalid(exception.message); }
            },
            setExit(value = "suspend") {
                if (!EXITS.includes(value)) return invalid("Sortie invalide / Invalid exit value.");
                return client.set("cmi.core.exit", value);
            },
            saveState(object) {
                // [FR] Préparer toute la chaîne avant SetValue : un JSON trop long laisse la sauvegarde précédente intacte.
                // [EN] Prepare the whole string before SetValue: oversized JSON leaves previous data intact.
                try { return client.set("cmi.suspend_data", encodeJSON(object)); }
                catch (exception) { return invalid(exception.message); }
            },
            loadState(fallback = {}) {
                // [FR] Une lecture vide est normale au premier lancement ; un JSON invalide reçoit un diagnostic distinct.
                // [EN] An empty read is normal on first launch; invalid JSON gets a distinct diagnostic.
                const result = client.read("cmi.suspend_data");
                if (!result.ok || !result.value) return fallback;
                try {
                    const parsed = JSON.parse(result.value);
                    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new TypeError("Objet attendu / Object expected.");
                    return parsed;
                } catch (exception) { clientError("JSON de reprise illisible / Invalid resume JSON: " + exception.message, "CLIENT_JSON"); return fallback; }
            },
            commit() {
                // [FR] Sauvegarder le temps avant la demande serveur, et arrêter si cette première écriture échoue.
                // [EN] Write session time before the server request and stop if that first write fails.
                if (!client.saveSessionTime()) return false;
                return client.LMSCommit("") === "true";
            },
            finish(exit = "suspend", force = false) {
                if (state === "finished") return true;
                if (!ready()) return false;
                if (!EXITS.includes(exit)) return invalid("Sortie invalide / Invalid exit value.");
                const saved = client.setExit(exit);
                const committed = client.commit();
                // [FR] Une sortie explicite reste ouverte si la sauvegarde échoue ; force est réservé au départ du navigateur.
                // [EN] An explicit exit stays open on save failure; force is reserved for browser departure.
                if ((!saved || !committed) && !force) return false;
                const ended = client.LMSFinish("") === "true";
                return saved && committed && ended;
            },
            getComments() { return readGroup({ learner: "cmi.comments", lms: "cmi.comments_from_lms" }); },
            setComments(value) {
                // [FR] Envoyer uniquement le nouveau fragment : le LMS le concatène aux précédents.
                // [EN] Send only the new fragment: the LMS concatenates it with earlier comments.
                if (typeof value !== "string" || value.length > 4096 || !ascii(value)) return invalid("Commentaires : au plus 4096 caractères ASCII / Comments: at most 4096 ASCII characters.");
                return client.set("cmi.comments", value);
            },
            getPreferences() { return readGroup(Object.fromEntries(["audio", "language", "speed", "text"].map(name => [name, "cmi.student_preference." + name]))); },
            setPreferences(preferences) {
                // [FR] Valider l'ensemble avant la première écriture pour éviter une préférence partiellement mal formée.
                // [EN] Validate the entire input before the first write to avoid partially malformed preferences.
                const fields = Object.entries(preferences).map(([key, value]) => ["cmi.student_preference." + key, value]);
                if (fields.some(([path, value]) => !MODEL[path] || !valid(MODEL[path][1], String(value)))) return badReport("Préférence invalide / Invalid preference.");
                return writeFields(fields);
            },
            getStudentData() { return readGroup({ masteryScore: "cmi.student_data.mastery_score", maxTimeAllowed: "cmi.student_data.max_time_allowed", timeLimitAction: "cmi.student_data.time_limit_action" }); },
            getChildren(group) { return client.read(group + "._children"); },
            getCount(group) { return client.read(group + "._count"); },
            getObjective(index) {
                if (!Number.isInteger(index) || index < 0) return badReport("Index invalide / Invalid index.");
                const prefix = "cmi.objectives." + index;
                return readGroup({ id: prefix + ".id", raw: prefix + ".score.raw", min: prefix + ".score.min", max: prefix + ".score.max", status: prefix + ".status" });
            },
            setObjective(objective) {
                // [FR] Les objectifs sont relisibles : rechercher l'id avant de décider d'ajouter un record.
                // [EN] Objectives are readable: look up the id before deciding to append a record.
                if (!objective || !valid("identifier", String(objective.id || ""))) return badReport("Identifiant d'objectif invalide / Invalid objective identifier.");
                const count = countValue("cmi.objectives");
                if (count === null) return { ok: false, fields: [], error: client.lastError };
                let index = count;
                for (let i = 0; i < count; i += 1) {
                    const existing = client.read("cmi.objectives." + i + ".id");
                    if (!existing.ok) return { ok: false, fields: [], error: existing };
                    if (existing.value.toLowerCase() === String(objective.id).toLowerCase()) { index = i; break; }
                }
                const prefix = "cmi.objectives." + index;
                const fields = [[prefix + ".id", objective.id]];
                ["raw", "min", "max"].forEach(name => { if (objective[name] !== undefined) fields.push([prefix + ".score." + name, objective[name]]); });
                if (objective.status !== undefined) fields.push([prefix + ".status", objective.status]);
                if (fields.some(([path, value]) => !valid(MODEL[normalize(path)][1], String(value)))) return badReport("Valeur d'objectif invalide / Invalid objective value.");
                return { ...writeFields(fields), index };
            },
            recordInteraction(interaction) {
                // [FR] Les interactions ne sont pas relisibles : ajouter une trace par réponse à l'index _count.
                // [EN] Interactions are not readable: append one trace per answer at the _count index.
                if (!interaction || !valid("identifier", String(interaction.id || "")) || !TYPES.includes(interaction.type)) return badReport("Interaction : id et type valides requis / Interaction requires a valid id and type.");
                const count = countValue("cmi.interactions");
                if (count === null) return { ok: false, fields: [], error: client.lastError };
                const prefix = "cmi.interactions." + count;
                // [FR] id puis type avant les réponses ; les indices commencent à zéro et restent contigus.
                // [EN] id then type before responses; indexes start at zero and remain contiguous.
                const fields = [[prefix + ".id", interaction.id], [prefix + ".type", interaction.type], [prefix + ".time", interaction.time || clockTime()]];
                (interaction.objectiveIds || []).forEach((id, index) => fields.push([prefix + ".objectives." + index + ".id", id]));
                (interaction.correctResponses || []).forEach((pattern, index) => fields.push([prefix + ".correct_responses." + index + ".pattern", pattern]));
                const mapping = { studentResponse: "student_response", result: "result", weighting: "weighting", latency: "latency" };
                Object.entries(mapping).forEach(([key, name]) => { if (interaction[key] !== undefined) fields.push([prefix + "." + name, interaction[key]]); });
                if (fields.some(([path, value]) => !valid(MODEL[normalize(path)][1], String(value), interaction.type))) return badReport("Format d'interaction invalide pour " + interaction.type + " / Invalid interaction format.");
                return { ...writeFields(fields, true), index: count };
            }
        };
        function invalid(message) { clientError(message); return false; }
        function badReport(message) { return { ok: false, fields: [], error: clientError(message) }; }
        function readGroup(mapping) {
            // [FR] values simplifie l'affichage ; fields conserve les erreurs de chaque élément optionnel.
            // [EN] values simplifies rendering; fields preserves errors for each optional element.
            const fields = Object.fromEntries(Object.entries(mapping).map(([key, path]) => [key, client.read(path)]));
            return { ok: Object.values(fields).every(result => result.ok), values: Object.fromEntries(Object.entries(fields).map(([key, result]) => [key, result.value])), fields };
        }
        function countValue(group) {
            // [FR] Ne pas confondre un compteur vide ou refusé avec zéro : cela écraserait des records existants.
            // [EN] Do not confuse an empty or rejected count with zero: that could overwrite existing records.
            const result = client.getCount(group);
            if (!result.ok) return null;
            if (!/^\d+$/.test(result.value) || Number(result.value) > 65535) { clientError("Compteur LMS invalide ou plein / Invalid or full LMS counter."); return null; }
            return Number(result.value);
        }
        function writeFields(fields, stopOnFailure = false) {
            // [FR] Le standard n'offre pas de transaction atomique ; documenter toutes les écritures partielles.
            // [EN] The standard provides no atomic transaction; record all partial writes.
            const results = [];
            for (const [element, value] of fields) {
                const ok = client.set(element, value);
                results.push({ element, ...client.lastError, ok });
                if (!ok && stopOnFailure) break;
            }
            // [FR] Aucun retour vrai si une écriture a échoué ; conserver le détail des succès partiels.
            // [EN] Never return success if a write failed; preserve details about partial success.
            return { ok: results.length === fields.length && results.every(result => result.ok), fields: results };
        }
        return client;
    }

    // [FR] Objet public unique : copier SCORM12.setBookmark("slide-2") après initialize().
    // [EN] Single public object: copy SCORM12.setBookmark("slide-2") after initialize().
    root.SCORM12 = Object.assign(createClient(), { createClient, createMockAPI, findAPI, formatTime, parseTime, clockTime, encodeJSON, feedbackValid, MODEL, CHILDREN });
}(typeof window !== "undefined" ? window : globalThis));
