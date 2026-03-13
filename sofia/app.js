const appCard = document.getElementById("app-card");

const state = {
    currentQuestionIndex: 0,
    selectedQuestions: [],
    errorCount: 0,
    isTransitioning: false,
    counterIntervalId: null
};

const QUIZ_CONFIG = {
    totalQuestions: 13,
    loadingDelayMs: 1800,
    questionTransitionDelayMs: 180
};

function normalizeText(text) {
    return text
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function deepClone(data) {
    return JSON.parse(JSON.stringify(data));
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
    }

    return copy;
}

const QUESTIONS_DB = [
    {
        id: "amigos_tension",
        text: "Cuando éramos amigos, ¿Qué fue lo que vos me dijiste después de tener un día entero juntos en Capital, volver en el tren abrazados, estar pegados cara a cara en la calle a punto de besarnos, con muchísima tensión linda en el ambiente?",
        neverInFirstN: 0,
        options: [
            { text: '"Me encantó estar tan juntos hoy, creo que siento cosas.."', isCorrect: false },
            { text: '"Después de lo de hoy, creo que me gustás, Fran.."', isCorrect: false },
            { text: '"Fran, gracias por cuidarme hoy, estás muy lindo.." <em>*lo besa*</em>', isCorrect: false },
            { text: '"Sos mi amigo gay"', isCorrect: true, fixedPosition: "last" }
        ]
    },
    {
        id: "hija_futura",
        text: "¿Cuál sería un posible nombre para una futura hija nuestra?",
        neverInFirstN: 0,
        options: [
            { text: "Luli Mili Titi Albertario", isCorrect: false },
            { text: "Historia Ymir Albertario", isCorrect: false },
            { text: "Isabella Valentina Albertario", isCorrect: true },
            { text: "Beatriz Mabel Mariela Albertario", isCorrect: false }
        ]
    },
    {
        id: "regalo",
        text: "¿Qué regalo me gustaría que me des?",
        neverInFirstN: 0,
        options: [
            { text: "Una carta de amor tuya", isCorrect: false },
            { text: "Muchos besitos y un lindo detalle de amor", isCorrect: false },
            { text: "Un Porsche 911 GT3 RS 525 CV (386 kW) Bóxer 4.0L", isCorrect: false },
            { text: "Todas las opciones", isCorrect: true }
        ]
    },
    {
        id: "donde_comenzo",
        text: "¿Dónde comenzó todo?",
        neverInFirstN: 0,
        options: [
            { text: "Cursando juntos en la Universidad", isCorrect: false },
            { text: "Pisándote el píe la primera vez que nos vimos", isCorrect: true },
            { text: "Estudiando para física en el ingreso", isCorrect: false },
            { text: "El parque de la costa", isCorrect: false }
        ]
    },
    {
        id: "cita_favorita",
        text: "¿Cuál fue para mi nuestra cita favorita?",
        neverInFirstN: 0,
        options: [
            { text: "Rosedal", isCorrect: false },
            { text: "La La Land", isCorrect: true },
            { text: "Bonavita", isCorrect: false },
            { text: "Buenos Aires (Paseo Golf, La Boca, Picnic, etc.)", isCorrect: false }
        ]
    },
    {
        id: "casarme_con_vos",
        text: "¿Cuándo me di cuenta de que me quería casar con vos?",
        neverInFirstN: 0,
        options: [
            { text: "En nuestro primer viaje juntos a la playa", isCorrect: false },
            { text: "Post charla en lo de Chapu", isCorrect: true },
            { text: "La La Land", isCorrect: false },
            { text: "Cuando te pisé el pie", isCorrect: true }
        ]
    },
    {
        id: "mejor_musica",
        text: "¿Quién hace mejor música?",
        neverInFirstN: 0,
        options: [
            { text: "Harry Styles", isCorrect: false },
            { text: "Los tussywarriors", isCorrect: true },
            { text: "Piñón Fijo", isCorrect: true },
            { text: "El Cóndor", isCorrect: true }
        ]
    },
    {
        id: "faceta_atractiva",
        text: "¿Qué faceta tuya me parece mas atractiva?",
        neverInFirstN: 0,
        options: [
            { text: "Cuando estas toda arreglada, pelo planchado, maquillada", isCorrect: false },
            { text: "Cuando estas entre-casa", isCorrect: false },
            { text: "Cuando estas un poco arreglada, chill", isCorrect: false },
            { text: "Cuando sos una fugazzeta", isCorrect: true }
        ]
    },
    {
        id: "algebra_kernel",
        text: "Sea la transformación lineal f: R³ → R³, definida por f(x, y, z) = (x, y, 0). ¿Cuál de los siguientes vectores pertenece al núcleo de f?",
        neverInFirstN: 4,
        options: [
            { text: "(1,0,0)", isCorrect: false },
            { text: "(0,1,0)", isCorrect: false },
            { text: "(0,0,1)", isCorrect: true },
            { text: "(1,1,1)", isCorrect: false }
        ]
    },
    {
        id: "ositos",
        text: "¿Cómo se llaman nuestros ositos?",
        neverInFirstN: 0,
        options: [
            { text: "Osito y Osita", isCorrect: false },
            { text: "Toti y Pupi", isCorrect: false },
            { text: "Marroncito y Blanquita", isCorrect: true },
            { text: "Dévoli y Companys", isCorrect: false }
        ]
    },
    {
        id: "serie_peli",
        text: "Cuando vemos una serie/peli que dije de ver yo, ¿Qué es lo que siempre repito?",
        neverInFirstN: 0,
        options: [
            { text: "Si no te gusta, vemos otra cosa", isCorrect: false },
            { text: "¿Vas a pagar atención?", isCorrect: true },
            { text: "¿La querés ver subtitulada o con doblaje?", isCorrect: false },
            { text: "Si no querés ver mas, pausamos y vemos mañana", isCorrect: false }
        ]
    },
    {
        id: "my_chemical_romance",
        text: "Cuando yo era un chico pequeño, ¿Qué hizo mi papá?",
        neverInFirstN: 0,
        options: [
            { text: "me regaló la bicicleta de mis sueños", isCorrect: false },
            { text: "me llevó a la ciudad a ver una banda marchar", isCorrect: true },
            { text: "me enseñó a hablar portugués", isCorrect: false },
            { text: "me regaló una guitarra", isCorrect: false }
        ]
    },
    {
        id: "te_amo",
        text: '¿Cuándo nos dijimos "Te amo" por primera vez?',
        neverInFirstN: 0,
        options: [
            { text: "13 de Septiembre de 2024", isCorrect: true },
            { text: "21 de Mayo de 2025", isCorrect: false },
            { text: "30 de Diciembre de 2024", isCorrect: false },
            { text: "07 de Enero de 2025", isCorrect: false }
        ]
    }
];

