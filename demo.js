// [FR] Personnalisez ce fichier pour vos activités ; le moteur SCORM reste dans son fichier séparé.
// [EN] Customize this file for your activities; the SCORM engine stays in its separate file.
(function () {
    "use strict";
    const scorm = window.SCORM12;
    const $ = id => document.getElementById(id);
    const text = (id, value) => { $(id).textContent = value; };
    let slide = 1;
    let visited = new Set([1]);
    let answers = {};
    let quizStarted = performance.now();
    let activityStarted = performance.now();
    let saveTimer;
    let autosaveTimer;
    let clockTimer;
    let timeLimitHandled = false;
    let timePolicy = null;
    let priorTime = 0;
    const slides = [
        ["Un petit colis, une grande autonomie.", "Le manifeste décrit le contenu de votre capsule. Le LMS ouvre ensuite index.html, votre porte d’entrée."],
        ["Une conversation en huit fonctions.", "L’API est l’interprète fourni par le LMS. Initialize ouvre la conversation, SetValue transmet une information, Commit demande sa sauvegarde, Finish clôt le dialogue."],
        ["Reprendre exactement où vous étiez.", "Le marque-page retient votre écran. Les données de suspension retiennent vos réponses et vos notes. Les deux se complètent, comme un signet et un carnet de bord."]
    ];

    // [FR] Afficher les erreurs avec leurs codes, sans injecter du HTML venant du LMS ou d'un utilisateur.
    // [EN] Display errors with codes without injecting HTML received from the LMS or a user.
    function notify(message, ok = true) {
        const element = $("feedback");
        element.textContent = message;
        element.className = "status-box toast " + (ok ? "success" : "error");
    }
    function errorText(result = scorm.lastError) {
        return "[" + result.code + "] " + (result.message || result.diagnostic || "Échec de communication");
    }
    function reportText(report) {
        if (report.ok) return "Tous les champs ont été acceptés.";
        if (report.error) return errorText(report.error);
        return report.fields.filter(field => !field.ok).map(field => field.element + " : " + errorText(field)).join(" ; ");
    }
    function logEvent(event) {
        const result = event.detail;
        const item = document.createElement("li");
        const stamp = new Date().toLocaleTimeString("fr-CA");
        item.textContent = stamp + " · " + result.method + " · " + (result.element || "") + " · " + (result.ok ? "OK" : "ERREUR " + result.code);
        if (!result.ok) item.className = "error";
        $("api-log").prepend(item);
        while ($("api-log").children.length > 60) $("api-log").lastElementChild.remove();
    }
    window.addEventListener("scorm:log", logEvent);

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Tableau de bord apprenant
    // [EN] START OF COPY-PASTE BLOCK: Learner dashboard
    // ================================================================
    function refreshDashboard() {
        if (scorm.state !== "active") return;
        const identity = scorm.getIdentity();
        text("learner-name", identity.values.name || "Nom non fourni");
        text("learner-id", identity.values.id || "Identifiant non fourni");
        text("lesson-status", scorm.getStatus() || "Non fourni");
        text("bookmark", scorm.getBookmark() || "Aucun");
        const raw = scorm.read("cmi.core.score.raw");
        text("score", raw.ok && raw.value !== "" ? raw.value : "—");
    }
    // [FR] FIN DU BLOC À COPIER-COLLER : Tableau de bord apprenant
    // [EN] END OF COPY-PASTE BLOCK: Learner dashboard

    function updateSlide() {
        text("slide-title", slides[slide - 1][0]);
        text("slide-body", slides[slide - 1][1]);
        text("slide-counter", "Écran " + slide + " / " + slides.length);
        text("visited-count", visited.size + " écran" + (visited.size > 1 ? "s explorés" : " exploré"));
        $("slide-progress").value = visited.size;
        $("slide-progress").max = slides.length;
        $("previous").disabled = slide === 1 || scorm.state !== "active";
        $("next").disabled = slide === slides.length || scorm.state !== "active";
    }
    function snapshot() {
        return { version: 1, slide, visited: Array.from(visited), reflection: $("reflection").value, answers };
    }
    function updateSize() {
        try { text("state-size", scorm.encodeJSON(snapshot()).length + " / 4096 ASCII"); }
        catch (exception) { text("state-size", "Limite dépassée : raccourcissez votre note."); }
    }
    function applyState(state) {
        // [FR] Le LMS peut contenir une ancienne version : vérifier chaque champ avant utilisation.
        // [EN] The LMS may contain an older version: check every field before using it.
        if (!state || state.version !== 1) return;
        if (Number.isInteger(state.slide) && state.slide >= 1 && state.slide <= slides.length) slide = state.slide;
        if (Array.isArray(state.visited)) visited = new Set(state.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= slides.length));
        visited.add(slide);
        if (typeof state.reflection === "string") $("reflection").value = state.reflection;
        if (state.answers && typeof state.answers === "object" && !Array.isArray(state.answers)) answers = state.answers;
        const quizAnswer = answers.question_manifeste;
        const selected = Array.from(document.querySelectorAll('[name="quiz"]')).find(input => input.value === quizAnswer);
        if (selected) selected.checked = true;
        updateSlide();
        updateSize();
    }

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Sauvegarde JSON de la progression
    // [EN] START OF COPY-PASTE BLOCK: JSON progress persistence
    // ================================================================
    function saveProgress(quiet = false) {
        if (scorm.state !== "active") return false;
        const saved = scorm.saveState(snapshot());
        if (!saved) { notify("Progression non sauvegardée : " + errorText(), false); return false; }
        const bookmark = scorm.setBookmark("slide-" + slide);
        const exit = scorm.setExit("suspend");
        const committed = scorm.commit();
        const ok = saved && bookmark && exit && committed;
        updateSize();
        if (!ok) notify("Une partie de la sauvegarde a échoué. Consultez le journal puis réessayez.", false);
        else if (!quiet) notify(scorm.isSimulation ? "Progression sauvegardée dans la simulation locale." : "Progression acceptée par le LMS.");
        refreshDashboard();
        if (scorm.isSimulation && scorm.persistent === false) {
            text("mode-notice", "Simulation en mémoire : le navigateur refuse le stockage local. La progression sera perdue à la fermeture.");
        }
        return ok;
    }
    // [FR] FIN DU BLOC À COPIER-COLLER : Sauvegarde JSON de la progression
    // [EN] END OF COPY-PASTE BLOCK: JSON progress persistence

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Navigation avec marque-page
    // [EN] START OF COPY-PASTE BLOCK: Navigation with bookmarking
    // ================================================================
    function navigate(target) {
        if (scorm.state !== "active") return;
        slide = Math.max(1, Math.min(slides.length, target));
        visited.add(slide);
        updateSlide();
        saveProgress();
    }
    $("previous").addEventListener("click", () => navigate(slide - 1));
    $("next").addEventListener("click", () => navigate(slide + 1));
    // [FR] FIN DU BLOC À COPIER-COLLER : Navigation avec marque-page
    // [EN] END OF COPY-PASTE BLOCK: Navigation with bookmarking

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : QCM, score et interaction
    // [EN] START OF COPY-PASTE BLOCK: Multiple choice, score and interaction
    // ================================================================
    function submitQuiz(event) {
        event.preventDefault();
        const answer = new FormData(event.currentTarget).get("quiz");
        const correct = answer === "b";
        const score = scorm.setScore(correct ? 100 : 0, 0, 100);
        const interaction = scorm.recordInteraction({
            id: "question_manifeste", type: "choice", objectiveIds: ["comprendre_manifeste"],
            correctResponses: ["b"], studentResponse: answer, result: correct ? "correct" : "wrong",
            weighting: 1, latency: scorm.formatTime(performance.now() - quizStarted)
        });
        answers.question_manifeste = answer;
        const committed = saveProgress(true);
        text("quiz-feedback", (correct ? "Exact ! Le manifeste décrit le colis." : "Presque ! Le LMS commence par imsmanifest.xml.") +
            " Score : " + reportText(score) + " Interaction : " + reportText(interaction));
        notify(score.ok && interaction.ok && committed ? "Réponse, score et progression acceptés." : "Réponse traitée ; certaines traces ont été refusées. Consultez le détail de la question.", score.ok && interaction.ok && committed);
        quizStarted = performance.now();
    }
    $("quiz-form").addEventListener("submit", submitQuiz);
    // [FR] FIN DU BLOC À COPIER-COLLER : QCM, score et interaction
    // [EN] END OF COPY-PASTE BLOCK: Multiple choice, score and interaction

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Fabrique des huit activités
    // [EN] START OF COPY-PASTE BLOCK: Eight-activity workshop
    // ================================================================
    // [FR] Chaque objet sépare l'interface HTML, l'évaluation locale et la trace SCORM 1.2.
    // [EN] Each object separates its HTML interface, local assessment and SCORM 1.2 trace.
    const activities = {
        "true-false": {
            html: '<fieldset><legend>Commit ferme-t-il la session SCORM ?</legend><label><input type="radio" name="answer" value="t" required data-session> Vrai</label><label><input type="radio" name="answer" value="f" required data-session> Faux</label></fieldset>',
            correct: "f", example: "f", response: form => form.get("answer"),
            explain: "Commit sauvegarde. C’est Finish qui ferme la communication."
        },
        choice: {
            html: '<fieldset><legend>Quels fichiers composent la présentation ? Cochez les deux.</legend><label><input type="checkbox" name="answer" value="a" data-session> HTML : structure</label><label><input type="checkbox" name="answer" value="b" data-session> CSS : apparence</label><label><input type="checkbox" name="answer" value="c" data-session> ZIP : style graphique</label></fieldset>',
            correct: "{a,b}", example: "a,b", response: form => form.getAll("answer").sort().join(","),
            assess: response => response === "a,b", explain: "HTML structure le contenu et CSS définit sa présentation. Les accolades exigent ici les deux choix."
        },
        "fill-in": {
            html: '<label for="activity-answer">Complétez : les données de reprise utilisent cmi._____</label><input id="activity-answer" name="answer" maxlength="255" required autocomplete="off" data-session>',
            correct: "suspend_data", example: "suspend_data", response: form => String(form.get("answer")).trim().toLowerCase(),
            explain: "Le champ est cmi.suspend_data. Cet exemple compare les textes sans tenir compte de la casse."
        },
        matching: {
            html: '<fieldset><legend>Associez chaque fonction à son rôle.</legend><label for="match-1">Initialize</label><select id="match-1" name="first" data-session><option value="b">Sauvegarder</option><option value="a">Ouvrir</option></select><label for="match-2">Commit</label><select id="match-2" name="second" data-session><option value="a">Ouvrir</option><option value="b">Sauvegarder</option></select></fieldset>',
            correct: "{1.a,2.b}", example: "1.a,2.b", response: form => "1." + form.get("first") + ",2." + form.get("second"),
            assess: response => response === "1.a,2.b", explain: "Initialize ouvre la session ; Commit demande la sauvegarde. Un point sépare chaque paire."
        },
        performance: {
            html: '<fieldset class="checklist"><legend>Avant de livrer une capsule, préparez votre colis.</legend><label><input type="checkbox" name="manifest" data-session> Le manifeste est à la racine.</label><label><input type="checkbox" name="commit" data-session> La progression est sauvegardée.</label><label><input type="checkbox" name="test" data-session> J’ai testé une reprise dans le LMS.</label></fieldset>',
            correct: "manifest=1;commit=1;test=1", example: "manifest=1;commit=1;test=1",
            response: form => ["manifest", "commit", "test"].map(key => key + "=" + (form.has(key) ? "1" : "0")).join(";"),
            explain: "Le format performance est un texte libre de 255 caractères maximum. Ici, les trois étapes sont nécessaires."
        },
        sequencing: {
            html: '<fieldset><legend>Remettez les actions dans l’ordre : a = Finish, b = Initialize, c = Commit.</legend><label for="order-1">Première action</label><select id="order-1" name="first" data-session><option>a</option><option>b</option><option>c</option></select><label for="order-2">Deuxième action</label><select id="order-2" name="second" data-session><option>b</option><option>a</option><option>c</option></select><label for="order-3">Troisième action</label><select id="order-3" name="third" data-session><option>c</option><option>a</option><option>b</option></select></fieldset>',
            correct: "b,c,a", example: "b,c,a", response: form => [form.get("first"), form.get("second"), form.get("third")].join(","),
            explain: "Initialize, puis les échanges et Commit, enfin Finish. L’ordre est évalué dans la capsule."
        },
        likert: {
            html: '<label for="activity-answer">Je me sens capable d’adapter ce gabarit.</label><select id="activity-answer" name="answer" data-session><option value="1">1 · Pas encore</option><option value="2">2 · Avec de l’aide</option><option value="3">3 · Plutôt oui</option><option value="4">4 · Tout à fait</option></select>',
            correct: null, example: "3", response: form => form.get("answer"),
            explain: "Une opinion n’est ni juste ni fausse : le résultat transmis est neutral, avec un poids nul."
        },
        numeric: {
            html: '<label for="activity-answer">Combien de fonctions natives possède l’API SCORM 1.2 ?</label><input id="activity-answer" name="answer" type="number" step="any" required data-session>',
            correct: "8", example: "8", response: form => String(Number(form.get("answer"))),
            explain: "Il y a huit fonctions natives. Cet exemple attend exactement 8 ; une tolérance éventuelle se calcule ici."
        }
    };
    function renderActivity() {
        const type = $("activity-type").value;
        const activity = activities[type];
        // [FR] HTML interne constant uniquement : ne jamais utiliser ici une réponse ou une donnée LMS.
        // [EN] Only constant internal HTML: never use a learner response or LMS data here.
        $("activity-content").innerHTML = activity.html;
        const example = { id: "activite_" + type.replace(/-/g, "_"), type, objectiveIds: ["pratiquer_scorm"],
            time: "12:00:00.00", correctResponses: activity.correct === null ? [] : [activity.correct],
            studentResponse: activity.example, result: type === "likert" ? "neutral" : "correct",
            weighting: type === "likert" ? 0 : 1, latency: "0000:00:08.00" };
        text("code-activity", "const report = SCORM12.recordInteraction(" + JSON.stringify(example, null, 2) + ");\nconst committed = SCORM12.commit();\nconsole.log(report, committed);");
        text("activity-feedback", activity.explain);
        activityStarted = performance.now();
    }
    function submitActivity(event) {
        event.preventDefault();
        const type = $("activity-type").value;
        const activity = activities[type];
        const response = activity.response(new FormData(event.currentTarget));
        if (type === "choice" && response === "") { notify("Cochez au moins une réponse.", false); return; }
        const correct = activity.assess ? activity.assess(response) : response === activity.correct;
        const result = type === "likert" ? "neutral" : correct ? "correct" : "wrong";
        const report = scorm.recordInteraction({
            id: "activite_" + type.replace(/-/g, "_"), type,
            correctResponses: activity.correct === null ? [] : [activity.correct],
            objectiveIds: ["pratiquer_scorm"], studentResponse: response, result,
            weighting: type === "likert" ? 0 : 1, latency: scorm.formatTime(performance.now() - activityStarted)
        });
        answers[type] = response;
        const committed = saveProgress(true);
        text("activity-feedback", "Résultat : " + result + ". " + activity.explain + " Suivi : " + reportText(report));
        notify(report.ok && committed ? "Activité enregistrée. Ouvrez son exemple pour réutiliser le code." : "L’activité est traitée ; son suivi n’a pas été intégralement accepté.", report.ok && committed);
        activityStarted = performance.now();
    }
    $("activity-type").addEventListener("change", renderActivity);
    $("activity-form").addEventListener("submit", submitActivity);
    // [FR] FIN DU BLOC À COPIER-COLLER : Fabrique des huit activités
    // [EN] END OF COPY-PASTE BLOCK: Eight-activity workshop

    $("save-progress").addEventListener("click", () => saveProgress());
    $("reflection").addEventListener("input", () => {
        updateSize();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveProgress(true), 700);
    });
    $("restore-progress").addEventListener("click", () => {
        const state = scorm.loadState(null);
        if (state === null) { notify("Aucune sauvegarde JSON valide. " + (scorm.lastError.ok ? "" : errorText()), false); return; }
        if (state.version !== 1) { notify("Version de sauvegarde non reconnue : prévoir une migration.", false); return; }
        applyState(state);
        notify("La progression a été relue depuis le suivi.");
    });

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Objectif pédagogique
    // [EN] START OF COPY-PASTE BLOCK: Learning objective
    // ================================================================
    $("save-objective").addEventListener("click", () => {
        const raw = $("objective-score").value;
        if (raw === "" || Number(raw) < 0 || Number(raw) > 100) { notify("Indiquez un score de 0 à 100.", false); return; }
        const report = scorm.setObjective({ id: "comprendre_manifeste", raw, min: 0, max: 100, status: $("objective-status").value });
        const committed = scorm.commit();
        text("objective-feedback", reportText(report));
        notify(report.ok && committed ? "Objectif enregistré." : "L’objectif n’a pas été intégralement accepté. " + reportText(report), report.ok && committed);
    });
    $("read-objective").addEventListener("click", () => {
        const count = scorm.getCount("cmi.objectives");
        if (!count.ok) { text("objective-feedback", errorText(count)); return; }
        const objectives = [];
        for (let i = 0; i < Math.min(Number(count.value), 100); i += 1) objectives.push(scorm.getObjective(i));
        text("objective-feedback", objectives.length ? JSON.stringify(objectives.map(objective => objective.values)) : "Aucun objectif enregistré.");
    });
    // [FR] FIN DU BLOC À COPIER-COLLER : Objectif pédagogique
    // [EN] END OF COPY-PASTE BLOCK: Learning objective

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Commentaires
    // [EN] START OF COPY-PASTE BLOCK: Comments
    // ================================================================
    $("save-comment").addEventListener("click", () => {
        if (!$("learner-comment").value.trim()) { notify("Écrivez un nouveau commentaire avant de l’envoyer.", false); return; }
        const saved = scorm.setComments($("learner-comment").value + "\n");
        const detail = scorm.lastError;
        const committed = saved && scorm.commit();
        if (committed) $("learner-comment").value = "";
        notify(committed ? "Commentaire accepté par le suivi." : "Commentaire non sauvegardé : " + errorText(saved ? scorm.lastError : detail), committed);
    });
    // [FR] FIN DU BLOC À COPIER-COLLER : Commentaires
    // [EN] END OF COPY-PASTE BLOCK: Comments

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Préférences apprenant
    // [EN] START OF COPY-PASTE BLOCK: Learner preferences
    // ================================================================
    $("preferences-form").addEventListener("submit", event => {
        event.preventDefault();
        const report = scorm.setPreferences({ audio: $("pref-audio").value, language: $("pref-language").value, speed: $("pref-speed").value, text: $("pref-text").value });
        const committed = scorm.commit();
        notify(report.ok && committed ? "Préférences acceptées. Votre code peut les appliquer aux médias." : reportText(report), report.ok && committed);
    });
    // [FR] FIN DU BLOC À COPIER-COLLER : Préférences apprenant
    // [EN] END OF COPY-PASTE BLOCK: Learner preferences

    function refreshData() {
        refreshDashboard();
        const identity = scorm.getIdentity();
        const student = scorm.getStudentData();
        const total = scorm.read("cmi.core.total_time");
        const entries = { "Crédit": identity.fields.credit, "Mode de lancement": identity.fields.mode, "Entrée / reprise": identity.fields.entry,
            "Données de lancement": identity.fields.launchData, "Temps cumulé avant cette session": total,
            "Seuil de réussite (optionnel)": student.fields.masteryScore, "Durée autorisée (optionnel)": student.fields.maxTimeAllowed,
            "Action si délai dépassé": student.fields.timeLimitAction };
        $("launch-data").replaceChildren();
        Object.entries(entries).forEach(([label, result]) => {
            const term = document.createElement("dt");
            const value = document.createElement("dd");
            term.textContent = label;
            value.textContent = result.ok ? (result.value || "Chaîne vide") : errorText(result);
            $("launch-data").append(term, value);
        });
        const comments = scorm.getComments();
        text("lms-comment", comments.fields.lms.ok ? comments.values.lms || "Aucun message" : errorText(comments.fields.lms));
    }
    $("refresh-data").addEventListener("click", refreshData);
    Object.keys(scorm.MODEL).concat(Object.keys(scorm.CHILDREN).map(group => group + "._children"),
        ["cmi.objectives._count", "cmi.interactions._count", "cmi.interactions.0.objectives._count", "cmi.interactions.0.correct_responses._count"])
        .forEach(path => {
            const option = document.createElement("option");
            option.value = path.replace(/\.n(?=\.|$)/g, ".0");
            option.textContent = option.value;
            $("inspect-element").append(option);
        });
    $("inspect-read").addEventListener("click", () => {
        const result = scorm.read($("inspect-element").value);
        text("inspect-result", JSON.stringify(result, null, 2));
    });
    $("inspect-error").addEventListener("click", () => {
        const code = scorm.LMSGetLastError();
        text("inspect-result", "LMSGetLastError() = " + code + "\nLMSGetErrorString = " + scorm.LMSGetErrorString(code) + "\nLMSGetDiagnostic = " + scorm.LMSGetDiagnostic(code));
    });
    $("commit-now").addEventListener("click", () => {
        const committed = scorm.commit();
        notify(committed ? "LMSCommit a accepté la demande de sauvegarde." : errorText(), committed);
    });

    // ================================================================
    // [FR] DÉBUT DU BLOC À COPIER-COLLER : Statut et fermeture
    // [EN] START OF COPY-PASTE BLOCK: Status and session finish
    // ================================================================
    function setLessonStatus(value) {
        const saved = scorm.setStatus(value);
        const detail = scorm.lastError;
        const committed = saved && scorm.commit();
        notify(committed ? "Statut transmis : " + value + "." : errorText(saved ? scorm.lastError : detail), committed);
        refreshDashboard();
    }
    function endedUI() {
        document.querySelectorAll("[data-session]").forEach(element => { element.disabled = true; });
        $("session-ended").hidden = false;
        clearTimeout(saveTimer);
        clearInterval(autosaveTimer);
        clearInterval(clockTimer);
        text("connection", "Session fermée");
    }
    function finishLesson(exit) {
        clearTimeout(saveTimer);
        if (!saveProgress(true)) return;
        const ok = scorm.finish(exit);
        if (scorm.state === "finished") endedUI();
        notify(ok ? "Session fermée et sauvegardée. Vous pouvez revenir au LMS." : "La fermeture a échoué. Gardez la capsule ouverte et réessayez. " + errorText(), ok);
    }
    $("complete").addEventListener("click", () => setLessonStatus("completed"));
    $("set-status").addEventListener("click", () => setLessonStatus($("status-choice").value));
    $("suspend").addEventListener("click", () => finishLesson("suspend"));
    $("finish").addEventListener("click", () => finishLesson($("exit-choice").value));
    // [FR] FIN DU BLOC À COPIER-COLLER : Statut et fermeture
    // [EN] END OF COPY-PASTE BLOCK: Status and session finish

    // [FR] Copier fonctionne aussi sans permission presse-papiers : sélection manuelle en secours.
    // [EN] Copy also works without clipboard permission: manual selection is the fallback.
    document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
        const element = $(button.dataset.copy);
        try {
            await navigator.clipboard.writeText(element.textContent);
            notify("Code copié. Adaptez les identifiants et le contenu dans votre projet.");
        } catch (exception) {
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            notify("Le code est sélectionné. Utilisez Ctrl+C (ou Cmd+C) pour le copier.");
        }
    }));
    document.querySelectorAll(".side-nav a").forEach(link => link.addEventListener("click", () => {
        document.querySelectorAll(".side-nav a").forEach(item => item.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "location");
    }));

    // [FR] Démarrage unique : ne jamais remplacer un refus réel du LMS par une simulation.
    // [EN] Initialize once: never replace a real LMS rejection with a simulation.
    renderActivity();
    if (!scorm.initialize()) {
        const error = errorText();
        text("connection", "Suivi indisponible");
        text("startup-error", error);
        $("startup-error").hidden = false;
        $("work-area").hidden = true;
        text("mode-notice", "Ouvrez le colis depuis le LMS. Pour un essai local, ouvrez index.html par double-clic ou via localhost.");
        notify("La session n’a pas pu démarrer : " + error, false);
        return;
    }
    text("connection", scorm.isSimulation ? "● Simulation locale" : "● Connecté au LMS");
    if (scorm.isSimulation) $("connection").classList.add("local");
    text("mode-notice", scorm.isSimulation ? "Mode simulation : les traces restent dans ce navigateur. Aucun résultat n’est envoyé à un LMS. Le stockage local peut être limité en navigation privée ou avec file://." : "Session LMS active : vos actions sont transmises par l’API SCORM 1.2. Les données optionnelles dépendent de cette plateforme.");
    const identity = scorm.getIdentity();
    if (identity.values.entry === "resume") {
        applyState(scorm.loadState({ version: 1 }));
        const bookmark = /^slide-(\d+)$/.exec(scorm.getBookmark());
        if (bookmark && Number(bookmark[1]) >= 1 && Number(bookmark[1]) <= slides.length) { slide = Number(bookmark[1]); visited.add(slide); }
        notify("Reprise de votre précédente session. Bienvenue à nouveau.");
    }
    const preferences = scorm.getPreferences();
    ["audio", "language", "speed", "text"].forEach(name => {
        if (preferences.fields[name].ok && preferences.values[name] !== "") $("pref-" + name).value = preferences.values[name];
    });
    // [FR] Laisser le nouveau commentaire vide pour ne pas renvoyer et dupliquer tout l'historique.
    // [EN] Leave the new comment empty to avoid resending and duplicating the entire history.
    const status = scorm.getStatus();
    // [FR] Ne pas effacer une réussite déjà reçue ; browse et review restent visibles et respectés.
    // [EN] Do not erase an existing success; browse and review remain visible and respected.
    if (status === "not attempted" && (!identity.fields.mode.ok || identity.values.mode === "normal")) scorm.setStatus("incomplete");
    else if (status === "not attempted" && identity.values.mode === "browse") scorm.setStatus("browsed");
    const student = scorm.getStudentData();
    if (student.fields.maxTimeAllowed.ok && student.fields.timeLimitAction.ok) {
        const maximum = scorm.parseTime(student.values.maxTimeAllowed);
        if (Number.isFinite(maximum) && maximum > 0) timePolicy = { maximum, action: student.values.timeLimitAction };
    }
    priorTime = scorm.parseTime(scorm.get("cmi.core.total_time", "0000:00:00.00")) || 0;
    updateSlide();
    updateSize();
    refreshData();
    if (!scorm.commit()) notify("La sauvegarde initiale a échoué : " + errorText(), false);
    autosaveTimer = setInterval(() => saveProgress(true), 30000);
    clockTimer = setInterval(() => {
        text("session-clock", "Session : " + scorm.formatTime(scorm.elapsedMilliseconds));
        // [FR] La durée maximale porte sur la tentative : inclure les sessions antérieures.
        // [EN] The time limit concerns the attempt: include earlier sessions.
        if (timePolicy && !timeLimitHandled && priorTime + scorm.elapsedMilliseconds >= timePolicy.maximum) {
            timeLimitHandled = true;
            const [action, message] = timePolicy.action.split(",");
            if (action === "exit") finishLesson("time-out");
            if (message === "message") notify(action === "exit" ? "La durée autorisée est écoulée. La capsule ferme sa communication." : "La durée indicative est écoulée ; vous pouvez poursuivre.");
        }
    }, 1000);
    // [FR] Sauvegarder régulièrement ; les événements de départ ne sont jamais garantis par le navigateur.
    // [EN] Save regularly; departure events are never guaranteed by the browser.
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && scorm.state === "active") saveProgress(true);
    });
    window.addEventListener("pagehide", event => {
        if (scorm.state !== "active") return;
        saveProgress(true);
        // [FR] Le cache de navigation peut restaurer la même page : garder sa session ouverte dans ce cas.
        // [EN] Back/forward cache may restore the same page: keep its session open in that case.
        if (!event.persisted) scorm.finish("suspend", true);
    });
}());
