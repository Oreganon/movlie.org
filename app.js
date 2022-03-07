const TRIES = 6;

async function get_movies() {
    let response = await fetch("movies.json");
    return await response.json();
}

async function get_votes(id) {
    let response = await fetch("/screenshots/" + id + "/votes.json");
    if (response.status == 404) {
        return {Votes:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
    }
    return await response.json();
}

async function flash(text) {
    let flash_element = document.getElementById("flasher");
    flash_element.innerText = text;
    flash_element.classList.remove("hide");
    await new Promise(r => setTimeout(r, 1000));
    flash_element.classList.add("hide");
}

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
      // success
  }, function() {
      alert("Copying to clipboard not supported :(");
  });
}

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 * https://gist.github.com/blixt/f17b47c62508be59987b
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
function Random(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) this._seed += 2147483646;
}

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 * https://gist.github.com/blixt/f17b47c62508be59987b
 */
Random.prototype.next = function () {
  return this._seed = this._seed * 16807 % 2147483647;
};


/**
 * Returns a pseudo-random floating point number in range [0, 1).
 * https://gist.github.com/blixt/f17b47c62508be59987b
 */
Random.prototype.nextFloat = function (opt_minOrMax, opt_max) {
  // We know that result of next() will be 1 to 2147483646 (inclusive).
  return (this.next() - 1) / 2147483646;
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array/6274381#6274381
 */
function shuffle(a) {
    let rand = new Random(1);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand.nextFloat() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function todays_movie(imdb_ids) {
    let shuffled = shuffle(imdb_ids);
    const now = new Date();  
    now.setUTCHours(0, 0, 0, 0);  // go by utc

    let days_since_epoch = Math.floor(now/8.64e7);
    return shuffled[days_since_epoch % (shuffled.length - 1)];
}


function create_reveal(movie, type) {
    let elem = document.createElement("div");
    elem.innerText = movie;
    elem.Text = movie;
    elem.classList.add(type);
    elem.classList.add("reveal");
    elem.classList.add("flip");
    return elem;
}

function add_delay(element, index) {
    let delay_class = "delay" + index;
    element.classList.add(delay_class);
}

async function jump(delayed, guess_div) {
    await new Promise(r => setTimeout(r, delayed));
    for (var child of guess_div.childNodes) {
        for (let j = 0; j < 20 ; ++j) {
            child.classList.remove("delay" + j);
        }
        await new Promise(r => setTimeout(r, 80));
        child.classList.add("jump");
    }
 
    await new Promise(r => setTimeout(r, 1000));
    let modal = document.getElementById("stats_modal")
    modal.style.display = "block";
}


async function check_guess() {
    let guess_input = document.getElementById("movie_guess");
    let guess = guess_input.value;
    let guess_lowercase = guess.toLowerCase();
    let names_lowercase = names.map(x => x.toLowerCase());

    if (guess == "") {
        flash("No input");
        return;
    } else if (!names_lowercase.includes(guess_lowercase)) {
        flash("This movie is not in the list");
        return;
    } else if (current_guess == TRIES) {
        flash("Riperino");
        return;
    }

    let guess_div = document.getElementById("guess" + current_guess);
    guess_div.innerHTML = "";

    if (guess_lowercase == solution.toLowerCase()) {
        let a = create_reveal(guess, "right");
        guess_div.appendChild(a);

        
        let stats = ["played", "win", "streak", "max-streak"];
        for (var stat of stats) {
            const stored = parseInt(localStorage.getItem(stat)) || 0;
            localStorage.setItem(stat, stored + 1);
        }

        // for the graph
        let total = parseInt(localStorage.getItem("total-" + current_guess)) || 0;
        localStorage.setItem("total-"+current_guess, total + 1);
        document.getElementById("total-graph-"+current_guess).classList.add("highlight");
        document.getElementById("stats-footer").classList.remove("hide");

        update_statistics();   

        await new Promise(r => setTimeout(r, 2000));
        let modal = document.getElementById("stats_modal")
        modal.style.display = "block";
    } else {
        let a = create_reveal(guess, "wrong");
        guess_div.appendChild(a);
    }

    current_guess += 1;

    // reset the input
    document.getElementById("movie_guess").value = "";


    if (current_guess == TRIES) {
        // Riperino
        let stored = parseInt(localStorage.getItem("played")) || 0;
        localStorage.setItem("played", stored + 1);
        stored = parseInt(localStorage.getItem("streak")) || 0;
        localStorage.setItem("streak", 0);

        display_solution();
    } else {
        reveal_clue(current_guess);
    }
}

async function display_solution() {
    await new Promise(r => setTimeout(r, 1000));
    document.getElementById("solution-container").classList.remove("hide");

    let guess_div = document.getElementById("solution")
    guess_div.innerHTML = solution;
}

function update_statistics() {
    let stats = ["played", "streak", "max-streak"];

    for (var stat of stats) {
        const stored = parseInt(localStorage.getItem(stat)) || 0;
        let div = document.getElementById(stat);
        div.innerText = stored;
    }

    let played = parseInt(localStorage.getItem("played")) || 0;
    let win = parseInt(localStorage.getItem("win")) || 0;
    let div = document.getElementById("win");
    if (played == 0) {
        div.innerText = 0;
    } else {
        div.innerText = Math.round((100 * win) / played);
    }

    for (var i = 0; i < TRIES ; ++i) {
        let total = parseInt(localStorage.getItem("total-"+i)) || 0;
        let percent = 7;
        if (total != 0) {
            percent = ((100 * total) / played);
        }
        let div = document.getElementById("total-"+i);
        div.innerText = total;
        div = document.getElementById("total-graph-"+i);
        div.style.width = "" + percent + "%";
    }
}

function countdown() {
    setInterval(function() {
        var now = new Date();
        const date = new Date();  
        date.setDate(now.getDate() + 1); // tomorrow
        date.setUTCHours(0, 0, 0, 0);  // go by utc
        now = now.getTime();
        var distance = date - now;

        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const zeroPad = (num, places) => String(num).padStart(places, '0')
        minutes = zeroPad(minutes, 2);
        seconds = zeroPad(seconds, 2);
        document.getElementsByTagName("countdown-timer")[0].innerText = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

// returns the xth day this wordle is by
function movlie_number() {
    const now = new Date();  
    now.setUTCHours(0, 0, 0, 0);  // go by utc

    let day = Math.floor(now/8.64e7) - 19057;
    return day;
}

function share() {
    let message = "Movlie.org ";

    let day = movlie_number();
    message += "" + day + " " + current_guess + "/6\n";
    updateClipboard(message);
    flash("Copied to clipboard");
}

function reveal_clue(index) {
    let votes_with_index = [];
    for (let i = 0; i <= 15; ++i) {
        votes_with_index.push([votes[i], i])
    }

    votes_with_index = votes_with_index.sort(function(a,b) {
        return a[0] < b[0];
    });

    index = votes_with_index[index][1];

    let img = document.getElementById("clue" + index);
    img.src = "screenshots/" + solution_imdb + "/" + index + ".png"
}

async function main() {
    window.current_guess = 0;
    window.movies = await get_movies();
    window.names = [];
    window.imdb_ids = [];
    let solution_eligible = [];
    for (let i = 0; i < movies.length ; ++i) {
        names.push(movies[i][1]);
        imdb_ids.push(movies[i][0]);
        if (movies[i][2] == "true") {
            solution_eligible.push(i);
        }
    }

    // find the solution, always the same for the whole UTC day
    window.solution_index = Number(todays_movie(solution_eligible));
    window.solution = names[solution_index];
    window.solution_imdb = imdb_ids[solution_index];

    window.votes = await get_votes(solution_imdb);
    votes = votes.Votes; // array of votes corresponding to screenshot votes

    reveal_clue(0);
    // guess by click on guess
    let button = document.getElementById("submit");
    button.addEventListener('click', check_guess);

    // guess by enter (keyCode 13)
    const input = document.getElementById("movie_guess");
    input.addEventListener('keypress', event => {
        if (event.keyCode == 13) {
            check_guess();
        }
    });

    update_statistics();

    // initialize the statistics
    let played = parseInt(localStorage.getItem("played")) || 0;
    if (played == 0) {
        let modal = document.getElementById("help_modal")
        modal.style.display = "block";
    }

    // share button listener
    button = document.getElementById("share-button");
    button.addEventListener('click', share);

    countdown();
}
main()

let modals = document.getElementsByClassName("modal");
let openers = document.getElementsByClassName("modal_open");
let closers = document.getElementsByClassName("modal_close");


for (let o of openers) {
    o.onclick = function() {
        let modal = document.getElementById(o.id + "_modal")
        modal.style.display = "block";
    }
}

for (let c of closers) {
    c.onclick = function() {
        for (let m of modals) {
            m.style.display = "none";
        }
    }
}

window.onclick = function(event) {
    for (let m of modals) {
        if (event.target == m) {
            m.style.display = "none";
        }
    }
} 

new autoComplete({
    selector: '#movie_guess',
    minChars: 2,
    source: function(term, suggest){
        term = term.toLowerCase();
        var choices = movies;
        var suggestions = [];
        for (i=0;i<choices.length;i++)
            if (~(choices[i][0]+' '+choices[i][1]).toLowerCase().indexOf(term)) suggestions.push(choices[i]);
        suggest(suggestions);
    },
    renderItem: function (item, search) {
        search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
        return '<div class="autocomplete-suggestion" data-imdb="'+item[0]+'" data-name="'+item[1]+'" data-val="'+search+'">'+item[1].replace(re, "<b>$1</b>")+'</div>';
    },
    onSelect: function(e, term, item) {
        document.getElementById("movie_guess").value = item.getAttribute("data-name");
    }
});