const TIMELINE_ITEMS = [
    {
        month: "Marzo 2025",
        title: "El comienzo",
        text: "14/03/2025 ~ la primera foto de mi novia.",
        image: "images/1.JPEG",
        note: "Marzo, el inicio de todo, mi mes favorito, me acuerdo de todo ese mes, el viaje que hicimos y lo nervioso que estaba, saqué esta foto un día después de pedirte que seas mi novia en la playa, esta es la primer foto de todas que te saqué siendo mi novia, cada vez que la veo me pongo muy feliz."
    },
    {
        month: "Abril 2025",
        title: "Un mes después",
        text: "UTN FRBA, Medrano, enseñandote una Universidad de verdad B).",
        image: "images/2.JPEG",
        note: "Abril nos recibió con la Universidad, cursando juntos por primera vez estando de novios, me acuerdo de lo caótico que fue ese año al comienzo de la cursada, y lo mucho que estuvimos juntos, esta foto es de FRBA, Medrano, me habías acompañado a entregar unos papeles y después fuimos al Mc :), somos unos batatas."
    },
    {
        month: "Mayo 2025",
        title: "Más recuerdos",
        text: "Conejita y Pingüinito.",
        image: "images/3.JPEG",
        note: "en Mayo hicimos muchas cositas, cursamos mucho, me acompañaste a comprar los botines, fuimos a Benjamín y comimos pastas muy muy ricas, nos pusimos mascarillas, pintamos cuadritos en un cumpleaños, etc; fue un mes muy patutito."
    },
    {
        month: "Junio 2025",
        title: "Continuamos juntitos :3",
        text: "Me encanta esta foto, me encantan tus ojos.",
        image: "images/4.JPEG",
        note: "Junio fue un mes de mucha Universidad, estuvimos juntos casi todos los días, pero en la facu, o en casa juntitos, no hicimos muchos planes, o mas bien, nuestros planes eran estar juntitos (mis favoritos), dato random, este mes conocimos a Silvi y nos ayudó en Álgebra jeje."
    },
    {
        month: "Julio 2025",
        title: "Mi mes :)",
        text: "Mi patuta dormilona.",
        image: "images/5.JPEG",
        note: "Julio lo comencé de la mejor manera posible, con muchísima felicidad, me recibiste en mi casa con decoración y cositas hermosas, me hiciste muy muy feliz, este mes fuimos al Museo de Arte, y fuimos a merendar, fue una de mis citas favoritas, recuerdo este mes con mucho cariño y amor."
    },
    {
        month: "Agosto 2025",
        title: "Hermosa",
        text: "New Line up: Frank Iero, Ray toro, Sofía Maldonado.",
        image: "images/6.JPEG",
        note: "Agosto también fue un mes extremadamente facultativo, un mes donde estuvimos muchísimo tiempo juntitos dandonos amor, pero full focus en la uni, este mes me llegó la guitarra y vos ya la rockeabas, batata rockera."
    },
    {
        month: "Septiembre 2025",
        title: "¡Felices seis meses mi amor!",
        text: "La mitad de este primer año.",
        image: "images/7.JPEG",
        note: "En septiembre cumplimos seis meses, acá ya nos conocíamos el uno a el otro muchísimo mas, mejorábamos día a día para hacer feliz a el otro, cumplir medio año juntos fue un paso hermoso que dimos, me ponía muy feliz saber que solo faltaba lo mismo para llegar a nuestro primer año, donde estamos a día de hoy, veo esta foto juntitos, cumpliendo seis meses, y veo lo mucho que crecimos juntos."
    },
    {
        month: "Octubre 2025",
        title: "Otro mes juntos",
        text: "Esta foto la llevaría a la guerra en mi casco y sería lo último que vería después de que me caiga una bomba.",
        image: "images/8.JPEG",
        note: "En octubre cursamos mucho en la facu, y decidiste cambiar de especialidad, de Industrial a Sistemas, de FRH a FRBA, un cambio que, a mi parecer, te favorece muchísimo, me acuerdo del día que fuimos a Medrano y estabas tan nerviosa y tímida que si me acercaba a la ventanilla con vos te enojabas, entonces me obligaste a dar vueltas, después obviamente metimos Mc."
    },
    {
        month: "Noviembre 2025",
        title: "Nos disfrazamos juntos",
        text: "Cosmo y Wanda.",
        image: "images/9.jpg",
        note: "Noviembre lo empezamos siendo Cosmo y Wanda, fuimos, objetivamente, el mejor disfraz por muy lejos, este mes, el día 13, al igual que nuestro primer beso y también nuestra fecha especial, ME COMPRÉ EL GOLF y VOS EL ONIXXXX, un 13.. 13/11/25, que día loco ese, yo yéndome temprano de la universidad para ir a señar el auto, y vos recibiéndolo el mismo día.. estamos conectados hasta en eso.. (el Onix y la Golfi son novios como nosotros)."
    },
    {
        month: "Diciembre 2025",
        title: "Fin de año",
        text: "Cerrando un año hermoso.",
        image: "images/10.JPEG",
        note: "En diciembre pasamos el ultimo mes del año juntitos, nuestro primer fin de año como novios, este mes fuimos a ver ZOOTOPIA kasljdjas, y metimos un paseo hermoso con el auto por todo capi, Puerto Madero, Palermo, Recoleta, etc., una día hermoso y un mes hermoso juntos."
    },
    {
        month: "Enero 2026",
        title: "Nuevo año",
        text: "Empezando otro año juntos.",
        image: "images/11.JPEG",
        note: "Enero fue un mes distinto, lo empezamos juntitos, lo pasamos con tu familia y con mi familia, eso fue hermoso, pero a el otro día me fui a Mar del Plata, donde estuvimos alejados, después, cuando volví, te fuiste vos, y volvimos a estarlo, esta es la única foto que tengo de ese mes, estábamos yendo a comprar unos juguitos y tu perlo estaba tan hermoso que me tenía que quedar con ese recuerdo, estuvimos alejados, pero juntos y presentes de una manera distinta, y también fue hermoso."
    },
    {
        month: "Febrero 2026",
        title: "¡¡FUIMOS A VER A MCR JUNTOSS!!",
        text: "I  ̶d̶o̶n̶'̶t love you, like I loved you yesterday.",
        image: "images/12.JPEG",
        note: "Arrancamos febrero YENDO A VER A MCR JUNTOS, literalmente cumplí un sueño, y fue junto a vos, fue una noche especial, donde me emocioné, y no solo por la banda, sino porque vos estabas ahí conmigo, este mes también fuimos a Claromecó, casi un año después de nuestra noche mágica, revivimos recuerdos y disfrutamos de playita juntos, y como no olvidar que este mes también fuimos a BRASIL, hacían de todo no? Un viaje donde pasaron tantas cosas, convivimos, conocí bien a tu familia, y conocimos dos países juntos, HERMOSO, podríamos hablar horas y horas de todo lo que hicimos y pasó en Marzo, digamos que, recuperamos los días alejados de Enero.. "
    },
    {
        month: "Marzo 2026",
        title: "Un año",
        text: "Un año entero con vos.",
        image: "images/13.JPEG",
        note: "Y volvimos a Marzo, volvimos a nuestro mes, volvimos al mes donde todo comenzó, un año completo, este mes lo empezamos de viaje, en otro país, juntos, de playa en playa, empezar nuestro mes en una playa, sabiendo que fue en una playa donde comenzó lo nuestro, lo hace aún mas loco y hermoso, nuestro amor esta conectado al mas y a la arena, fue un mes hermoso, y un fin de viaje hermoso."
    }
];

