
const phrases = [
    "Good job!",
    "Well done!",
    "Nice work!",
    "Excellent!",
    "Great effort!",
    "Fantastic!",
    "Keep it up!",
    "Awesome!",
    "You're doing great!",
    "Superb!",
    "Perfect!",
    "Spot on!",
    "You nailed it!",
    "Bravo!",
    "Outstanding!",
    "Impressive!",
    "Way to go!",
    "Top-notch!",
    "Correct!",
    "Amazing!"
];

document.getElementById('conjugationForm').addEventListener('submit', check);
document.addEventListener("DOMContentLoaded", function () {

    const initialsElements = [
        document.getElementById("1st-place-initials"),
        document.getElementById("2nd-place-initials"),
        document.getElementById("3rd-place-initials"),
        document.getElementById("4th-place-initials"),
        document.getElementById("5th-place-initials"),
        document.getElementById("6th-place-initials"),
        document.getElementById("7th-place-initials"),
        document.getElementById("8th-place-initials"),
        document.getElementById("9th-place-initials"),
        document.getElementById("10th-place-initials"),
    ];
    
    // Elements for scores
    const scoreElements = [
        document.getElementById("1st-place-score"),
        document.getElementById("2nd-place-score"),
        document.getElementById("3rd-place-score"),
        document.getElementById("4th-place-score"),
        document.getElementById("5th-place-score"),
        document.getElementById("6th-place-score"),
        document.getElementById("7th-place-score"),
        document.getElementById("8th-place-score"),
        document.getElementById("9th-place-score"),
        document.getElementById("10th-place-score"),
    ];
    
    function display_top_ten() {
        fetchWithRetries('/api/top_ten_scores/', {}, 3, 100)
        .then(data => {
            // Check if the response has 'top_scores' data
            if (data.top_scores) {
                index = 0;
                console.info(`${JSON.stringify([...data.top_scores])}`);
                data.top_scores.forEach((player) => {
                    if (index < 10) {
                        initialsElements[index].innerHTML =`${player.initials}`; 
                        scoreElements[index].innerText = `${player.score}`;   
                        index = index + 1;
                    }
                });
            } else {
                console.error("Unexpected response format:", data);
            }
        });
    }
    
    display_top_ten();
    
    const CORRECT_VERB_TENSE_LV1 = "CORRECT_VERB_TENSE_LV1";
    const CORRECT_VERB_TENSE_LV2 = "CORRECT_VERB_TENSE_LV2";
    const CORRECT_VERB_TENSE_LV3 = "CORRECT_VERB_TENSE_LV3";
    const CORRECT_AUX_CONJUGATION = "CORRECT_AUX_CONJUGATION";
    const CORRECT_PARTICIPLE = "CORRECT_PARTICIPLE";
    const points = new Map();
    points.set(CORRECT_VERB_TENSE_LV1, 100);
    points.set(CORRECT_VERB_TENSE_LV2, 200);
    points.set(CORRECT_VERB_TENSE_LV3, 300);
    points.set(CORRECT_AUX_CONJUGATION, 50);
    points.set(CORRECT_PARTICIPLE, 25);
    
    const tenseLevel1 = ["presente", "imperfetto"];
    const level1 = new Set(tenseLevel1);
        
    const tenseLevel2 = ["passato prossimo", "condizionale presente", "futuro semplice", "congiuntivo presente"];
    const level2 = new Set(tenseLevel2);
    
    const tenseLevel3 = ["futuro anteriore", "condizionale passato", "congiuntivo imperfetto", "trapassato prossimo"];
    const level3 = new Set(tenseLevel3);

    const submit_button = document.getElementById("check");
    const start_btn = document.getElementById("start");
    const start_over_btn = document.getElementById("start-over");
    const save_score_btn = document.getElementById("save-score");
    start_btn.focus();
    const game_start_div = document.getElementById("game-start-div");
    const game_on_div = document.getElementById("game-on-div");
    const game_over_div = document.getElementById("game-over-div");
    // const timerDuration = 5 * 60 * 1000;
    const timerDuration = 30 * 1000;
    const startingTime = 120;
    // let timeLeft = 2 * 60; 
    let timeLeft = 120;
    let score = 0;
    let rank = 0;
    const timerDisplay = document.getElementById("timer");
    const inputElement = document.getElementById("dynamic-initials-input");
    const answerInput = document.getElementById("answerInput");
    inputElement.style.fontFamily = "'Karmatic Arcade', sans-serif";
    inputElement.style.color = "#87E02C";
    inputElement.style.padding = "10px";
    inputElement.style["textAlign"] = "left";
    

    function blockInputs() {
    }

    function unblockInputs() {
    }
    
    function startCountdown() {
        answerInput.focus();
        const countdown = setInterval(() => {
            // Calculate minutes and seconds
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            // Format and update the HTML content
            timerDisplay.textContent = `Time Left:  ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            // Decrement the timer
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(countdown);
                document.getElementById("player_score_final").innerHTML = `${score}`;
                game_over_div.classList.toggle("hidden");
                game_on_div.classList.toggle("hidden");
                inputElement.focus();
            }
        }, 1000); // Update every 1 second
    }

    let toggle = true;

    function fetchWithRetries(url, options = {}, retries = 3, delay = 100) {
        return new Promise((resolve, reject) => {
            const attemptFetch = (n) => {
                fetch(url, options)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(resolve) // On success
                    .catch((error) => {
                        if (n > 1) {
                            console.warn(`Retrying... Attempts left: ${n - 1}`);
                            setTimeout(() => attemptFetch(n - 1), delay);
                        } else {
                            reject(error); // Reject after retries are exhausted
                        }
                    });
            };
    
            attemptFetch(retries);
        });
    }

    

    function again() {
        if (event) {
        event.preventDefault();
        }
        blockInputs();
        fetchWithRetries('/api/get_italian_conjugation/', {}, 3, 100)
        .then(data => {
                if (data.auxillary === null || data.auxillary === "None") {
                    document.getElementById('auxillary').innerHTML = ``;
                } else {
                    document.getElementById('auxillary').innerHTML = `${data.auxillary} &nbsp;`;
                }

                
                document.getElementById('subject_answer').innerHTML = ``;

                if (data.tense.includes("Congiuntivo") || (data.participle !== null && data.participle.includes("che"))) {
                    document.getElementById('subject_answer').innerHTML = `${data.subject} &nbsp;`;
                } 

                if (data.participle !== null) {
                    if (data.participle.includes("mi") || data.participle.includes("ti") || data.participle.includes("si") || data.participle.includes("ci") || data.participle.includes("vi")  || data.participle.includes("che")) {
                        document.getElementById('subject_answer').innerHTML = ``;
                        document.getElementById('participle').innerHTML = `${data.participle} &nbsp;`;
                    } 

                    if (data.participle === "che") {
                        document.getElementById('participle').innerHTML = ``;
                        if (data.subject.includes("Lei") || data.subject.includes("Lui") || data.subject.includes("Tu") || data.subject.includes("Io")) {
                            document.getElementById('subject_answer').innerHTML = `${data.subject} &nbsp;`;
                        }
                    }
                } else {
                    document.getElementById('participle').innerHTML = ``;
                }
                    
                document.getElementById('subject').innerHTML = `${data.subject}`;
                document.getElementById('tense').innerHTML = `${data.tense} ` || ``;
                document.getElementById('infinitive').innerHTML = `${data.infinitive}` || ``;
                document.getElementById('verb').innerHTML = `${data.verb}` || ``;

                unblockInputs();
                document.getElementById("answerInput").value = "";
                answerInput.focus();
            })
            .catch(error => {
                document.getElementById('message').innerHTML = error.stack;
                document.getElementById("answerInput").value = "";
                unblockInputs();
                answerInput.focus();
            });
    }
    
    function check(event) { 
        event.preventDefault(); 
        const answer = document.getElementById("answerInput").value;
        const answerList = answer.split(" ").filter(word => word !== "");
        const lastElement = answerList.at(-1);
        console.log(`lastElement: ${lastElement}`);
        if (lastElement !== undefined) {
            original_subject_answer = document.getElementById('subject_answer').innerHTML;
            original_participle = document.getElementById('participle').innerHTML;
            original_auxillary = document.getElementById('auxillary').innerHTML;
            original_verb = document.getElementById('verb').innerHTML;
            sanitized_subject_answer = "";
            sanitized_participle = "";
            sanitized_auxillary = "";
            sanitized_verb = "";

            if (original_subject_answer && original_subject_answer.trim() !== "") {
                sanitized_subject_answer = original_subject_answer.replace(/\u00A0|&nbsp;/g, "").trim();
            }

            if (original_participle && original_participle.trim() !== "") {
                sanitized_participle = original_participle.replace(/\u00A0|&nbsp;/g, "").trim();
            }

            if (original_auxillary && original_auxillary.trim() !== "") {
                sanitized_auxillary = original_auxillary.replace(/\u00A0|&nbsp;/g, "").trim();
            }

            if (original_verb && original_verb.trim() !== "") {
                sanitized_verb = original_verb.replace(/\u00A0|&nbsp;/g, "").trim();
            }

            let subject_matches = false;  
            let verb_matches = false;
            let aux_matches = false;
            let part_matches = false;

            console.log(`original participle: ${original_participle}`);
            console.log(`original auxillary: ${original_auxillary}`);
            console.log(`original verb: ${original_verb}`);

            console.log(`lastElement: ${lastElement}`);
            if (sanitized_verb.includes("/")) {
                const sanitized_verbs = sanitized_verb.split("/").map(part => part.trim().toLowerCase());

                if (sanitized_verbs.includes(lastElement.toLowerCase())) {
                    verb_matches = true;
                    $('#verb').removeClass("glow-text-red-override");
                    $('#verb').addClass("glow-text");
                } else {
                    $('#verb').addClass("glow-text-red-override");
                }
            } else {
                if (lastElement.toLowerCase() === sanitized_verb.toLowerCase()) {
                    verb_matches = true;
                    $('#verb').removeClass("glow-text-red-override");
                    $('#verb').addClass("glow-text");
                } else {
                    $('#verb').addClass("glow-text-red-override");
                }
            }
            
            let i = -2;
            const secondToLastElement = answerList.at(i); 
            console.log(`secondToLastElement: ${secondToLastElement}`);
            if (typeof sanitized_auxillary !== "undefined" && sanitized_auxillary !== "") {
                if (secondToLastElement !== undefined && secondToLastElement.toLowerCase() === sanitized_auxillary.toLowerCase()) {
                    aux_matches = true;
                    $('#auxillary').removeClass("glow-text-red-override");
                    $('#auxillary').addClass("glow-text");
                } else {
                    console.log(`sanitized_auxillary: ${sanitized_auxillary}`);
                    $('#auxillary').addClass("glow-text-red-override");
                }
                i = i-1;
            } else {
                aux_matches = true;
                $('#auxillary').removeClass("glow-text-red-override");
                $('#auxillary').addClass("glow-text");
            }
            

            const thirdToLastElement = answerList.at(i); 
            console.log(`thirdToLastElement: ${thirdToLastElement}`);
            if (typeof sanitized_participle !== "undefined" && sanitized_participle !== "") {
                if (thirdToLastElement !== undefined && thirdToLastElement.toLowerCase() === sanitized_participle.toLowerCase()) {
                    part_matches = true;
                    $('#participle').removeClass("glow-text-red-override");
                    $('#participle').addClass("glow-text");
                } else {
                    console.log(`sanitized_participle: ${sanitized_participle}`);
                    $('#participle').addClass("glow-text-red-override");
                }
                i = i-1;
            } else {
                part_matches = true;
                $('#participle').removeClass("glow-text-red-override");
                $('#participle').addClass("glow-text");
            }

            if (part_matches && aux_matches && verb_matches) {
                document.getElementById('participle').innerHTML = ``
                document.getElementById('auxillary').innerHTML = ``
                document.getElementById('subject_answer').innerHTML = ``
                const randomIndex = Math.floor(Math.random() * phrases.length);
                document.getElementById('verb').innerHTML = `${phrases[randomIndex]}`
            } 

            console.log(`subject_matches: ${subject_matches}`);
            console.log(`part_matches: ${part_matches}`);
            console.log(`aux_matches: ${aux_matches}`);
            console.log(`verb_matches: ${verb_matches}`);

            
            let tense = document.getElementById("tense").innerHTML.valueOf();

            if (aux_matches && typeof sanitized_auxillary !== "undefined" && sanitized_auxillary !== "") {
                score = score+points.get(CORRECT_AUX_CONJUGATION);
                document.getElementById("player_score").innerHTML = `Score: &nbsp; ${score}`
            }
            if (part_matches && typeof sanitized_participle !== "undefined" && sanitized_participle !== "") {
                score = score+points.get(CORRECT_PARTICIPLE);
                document.getElementById("player_score").innerHTML = `Score: &nbsp; ${score}`
            }
            if (verb_matches) {

                console.log(`tense: ${tense.toLowerCase().trim()}`);
                console.log(`lvl1: ${JSON.stringify([...level1])} result: ${level1.has(tense.toLowerCase().trim())}`);
                console.log(`lvl2: ${JSON.stringify([...level2])} result: ${level2.has(tense.toLowerCase().trim())}`);
                console.log(`lvl3: ${JSON.stringify([...level3])} result: ${level3.has(tense.toLowerCase().trim())}`);
                if (level1.has(tense.toLowerCase().trim())) {
                    score = score+points.get(CORRECT_VERB_TENSE_LV1);
                    console.log(`new score: ${score}`);
                    document.getElementById("player_score").innerHTML = `Score: &nbsp; ${score}`;
                }
                if (level2.has(tense.toLowerCase().trim())) {
                    score = score+points.get(CORRECT_VERB_TENSE_LV2);
                    console.log(`new score: ${score}`);
                    document.getElementById("player_score").innerHTML = `Score: &nbsp;  ${score}`;
                }
                if (level3.has(tense.toLowerCase().trim())) {
                    score = score+points.get(CORRECT_VERB_TENSE_LV3);
                    console.log(`new score: ${score}`);
                    document.getElementById("player_score").innerHTML = `Score: &nbsp; ${score}`;
                }
            }
            }
    }
    
    let doingStuff = false;
    function doTurn(event, isFirst) {
        event.preventDefault(); 
        if (isFirst) {
            isFirst = false;
            document.getElementById("answerInput").focus();
            console.log("OMG");
            return;
        }
        if (doingStuff === false) {
            const inputValue = document.getElementById("answerInput").value;
            
            doingStuff = true;

            if (inputValue === null || inputValue.trim() === "") {
                console.log("Input is empty or null. Skipping verb.");

                if (inCheckMode) {
                    $('#message').toggleClass("hidden");
                    $('#check').toggleClass("hidden");
                    
                console.log("CHECK MODE TRUE");
                    again(); 
                    inCheckMode = false;
                } else {
                    $('#message').toggleClass("hidden");
                    again();
                    $('#message').toggleClass("hidden");
                    $('#check').toggleClass("hidden");
                    console.log("CHECK MODE FALSE");
                }

                doingStuff = false;
                return; 
            }

            check(event);
            $('#message').toggleClass("hidden");
            $('#check').toggleClass("hidden"); 
            let delay = 1300;
            if (phrases.includes(document.getElementById("verb").innerHTML)) {
                delay = 500;
            }
            setTimeout(() => {
                again();
                $('#message').toggleClass("hidden");
                $('#check').toggleClass("hidden"); 
                doingStuff = false;
            }, delay);
            answerInput.focus();
            toggle = !toggle; 
        } else {
            console.error("pressed enter too early, was doing stuff already");
            return;
        }
            
    }


    let isFirst = true;
    answerInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") { 
            isFirst = false;
            doTurn(event, isFirst);
        }
    });

    submit_button.addEventListener("click", (event) => doTurn(event, true));
    inistials_input_div = document.getElementById("initials-input-div");
    
    start_btn.addEventListener("click", () => {
        game_start_div.classList.toggle("hidden");
        game_on_div.classList.toggle("hidden");
        answerInput.focus();
        startCountdown();
    });

   start_btn.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { 
        game_start_div.classList.toggle("hidden");
        game_on_div.classList.toggle("hidden");
        answerInput.focus();
        startCountdown();
    }
   });

   start_over_btn.addEventListener("click", (event) => {
        event.preventDefault(); 
        score = 0;
        document.getElementById("player_score").innerHTML = `Score: &nbsp; 0`;
        document.getElementById("answerInput").value = "";
        $('#message').removeClass("hidden");
        $('#message').addClass("hidden");
        game_over_div.classList.toggle("hidden");
        game_on_div.classList.toggle("hidden");
        answerInput.focus();
        inistials_input_div.classList.toggle("hidden");
        saved_initials_div.classList.toggle("hidden");
        document.getElementById("player_rank").innerHTML = ``;
        save_score_btn.classList.toggle("hidden");
        timeLeft = startingTime;
        startCountdown();
    });

    function getCSRFToken() {
        const cookie = document.cookie.split("; ").find(row => row.startsWith("csrftoken="));
        return cookie ? cookie.split("=")[1] : "";
    }

    function getOrdinalSuffix(number) {
        const j = number % 10; // Get the last digit
        const k = number % 100; // Get the last two digits
        
        if (j === 1 && k !== 11) return `${number}st`;
        if (j === 2 && k !== 12) return `${number}nd`;
        if (j === 3 && k !== 13) return `${number}rd`;
        return `${number}th`;
    }

    function save_score(event) {
        event.preventDefault(); 
        blockInputs();
        let scoreData = {
            initials: inputElement.value,  
            score: score
        };

        fetchWithRetries('/api/save_score/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken() // Use CSRF token in production
            },
            body: JSON.stringify(scoreData)
        }, 3, 1000)
        .then(data => {
            unblockInputs();
            let excitement = "!";
            let placed = getOrdinalSuffix(data.data.rank_at_created);
            if (placed === "1st") {
                excitement = "!!!";
            } else if (placed === "2nd") {
                excitement = "!!";
            }

            if (data.data.rank_at_created <= 10) {
                document.getElementById("player_rank").innerHTML = `Ranked: &nbsp; ${getOrdinalSuffix(data.data.rank_at_created)} &nbsp; ${excitement}`;
            } else {
                document.getElementById("player_rank").innerHTML = `Ranked &nbsp; ${getOrdinalSuffix(data.data.rank_at_created)}`;
            }
            display_top_ten();
            console.log("Saved:", data)
            start_over_btn.focus();
    })
        .catch(error => {
            unblockInputs();
            console.error("Error:", error)
            start_over_btn.focus();});

        inistials_input_div.classList.toggle("hidden");
        let inputValue = inputElement.value;
        // Capitalize the first letter and make the rest lowercase
        let capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1).toUpperCase();

        saved_initials_div.innerHTML = `${capitalizedValue}`;
        saved_initials_div.classList.toggle("hidden");
        save_score_btn.classList.toggle("hidden");
        start_over_btn.focus();
    }

    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            save_score(event);
        }
    });

    score_saved_div = document.getElementById("score-saved");
    saved_initials_div = document.getElementById("saved_initials");
    save_score_btn.addEventListener("click", save_score);

    let inCheckMode = false;
});