function buildQuizQuestions() {
    const questions = deepClone(QUESTIONS_DB);

    const restrictedQuestions = [];
    const normalQuestions = [];

    questions.forEach((question) => {
        if (question.neverInFirstN && question.neverInFirstN > 0) {
            restrictedQuestions.push(question);
        } else {
            normalQuestions.push(question);
        }
    });

    const shuffledNormalQuestions = shuffleArray(normalQuestions);
    const shuffledRestrictedQuestions = shuffleArray(restrictedQuestions);

    let combinedQuestions = [...shuffledNormalQuestions, ...shuffledRestrictedQuestions];
    combinedQuestions = enforceQuestionPositionRules(combinedQuestions);

    combinedQuestions.forEach((question) => {
        question.options = buildShuffledOptions(question.options);
    });

    return combinedQuestions;
}

function enforceQuestionPositionRules(questions) {
    const result = [...questions];

    for (let i = 0; i < result.length; i++) {
        const question = result[i];
        const minIndexAllowed = question.neverInFirstN || 0;

        if (minIndexAllowed > 0 && i < minIndexAllowed) {
            let swapIndex = -1;

            for (let j = minIndexAllowed; j < result.length; j++) {
                if ((result[j].neverInFirstN || 0) <= i) {
                    swapIndex = j;
                    break;
                }
            }

            if (swapIndex !== -1) {
                [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
            }
        }
    }

    return result;
}

function buildShuffledOptions(options) {
    const fixedLast = options.filter((option) => option.fixedPosition === "last");
    const normal = options.filter((option) => option.fixedPosition !== "last");
    const shuffledNormal = shuffleArray(normal);
    return [...shuffledNormal, ...fixedLast];
}

function renderTemplate(templateId) {
    const template = document.getElementById(templateId);
    appCard.innerHTML = "";
    appCard.appendChild(template.content.cloneNode(true));
}

function renderWelcomeScreen() {
    clearCounterInterval();
    renderTemplate("template-welcome");

    const startQuizBtn = document.getElementById("start-quiz-btn");
    startQuizBtn.addEventListener("click", () => {
        startQuiz();
    });
}

function startQuiz() {
    clearCounterInterval();
    state.currentQuestionIndex = 0;
    state.errorCount = 0;
    state.isTransitioning = false;
    state.selectedQuestions = buildQuizQuestions();
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    renderTemplate("template-quiz");

    const questionText = document.getElementById("question-text");
    const questionTag = document.getElementById("question-tag");
    const answersGrid = document.getElementById("answers-grid");
    const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];

    questionTag.textContent = "Elegí una opción";
    questionText.innerHTML = currentQuestion.text;

    currentQuestion.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "answer-btn";
        button.type = "button";
        button.innerHTML = option.text;

        button.addEventListener("click", () => {
            handleAnswer(option.isCorrect);
        });

        answersGrid.appendChild(button);
    });
}

function handleAnswer(isCorrect) {
    if (state.isTransitioning) {
        return;
    }

    state.isTransitioning = true;

    if (!isCorrect) {
        state.errorCount += 1;
    }

    const isLastQuestion = state.currentQuestionIndex === state.selectedQuestions.length - 1;

    if (isLastQuestion) {
        setTimeout(() => {
            renderLoadingScreen();
        }, QUIZ_CONFIG.questionTransitionDelayMs);
        return;
    }

    setTimeout(() => {
        state.currentQuestionIndex += 1;
        state.isTransitioning = false;
        renderCurrentQuestion();
    }, QUIZ_CONFIG.questionTransitionDelayMs);
}

function renderLoadingScreen() {
    renderTemplate("template-loading");

    setTimeout(() => {
        if (state.errorCount === 0) {
            renderResultScreen(true);
        } else {
            renderResultScreen(false);
        }
    }, QUIZ_CONFIG.loadingDelayMs);
}

function renderResultScreen(passedQuiz) {
    renderTemplate("template-result");

    const resultErrors = document.getElementById("result-errors");
    const resultMessage = document.getElementById("result-message");
    const resultActions = document.getElementById("result-actions");

    if (passedQuiz) {
        resultErrors.textContent = "Tuviste 0 errores.";
        resultMessage.textContent = "Muy bien mi amor, pasate el quiz :)";

        const continueBtn = document.createElement("button");
        continueBtn.className = "primary-btn";
        continueBtn.textContent = "Continuar";

        continueBtn.addEventListener("click", () => {
            renderSecretScreen();
        });

        resultActions.appendChild(continueBtn);
        return;
    }

    resultErrors.textContent = `Tuviste ${state.errorCount} error${state.errorCount === 1 ? "" : "es"}.`;

    if (state.errorCount === 1) {
        resultMessage.textContent = "estuviste muy cerca batatita, pero no es suficiente, vas al recuperatorio..";
    } else if (state.errorCount >= 2 && state.errorCount <= 3) {
        resultMessage.textContent = "mmm… dale batatita hay recuerdos que repasar, ponele onda, recursas el quiz.";
    } else {
        resultMessage.textContent = "rain me conoce mas, dejá..";
    }

    const retryBtn = document.createElement("button");
    retryBtn.className = "primary-btn";
    retryBtn.textContent = "Intentar nuevamente";

    retryBtn.addEventListener("click", () => {
        startQuiz();
    });

    resultActions.appendChild(retryBtn);
}

function renderSecretScreen() {
    clearCounterInterval();
    renderTemplate("template-secret");

    const secretForm = document.getElementById("secret-form");
    const secretInput = document.getElementById("secret-input");
    const secretFeedback = document.getElementById("secret-feedback");

    secretInput.focus();

    secretForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const rawValue = secretInput.value;
        const normalizedValue = normalizeText(rawValue);

        if (normalizedValue === "claromeco") {
            secretFeedback.textContent = "Correcto, pero, quiero que seas mas específica.";
            secretInput.value = "";
            secretInput.focus();
            return;
        }

        if (normalizedValue === "dunamar") {
            renderUnlockedScreen();
            return;
        }

        secretFeedback.textContent = "No es esa respuesta.";
    });
}

function clearCounterInterval() {
    if (state.counterIntervalId) {
        clearInterval(state.counterIntervalId);
        state.counterIntervalId = null;
    }
}

function startRelationshipCounter() {
    clearCounterInterval();

    const daysEl = document.getElementById("counter-days");
    const hoursEl = document.getElementById("counter-hours");
    const minutesEl = document.getElementById("counter-minutes");
    const secondsEl = document.getElementById("counter-seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }

    const startDate = new Date("2025-03-13T00:00:00-03:00");

    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        daysEl.textContent = days;
        hoursEl.textContent = hours;
        minutesEl.textContent = minutes;
        secondsEl.textContent = seconds;
    }

    updateCounter();
    state.counterIntervalId = setInterval(updateCounter, 1000);
}

function renderTimeline() {
    const timelineContainer = document.getElementById("timeline-container");

    if (!timelineContainer) {
        return;
    }

    timelineContainer.innerHTML = "";

    TIMELINE_ITEMS.forEach((item, index) => {
        const sideClass = index % 2 === 0 ? "left" : "right";

        const article = document.createElement("article");
        article.className = `timeline-item ${sideClass}`;

        article.innerHTML = `
            ${sideClass === "right" ? `
            <div class="timeline-copy">
                <div class="timeline-copy-text">
                    <p>${item.note}</p>
                </div>
            </div>
            ` : ""}

            <div class="timeline-content">
                <span class="timeline-month">${item.month}</span>
                <h4 class="timeline-title">${item.title}</h4>
                <img src="${item.image}" class="timeline-photo" alt="${item.month}">
                <p class="timeline-text">${item.text}</p>
            </div>

            <div class="timeline-center">
                <span class="timeline-dot"></span>
            </div>

            ${sideClass === "left" ? `
            <div class="timeline-copy">
                <div class="timeline-copy-text">
                    <p>${item.note}</p>
                </div>
            </div>
            ` : ""}
        `;

        timelineContainer.appendChild(article);
    });
}

function renderUnlockedScreen() {
    renderTemplate("template-unlocked");
    startRelationshipCounter();
    renderTimeline();
}

renderWelcomeScreen();
